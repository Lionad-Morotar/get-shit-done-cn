---
name: gsd:execute-phase
description: 使用基于波并行化执行阶段中的所有计划
argument-hint: "<阶段编号> [--gaps-only]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
  - TodoWrite
  - AskUserQuestion
---
<objective>
使用基于波的并行执行来执行阶段中的所有计划。

编排器保持精简：发现计划、分析依赖关系、分组为波、生成子代理、收集结果。每个子代理加载完整的 execute-plan 上下文并处理自己的计划。

上下文预算：~15% 编排器，每个子代理 100% 新上下文。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-phase.md
@~/.claude/get-shit-done/references/ui-brand.md
</execution_context>

<context>
阶段: $ARGUMENTS

**标志：**
- `--gaps-only` — 仅执行差距关闭计划（frontmatter 中带有 `gap_closure: true` 的计划）。在 verify-work 创建修复计划后使用。

@.planning/ROADMAP.md
@.planning/STATE.md
</context>

<process>
端到端执行来自 @~/.claude/get-shit-done/workflows/execute-phase.md 的 execute-phase 工作流。
保留所有工作流关卡（波执行、检查点处理、验证、状态更新、路由）。
</process>
