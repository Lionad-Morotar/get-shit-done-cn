<purpose>
通过具有持久状态的对话式测试验证已构建的功能。创建跟踪测试进度的 UAT.md，在 /clear 中存活，并将差距反馈到 /gsd:plan-phase --gaps。
</purpose>

<philosophy>
**展示预期，询问现实是否匹配。**

Claude 展示应该发生什么。用户确认或描述差异。
- "yes" / "y" / "next" / 空 → 通过
- 其他任何内容 → 记录为问题，推断严重性

没有通过/失败按钮。没有严重性问题。只是："这里应该发生什么。发生了吗？"
</philosophy>

<template>
@~/.claude/get-shit-done/templates/UAT.md
</template>

<process>

<step name="initialize" priority="first">
如果 $ARGUMENTS 包含阶段编号，加载上下文：

```bash
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js init verify-work "${PHASE_ARG}")
```

解析 JSON 获取：`planner_model`、`checker_model`、`commit_docs`、`phase_found`、`phase_dir`、`phase_number`、`phase_name`、`has_verification`。
</step>

<step name="check_active_session">
**首先：检查活动 UAT 会话**

```bash
find .planning/phases -name "*-UAT.md" -type f 2>/dev/null | head -5
```

**如果存在活动会话且未提供 $ARGUMENTS：**

读取每个文件的前置元数据（status、phase）和当前测试部分。

内联显示：

```
## 活动 UAT 会话

| # | 阶段 | 状态 | 当前测试 | 进度 |
|---|-------|--------|--------------|----------|
| 1 | 04-comments | testing | 3. Reply to Comment | 2/6 |
| 2 | 05-auth | testing | 1. Login Form | 0/4 |

回复数字以恢复，或提供阶段编号以开始新的。
```

等待用户响应。

- 如果用户回复数字（1、2）→ 加载该文件，转到 `resume_from_file`
- 如果用户回复阶段编号 → 视为新会话，转到 `create_uat_file`

**如果存在活动会话且提供了 $ARGUMENTS：**

检查该阶段是否存在会话。如果是，提供恢复或重新开始选项。
如果否，继续到 `create_uat_file`。

**如果没有活动会话且未提供 $ARGUMENTS：**

```
无活动 UAT 会话。

提供阶段编号以开始测试（例如，/gsd:verify-work 4）
```

**如果没有活动会话且提供了 $ARGUMENTS：**

继续到 `create_uat_file`。
</step>

<step name="find_summaries">
**查找要测试的内容：**

使用 init 中的 `phase_dir`（如果尚未运行 init 则运行它）。

```bash
ls "$phase_dir"/*-SUMMARY.md 2>/dev/null
```

读取每个 SUMMARY.md 以提取可测试的交付物。
</step>

<step name="extract_tests">
**从 SUMMARY.md 提取可测试的交付物：**

解析：
1. **成就** — 添加的功能/功能
2. **面向用户的变化** — UI、工作流程、交互

专注于用户可观察的结果，而不是实现细节。

对于每个交付物，创建一个测试：
- name：简短的测试名称
- expected：用户应该看到/体验到的内容（具体的、可观察的）

示例：
- 成就："Added comment threading with infinite nesting"
  → 测试："Reply to a Comment"
  → 预期："Clicking Reply opens inline composer below comment. Submitting shows reply nested under parent with visual indentation."

跳过内部/不可观察的项目（重构、类型更改等）。
</step>

<step name="create_uat_file">
**创建包含所有测试的 UAT 文件：**

```bash
mkdir -p "$PHASE_DIR"
```

从提取的交付物构建测试列表。

创建文件：

```markdown
---
status: testing
phase: XX-name
source: [SUMMARY.md 文件列表]
started: [ISO 时间戳]
updated: [ISO 时间戳]
---

## 当前测试
<!-- 每个测试覆盖 - 显示我们在哪里 -->

number: 1
name: [第一个测试名称]
expected: |
  [用户应该观察到的]
awaiting: user response

## 测试

### 1. [测试名称]
expected: [可观察行为]
result: [pending]

### 2. [测试名称]
expected: [可观察行为]
result: [pending]

...

## 总结

total: [N]
passed: 0
issues: 0
pending: [N]
skipped: 0

## 差距

[尚无]
```

写入到 `.planning/phases/XX-name/{phase}-UAT.md`

继续到 `present_test`。
</step>

<step name="present_test">
**向用户展示当前测试：**

从 UAT 文件读取当前测试部分。

使用检查点框格式显示：

```
╔══════════════════════════════════════════════════════════════╗
║  CHECKPOINT: 需要验证                           ║
╚══════════════════════════════════════════════════════════════╝

**测试 {number}: {name}**

{expected}

──────────────────────────────────────────────────────────────
→ 输入 "pass" 或描述问题
──────────────────────────────────────────────────────────────
```

