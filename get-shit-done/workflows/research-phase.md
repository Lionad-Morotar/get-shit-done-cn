<purpose>
研究如何实现阶段。使用阶段上下文生成 gsd-phase-researcher。

独立研究命令。对于大多数工作流程，使用 `/gsd:plan-phase`，它自动集成研究。
</purpose>

<process>

## 步骤 0：解析模型配置文件

@~/.claude/get-shit-done/references/model-profile-resolution.md

解析以下模型：
- `gsd-phase-researcher`

## 步骤 1：规范化和验证阶段

@~/.claude/get-shit-done/references/phase-argument-parsing.md

```bash
PHASE_INFO=$(node ~/.claude/get-shit-done/bin/gsd-tools.js roadmap get-phase "${PHASE}")
```

如果 `found` 为 false：错误并退出。

## 步骤 2：检查现有研究

```bash
ls .planning/phases/${PHASE}-*/RESEARCH.md 2>/dev/null
```

如果存在：提供更新/查看/跳过选项。

## 步骤 3：收集阶段上下文

```bash
# 来自路线图的阶段部分（已在 PHASE_INFO 中加载）
echo "$PHASE_INFO" | jq -r '.section'
cat .planning/REQUIREMENTS.md 2>/dev/null
cat .planning/phases/${PHASE}-*/*-CONTEXT.md 2>/dev/null
# 来自状态快照的决策（结构化 JSON）
node ~/.claude/get-shit-done/bin/gsd-tools.js state-snapshot | jq '.decisions'
```

## 步骤 4：生成研究者

```
Task(
  prompt="<objective>
研究阶段 {phase} 的实现方法：{name}
</objective>

<context>
阶段描述：{description}
需求：{requirements}
先前的决策：{decisions}
阶段上下文：{context_md}
</context>

<output>
写入到：.planning/phases/${PHASE}-${slug}/${PHASE}-RESEARCH.md
</output>",
  subagent_type="gsd-phase-researcher",
  model="{researcher_model}"
)
```

## 步骤 5：处理返回

- `## 研究完成` — 显示摘要，提供：规划/深入挖掘/审查/完成
- `## 已到达检查点` — 展示给用户，生成继续
- `## 研究无结果` — 显示尝试，提供：添加上下文/尝试不同模式/手动

</process>
