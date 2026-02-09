---
name: gsd:plan-milestone-gaps
description: 创建阶段以关闭里程碑审计识别的所有差距
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
---
<objective>
创建关闭 `/gsd:audit-milestone` 识别的差距所需的所有阶段。

读取 MILESTONE-AUDIT.md，将差距分组为逻辑阶段，在 ROADMAP.md 中创建阶段条目，并提供规划每个阶段。

一个命令创建所有修复阶段 — 无需针对每个差距手动 `/gsd:add-phase`。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/plan-milestone-gaps.md
</execution_context>

<context>
**审计结果：**
Glob: .planning/v*-MILESTONE-AUDIT.md（使用最新的）

**原始意图（用于优先级排序）：**
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md

**当前状态：**
@.planning/ROADMAP.md
@.planning/STATE.md
</context>

<process>
端到端执行来自 @~/.claude/get-shit-done/workflows/plan-milestone-gaps.md 的 plan-milestone-gaps 工作流。
保留所有工作流关卡（审计加载、优先级排序、阶段分组、用户确认、路线图更新）。
</process>