等待用户响应（纯文本，无 AskUserQuestion）。
</step>

<step name="process_response">
**处理用户响应并更新文件：**

**如果响应指示通过：**
- 空响应、"yes"、"y"、"ok"、"pass"、"next"、"approved"、"✓"

更新测试部分：
```
### {N}. {name}
expected: {expected}
result: pass
```

**如果响应指示跳过：**
- "skip"、"can't test"、"n/a"

更新测试部分：
```
### {N}. {name}
expected: {expected}
result: skipped
reason: [用户的原因（如果提供）]
```

**如果响应是其他任何内容：**
- 视为问题描述

从描述推断严重性：
- 包含：crash、error、exception、fails、broken、unusable → blocker
- 包含：doesn't work、wrong、missing、can't → major
- 包含：slow、weird、off、minor、small → minor
- 包含：color、font、spacing、alignment、visual → cosmetic
- 如果不清楚则默认：major

更新测试部分：
```
### {N}. {name}
expected: {expected}
result: issue
reported: "{逐字用户响应}"
severity: {inferred}
```

附加到差距部分（用于 plan-phase --gaps 的结构化 YAML）：
```yaml
- truth: "{来自测试的预期行为}"
  status: failed
  reason: "User reported: {逐字用户响应}"
  severity: {inferred}
  test: {N}
  artifacts: []  # 由诊断填充
  missing: []    # 由诊断填充
```

**任何响应后：**

更新总结计数。
更新前置元数据.updated 时间戳。

如果更多测试剩余 → 更新当前测试，转到 `present_test`
如果没有更多测试 → 转到 `complete_session`
</step>

<step name="resume_from_file">
**从 UAT 文件恢复测试：**

读取完整的 UAT 文件。

查找第一个带有 `result: [pending]` 的测试。

宣布：
```
恢复：阶段 {phase} UAT
进度：{passed + issues + skipped}/{total}
目前发现的问题：{issues count}

从测试 {N} 继续...
```

用待处理测试更新当前测试部分。
继续到 `present_test`。
</step>

<step name="complete_session">
**完成测试并提交：**

更新前置元数据：
- status: complete
- updated: [现在]

清除当前测试部分：
```
## 当前测试

[测试完成]
```

提交 UAT 文件：
```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "test({phase}): complete UAT - {passed} passed, {issues} issues" --files ".planning/phases/XX-name/{phase}-UAT.md"
```

展示总结：
```
## UAT 完成：阶段 {phase}

| 结果 | 计数 |
|--------|-------|
| 通过 | {N}   |
| 问题 | {N}   |
| 跳过| {N}   |

[如果 issues > 0:]
### 发现的问题

[来自问题部分的列表]
```

**如果 issues > 0：** 转到 `diagnose_issues`

**如果 issues == 0：**
```
所有测试通过。准备继续。

- `/gsd:plan-phase {next}` — 规划下一个阶段
- `/gsd:execute-phase {next}` — 执行下一个阶段
```
</step>

<step name="diagnose_issues">
**在规划修复之前诊断根本原因：**

```
---

{N} 个问题。诊断根本原因...

生成并行调试代理以调查每个问题。
```

- 加载 diagnose-issues 工作流程
- 遵循 @~/.claude/get-shit-done/workflows/diagnose-issues.md
- 为每个问题生成并行调试代理
- 收集根本原因
- 使用根本原因更新 UAT.md
- 继续到 `plan_gap_closure`

诊断自动运行 — 无用户提示。并行代理同时调查，因此开销最小且修复更准确。
</step>

<step name="plan_gap_closure">
**从诊断的差距自动规划修复：**

显示：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 规划修复
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 为差距关闭生成规划器...
```

以 --gaps 模式生成 gsd-planner：

```
Task(
  prompt="""
<planning_context>

**阶段：** {phase_number}
**模式：** gap_closure

**带有诊断的 UAT：**
@.planning/phases/{phase_dir}/{phase}-UAT.md

**项目状态：**
@.planning/STATE.md

**路线图：**
@.planning/ROADMAP.md

</planning_context>

<downstream_consumer>
输出由 /gsd:execute-phase 消费
计划必须是可执行的提示。
</downstream_consumer>
""",
  subagent_type="gsd-planner",
  model="{planner_model}",
  description="为阶段 {phase} 规划差距修复"
)
```

返回时：
- **规划完成：** 转到 `verify_gap_plans`
- **规划无结果：** 报告并提供手动干预
</step>

<step name="verify_gap_plans">
**使用检查器验证修复计划：**

显示：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 验证修复计划
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 生成计划检查器...
```

初始化：`iteration_count = 1`

生成 gsd-plan-checker：

