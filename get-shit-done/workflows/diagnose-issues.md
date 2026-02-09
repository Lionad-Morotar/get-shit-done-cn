<purpose>
编排并行调试代理来调查 UAT 缺陷并找到根本原因。

UAT 发现缺陷后，为每个缺陷生成一个调试代理。每个代理使用来自 UAT 的预填症状自主调查。收集根本原因，更新 UAT.md 缺陷的诊断，然后交给 plan-phase --gaps 进行实际诊断。

编排器保持精简：解析缺陷、生成代理、收集结果、更新 UAT。
</purpose>

<paths>
DEBUG_DIR=.planning/debug

调试文件使用 `.planning/debug/` 路径（带前导点的隐藏目录）。
</paths>

<core_principle>
**先诊断再计划修复。**

UAT 告诉我们什么坏了（症状）。调试代理找到为什么坏（根本原因）。plan-phase --gaps 然后基于实际原因创建针对性修复，而不是猜测。

没有诊断："评论不刷新" → 猜测修复 → 可能错误
有诊断："评论不刷新" → "useEffect 缺少依赖" → 精确修复
</core_principle>

<process>

<step name="parse_gaps">
**从 UAT.md 提取缺陷：**

读取 "Gaps" 部分（YAML 格式）：
```yaml
- truth: "提交后评论立即显示"
  status: failed
  reason: "用户报告：有效但刷新页面后才显示"
  severity: major
  test: 2
  artifacts: []
  missing: []
```

对于每个缺陷，还要从 "Tests" 部分读取相应的测试以获取完整上下文。

构建缺陷列表：
```
gaps = [
  {truth: "提交后评论立即显示...", severity: "major", test_num: 2, reason: "..."},
  {truth: "回复按钮位置正确...", severity: "minor", test_num: 5, reason: "..."},
  ...
]
```
</step>

<step name="report_plan">
**向用户报告诊断计划：**

```
## 正在诊断 {N} 个缺陷

生成并行调试代理来调查根本原因：

| 缺陷（期望） | 严重程度 |
|-------------|----------|
| 提交后评论立即显示 | major |
| 回复按钮位置正确 | minor |
| 删除移除评论 | blocker |

每个代理将：
1. 创建 DEBUG-{slug}.md 并预填症状
2. 自主调查（读取代码、形成假设、测试）
3. 返回根本原因

这是并行运行的 - 所有缺陷同时调查。
```
</step>

<step name="spawn_agents">
**并行生成调试代理：**

对于每个缺陷，填充 debug-subagent-prompt 模板并生成：

```
Task(
  prompt=filled_debug_subagent_prompt,
  subagent_type="general-purpose",
  description="调试: {truth_short}"
)
```

**所有代理在单条消息中生成**（并行执行）。

模板占位符：
- `{truth}`: 失败的期望行为
- `{expected}`: 来自 UAT 测试
- `{actual}`: 来自 reason 字段的逐字用户描述
- `{errors}`: 任何来自 UAT 的错误消息（或 "未报告"）
- `{reproduction}`: "UAT 中的测试 {test_num}"
- `{timeline}`: "在 UAT 期间发现"
- `{goal}`: `find_root_cause_only`（UAT 流程 - plan-phase --gaps 处理修复）
- `{slug}`: 从 truth 生成
</step>

<step name="collect_results">
**从代理收集根本原因：**

每个代理返回：
```
## 发现根本原因

**调试会话：** ${DEBUG_DIR}/{slug}.md

**根本原因：** {带有证据的具体原因}

**证据摘要：**
- {关键发现 1}
- {关键发现 2}
- {关键发现 3}

**涉及的文件：**
- {file1}: {问题}
- {file2}: {相关问题}

**建议的修复方向：** {plan-phase --gaps 的简要提示}
```

解析每个返回以提取：
- root_cause: 诊断的原因
- files: 涉及的文件
- debug_path: 调试会话文件路径
- suggested_fix: 缺陷关闭计划的提示

如果代理返回 `## INVESTIGATION INCONCLUSIVE`：
- root_cause: "调查不确定 - 需要人工审查"
- 标记哪个问题需要人工注意
- 包含代理返回的剩余可能性
</step>

<step name="update_uat">
**用诊断更新 UAT.md 缺陷：**

对于 Gaps 部分的每个缺陷，添加 artifacts 和 missing 字段：

```yaml
- truth: "提交后评论立即显示"
  status: failed
  reason: "用户报告：有效但刷新页面后才显示"
  severity: major
  test: 2
  root_cause: "CommentList.tsx 中的 useEffect 缺少 commentCount 依赖"
  artifacts:
    - path: "src/components/CommentList.tsx"
      issue: "useEffect 缺少依赖"
  missing:
    - "将 commentCount 添加到 useEffect 依赖数组"
    - "当添加新评论时触发重新渲染"
  debug_session: .planning/debug/comment-not-refreshing.md
```

更新 frontmatter 中的状态为 "diagnosed"。

提交更新后的 UAT.md：
```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "docs({phase}): 添加来自诊断的根本原因" --files ".planning/phases/XX-name/{phase}-UAT.md"
```
</step>

<step name="report_results">
**报告诊断结果并交接：**

显示：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 诊断完成
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| 缺陷（期望） | 根本原因 | 文件 |
|-------------|------------|-------|
| 提交后评论立即显示 | useEffect 缺少依赖 | CommentList.tsx |
| 回复按钮位置正确 | CSS flex 顺序不正确 | ReplyButton.tsx |
| 删除移除评论 | API 缺少 auth 头 | api/comments.ts |

调试会话：${DEBUG_DIR}/

正在继续计划修复...
```

返回 verify-work 编排器进行自动规划。
不要提供手动下一步 - verify-work 处理其余部分。
</step>

</process>

<context_efficiency>
代理从 UAT 预填的症状开始（无需症状收集）。
代理只诊断 - plan-phase --gaps 处理修复（不应用修复）。
</context_efficiency>

<failure_handling>
**代理未能找到根本原因：**
- 标记缺陷为 "needs manual review"
- 继续处理其他缺陷
- 报告不完整的诊断

**代理超时：**
- 检查 DEBUG-{slug}.md 的部分进度
- 可以用 /gsd:debug 恢复

**所有代理失败：**
- 系统性问题（权限、git 等）
- 报告人工调查
- 回退到 plan-phase --gaps 而没有根本原因（不太精确）
</failure_handling>

<success_criteria>
- [ ] 从 UAT.md 解析缺陷
- [ ] 并行生成调试代理
- [ ] 从所有代理收集根本原因
- [ ] 用 artifacts 和 missing 更新 UAT.md 缺陷
- [ ] 调试会话保存到 ${DEBUG_DIR}/
- [ ] 交接给 verify-work 进行自动规划
</success_criteria>
