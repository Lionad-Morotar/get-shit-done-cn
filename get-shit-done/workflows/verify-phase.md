<purpose>
通过目标反向分析验证阶段目标实现。检查代码库是否交付了阶段承诺的内容，而不仅仅是任务完成。
</purpose>

<core_principle>
**任务完成 ≠ 目标实现**

任务"创建聊天组件"可以在组件是占位符时标记为完成。任务已完成 — 但目标"可工作的聊天界面"未实现。

目标反向验证：
1. 目标实现必须为真的是什么？
2. 那些真理成立必须存在什么？
3. 那些工件运行必须连接什么？

然后根据实际代码库验证每个级别。
</core_principle>

<required_reading>
@~/.claude/get-shit-done/references/verification-patterns.md
@~/.claude/get-shit-done/templates/verification-report.md
</required_reading>

<process>

<step name="load_context" priority="first">
加载阶段操作上下文：

```bash
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js init phase-op "${PHASE_ARG}")
```

从 init JSON 提取：`phase_dir`、`phase_number`、`phase_name`、`has_plans`、`plan_count`。

然后加载阶段详细并列出计划/摘要：
```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js roadmap get-phase "${phase_number}"
grep -E "^| ${phase_number}" .planning/REQUIREMENTS.md 2>/dev/null
ls "$phase_dir"/*-SUMMARY.md "$phase_dir"/*-PLAN.md 2>/dev/null
```

从 ROADMAP.md 提取**阶段目标**（要验证的结果，而不是任务），如果存在则从 REQUIREMENTS.md 提取**需求**。
</step>

<step name="establish_must_haves">
**选项 A：PLAN 前置元数据中的必须项**

使用 gsd-tools 从每个 PLAN 提取 must_haves：

```bash
for plan in "$PHASE_DIR"/*-PLAN.md; do
  MUST_HAVES=$(node ~/.claude/get-shit-done/bin/gsd-tools.js frontmatter get "$plan" --field must_haves)
  echo "=== $plan ===" && echo "$MUST_HAVES"
done
```

返回 JSON：`{ truths: [...], artifacts: [...], key_links: [...] }`

聚合跨计划的所有 must_haves 以进行阶段级别验证。

**选项 B：从阶段目标派生**

如果前置元数据中没有 must_haves（MUST_HAVES 返回错误或为空）：
1. 陈述来自 ROADMAP.md 的目标
2. 派生**真理**（3-7 个可观察行为，每个可测试）
3. 派生**工件**（每个真理的具体文件路径）
4. 派生**关键链接**（存根隐藏的关键连接）
5. 在继续之前记录派生的 must-haves
</step>

<step name="verify_truths">
对于每个可观察的真理，确定代码库是否启用它。

**状态：** ✓ 已验证（所有支持工件通过） | ✗ 失败（工件丢失/存根/未连接） | ? 不确定（需要人工）

对于每个真理：识别支持工件 → 检查工件状态 → 检查连接 → 确定真理状态。

**示例：** 真理"用户可以看到现有消息"依赖于 Chat.tsx（渲染）、/api/chat GET（提供）、Message 模型（架构）。如果 Chat.tsx 是存根或 API 返回硬编码的 [] → 失败。如果所有都存在、有实质内容且已连接 → 已验证。
</step>

<step name="verify_artifacts">
使用 gsd-tools 根据每个 PLAN 中的 must_haves 验证工件：

```bash
for plan in "$PHASE_DIR"/*-PLAN.md; do
  ARTIFACT_RESULT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js verify artifacts "$plan")
  echo "=== $plan ===" && echo "$ARTIFACT_RESULT"
done
```

解析 JSON 结果：`{ all_passed, passed, total, artifacts: [{path, exists, issues, passed}] }`

**从结果的工件状态：**
- `exists=false` → 丢失
- `issues` 不为空 → 存根（检查问题中的"只有 N 行"或"缺少模式"）
- `passed=true` → 已验证（级别 1-2 通过）

**级别 3 — 连接（通过级别 1-2 的工件的手动检查）：**
```bash
grep -r "import.*$artifact_name" src/ --include="*.ts" --include="*.tsx"  # 已导入
grep -r "$artifact_name" src/ --include="*.ts" --include="*.tsx" | grep -v "import"  # 已使用
```
已连接 = 已导入 且 已使用。孤立 = 存在但未导入/使用。

| 存在 | 有实质内容 | 已连接 | 状态 |
|--------|-------------|-------|--------|
| ✓ | ✓ | ✓ | ✓ 已验证 |
| ✓ | ✓ | ✗ | ⚠️ 孤立 |
| ✓ | ✗ | - | ✗ 存根 |
| ✗ | - | - | ✗ 丢失 |
</step>

<step name="verify_wiring">
使用 gsd-tools 根据每个 PLAN 中的 must_haves 验证关键链接：

```bash
for plan in "$PHASE_DIR"/*-PLAN.md; do
  LINKS_RESULT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js verify key-links "$plan")
  echo "=== $plan ===" && echo "$LINKS_RESULT"
done
```

