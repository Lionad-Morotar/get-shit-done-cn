---
name: gsd:plan-phase
description: 为阶段创建详细的执行计划（PLAN.md），带验证循环
argument-hint: "[阶段] [--research] [--skip-research] [--gaps] [--skip-verify]"
agent: gsd-planner
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Task
  - WebFetch
  - mcp__context7__*
---
<objective>
为路线图阶段创建可执行的阶段提示（PLAN.md 文件），并集成研究和验证。

**默认流程：** 研究（如果需要）→ 规划 → 验证 → 完成

**编排器角色：** 解析参数、验证阶段、研究领域（除非跳过）、生成 gsd-planner、使用 gsd-plan-checker 验证、迭代直到通过或达到最大迭代次数、呈现结果。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/plan-phase.md
@~/.claude/get-shit-done/references/ui-brand.md
</execution_context>

<context>
阶段编号: $ARGUMENTS（可选 — 如果省略则自动检测下一个未计划的阶段）

**标志：**
- `--research` — 即使 RESEARCH.md 存在也强制重新研究
- `--skip-research` — 跳过研究，直接进入规划
- `--gaps` — 差距关闭模式（读取 VERIFICATION.md，跳过研究）
- `--skip-verify` — 跳过验证循环

在步骤 2 中规范化阶段输入，然后再进行任何目录查找。
</context>

<process>
端到端执行来自 @~/.claude/get-shit-done/workflows/plan-phase.md 的 plan-phase 工作流。
保留所有工作流关卡（验证、研究、规划、验证循环、路由）。
</process>
