<required_reading>

**现在读取这些文件：**

1. `.planning/STATE.md`
2. `.planning/PROJECT.md`
3. `.planning/ROADMAP.md`
4. 当前阶段的计划文件（`*-PLAN.md`）
5. 当前阶段的摘要文件（`*-SUMMARY.md`）

</required_reading>

<purpose>

标记当前阶段完成并前进到下一个。这是进度跟踪和 PROJECT.md 演变的自然点。

"规划下一个阶段" = "当前阶段已完成"

</purpose>

<process>

<step name="load_project_state" priority="first">

在转换之前，读取项目状态：

```bash
cat .planning/STATE.md 2>/dev/null
cat .planning/PROJECT.md 2>/dev/null
```

解析当前位置以验证我们正在转换正确的阶段。
注意转换后可能需要更新的累积上下文。

</step>

<step name="verify_completion">

检查当前阶段是否有所有计划摘要：

```bash
ls .planning/phases/XX-current/*-PLAN.md 2>/dev/null | sort
ls .planning/phases/XX-current/*-SUMMARY.md 2>/dev/null | sort
```

**验证逻辑：**

- 计算计划文件
- 计算摘要文件
- 如果计数匹配：所有计划完成
- 如果计数不匹配：不完整

<config-check>

```bash
cat .planning/config.json 2>/dev/null
```

</config-check>

**如果所有计划完成：**

<if mode="yolo">

```
⚡ 自动批准：转换阶段 [X] → 阶段 [X+1]
阶段 [X] 完成 — 所有 [Y] 个计划已完成。

继续标记完成并前进...
```

直接转到 cleanup_handoff 步骤。

</if>

<if mode="interactive" OR="custom with gates.confirm_transition true">

询问："阶段 [X] 完成 — 所有 [Y] 个计划已完成。准备标记完成并移动到阶段 [X+1] 吗？"

在继续之前等待确认。

</if>

**如果计划不完整：**

**安全护栏：always_confirm_destructive 在此应用。**
跳过不完整的计划是破坏性的 — 无论模式如何始终提示。

展示：

```
阶段 [X] 有不完整的计划：
- {phase}-01-SUMMARY.md ✓ 完成
- {phase}-02-SUMMARY.md ✗ 丢失
- {phase}-03-SUMMARY.md ✗ 丢失

⚠️ 安全护栏：跳过计划需要确认（破坏性操作）

选项：
1. 继续当前阶段（执行剩余计划）
2. 无论如何标记完成（跳过剩余计划）
3. 查看剩余内容
```

等待用户决定。

</step>

<step name="cleanup_handoff">

检查残留的交接：

```bash
ls .planning/phases/XX-current/.continue-here*.md 2>/dev/null
```

如果发现，删除它们 — 阶段已完成，交接已过时。

</step>

<step name="update_roadmap_and_state">

**委托 ROADMAP.md 和 STATE.md 更新给 gsd-tools：**

```bash
TRANSITION=$(node ~/.claude/get-shit-done/bin/gsd-tools.js phase complete "${current_phase}")
```

