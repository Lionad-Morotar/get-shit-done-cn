---
name: gsd:help
description: 显示可用的 GSD 命令和使用指南
---
<objective>
显示完整的 GSD 命令参考。

**仅输出以下参考内容。** 不要添加：
- 项目特定分析
- Git 状态或文件上下文
- 下一步建议
- 参考之外的任何注释
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/help.md
</execution_context>

<process>
直接输出来自 @~/.claude/get-shit-done/workflows/help.md 的完整 GSD 命令参考。
直接显示参考内容 - 无添加或修改。
</process>