```
Task(
  prompt="""
<verification_context>

**阶段：** {phase_number}
**阶段目标：** 关闭来自 UAT 的诊断差距

**要验证的计划：**
@.planning/phases/{phase_dir}/*-PLAN.md

</verification_context>

<expected_output>
返回以下之一：
- ## 验证通过 — 所有检查通过
- ## 发现问题 — 结构化问题列表
</expected_output>
""",
  subagent_type="gsd-plan-checker",
  model="{checker_model}",
  description="验证阶段 {phase} 修复计划"
)
```

返回时：
- **验证通过：** 转到 `present_ready`
- **发现问题：** 转到 `revision_loop`
</step>

<step name="revision_loop">
**迭代规划器 ↔ 检查器直到计划通过（最多 3 次）：**

**如果 iteration_count < 3：**

显示：`发送回规划器进行修订...（迭代 {N}/3）`

使用修订上下文生成 gsd-planner：

```
Task(
  prompt="""
<revision_context>

**阶段：** {phase_number}
**模式：** revision

**现有计划：**
@.planning/phases/{phase_dir}/*-PLAN.md

**检查器问题：**
{来自检查器的结构化问题}

</revision_context>

<instructions>
读取现有 PLAN.md 文件。进行针对性更新以解决检查器问题。
除非问题是根本性的，否则不要从头重新规划。
</instructions>
""",
  subagent_type="gsd-planner",
  model="{planner_model}",
  description="修订阶段 {phase} 计划"
)
```

规划器返回后 → 再次生成检查器（verify_gap_plans 逻辑）
增加 iteration_count

**如果 iteration_count >= 3：**

显示：`达到最大迭代次数。{N} 个问题剩余。`

提供选项：
1. 强制继续（尽管有问题仍执行）
2. 提供指导（用户给出方向，重试）
3. 放弃（退出，用户手动运行 /gsd:plan-phase）

等待用户响应。
</step>

<step name="present_ready">
**展示完成和下一步：**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 修复准备就绪 ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**阶段 {X}: {Name}** — {N} 个差距已诊断，{M} 个修复计划已创建

| 差距 | 根本原因 | 修复计划 |
|-----|------------|----------|
| {truth 1} | {root_cause} | {phase}-04 |
| {truth 2} | {root_cause} | {phase}-04 |

计划已验证并准备好执行。

───────────────────────────────────────────────────────────────

## ▶ 接下来

**执行修复** — 运行修复计划

`/clear` 然后 `/gsd:execute-phase {phase} --gaps-only`

───────────────────────────────────────────────────────────────
```
</step>

</process>

<update_rules>
**批量写入以提高效率：**

将结果保留在内存中。仅在以下情况写入文件：
1. **发现问题** — 立即保留问题
2. **会话完成** — 提交前的最终写入
3. **检查点** — 每 5 个通过的测试（安全网）

| 部分 | 规则 | 写入时间 |
|---------|------|--------------|
| 前置元数据.status | 覆盖 | 开始、完成 |
| 前置元数据.updated | 覆盖 | 任何文件写入时 |
| 当前测试 | 覆盖 | 任何文件写入时 |
| 测试.{N}.result | 覆盖 | 任何文件写入时 |
| 总结 | 覆盖 | 任何文件写入时 |
| 差距 | 附加 | 发现问题时 |

上下文重置时：文件显示最后一个检查点。从那里恢复。
</update_rules>

<severity_inference>
**从用户的自然语言推断严重性：**

| 用户说 | 推断 |
|-----------|-------|
| "crashes"、"error"、"exception"、"fails completely" | blocker |
| "doesn't work"、"nothing happens"、"wrong behavior" | major |
| "works but..."、"slow"、"weird"、"minor issue" | minor |
| "color"、"spacing"、"alignment"、"looks off" | cosmetic |

如果不清楚则默认为 **major**。如果需要，用户可以更正。

**从不问"这有多严重？"** — 只需推断并继续。
</severity_inference>

<success_criteria>
- [ ] 使用来自 SUMMARY.md 的所有测试创建 UAT 文件
- [ ] 测试一次展示一个，带有预期行为
- [ ] 用户响应处理为通过/问题/跳过
- [ ] 从描述推断严重性（从不询问）
- [ ] 批量写入：发现问题、每 5 次通过或完成时
- [ ] 完成时提交
- [ ] 如果有问题：并行调试代理诊断根本原因
- [ ] 如果有问题：gsd-planner 创建修复计划（gap_closure 模式）
- [ ] 如果有问题：gsd-plan-checker 验证修复计划
- [ ] 如果有问题：修订循环直到计划通过（最多 3 次迭代）
- [ ] 完成时准备好 `/gsd:execute-phase --gaps-only`
</success_criteria>
