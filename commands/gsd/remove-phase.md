---
name: gsd:remove-phase
description: 从路线图中删除未来阶段并重新编号后续阶段
argument-hint: <阶段编号>
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
---
<objective>
从路线图中删除未开始的未来阶段，并重新编号所有后续阶段以保持清晰、线性的序列。

目的：干净地删除你已决定不做的工作，而不会用已取消/延迟标记污染上下文。
输出：阶段已删除，所有后续阶段已重新编号，git 提交作为历史记录。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/remove-phase.md
</execution_context>

<context>
阶段: $ARGUMENTS

@.planning/ROADMAP.md
@.planning/STATE.md
</context>

<process>
端到端执行来自 @~/.claude/get-shit-done/workflows/remove-phase.md 的 remove-phase 工作流。
保留所有验证关卡（未来阶段检查、工作检查）、重新编号逻辑和提交。
</process>