解析 JSON 结果：`{ all_verified, verified, total, links: [{from, to, via, verified, detail}] }`

**从结果的链接状态：**
- `verified=true` → 已连接
- `verified=false` 带有"未找到"→ 未连接
- `verified=false` 带有"未找到模式"→ 部分

**后备模式（如果 must_haves 中没有 key_links）：**

| 模式 | 检查 | 状态 |
|---------|-------|--------|
| 组件 → API | 对 API 路径的 fetch/axios 调用，响应已使用（await/.then/setState） | 已连接 / 部分（调用但未使用响应）/ 未连接 |
| API → 数据库 | 模型上的 Prisma/DB 查询，通过 res.json() 返回结果 | 已连接 / 部分（查询但未返回）/ 未连接 |
| 表单 → 处理程序 | 带有真实实现的 onSubmit（fetch/axios/mutate/dispatch），而不是 console.log/空 | 已连接 / 存根（仅日志/空）/ 未连接 |
| 状态 → 渲染 | useState 变量出现在 JSX 中（`{stateVar}` 或 `{stateVar.property}`） | 已连接 / 未连接 |

记录每个关键链接的状态和证据。
</step>

<step name="verify_requirements">
如果 REQUIREMENTS.md 存在：
```bash
grep -E "Phase ${PHASE_NUM}" .planning/REQUIREMENTS.md 2>/dev/null
```

对于每个需求：解析描述 → 识别支持真理/工件 → 状态：✓ 已满足 / ✗ 被阻塞 / ? 需要人工。
</step>

<step name="scan_antipatterns">
从 SUMMARY.md 提取此阶段修改的文件，扫描每个：

| 模式 | 搜索 | 严重性 |
|---------|--------|----------|
| TODO/FIXME/XXX/HACK | `grep -n -E "TODO\|FIXME\|XXX\|HACK"` | ⚠️ 警告 |
| 占位符内容 | `grep -n -iE "placeholder\|coming soon\|will be here"` | 🛑 阻塞因素 |
| 空返回 | `grep -n -E "return null\|return \{\}\|return \[\]\|=> \{\}"` | ⚠️ 警告 |
| 仅日志函数 | 仅包含 console.log 的函数 | ⚠️ 警告 |

分类：🛑 阻塞因素（阻止目标）| ⚠️ 警告（不完整）| ℹ️ 信息（值得注意）。
</step>

<step name="identify_human_verification">
**始终需要人工：** 视觉外观、用户流程完成、实时行为（WebSocket/SSE）、外部服务集成、性能感觉、错误消息清晰度。

**如果不确定则需要人工：** grep 无法跟踪的复杂连接、依赖于动态状态的行为、边缘情况。

将每个格式化为：测试名称 → 做什么 → 预期结果 → 为什么无法以编程方式验证。
</step>

<step name="determine_status">
**通过：** 所有真理已验证，所有工件通过级别 1-3，所有关键链接已连接，没有阻塞因素反模式。

**发现差距：** 任何真理失败、工件丢失/存根、关键链接未连接或发现阻塞因素。

**需要人工：** 所有自动检查通过但人工验证项目仍存在。

**得分：** `verified_truths / total_truths`
</step>

<step name="generate_fix_plans">
如果发现差距：

1. **聚类相关差距：** API 存根 + 组件未连接 →"连接前端到后端"。多个丢失 →"完成核心实现"。仅连接 →"连接现有组件"。

2. **为每个聚类生成计划：** 目标、2-3 个任务（每个文件/操作/验证）、重新验证步骤。保持专注：每个计划单一关注点。

3. **按依赖排序：** 修复丢失 → 修复存根 → 修复连接 → 验证。
</step>

<step name="create_report">
```bash
REPORT_PATH="$PHASE_DIR/${PHASE_NUM}-VERIFICATION.md"
```

填充模板部分：前置元数据（阶段/时间戳/状态/得分）、目标实现、工件表、连接表、需求覆盖、反模式、人工验证、差距摘要、修复计划（如果发现差距）、元数据。

参见 ~/.claude/get-shit-done/templates/verification-report.md 获取完整模板。
</step>

<step name="return_to_orchestrator">
返回状态（`passed` | `gaps_found` | `human_needed`）、得分（N/M 必须项）、报告路径。

如果发现差距：列出差距 + 推荐的修复计划名称。
如果需要人工：列出需要人工测试的项目。

编排器路由：`passed` → 更新路线图 | `gaps_found` → 创建/执行修复，重新验证 | `human_needed` → 展示给用户。
</step>

</process>

<success_criteria>
- [ ] 必须项已建立（从前置元数据或派生）
- [ ] 所有真理已验证状态和证据
- [ ] 所有工件在所有三个级别检查
- [ ] 所有关键链接已验证
- [ ] 需求覆盖已评估（如果适用）
- [ ] 反模式已扫描和分类
- [ ] 人工验证项目已识别
- [ ] 整体状态已确定
- [ ] 修复计划已生成（如果发现差距）
- [ ] VERIFICATION.md 已创建完整报告
- [ ] 结果已返回给编排器
</success_criteria>
