<purpose>
创建 `.continue-here.md` 交接文件以跨会话保留完整工作状态。启用完全上下文恢复的无缝恢复。
</purpose>

<required_reading>
在开始之前读取调用提示的 execution_context 引用的所有文件。
</required_reading>

<process>

<step name="detect">
从最近修改的文件中查找当前阶段目录：

```bash
# 查找最近有工作的阶段目录
ls -lt .planning/phases/*/PLAN.md 2>/dev/null | head -1 | grep -oP 'phases/\K[^/]+'
```

如果未检测到活动阶段，询问用户他们正在暂停哪个阶段的工作。
</step>

<step name="gather">
**收集交接的完整状态：**

1. **当前位置**：哪个阶段、哪个计划、哪个任务
2. **已完成的工作**：本次会话完成了什么
3. **剩余的工作**：当前计划/阶段中还剩下什么
4. **已做出的决策**：关键决策和理由
5. **阻塞因素/问题**：任何卡住的东西
6. **思维上下文**：方法、下一步、"氛围"
7. **已修改的文件**：已更改但未提交的内容

如需要，通过对话问题询问用户以获取澄清。
</step>

<step name="write">
**将交接写入 `.planning/phases/XX-name/.continue-here.md`：**

```markdown
---
phase: XX-name
task: 3
total_tasks: 7
status: in_progress
last_updated: [来自 current-timestamp 的时间戳]
---

<current_state>
[我们确切在哪里？立即上下文]
</current_state>

<completed_work>

- Task 1：[name] - 已完成
- Task 2：[name] - 已完成
- Task 3：[name] - 进行中，[已完成的内容]
</completed_work>

<remaining_work>

- Task 3：[剩余内容]
- Task 4：未开始
- Task 5：未开始
</remaining_work>

<decisions_made>

- 决定使用 [X]，因为 [理由]
- 选择 [方法] 而不是 [替代方案]，因为 [理由]
</decisions_made>

<blockers>
- [阻塞因素 1]：[状态/解决方法]
</blockers>

<context>
[思维状态，你在想什么，计划]
</context>

<next_action>
开始于：[恢复时的具体第一个操作]
</next_action>
```

足够具体以便新的 Claude 立即理解。

对 last_updated 字段使用 `current-timestamp`。您可以使用 init todos（提供时间戳）或直接调用：
```bash
timestamp=$(node ~/.claude/get-shit-done/bin/gsd-tools.js current-timestamp full --raw)
```
</step>

<step name="commit">
```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "wip: [phase-name] 在任务 [X]/[Y] 处暂停" --files .planning/phases/*/.continue-here.md
```
</step>

<step name="confirm">
```
✓ 交接已创建：.planning/phases/[XX-name]/.continue-here.md

当前状态：

- 阶段：[XX-name]
- 任务：[Y] 个中的 [X]
- 状态：[in_progress/blocked]
- 已提交为 WIP

要恢复：/gsd:resume-work

```
</step>

</process>

<success_criteria>
- [ ] 在正确的阶段目录中创建了 .continue-here.md
- [ ] 所有部分都填充了具体内容
- [ ] 已提交为 WIP
- [ ] 用户知道位置和如何恢复
      </success_criteria>
