---
name: gsd:debug
description: 使用跨上下文重置的持久状态进行系统性调试
argument-hint: [问题描述]
allowed-tools:
  - Read
  - Bash
  - Task
  - AskUserQuestion
---

<objective>
使用科学方法和子代理隔离来调试问题。

**编排器角色：** 收集症状、生成 gsd-debugger agent、处理检查点、生成延续。

**为什么使用子代理：** 调查会快速消耗上下文（读取文件、形成假设、测试）。每次调查都有新的 200k 上下文。主上下文保持精简以便用户交互。
</objective>

<context>
用户的问题: $ARGUMENTS

检查活动会话：
```bash
ls .planning/debug/*.md 2>/dev/null | grep -v resolved | head -5
```
</context>

<process>

## 0. 初始化上下文

```bash
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js state load)
```

从 init JSON 提取 `commit_docs`。解析调试器模型：
```bash
DEBUGGER_MODEL=$(node ~/.claude/get-shit-done/bin/gsd-tools.js resolve-model gsd-debugger --raw)
```

## 1. 检查活动会话

如果存在活动会话且没有 $ARGUMENTS：
- 列出会话及其状态、假设、下一步操作
- 用户选择数字以恢复或描述新问题

如果提供了 $ARGUMENTS 或用户描述了新问题：
- 继续进行症状收集

## 2. 收集症状（如果是新问题）

对每个症状使用 AskUserQuestion：

1. **预期行为** - 应该发生什么？
2. **实际行为** - 实际发生了什么？
3. **错误消息** - 有任何错误吗？（粘贴或描述）
4. **时间线** - 这什么时候开始的？曾经工作过吗？
5. **重现** - 你如何触发它？

收集完所有后，确认准备好进行调查。

## 3. 生成 gsd-debugger Agent

填充提示并生成：

```markdown
<objective>
调查问题: {slug}

**摘要：** {trigger}
</objective>

<symptoms>
expected: {expected}
actual: {actual}
errors: {errors}
reproduction: {reproduction}
timeline: {timeline}
</symptoms>

<mode>
symptoms_prefilled: true
goal: find_and_fix
</mode>

<debug_file>
创建: .planning/debug/{slug}.md
</debug_file>
```

```
Task(
  prompt=filled_prompt,
  subagent_type="gsd-debugger",
  model="{debugger_model}",
  description="调试 {slug}"
)
```

## 4. 处理 Agent 返回

**如果 `## ROOT CAUSE FOUND`：**
- 显示根本原因和证据摘要
- 提供选项：
  - "现在修复" - 生成修复子代理
  - "计划修复" - 建议 /gsd:plan-phase --gaps
  - "手动修复" - 完成

**如果 `## CHECKPOINT REACHED`：**
- 向用户呈现检查点详情
- 获取用户响应
- 生成延续代理（见步骤 5）

**如果 `## INVESTIGATION INCONCLUSIVE`：**
- 显示已检查和已消除的内容
- 提供选项：
  - "继续调查" - 使用附加上下文生成新代理
  - "手动调查" - 完成
  - "添加更多上下文" - 收集更多症状，再次生成

## 5. 生成延续代理（检查点后）

当用户响应检查点时，生成新的代理：

```markdown
<objective>
继续调试 {slug}。证据在调试文件中。
</objective>

<prior_state>
调试文件: @.planning/debug/{slug}.md
</prior_state>

<checkpoint_response>
**类型：** {checkpoint_type}
**响应：** {user_response}
</checkpoint_response>

<mode>
goal: find_and_fix
</mode>
```

```
Task(
  prompt=continuation_prompt,
  subagent_type="gsd-debugger",
  model="{debugger_model}",
  description="继续调试 {slug}"
)
```

</process>

<success_criteria>
- [ ] 活动会话已检查
- [ ] 症状已收集（如果是新的）
- [ ] 使用上下文生成了 gsd-debugger
- [ ] 检查点处理正确
- [ ] 在修复前确认了根本原因
</success_criteria>
