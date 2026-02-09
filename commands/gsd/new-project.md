---
name: gsd:new-project
description: 通过深度上下文收集和 PROJECT.md 初始化新项目
argument-hint: "[--auto]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---
<context>
**标志：**
- `--auto` — 自动模式。配置问题后，运行研究 → 需求 → 路线图而无需进一步交互。期望通过 @ 引用提供想法文档。
</context>

<objective>
通过统一流程初始化新项目：质疑 → 研究（可选）→ 需求 → 路线图。

**创建：**
- `.planning/PROJECT.md` — 项目上下文
- `.planning/config.json` — 工作流偏好
- `.planning/research/` — 领域研究（可选）
- `.planning/REQUIREMENTS.md` — 范围需求
- `.planning/ROADMAP.md` — 阶段结构
- `.planning/STATE.md` — 项目记忆

**此命令后：** 运行 `/gsd:plan-phase 1` 开始执行。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/new-project.md
@~/.claude/get-shit-done/references/questioning.md
@~/.claude/get-shit-done/references/ui-brand.md
@~/.claude/get-shit-done/templates/project.md
@~/.claude/get-shit-done/templates/requirements.md
</execution_context>

<process>
端到端执行来自 @~/.claude/get-shit-done/workflows/new-project.md 的 new-project 工作流。
保留所有工作流关卡（验证、批准、提交、路由）。
</process>
