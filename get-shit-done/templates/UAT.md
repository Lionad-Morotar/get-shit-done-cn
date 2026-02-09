# UAT 模板

用于 `.planning/phases/XX-name/{phase}-UAT.md` 的模板 — 持久 UAT 会话跟踪。

---

## 文件模板

```markdown
---
status: testing | complete | diagnosed
phase: XX-name
source: [测试的 SUMMARY.md 文件列表]
started: [ISO 时间戳]
updated: [ISO 时间戳]
---

## 当前测试
<!-- 每个测试时覆盖 - 显示我们在哪里 -->

number: [N]
name: [测试名称]
expected: |
  [用户应该观察的内容]
awaiting: 用户响应

## 测试

### 1. [测试名称]
expected: [可观察行为 - 用户应该看到的内容]
result: [pending]

### 2. [测试名称]
expected: [可观察行为]
result: pass

### 3. [测试名称]
expected: [可观察行为]
result: issue
reported: "[逐字用户响应]"
severity: major

### 4. [测试名称]
expected: [可观察行为]
result: skipped
reason: [跳过原因]

...

## 摘要

total: [N]
passed: [N]
issues: [N]
pending: [N]
skipped: [N]

## 差距

<!-- YAML 格式供 plan-phase --gaps 使用 -->
- truth: "[测试的预期行为]"
  status: failed
  reason: "用户报告：[逐字响应]"
  severity: blocker | major | minor | cosmetic
  test: [N]
  root_cause: ""     # 由诊断填充
  artifacts: []      # 由诊断填充
  missing: []        # 由诊断填充
  debug_session: ""  # 由诊断填充
```

---

<section_rules>

**前置元数据：**
- `status`：覆盖 - "testing" 或 "complete"
- `phase`：不可变 - 创建时设置
- `source`：不可变 - 正在测试的 SUMMARY 文件
- `started`：不可变 - 创建时设置
- `updated`：覆盖 - 每次更改时更新

**当前测试：**
- 每次测试转换时完全覆盖
- 显示哪个测试处于活动状态以及等待什么
- 完成时："[testing complete]"

**测试：**
- 每个测试：用户响应时覆盖结果字段
- `result` 值：[pending]、pass、issue、skipped
- 如果是问题：添加 `reported`（逐字）和 `severity`（推断）
- 如果跳过：如果提供了则添加 `reason`

**摘要：**
- 每次响应后覆盖计数
- 跟踪：total、passed、issues、pending、skipped

**差距：**
- 仅在发现问题时追加（YAML 格式）
- 诊断后：填充 `root_cause`、`artifacts`、`missing`、`debug_session`
- 此部分直接提供给 /gsd:plan-phase --gaps

</section_rules>

<diagnosis_lifecycle>

**测试完成后（status: complete），如果存在差距：**

1. 用户运行诊断（从 verify-work 提供或手动）
2. diagnose-issues 工作流生成并行调试代理
3. 每个代理调查一个差距，返回根本原因
4. UAT.md 差距部分使用诊断更新：
   - 每个差距填充 `root_cause`、`artifacts`、`missing`、`debug_session`
5. status → "diagnosed"
6. 准备好使用根本原因进行 /gsd:plan-phase --gaps

**诊断后：**
```yaml
## Gaps

- truth: "提交后评论立即显示"
  status: failed
  reason: "用户报告：有效但不刷新页面不显示"
  severity: major
  test: 2
  root_cause: "CommentList.tsx 中的 useEffect 缺少 commentCount 依赖"
  artifacts:
    - path: "src/components/CommentList.tsx"
      issue: "useEffect 缺少依赖"
  missing:
    - "将 commentCount 添加到 useEffect 依赖数组"
  debug_session: ".planning/debug/comment-not-refreshing.md"
```

</diagnosis_lifecycle>

<lifecycle>

**创建：** 当 /gsd:verify-work 开始新会话时
- 从 SUMMARY.md 文件提取测试
- 将状态设置为"testing"
- 当前测试指向测试 1
- 所有测试都有 result: [pending]

**测试期间：**
- 从当前测试部分展示测试
- 用户响应通过确认或问题描述
- 更新测试结果（pass/issue/skipped）
- 更新摘要计数
- 如果是问题：追加到差距部分（YAML 格式），推断严重性
- 将当前测试移动到下一个待处理测试

**完成时：**
- status → "complete"
- 当前测试 → "[testing complete]"
- 提交文件
- 展示摘要和下一步

**/clear 后恢复：**
1. 读取前置元数据 → 知道阶段和状态
2. 读取当前测试 → 知道我们在哪里
3. 找到第一个 [pending] 结果 → 从那里继续
4. 摘要显示迄今为止的进度

</lifecycle>

<severity_guide>

严重性从用户的自然语言推断，从不询问。

| 用户描述 | 推断 |
|----------------|-------|
| 崩溃、错误、异常、完全失败、不可用 | blocker |
| 不工作、什么也没发生、错误行为、缺失 | major |
| 有效但...、慢、奇怪、小问题、小问题 | minor |
| 颜色、字体、间距、对齐、视觉、看起来不对 | cosmetic |

默认：**major**（安全默认，如果错了用户可以澄清）

</severity_guide>

<good_example>
```markdown
---
status: diagnosed
phase: 04-comments
source: 04-01-SUMMARY.md, 04-02-SUMMARY.md
started: 2025-01-15T10:30:00Z
updated: 2025-01-15T10:45:00Z
---

## 当前测试

[testing complete]

## 测试

### 1. 查看帖子上的评论
expected: 评论部分展开，显示计数和评论列表
result: pass

### 2. 创建顶级评论
expected: 通过富文本编辑器提交评论，显示在列表中并带有作者信息
result: issue
reported: "有效但不刷新页面不显示"
severity: major

### 3. 回复评论
expected: 点击回复，内联编辑器出现，提交显示嵌套回复
result: pass

### 4. 视觉嵌套
expected: 3+ 级线程显示缩进、左边框、在合理深度限制
result: pass

### 5. 删除自己的评论
expected: 在自己的评论上点击删除，删除或如果有回复则显示 [deleted]
result: pass

### 6. 评论计数
expected: 帖子显示准确计数，添加评论时递增
result: pass

## 摘要

total: 6
passed: 5
issues: 1
pending: 0
skipped: 0

## 差距

- truth: "提交后评论立即显示在列表中"
  status: failed
  reason: "用户报告：有效但不刷新页面不显示"
  severity: major
  test: 2
  root_cause: "CommentList.tsx 中的 useEffect 缺少 commentCount 依赖"
  artifacts:
    - path: "src/components/CommentList.tsx"
      issue: "useEffect 缺少依赖"
  missing:
    - "将 commentCount 添加到 useEffect 依赖数组"
  debug_session: ".planning/debug/comment-not-refreshing.md"
```
</good_example>
