---
name: gsd:quick
description: 使用 GSD 保证（原子提交、状态跟踪）执行快速任务，但跳过可选代理
argument-hint: ""
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
  - AskUserQuestion
---
<objective>
使用 GSD 保证（原子提交、STATE.md 跟踪）执行小型、临时任务，同时跳过可选代理（research、plan-checker、verifier）。

快速模式是相同系统的更短路径：
- 生成 gsd-planner（快速模式）+ gsd-executor
- 跳过 gsd-phase-researcher、gsd-plan-checker、gsd-verifier
- 快速任务位于 `.planning/quick/` 中，与计划阶段分离
- 更新 STATE.md"已完成的快速任务"表（而非 ROADMAP.md）

使用场景：你确切知道要做什么，并且任务足够小，不需要研究或验证。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/quick.md
</execution_context>

<context>
@.planning/STATE.md
</context>

<process>
端到端执行来自 @~/.claude/get-shit-done/workflows/quick.md 的 quick 工作流。
保留所有工作流关卡（验证、任务描述、规划、执行、状态更新、提交）。
</process>
