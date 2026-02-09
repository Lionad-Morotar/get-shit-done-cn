---
name: gsd:set-profile
description: 切换 GSD agents 的模型配置（quality/balanced/budget）
argument-hint: <配置>
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
切换 GSD agents 使用的模型配置。控制每个 agent 使用哪个 Claude 模型，平衡质量与令牌消耗。

路由到 set-profile 工作流，该工作流处理：
- 参数验证（quality/balanced/budget）
- 如果缺失则创建配置文件
- 在 config.json 中更新配置
- 确认并显示模型表
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/set-profile.md
</execution_context>

<process>
**遵循 set-profile 工作流**，来自 `@~/.claude/get-shit-done/workflows/set-profile.md`。

该工作流处理所有逻辑，包括：
1. 配置参数验证
2. 配置文件确保
3. 配置读取和更新
4. 从 MODEL_PROFILES 生成模型表
5. 确认显示
</process>
