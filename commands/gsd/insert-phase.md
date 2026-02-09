---
name: gsd:insert-phase
description: 将紧急工作作为小数阶段（例如 72.1）插入到现有阶段之间
argument-hint: <after> <description>
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
将小数阶段插入到里程碑期间发现的必须在现有整数阶段之间完成的紧急工作。

使用小数编号（72.1、72.2 等）在容纳紧急插入的同时保持计划阶段的逻辑顺序。

目的：在执行期间处理发现的紧急工作，而无需重新编号整个路线图。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/insert-phase.md
</execution_context>

<context>
参数: $ARGUMENTS（格式：<after-phase-number> <description>）

@.planning/ROADMAP.md
@.planning/STATE.md
</context>

<process>
端到端执行来自 @~/.claude/get-shit-done/workflows/insert-phase.md 的 insert-phase 工作流。
保留所有验证关卡（参数解析、阶段验证、小数计算、路线图更新）。
</process>
