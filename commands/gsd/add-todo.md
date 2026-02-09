---
name: gsd:add-todo
description: 从当前对话上下文中捕获想法或任务作为待办事项
argument-hint: [可选描述]
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
---

<objective>
将在 GSD 会话期间出现的想法、任务或问题捕获为结构化的待办事项，以便后续工作。

路由到 add-todo 工作流，该工作流处理：
- 目录结构创建
- 从参数或对话中提取内容
- 从文件路径推断区域
- 重复检测和解决
- 创建带 frontmatter 的待办文件
- STATE.md 更新
- Git 提交
</objective>

<execution_context>
@.planning/STATE.md
@~/.claude/get-shit-done/workflows/add-todo.md
</execution_context>

<process>
**遵循 add-todo 工作流**，来自 `@~/.claude/get-shit-done/workflows/add-todo.md`。

该工作流处理所有逻辑，包括：
1. 确保目录存在
2. 检查现有区域
3. 内容提取（参数或对话）
4. 区域推断
5. 重复检查
6. 文件创建与 slug 生成
7. STATE.md 更新
8. Git 提交
</process>
