---
name: gsd:verify-work
description: 通过对话式 UAT 验证已构建的功能
argument-hint: "[阶段编号，例如 '4']"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Edit
  - Write
  - Task
---
<objective>
通过带有持久状态的对话式测试验证已构建的功能。

目的：确认 Claude 构建的内容从用户角度来看确实有效。一次测试一个，纯文本响应，无审问。发现问题时，自动诊断、规划修复并准备执行。

输出：{phase}-UAT.md 跟踪所有测试结果。如果发现问题：诊断的差距、验证的修复计划准备用于 /gsd:execute-phase
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/verify-work.md
@~/.claude/get-shit-done/templates/UAT.md
</execution_context>

<context>
阶段: $ARGUMENTS（可选）
- 如果提供：测试特定阶段（例如，"4"）
- 如果未提供：检查活动会话或提示输入阶段

@.planning/STATE.md
@.planning/ROADMAP.md
</context>

<process>
端到端执行来自 @~/.claude/get-shit-done/workflows/verify-work.md 的 verify-work 工作流。
保留所有工作流关卡（会话管理、测试呈现、诊断、修复规划、路由）。
</process>
