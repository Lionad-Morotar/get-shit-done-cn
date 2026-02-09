# 从这里继续模板

为 `.planning/phases/XX-name/.continue-here.md` 复制并填写此结构：

```yaml
---
phase: XX-name
task: 3
total_tasks: 7
status: in_progress
last_updated: 2025-01-15T14:30:00Z
---
```

```markdown
<current_state>
[我们确切在哪里？直接的上下文是什么？]
</current_state>

<completed_work>
[本次会话完成了什么 — 要具体]

- 任务 1：[名称] - 已完成
- 任务 2：[名称] - 已完成
- 任务 3：[名称] - 进行中，[已完成的部分]
</completed_work>

<remaining_work>
[本阶段剩余的工作]

- 任务 3：[名称] - [剩余待完成]
- 任务 4：[名称] - 未开始
- 任务 5：[名称] - 未开始
</remaining_work>

<decisions_made>
[关键决策及原因 — 以便下次会话不再重新讨论]

- 决定使用 [X] 因为 [原因]
- 选择 [方法] 而非 [替代方案] 因为 [原因]
</decisions_made>

<blockers>
[任何卡住或等待外部因素的事情]

- [阻碍 1]：[状态/变通方法]
</blockers>

<context>
[精神状态、"氛围"、任何有助于顺利恢复的内容]

[你在思考什么？计划是什么？
这是"精确地从你离开的地方继续"的上下文。]
</context>

<next_action>
[恢复时第一件要做的事]

从：[具体行动] 开始
</next_action>
```

<yaml_fields>
必需的 YAML 前置元数据：

- `phase`：目录名称（例如，`02-authentication`）
- `task`：当前任务编号
- `total_tasks`：阶段中有多少任务
- `status`：`in_progress`、`blocked`、`almost_done`
- `last_updated`：ISO 时间戳
</yaml_fields>

<guidelines>
- 要足够具体，让新的 Claude 实例立即理解
- 包含做出决策的原因，而不仅仅是决策内容
- `<next_action>` 应该在不阅读其他任何内容的情况下可执行
- 此文件在恢复后被删除 — 它不是永久存储
</guidelines>
