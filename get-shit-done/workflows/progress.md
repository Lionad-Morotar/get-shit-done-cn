<purpose>
检查项目进度，总结最近的工作和未来的工作，然后智能路由到下一个操作 — 执行现有计划或创建下一个计划。在继续工作之前提供态势感知。
</purpose>

<required_reading>
在开始之前读取执行上下文引用的所有文件。
</required_reading>

<process>

<step name="init_context">
**加载进度上下文（包括文件内容以避免冗余读取）：**

```bash
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js init progress --include state,roadmap,project,config)
```

从 init JSON 提取：`project_exists`、`roadmap_exists`、`state_exists`、`phases`、`current_phase`、`next_phase`、`milestone_version`、`completed_count`、`phase_count`、`paused_at`。

**文件内容（来自 --include）：** `state_content`、`roadmap_content`、`project_content`、`config_content`。如果文件不存在，这些为 null。

如果 `project_exists` 为 false（没有 `.planning/` 目录）：

```
未找到规划结构。

运行 /gsd:new-project 以启动新项目。
```

退出。

如果缺少 STATE.md：建议 `/gsd:new-project`。

**如果缺少 ROADMAP.md 但存在 PROJECT.md：**

这意味着里程碑已完成并归档。转到 **路由 F**（里程碑之间）。

如果 ROADMAP.md 和 PROJECT.md 都缺少：建议 `/gsd:new-project`。
</step>

<step name="load">
**使用来自 INIT 的项目上下文：**

所有文件内容已在 init_context 步骤中通过 `--include` 加载：
- `state_content` — 活动内存（位置、决策、问题）
- `roadmap_content` — 阶段结构和目标
- `project_content` — 当前状态（这是什么、核心价值、需求）
- `config_content` — 设置（model_profile、工作流切换）

不需要额外的文件读取。
</step>

<step name="analyze_roadmap">
**获取综合路线图分析（代替手动解析）：**

```bash
ROADMAP=$(node ~/.claude/get-shit-done/bin/gsd-tools.js roadmap analyze)
```

这返回结构化 JSON，包括：
- 所有阶段及其磁盘状态（complete/partial/planned/empty/no_directory）
- 每个阶段的目标和依赖项
- 每个阶段的计划和摘要计数
- 聚合统计：总计划、摘要、进度百分比
- 当前和下一个阶段识别

使用此代替手动读取/解析 ROADMAP.md。
</step>

<step name="recent">
**收集最近的工作上下文：**

- 查找 2-3 个最近的 SUMMARY.md 文件
- 使用 `summary-extract` 进行高效解析：
  ```bash
  node ~/.claude/get-shit-done/bin/gsd-tools.js summary-extract <path> --fields one_liner
  ```
- 这显示"我们一直在做什么"
</step>

<step name="position">
**从 init 上下文和路线图分析解析当前位置：**

- 使用来自路线图分析的 `current_phase` 和 `next_phase`
- 使用来自分析的阶段级 `has_context` 和 `has_research` 标志
- 注意如果工作暂停，`paused_at`（来自 init 上下文）
- 计算待处理待办事项：使用 `init todos` 或 `list-todos`
- 检查活动调试会话：`ls .planning/debug/*.md 2>/dev/null | grep -v resolved | wc -l`
</step>

<step name="report">
**从 gsd-tools 生成进度条，然后呈现丰富的状态报告：**

```bash
# 获取格式化的进度条
PROGRESS_BAR=$(node ~/.claude/get-shit-done/bin/gsd-tools.js progress bar --raw)
```

呈现：

```
# [项目名称]

**进度：** {PROGRESS_BAR}
**配置文件：** [quality/balanced/budget]

## 最近的工作
- [阶段 X，计划 Y]：[完成的内容 - 来自 summary-extract 的一行]
- [阶段 X，计划 Z]：[完成的内容 - 来自 summary-extract 的一行]

## 当前位置
总计 [total] 中的阶段 [N]：[phase-name]
[phase-total] 中的计划 [M]：[status]
上下文：[如果 has_context 则为 ✓ | 如果不是则为 -]

## 做出的关键决策
- [来自 STATE.md 的决策 1]
- [决策 2]

## 阻塞因素/关注点
- [来自 STATE.md 的任何阻塞因素或关注点]

## 待处理待办事项
- [count] 待处理 — /gsd:check-todos 以审查

## 活动调试会话
- [count] 活动 — /gsd:debug 以继续
（仅当 count > 0 时显示此部分）

## 接下来
[来自路线图分析的下一个阶段/计划目标]
```

</step>

<step name="route">
**根据验证的计数确定下一个操作。**

**步骤 1：计算当前阶段中的计划、摘要和问题**

列出当前阶段目录中的文件：

```bash
ls -1 .planning/phases/[current-phase-dir]/*-PLAN.md 2>/dev/null | wc -l
ls -1 .planning/phases/[current-phase-dir]/*-SUMMARY.md 2>/dev/null | wc -l
ls -1 .planning/phases/[current-phase-dir]/*-UAT.md 2>/dev/null | wc -l
```

状态："此阶段有 {X} 个计划，{Y} 个摘要。"

**步骤 1.5：检查未处理的 UAT 缺陷**

检查状态为 "diagnosed"（有需要修复的缺陷）的 UAT.md 文件。

```bash
# 检查已诊断的 UAT 及缺陷
grep -l "status: diagnosed" .planning/phases/[current-phase-dir]/*-UAT.md 2>/dev/null
```

