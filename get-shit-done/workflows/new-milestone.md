<purpose>

为现有项目启动新的里程碑周期。加载项目上下文，收集里程碑目标（从 MILESTONE-CONTEXT.md 或对话），更新 PROJECT.md 和 STATE.md，可选运行并行研究，定义带有 REQ-ID 的范围需求，生成路线图器以创建分阶段执行计划，并提交所有工件。棕地项目的 new-project 等效项。

</purpose>

<required_reading>

在开始之前读取执行上下文引用的所有文件。

</required_reading>

<process>

## 1. 加载上下文

- 读取 PROJECT.md（现有项目，已验证需求，决策）
- 读取 MILESTONES.md（以前发布的内容）
- 读取 STATE.md（待处理待办事项，阻塞因素）
- 检查 MILESTONE-CONTEXT.md（来自 /gsd:discuss-milestone）

## 2. 收集里程碑目标

**如果 MILESTONE-CONTEXT.md 存在：**
- 使用来自 discuss-milestone 的功能和范围
- 展示摘要以供确认

**如果没有上下文文件：**
- 展示上一个里程碑发布的内容
- 询问："您接下来想构建什么？"
- 使用 AskUserQuestion 探索功能、优先级、约束、范围

## 3. 确定里程碑版本

- 从 MILESTONES.md 解析最后一个版本
- 建议下一个版本（v1.0 → v1.1，或 v2.0 用于主要版本）
- 与用户确认

## 4. 更新 PROJECT.md

添加/更新：

```markdown
## 当前里程碑：v[X.Y] [Name]

**目标：** [一句话描述里程碑焦点]

**目标功能：**
- [功能 1]
- [功能 2]
- [功能 3]
```

更新活跃需求部分和"最后更新"页脚。

## 5. 更新 STATE.md

```markdown
## 当前位置

阶段：尚未开始（定义需求）
计划：—
状态：定义需求
最后活动：[today] — 里程碑 v[X.Y] 已启动
```

保留来自上一个里程碑的累积上下文部分。

## 6. 清理和提交

如果存在，删除 MILESTONE-CONTEXT.md（已消耗）。

```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "docs: start milestone v[X.Y] [Name]" --files .planning/PROJECT.md .planning/STATE.md
```

## 7. 加载上下文并解析模型

```bash
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js init new-milestone)
```

从 init JSON 提取：`researcher_model`、`synthesizer_model`、`roadmapper_model`、`commit_docs`、`research_enabled`、`current_milestone`、`project_exists`、`roadmap_exists`。

## 8. 研究决策

AskUserQuestion："在定义需求之前研究新功能的领域生态系统？"
- "先研究（推荐）" — 发现新功能的模式、功能、架构
- "跳过研究" — 直接进入需求

**将选择持久化到配置**（以便未来的 `/gsd:plan-phase` 遵守它）：

```bash
# 如果 "先研究"：持久化 true
node ~/.claude/get-shit-done/bin/gsd-tools.js config-set workflow.research true

# 如果 "跳过研究"：持久化 false
node ~/.claude/get-shit-done/bin/gsd-tools.js config-set workflow.research false
```

**如果 "先研究"：**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 研究中
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 生成 4 个并行研究代理...
  → 技术栈、功能、架构、陷阱
