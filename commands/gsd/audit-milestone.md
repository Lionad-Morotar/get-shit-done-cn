---
name: gsd:audit-milestone
description: 在归档之前审计里程碑完成情况是否符合原始意图
argument-hint: "[版本]"
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
  - Task
  - Write
---
<objective>
验证里程碑是否达到了其完成定义。检查需求覆盖、跨阶段集成和端到端流程。

**此命令本身是编排器。** 读取现有的 VERIFICATION.md 文件（在 execute-phase 期间已验证的阶段），汇总技术债务和延迟的差距，然后生成集成检查器以进行跨阶段连接。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/audit-milestone.md
</execution_context>

<context>
版本: $ARGUMENTS（可选 — 默认为当前里程碑）

**原始意图：**
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md

**计划工作：**
@.planning/ROADMAP.md
@.planning/config.json（如果存在）

**已完成工作：**
Glob: .planning/phases/*/*-SUMMARY.md
Glob: .planning/phases/*/*-VERIFICATION.md
</context>

<process>
端到端执行来自 @~/.claude/get-shit-done/workflows/audit-milestone.md 的 audit-milestone 工作流。
保留所有工作流关卡（范围确定、验证读取、集成检查、需求覆盖、路由）。
</process>
