# 调试子代理提示词模板

用于生成 gsd-debugger 代理的模板。代理包含所有调试专业知识 — 此模板仅提供问题上下文。

---

## 模板

```markdown
<objective>
调查问题：{issue_id}

**摘要：** {issue_summary}
</objective>

<symptoms>
expected: {expected}
actual: {actual}
errors: {errors}
reproduction: {reproduction}
timeline: {timeline}
</symptoms>

<mode>
symptoms_prefilled: {true_or_false}
goal: {find_root_cause_only | find_and_fix}
</mode>

<debug_file>
创建：.planning/debug/{slug}.md
</debug_file>
```

---

## 占位符

| 占位符 | 来源 | 示例 |
|-------------|--------|---------|
| `{issue_id}` | 协调器分配 | `auth-screen-dark` |
| `{issue_summary}` | 用户描述 | `认证屏幕太暗` |
| `{expected}` | 来自症状 | `清楚看到 logo` |
| `{actual}` | 来自症状 | `屏幕很暗` |
| `{errors}` | 来自症状 | `控制台无错误` |
| `{reproduction}` | 来自症状 | `打开 /auth 页面` |
| `{timeline}` | 来自症状 | `最近部署后` |
| `{goal}` | 协调器设置 | `find_and_fix` |
| `{slug}` | 生成 | `auth-screen-dark` |

---

## 使用

**从 /gsd:debug:**
```python
Task(
  prompt=filled_template,
  subagent_type="gsd-debugger",
  description="调试 {slug}"
)
```

**从 diagnose-issues (UAT):**
```python
Task(prompt=template, subagent_type="gsd-debugger", description="调试 UAT-001")
```

---

## 继续

对于检查点，生成新代理并附带：

```markdown
<objective>
继续调试 {slug}。证据在调试文件中。
</objective>

<prior_state>
调试文件：@.planning/debug/{slug}.md
</prior_state>

<checkpoint_response>
**类型：** {checkpoint_type}
**响应：** {user_response}
</checkpoint_response>

<mode>
goal: {goal}
</mode>
```
