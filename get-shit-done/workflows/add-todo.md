<purpose>
捕获在 GSD 会话期间出现的想法、任务或问题作为结构化待办事项供以后工作。启用"想法 → 捕获 → 继续"流程而不会丢失上下文。
</purpose>

<required_reading>
在开始之前读取调用提示的 execution_context 引用的所有文件。
</required_reading>

<process>

<step name="init_context">
加载待办事项上下文：

```bash
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js init todos)
```

从 init JSON 中提取：`commit_docs`、`date`、`timestamp`、`todo_count`、`todos`、`pending_dir`、`todos_dir_exists`。

确保目录存在：
```bash
mkdir -p .planning/todos/pending .planning/todos/done
```

注意来自 todos 数组的现有区域，以便在 infer_area 步骤中保持一致。
</step>

<step name="extract_content">
**带参数：** 用作标题/焦点。
- `/gsd:add-todo 添加身份验证令牌刷新` → title = "添加身份验证令牌刷新"

**不带参数：** 分析最近对话以提取：
- 讨论的具体问题、想法或任务
- 提到的相关文件路径
- 技术细节（错误消息、行号、约束）

制定：
- `title`：3-10 个单词的描述性标题（首选动作动词）
- `problem`：什么错了或为什么需要这个
- `solution`：方法提示或如果只是想法则为"TBD"
- `files`：来自对话的相关路径及行号
</step>

<step name="infer_area">
从文件路径推断区域：

| 路径模式 | 区域 |
|--------------|------|
| `src/api/*`, `api/*` | `api` |
| `src/components/*`, `src/ui/*` | `ui` |
| `src/auth/*`, `auth/*` | `auth` |
| `src/db/*`, `database/*` | `database` |
| `tests/*`, `__tests__/*` | `testing` |
| `docs/*` | `docs` |
| `.planning/*` | `planning` |
| `scripts/*`, `bin/*` | `tooling` |
| 无文件或不清楚 | `general` |

如果存在类似匹配，则使用步骤 2 中的现有区域。
</step>

<step name="check_duplicates">
```bash
# 在现有待办事项中搜索来自标题的关键字
grep -l -i "[来自标题的关键字]" .planning/todos/pending/*.md 2>/dev/null
```

如果发现潜在重复：
1. 读取现有待办事项
2. 比较范围

如果重叠，使用 AskUserQuestion：
- header: "重复？"
- question: "存在类似的待办事项：[title]。您想做什么？"
- options:
  - "跳过" — 保留现有待办事项
  - "替换" — 使用新上下文更新现有
  - "仍然添加" — 创建为单独的待办事项
</step>

<step name="create_file">
使用 init 上下文中的值：`timestamp` 和 `date` 已经可用。

为标题生成 slug：
```bash
slug=$(node ~/.claude/get-shit-done/bin/gsd-tools.js generate-slug "$title" --raw)
```

写入到 `.planning/todos/pending/${date}-${slug}.md`：

```markdown
---
created: [timestamp]
title: [title]
area: [area]
files:
  - [file:lines]
---

## 问题

[问题描述 - 足够的上下文供未来的 Claude 数周后理解]

## 解决方案

[方法提示或"TBD"]
```
</step>

<step name="update_state">
如果 `.planning/STATE.md` 存在：

1. 使用 init 上下文中的 `todo_count`（或如果计数更改则重新运行 `init todos`）
2. 更新"## 累积上下文"下的"### 待办待处理事项"
</step>

<step name="git_commit">
提交待办事项和任何更新的状态：

```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "docs: 捕获待办事项 - [title]" --files .planning/todos/pending/[filename] .planning/STATE.md
```

工具自动尊重 `commit_docs` 配置和 gitignore。

确认："已提交：docs: 捕获待办事项 - [title]"
</step>

<step name="confirm">
```
待办事项已保存：.planning/todos/pending/[filename]

  [title]
  区域：[area]
  文件：[count] 个引用

---

您想：

1. 继续当前工作
2. 添加另一个待办事项
3. 查看所有待办事项（/gsd:check-todos）
```
</step>

</process>

<success_criteria>
- [ ] 目录结构存在
- [ ] 待办事项文件已创建，具有有效的前置元数据
- [ ] 问题部分有足够的上下文供未来的 Claude 使用
- [ ] 无重复（已检查并解决）
- [ ] 区域与现有待办事项一致
- [ ] 如果存在则更新 STATE.md
- [ ] 待办事项和状态已提交到 git
</success_criteria>