跟踪：
- `uat_with_gaps`：状态为 "diagnosed" 的 UAT.md 文件（缺陷需要修复）

**步骤 2：根据计数路由**

| 条件 | 含义 | 操作 |
|-----------|---------|--------|
| uat_with_gaps > 0 | UAT 缺陷需要修复计划 | 转到 **路由 E** |
| summaries < plans | 存在未执行的计划 | 转到 **路由 A** |
| summaries = plans AND plans > 0 | 阶段完成 | 转到步骤 3 |
| plans = 0 | 阶段尚未规划 | 转到 **路由 B** |

---

**路由 A：存在未执行的计划**

查找第一个没有匹配 SUMMARY.md 的 PLAN.md。
读取其 `<objective>` 部分。

```
---

## ▶ 接下来

**{phase}-{plan}：[计划名称]** — [来自 PLAN.md 的目标摘要]

`/gsd:execute-phase {phase}`

<sub>/clear first → 新的上下文窗口</sub>

---
```

---

**路由 B：阶段需要规划**

检查阶段目录中是否存在 `{phase}-CONTEXT.md`。

**如果存在 CONTEXT.md：**

```
---

## ▶ 接下来

**阶段 {N}：{Name}** — {来自 ROADMAP.md 的 Goal}
<sub>✓ 上下文已收集，准备规划</sub>

`/gsd:plan-phase {phase-number}`

<sub>/clear first → 新的上下文窗口</sub>

---
```

**如果不存在 CONTEXT.md：**

```
---

## ▶ 接下来

**阶段 {N}：{Name}** — {来自 ROADMAP.md 的 Goal}

`/gsd:discuss-phase {phase}` — 收集上下文并阐明方法

<sub>/clear first → 新的上下文窗口</sub>

---

**也可用：**
- `/gsd:plan-phase {phase}` — 跳过讨论，直接规划
- `/gsd:list-phase-assumptions {phase}` — 查看 Claude 的假设

---
```

---

**路由 E：UAT 缺陷需要修复计划**

存在带有缺陷（已诊断问题）的 UAT.md。用户需要规划修复。

```
---

## ⚠ 发现 UAT 缺陷

**{phase}-UAT.md** 有 {N} 个需要修复的缺陷。

`/gsd:plan-phase {phase} --gaps`

<sub>/clear first → 新的上下文窗口</sub>

---

**也可用：**
- `/gsd:execute-phase {phase}` — 执行阶段计划
- `/gsd:verify-work {phase}` — 运行更多 UAT 测试

---
```

---

**步骤 3：检查里程碑状态（仅在阶段完成时）**

读取 ROADMAP.md 并识别：
1. 当前阶段编号
2. 当前里程碑部分中的所有阶段编号

计算总阶段数并识别最高的阶段编号。

状态："当前阶段是 {X}。里程碑有 {N} 个阶段（最高：{Y}）。"

**根据里程碑状态路由：**

| 条件 | 含义 | 操作 |
|-----------|---------|--------|
| 当前阶段 < 最高阶段 | 更多阶段保留 | 转到 **路由 C** |
| 当前阶段 = 最高阶段 | 里程碑完成 | 转到 **路由 D** |

---

**路由 C：阶段完成，更多阶段保留**

读取 ROADMAP.md 以获取下一个阶段的名称和目标。

```
---

## ✓ 阶段 {Z} 完成

## ▶ 接下来

**阶段 {Z+1}：{Name}** — {来自 ROADMAP.md 的 Goal}

`/gsd:discuss-phase {Z+1}` — 收集上下文并阐明方法

<sub>/clear first → 新的上下文窗口</sub>

---

**也可用：**
- `/gsd:plan-phase {Z+1}` — 跳过讨论，直接规划
- `/gsd:verify-work {Z}` — 继续之前进行用户验收测试

---
```

---

**路由 D：里程碑完成**

```
---

## 🎉 里程碑完成

所有 {N} 个阶段已完成！

## ▶ 接下来

**完成里程碑** — 归档并准备下一个

`/gsd:complete-milestone`

<sub>/clear first → 新的上下文窗口</sub>

---

**也可用：**
- `/gsd:verify-work` — 完成里程碑之前的用户验收测试

---
```

---

**路由 F：里程碑之间（缺少 ROADMAP.md，存在 PROJECT.md）**

里程碑已完成并归档。准备开始下一个里程碑周期。

读取 MILESTONES.md 以查找最后完成的里程碑版本。

```
---

## ✓ 里程碑 v{X.Y} 完成

准备规划下一个里程碑。

## ▶ 接下来

**开始下一个里程碑** — 提问 → 研究 → 需求 → 路线图

`/gsd:new-milestone`

<sub>/clear first → 新的上下文窗口</sub>

---
```

</step>

<step name="edge_cases">
**处理边缘情况：**

- 阶段完成但下一个阶段未规划 — 提供 `/gsd:plan-phase [next]`
- 所有工作完成 — 提供里程碑完成
- 存在阻塞因素 — 在提供继续之前突出显示
- 存在交接文件 — 提及它，提供 `/gsd:resume-work`
</step>

</process>

<success_criteria>

- [ ] 提供了丰富的上下文（最近的工作、决策、问题）
- [ ] 当前位置清晰，带有视觉进度
- [ ] 清楚解释了下一步
- [ ] 智能路由：如果存在计划则为 /gsd:execute-phase，如果不存在则为 /gsd:plan-phase
- [ ] 用户在任何操作之前确认
- [ ] 无缝交接到适当的 gsd 命令
</success_criteria>
