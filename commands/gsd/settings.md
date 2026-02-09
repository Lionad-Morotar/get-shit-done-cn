---
name: gsd:settings
description: 配置 GSD 工作流切换和模型配置
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
---

<objective>
通过多问题提示交互式配置 GSD 工作流 agents 和模型配置。

路由到 settings 工作流，该工作流处理：
- 配置存在性确保
- 当前设置读取和解析
- 交互式 5 问题提示（模型、研究、plan_check、verifier、branching）
- 配置合并和写入
- 确认显示并附带快速命令参考
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/settings.md
</execution_context>

<process>
**遵循 settings 工作流**，来自 `@~/.claude/get-shit-done/workflows/settings.md`。

该工作流处理所有逻辑，包括：
1. 如果缺失则使用默认值创建配置文件
2. 当前配置读取
3. 交互式设置呈现并带预选
4. 答案解析和配置合并
5. 文件写入
6. 确认显示
</process>
