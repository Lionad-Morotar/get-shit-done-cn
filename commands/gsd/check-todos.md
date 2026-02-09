---
name: gsd:check-todos
description: 列出待办事项并选择一个来处理
argument-hint: [区域筛选]
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
---

<objective>
列出所有待办事项，允许选择，为选定的待办事项加载完整上下文，并路由到适当的操作。

路由到 check-todos 工作流，该工作流处理：
- 待办事项计数和列表，带区域筛选
- 交互式选择，带完整上下文加载
- 路线图相关性检查
- 操作路由（现在工作、添加到阶段、头脑风暴、创建阶段）
- STATE.md 更新和 git 提交
</objective>

<execution_context>
@.planning/STATE.md
@.planning/ROADMAP.md
@~/.claude/get-shit-done/workflows/check-todos.md
</execution_context>

<process>
**遵循 check-todos 工作流**，来自 `@~/.claude/get-shit-done/workflows/check-todos.md`。

该工作流处理所有逻辑，包括：
1. 待办事项存在性检查
2. 区域筛选
3. 交互式列表和选择
4. 完整上下文加载，带文件摘要
5. 路线图相关性检查
6. 操作提供和执行
7. STATE.md 更新
8. Git 提交
</process>