CLI 处理：
- 将阶段复选框标记为 `[x] 完成并带有今天的日期
- 将计划计数更新为最终值（例如，"3/3 计划完成"）
- 更新进度表（状态 → 完成，添加日期）
- 将 STATE.md 前进到下一个阶段（当前阶段、状态 → 准备规划、当前计划 → 未开始）
- 检测这是否是里程碑中的最后一个阶段

从结果中提取：`completed_phase`、`plans_executed`、`next_phase`、`next_phase_name`、`is_last_phase`。

</step>

<step name="archive_prompts">

如果为阶段生成了提示，它们保持原位。
来自 create-meta-prompts 的 `completed/` 子文件夹模式处理归档。

</step>

<step name="evolve_project">

演进 PROJECT.md 以反映已完成阶段的学习。

**读取阶段摘要：**

```bash
cat .planning/phases/XX-current/*-SUMMARY.md
```

**评估需求变更：**

1. **需求已验证？**
   - 此阶段中发布的任何活动需求？
   - 移动到已验证并带有阶段引用：`- ✓ [需求] — 阶段 X`

2. **需求已失效？**
   - 发现任何活动需求是不必要或错误的？
   - 移动到范围外并带有原因：`- [需求] — [为什么失效]`

3. **需求已出现？**
   - 构建期间发现的任何新需求？
   - 添加到活动：`- [ ] [新需求]`

4. **要记录的决策？**
   - 从 SUMMARY.md 文件提取决策
   - 添加到关键决策表（如果已知则带有结果）

5. **"这是什么"仍然准确？**
   - 如果产品有意义的改变，更新描述
   - 保持当前和准确

**更新 PROJECT.md：**

内联进行编辑。更新"最后更新"页脚：

```markdown
---
*最后更新：[日期] 阶段 [X] 之后*
```

**演进示例：**

之前：

```markdown
### 活动

- [ ] JWT 身份验证
- [ ] 实时同步 < 500ms
- [ ] 离线模式

### 范围外

- OAuth2 — v1 不需要复杂性
```

之后（阶段 2 发布了 JWT 身份验证，发现需要速率限制）：

```markdown
### 已验证

- ✓ JWT 身份验证 — 阶段 2

### 活动

- [ ] 实时同步 < 500ms
- [ ] 离线模式
- [ ] 同步端点上的速率限制

### 范围外

- OAuth2 — v1 不需要复杂性
```

**步骤完成时：**

- [ ] 已审查阶段摘要的学习
- [ ] 已验证需求从活动移动
- [ ] 已失效需求移动到范围外并带有原因
- [ ] 已出现需求添加到活动
- [ ] 新决策已记录并带有理由
- [ ] 如果产品改变则更新"这是什么"
- [ ] "最后更新"页脚反映此转换

</step>

<step name="update_current_position_after_transition">

**注意：** 基本位置更新（当前阶段、状态、当前计划、最后活动）已在 update_roadmap_and_state 步骤中由 `gsd-tools phase complete` 处理。

通过读取 STATE.md 验证更新是否正确。如果进度条需要更新，使用：

```bash
PROGRESS=$(node ~/.claude/get-shit-done/bin/gsd-tools.js progress bar --raw)
```

用结果更新 STATE.md 中的进度条行。

**步骤完成时：**

- [ ] 阶段编号增加到下一个阶段（由 phase complete 完成）
- [ ] 计划状态重置为"未开始"（由 phase complete 完成）
- [ ] 状态显示"准备规划"（由 phase complete 完成）
- [ ] 进度条反映已完成的计划总数

</step>

<step name="update_project_reference">

更新 STATE.md 中的项目参考部分。

```markdown
## 项目参考

参见：.planning/PROJECT.md（已更新 [今天]）

**核心价值：** [来自 PROJECT.md 的当前核心价值]
**当前焦点：** [下一个阶段名称]
```

更新日期和当前焦点以反映转换。

</step>

<step name="review_accumulated_context">

审查和更新 STATE.md 中的累积上下文部分。

**决策：**

- 注明此阶段的最新决策（最多 3-5 个）
- 完整日志存在于 PROJECT.md 关键决策表中

**阻塞因素/关注点：**

- 审查已完成阶段的阻塞因素
- 如果在此阶段中解决：从列表中删除
- 如果对未来仍然相关：保留并带有"阶段 X"前缀
- 添加来自已完成阶段摘要的任何新关注点

**示例：**

之前：

```markdown
### 阻塞因素/关注点

- ⚠️ [阶段 1] 数据库架构未为常见查询索引
- ⚠️ [阶段 2] WebSocket 在不稳定网络上的重新连接行为未知
```

之后（如果数据库索引在阶段 2 中解决）：

```markdown
### 阻塞因素/关注点

- ⚠️ [阶段 2] WebSocket 在不稳定网络上的重新连接行为未知
```

**步骤完成时：**

- [ ] 已注明最新决策（完整日志在 PROJECT.md 中）
- [ ] 已解决的阻塞因素从列表中删除
- [ ] 未解决的阻塞因素保留并带有阶段前缀
- [ ] 已完成阶段的新关注点已添加

</step>

<step name="update_session_continuity_after_transition">

更新 STATE.md 中的会话连续性部分以反映转换完成。

**格式：**

```markdown
最后会话：[今天]
停止于：阶段 [X] 完成，准备规划阶段 [X+1]
恢复文件：无
```

**步骤完成时：**

- [ ] 最后会话时间戳已更新为当前日期和时间
- [ ] 停止于描述阶段完成和下一个阶段
- [ ] 恢复文件确认为无（转换不使用恢复文件）

</step>

<step name="offer_next_phase">

**强制：在展示下一步之前验证里程碑状态。**

**使用来自 `gsd-tools phase complete` 的转换结果：**

来自阶段完成结果的 `is_last_phase` 字段直接告诉您：
- `is_last_phase: false` → 更多阶段剩余 → 转到 **路线图 A**
- `is_last_phase: true` → 里程碑完成 → 转到 **路线图 B**

`next_phase` 和 `next_phase_name` 字段为您提供下一个阶段的详细信息。

如果需要额外上下文，使用：
```bash
ROADMAP=$(node ~/.claude/get-shit-done/bin/gsd-tools.js roadmap analyze)
```

这返回所有阶段及其目标、磁盘状态和完成信息。

---

**路线图 A：里程碑中仍有更多阶段**

读取 ROADMAP.md 以获取下一个阶段的名称和目标。

**如果下一个阶段存在：**

<if mode="yolo">

```
阶段 [X] 已标记完成。

下一步：阶段 [X+1] — [名称]

⚡ 自动继续：详细规划阶段 [X+1]
```

退出技能并调用 SlashCommand("/gsd:plan-phase [X+1]")

</if>

<if mode="interactive" OR="custom with gates.confirm_transition true">

```
## ✓ 阶段 [X] 完成

---

## ▶ 接下来

**阶段 [X+1]: [名称]** — [来自 ROADMAP.md 的目标]

`/gsd:plan-phase [X+1]`

<sub>`/clear` 首先 → 清空上下文窗口</sub>

---

**也可用：**
- `/gsd:discuss-phase [X+1]` — 首先收集上下文
- `/gsd:research-phase [X+1]` — 调查未知
- 查看路线图

---
```

</if>

---

**路线图 B：里程碑完成（所有阶段已完成）**

<if mode="yolo">

```
阶段 {X} 已标记完成。

🎉 里程碑 {version} 100% 完成 — 所有 {N} 个阶段已完成！

⚡ 自动继续：完成里程碑并归档
```

退出技能并调用 SlashCommand("/gsd:complete-milestone {version}")

</if>

<if mode="interactive" OR="custom with gates.confirm_transition true">

```
## ✓ 阶段 {X}: {阶段名称} 完成

🎉 里程碑 {version} 100% 完成 — 所有 {N} 个阶段已完成！

---

## ▶ 接下来

**完成里程碑 {version}** — 归档并准备下一个

`/gsd:complete-milestone {version}`

<sub>`/clear` 首先 → 清空上下文窗口</sub>

---

**也可用：**
- 在归档之前审查成就

---
```

</if>

</step>

</process>

<implicit_tracking>
进度跟踪是隐式的：规划阶段 N 意味着阶段 1-(N-1) 完成。没有单独的进度步骤 — 向前运动就是进度。
</implicit_tracking>

<partial_completion>

如果用户想继续但阶段未完全完成：

```
阶段 [X] 有不完整的计划：
- {phase}-02-PLAN.md（未执行）
- {phase}-03-PLAN.md（未执行）

选项：
1. 无论如何标记完成（计划不需要）
2. 将工作推迟到后期阶段
3. 留下并完成当前阶段
```

尊重用户判断 — 他们知道工作是否重要。

**如果在不完整计划的情况下标记完成：**

- 更新 ROADMAP："2/3 计划完成"（而不是"3/3"）
- 在转换消息中注明跳过了哪些计划

</partial_completion>

<success_criteria>

转换完成时：

- [ ] 当前阶段计划摘要已验证（全部存在或用户选择跳过）
- [ ] 任何过时的交接已删除
- [ ] ROADMAP.md 已更新完成状态和计划计数
- [ ] PROJECT.md 已演进（需求、决策、描述（如果需要））
- [ ] STATE.md 已更新（位置、项目参考、上下文、会话）
- [ ] 进度表已更新
- [ ] 用户知道下一步

</success_criteria>
