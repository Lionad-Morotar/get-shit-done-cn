---
name: gsd:research-phase
description: 研究如何实现阶段（独立 - 通常改用 /gsd:plan-phase）
argument-hint: "[阶段]"
allowed-tools:
  - Read
  - Bash
  - Task
---

<objective>
研究如何实现阶段。生成带有阶段上下文的 gsd-phase-researcher agent。

**注意：** 这是一个独立研究命令。对于大多数工作流，使用 `/gsd:plan-phase`，它会自动集成研究。

**使用此命令当：**
- 你想在尚未规划的情况下进行研究
- 你想在规划完成后重新研究
- 你需要在决定阶段是否可行之前进行调查

**编排器角色：** 解析阶段、根据路线图验证、检查现有研究、收集上下文、生成研究代理、呈现结果。

**为什么使用子代理：** 研究会快速消耗上下文（WebSearch、Context7 查询、源代码验证）。为调查提供全新的 200k 上下文。主上下文保持精简以便用户交互。
</objective>

<context>
阶段编号: $ARGUMENTS（必需）

在步骤 1 中规范化阶段输入，然后再进行任何目录查找。
</context>

<process>

## 0. 初始化上下文

```bash
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js init phase-op "$ARGUMENTS")
```

从 init JSON 提取：`phase_dir`、`phase_number`、`phase_name`、`phase_found`、`commit_docs`、`has_research`。

解析研究模型：
```bash
RESEARCHER_MODEL=$(node ~/.claude/get-shit-done/bin/gsd-tools.js resolve-model gsd-phase-researcher --raw)
```

## 1. 验证阶段

```bash
PHASE_INFO=$(node ~/.claude/get-shit-done/bin/gsd-tools.js roadmap get-phase "${phase_number}")
```

**如果 `found` 为 false：** 报错并退出。**如果 `found` 为 true：** 从 JSON 提取 `phase_number`、`phase_name`、`goal`。

## 2. 检查现有研究

```bash
ls .planning/phases/${PHASE}-*/RESEARCH.md 2>/dev/null
```

**如果存在：** 提供：1) 更新研究，2) 查看现有，3) 跳过。等待响应。

**如果不存在：** 继续。

## 3. 收集阶段上下文

```bash
# 阶段部分已在 PHASE_INFO 中加载
echo "$PHASE_INFO" | jq -r '.section'
cat .planning/REQUIREMENTS.md 2>/dev/null
cat .planning/phases/${PHASE}-*/*-CONTEXT.md 2>/dev/null
grep -A30 "### 所做决策" .planning/STATE.md 2>/dev/null
```

呈现阶段描述、需求、先前决策的摘要。

## 4. 生成 gsd-phase-researcher Agent

研究模式：ecosystem（默认）、feasibility、implementation、comparison。

```markdown
<research_type>
阶段研究 — 调查如何很好地实现特定阶段。
</research_type>

<key_insight>
问题不是"我应该使用哪个库？"

问题是："有什么我不知道的不知道？"

对于此阶段，发现：
- 什么是既定的架构模式？
- 哪些库形成标准堆栈？
- 人们经常遇到什么问题？
- 什么是 SOTA vs Claude 的训练认为的 SOTA？
- 什么不应该手工构建？
</key_insight>

<objective>
研究阶段 {phase_number} 的实现方法：{phase_name}
模式：ecosystem
</objective>

<context>
**阶段描述：** {phase_description}
**需求：** {requirements_list}
**先前决策：** {decisions_if_any}
**阶段上下文：** {context_md_content}
</context>

<downstream_consumer>
你的 RESEARCH.md 将被 `/gsd:plan-phase` 加载，它使用特定部分：
- `## 标准堆栈` → 计划使用这些库
- `## 架构模式` → 任务结构遵循这些
- `## 不要手工构建` → 任务从不为列出的问题构建自定义解决方案
- `## 常见陷阱` → 验证步骤检查这些
- `## 代码示例` → 任务操作引用这些模式

具有规定性，而不是探索性。"使用 X"而不是"考虑 X 或 Y"。
</downstream_consumer>

<quality_gate>
在声明完成之前，验证：
- [ ] 所有域已调查（而不仅仅是一些）
- [ ] 通过官方文档验证了否定声明
- [ ] 关键声明的多个来源
- [ ] 诚实分配置信度水平
- [ ] 部分名称与 plan-phase 期望的匹配
</quality_gate>

<output>
写入：.planning/phases/${PHASE}-{slug}/${PHASE}-RESEARCH.md
</output>
```

```
Task(
  prompt="首先，阅读 ~/.claude/agents/gsd-phase-researcher.md 以了解你的角色和说明。\n\n" + filled_prompt,
  subagent_type="general-purpose",
  model="{researcher_model}",
  description="研究阶段 {phase}"
)
```

## 5. 处理 Agent 返回

**`## RESEARCH COMPLETE`：** 显示摘要，提供：规划阶段、深入挖掘、查看完整、完成。

**`## CHECKPOINT REACHED`：** 呈现给用户，获取响应，生成延续。

**`## RESEARCH INCONCLUSIVE`：** 显示尝试的内容，提供：添加上下文、尝试不同模式、手动。

## 6. 生成延续 Agent

```markdown
<objective>
继续阶段 {phase_number} 的研究：{phase_name}
</objective>

<prior_state>
研究文件：@.planning/phases/${PHASE}-{slug}/${PHASE}-RESEARCH.md
</prior_state>

<checkpoint_response>
**类型：** {checkpoint_type}
**响应：** {user_response}
</checkpoint_response>
```

```
Task(
  prompt="首先，阅读 ~/.claude/agents/gsd-phase-researcher.md 以了解你的角色和说明。\n\n" + continuation_prompt,
  subagent_type="general-purpose",
  model="{researcher_model}",
  description="继续研究阶段 {phase}"
)
```

</process>

<success_criteria>
- [ ] 根据路线图验证阶段
- [ ] 检查现有研究
- [ ] 使用上下文生成 gsd-phase-researcher
- [ ] 正确处理检查点
- [ ] 用户知道后续步骤
</success_criteria>
