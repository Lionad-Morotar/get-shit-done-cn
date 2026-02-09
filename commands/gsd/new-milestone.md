---
name: gsd:new-milestone
description: 开始新的里程碑周期 — 更新 PROJECT.md 并路由到需求
argument-hint: "[里程碑名称，例如 'v1.1 通知']"
allowed-tools:
  - Read
  - Write
  - Bash
  - Task
  - AskUserQuestion
---
<objective>
开始新里程碑：质疑 → 研究（可选）→ 需求 → 路线图。

棕地项目的 new-project 等价物。项目存在，PROJECT.md 有历史。收集"下一步是什么"，更新 PROJECT.md，然后运行需求 → 路线图周期。

**创建/更新：**
- `.planning/PROJECT.md` — 使用新里程碑目标更新
- `.planning/research/` — 领域研究（可选，仅新功能）
- `.planning/REQUIREMENTS.md` — 此里程碑的范围需求
- `.planning/ROADMAP.md` — 阶段结构（继续编号）
- `.planning/STATE.md` — 为新里程碑重置

**之后：** `/gsd:plan-phase [N]` 开始执行。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/new-milestone.md
@~/.claude/get-shit-done/references/questioning.md
@~/.claude/get-shit-done/references/ui-brand.md
@~/.claude/get-shit-done/templates/project.md
@~/.claude/get-shit-done/templates/requirements.md
</execution_context>

<context>
里程碑名称: $ARGUMENTS（可选 - 如果未提供将提示）

**加载项目上下文：**
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/MILESTONES.md
@.planning/config.json

**加载里程碑上下文（如果存在，来自 /gsd:discuss-milestone）：**
@.planning/MILESTONE-CONTEXT.md
</context>

<process>
端到端执行来自 @~/.claude/get-shit-done/workflows/new-milestone.md 的 new-milestone 工作流。
保留所有工作流关卡（验证、质疑、研究、需求、路线图批准、提交）。
</process>
