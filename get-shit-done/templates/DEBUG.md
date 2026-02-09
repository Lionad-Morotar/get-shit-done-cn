# 调试模板

用于 `.planning/debug/[slug].md` 的模板 — 活动调试会话跟踪。

---

## 文件模板

```markdown
---
status: gathering | investigating | fixing | verifying | resolved
trigger: "[逐字用户输入]"
created: [ISO 时间戳]
updated: [ISO 时间戳]
---

## 当前焦点
<!-- 每次更新时覆盖 - 始终反映现在 -->

hypothesis: [当前正在测试的理论]
test: [如何测试它]
expecting: [如果为真/假意味着什么结果]
next_action: [直接的下一步]

## 症状
<!-- 在收集期间编写，然后不可变 -->

expected: [应该发生什么]
actual: [实际发生了什么]
errors: [错误信息（如果有）]
reproduction: [如何触发]
started: [何时出问题 / 一直有问题]

## 已排除
<!-- 仅追加 - 防止在 /clear 后重新调查 -->

- hypothesis: [错误的理论]
  evidence: [什么反驳了它]
  timestamp: [何时排除]

## 证据
<!-- 仅追加 - 调查期间发现的事实 -->

- timestamp: [何时发现]
  checked: [检查了什么]
  found: [观察到什么]
  implication: [这意味着什么]

## 解决方案
<!-- 随着理解演变而覆盖 -->

root_cause: [找到之前为空]
fix: [应用之前为空]
verification: [验证之前为空]
files_changed: []
```

---

<section_rules>

**前置元数据（status、trigger、timestamps）：**
- `status`：覆盖 — 反映当前阶段
- `trigger`：不可变 — 逐字用户输入，永不更改
- `created`：不可变 — 设置一次
- `updated`：覆盖 — 每次更改时更新

**当前焦点：**
- 每次更新时完全覆盖
- 始终反映 Claude 当前正在做什么
- 如果 Claude 在 /clear 后读取此文件，它确切知道从哪里恢复
- 字段：hypothesis、test、expecting、next_action

**症状：**
- 在初始收集阶段编写
- 收集完成后不可变
- 我们要修复什么的参考点
- 字段：expected、actual、errors、reproduction、started

**已排除：**
- 仅追加 — 永不删除条目
- 防止在上下文重置后重新调查死胡同
- 每个条目：hypothesis、反驳它的证据、timestamp
- 对于跨 /clear 边界的效率至关重要

**证据：**
- 仅追加 — 永不删除条目
- 调查期间发现的事实
- 每个条目：timestamp、检查了什么、发现了什么、implication
- 构建根本原因的案例

**解决方案：**
- 随着理解演变而覆盖
- 可能随着尝试修复而多次更新
- 最终状态显示确认的根本原因和验证的修复
- 字段：root_cause、fix、verification、files_changed

</section_rules>

<lifecycle>

**创建：** 调用 /gsd:debug 时立即
- 使用来自用户输入的触发器创建文件
- 将状态设置为 "gathering"
- 当前焦点：next_action = "收集症状"
- 症状：空，待填写

**在症状收集期间：**
- 随着用户回答问题更新症状部分
- 每个问题更新当前焦点
- 完成时：status → "investigating"

**在调查期间：**
- 每个假设覆盖当前焦点
- 每个发现追加到证据
- 假设被反驳时追加到已排除
- 更新前置元数据中的 timestamp

**在修复期间：**
- status → "fixing"
- 确认时更新 Resolution.root_cause
- 应用时更新 Resolution.fix
- 更新 Resolution.files_changed

**在验证期间：**
- status → "verifying"
- 用结果更新 Resolution.verification
- 如果验证失败：status → "investigating"，重试

**解决时：**
- status → "resolved"
- 将文件移动到 .planning/debug/resolved/

</lifecycle>

<resume_behavior>

当 Claude 在 /clear 后读取此文件时：

1. 解析前置元数据 → 知道状态
2. 读取当前焦点 → 知道确切发生了什么
3. 读取已排除 → 知道不要重试什么
4. 读取证据 → 知道学到了什么
5. 从 next_action 继续

文件就是调试大脑。Claude 应该能够从任何中断点完美恢复。

</resume_behavior>

<size_constraint>

保持调试文件聚焦：
- 证据条目：每个 1-2 行，只是事实
- 已排除：简短 — hypothesis + 为什么失败
- 无叙述散文 — 仅结构化数据

如果证据变得很大（10+ 条目），考虑是否在兜圈子。检查已排除以确保不是在重蹈覆辙。

</size_constraint>