```

```bash
mkdir -p .planning/research
```

生成 4 个并行 gsd-project-researcher 代理。每个使用此模板并带有特定维度的字段：

**所有 4 个研究者的通用结构：**
```
Task(prompt="
<research_type>项目研究 — {DIMENSION} 用于 [新功能]。</research_type>

<milestone_context>
后续里程碑 — 将 [目标功能] 添加到现有应用程序。
{EXISTING_CONTEXT}
仅关注新功能需要的内容。
</milestone_context>

<question>{QUESTION}</question>

<project_context>[PROJECT.md 摘要]</project_context>

<downstream_consumer>{CONSUMER}</downstream_consumer>

<quality_gate>{GATES}</quality_gate>

<output>
写入到：.planning/research/{FILE}
使用模板：~/.claude/get-shit-done/templates/research-project/{FILE}
</output>
", subagent_type="gsd-project-researcher", model="{researcher_model}", description="{DIMENSION} research")
```

**特定维度的字段：**

| 字段 | 技术栈 | 功能 | 架构 | 陷阱 |
|-------|-------|----------|-------------|----------|
| EXISTING_CONTEXT | 现有验证功能（不要重新研究）：[来自 PROJECT.md] | 现有功能（已构建）：[来自 PROJECT.md] | 现有架构：[来自 PROJECT.md 或代码库映射] | 专注于将这些功能添加到现有系统时的常见错误 |
| QUESTION | [新功能] 需要哪些技术栈添加/更改？ | [目标功能] 通常如何工作？预期行为？ | [目标功能] 如何与现有架构集成？ | 将 [目标功能] 添加到 [领域] 时的常见错误？ |
| CONSUMER | 带有版本的新功能特定库、集成点、不添加什么 | 基本功能 vs 差异化功能 vs 反功能、注意的复杂性、对现有的依赖 | 集成点、新组件、数据流更改、建议的构建顺序 | 警告信号、预防策略、哪个阶段应该解决它 |
| GATES | 版本当前（使用 Context7 验证）、基本原理解释为什么、考虑集成 | 类别清晰、注意复杂性、识别依赖 | 集成点已识别、新 vs 修改明确、构建顺序考虑依赖 | 陷阱特定于添加这些功能、覆盖集成陷阱、预防可操作 |
| FILE | STACK.md | FEATURES.md | ARCHITECTURE.md | PITFALLS.md |

所有 4 个完成后，生成合成器：

```
Task(prompt="
将研究输出合成为 SUMMARY.md。

读取：.planning/research/STACK.md、FEATURES.md、ARCHITECTURE.md、PITFALLS.md

写入到：.planning/research/SUMMARY.md
使用模板：~/.claude/get-shit-done/templates/research-project/SUMMARY.md
写入后提交。
", subagent_type="gsd-research-synthesizer", model="{synthesizer_model}", description="Synthesize research")
```

显示来自 SUMMARY.md 的关键发现：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 研究完成 ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**技术栈添加：** [来自 SUMMARY.md]
**功能基本要求：** [来自 SUMMARY.md]
**注意：** [来自 SUMMARY.md]
```

**如果 "跳过研究"：** 继续到步骤 9。

## 9. 定义需求

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 定义需求
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

读取 PROJECT.md：核心价值、当前里程碑目标、已验证需求（存在的内容）。

**如果研究存在：** 读取 FEATURES.md，提取功能类别。

按类别展示功能：
```
## [类别 1]
**基本功能：** 功能 A、功能 B
**差异化功能：** 功能 C、功能 D
**研究注释：** [任何相关注释]
```

**如果没有研究：** 通过对话收集需求。询问："用户使用 [新功能] 需要做的 main事情是什么？" 澄清、探查相关功能、分组到类别。

**通过 AskUserQuestion 范围化每个类别**（multiSelect: true）：
- "[功能 1]" — [简短描述]
- "[功能 2]" — [简短描述]
- "此里程碑无" — 推迟整个类别

跟踪：选中 → 此里程碑。未选中的基本功能 → 未来。未选中的差异化功能 → 超出范围。

**通过 AskUserQuestion 识别差距：**
- "不，研究已覆盖" — 继续
- "是的，让我添加一些" — 捕获添加内容

**生成 REQUIREMENTS.md：**
- v1 需求按类别分组（复选框、REQ-ID）
- 未来需求（已推迟）
- 超出范围（明确排除及其基本原理）
- 可追溯性部分（空，由路线图填充）

**REQ-ID 格式：** `[CATEGORY]-[NUMBER]`（AUTH-01、NOTIF-02）。从现有的继续编号。

**需求质量标准：**

好的需求是：
- **具体和可测试：** "用户可以通过电子邮件链接重置密码"（而不是 "处理密码重置"）
- **以用户为中心：** "用户可以 X"（而不是 "系统做 Y"）
- **原子性：** 每个需求一个功能（而不是 "用户可以登录和管理个人资料"）
- **独立性：** 对其他需求的依赖最小

展示完整的需求列表以供确认：

```
## 里程碑 v[X.Y] 需求

### [类别 1]
- [ ] **CAT1-01**：用户可以执行 X
- [ ] **CAT1-02**：用户可以执行 Y

### [类别 2]
- [ ] **CAT2-01**：用户可以执行 Z

这是否捕获了您正在构建的内容？(yes / adjust)
```

如果 "adjust"：返回到范围设定。

**提交需求：**
```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "docs: define milestone v[X.Y] requirements" --files .planning/REQUIREMENTS.md
```

## 10. 创建路线图

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 创建路线图
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 生成路线图器...
```

**起始阶段编号：** 读取 MILESTONES.md 的最后阶段编号。从那里继续（v1.0 结束于阶段 5 → v1.1 从阶段 6 开始）。

```
Task(prompt="
<planning_context>
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md
@.planning/research/SUMMARY.md（如果存在）
@.planning/config.json
@.planning/MILESTONES.md
</planning_context>

<instructions>
为里程碑 v[X.Y] 创建路线图：
1. 从 [N] 开始阶段编号
2. 仅从此里程碑的需求派生阶段
3. 将每个需求映射到恰好一个阶段
4. 为每个阶段派生 2-5 个成功标准（可观察的用户行为）
5. 验证 100% 覆盖
6. 立即写入文件（ROADMAP.md、STATE.md、更新 REQUIREMENTS.md 可追溯性）
7. 返回已创建路线图并带有摘要

首先写入文件，然后返回。
</instructions>
", subagent_type="gsd-roadmapper", model="{roadmapper_model}", description="Create roadmap")
```

**处理返回：**

**如果 `## ROADMAP BLOCKED`：** 展示阻塞因素，与用户合作，重新生成。

**如果 `## ROADMAP CREATED`：** 读取 ROADMAP.md，内联展示：

```
## 提议的路线图

**[N] 个阶段** | **[X] 个需求已映射** | 全部覆盖 ✓

| # | 阶段 | 目标 | 需求 | 成功标准 |
|---|-------|------|--------------|------------------|
| [N] | [名称] | [目标] | [REQ-ID] | [count] |

### 阶段详细信息

**阶段 [N]：[名称]**
目标：[goal]
需求：[REQ-IDs]
成功标准：
1. [criterion]
2. [criterion]
```

**通过 AskUserQuestion 请求批准：**
- "批准" — 提交并继续
- "调整阶段" — 告诉我要更改什么
- "审查完整文件" — 显示原始 ROADMAP.md

**如果 "调整"：** 获取注释，使用修订上下文重新生成路线图器，循环直到批准。
**如果 "审查"：** 显示原始 ROADMAP.md，重新询问。

**提交路线图**（批准后）：
```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "docs: create milestone v[X.Y] roadmap ([N] phases)" --files .planning/ROADMAP.md .planning/STATE.md .planning/REQUIREMENTS.md
```

## 11. 完成

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 里程碑已初始化 ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**里程碑 v[X.Y]：[Name]**

| 工件       | 位置                    |
|----------------|-----------------------------|
| 项目        | `.planning/PROJECT.md`      |
| 研究       | `.planning/research/`       |
| 需求   | `.planning/REQUIREMENTS.md` |
| 路线图        | `.planning/ROADMAP.md`      |

**[N] 个阶段** | **[X] 个需求** | 准备构建 ✓

## ▶ 接下来

**阶段 [N]：[阶段名称]** — [目标]

`/gsd:discuss-phase [N]` — 收集上下文并阐明方法

<sub>`/clear` 首先 → 新的上下文窗口</sub>

还有：`/gsd:plan-phase [N]` — 跳过讨论，直接规划
```

</process>

<success_criteria>
- [ ] PROJECT.md 已使用当前里程碑部分更新
- [ ] STATE.md 为新里程碑重置
- [ ] MILESTONE-CONTEXT.md 已消耗并删除（如果存在）
- [ ] 研究已完成（如果选中）— 4 个并行代理，里程碑感知
- [ ] 需求已按类别收集和范围化
- [ ] REQUIREMENTS.md 已使用 REQ-ID 创建
- [ ] gsd-roadmapper 已使用阶段编号上下文生成
- [ ] 路线图文件立即写入（不是草稿）
- [ ] 用户反馈已合并（如果有）
- [ ] ROADMAP.md 阶段从上一个里程碑继续
- [ ] 所有提交已完成（如果提交了规划文档）
- [ ] 用户知道下一步：`/gsd:discuss-phase [N]`

**原子提交：** 每个阶段立即提交其工件。
</success_criteria>
