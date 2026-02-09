<purpose>
使用基于波的并行执行执行阶段中的所有计划。编排器保持精简 — 将计划执行委托给子代理。
</purpose>

<core_principle>
编排器协调，不执行。每个子代理加载完整的执行计划上下文。编排器：发现计划 → 分析依赖 → 分组波 → 生成代理 → 处理检查点 → 收集结果。
</core_principle>

<required_reading>
在任何操作之前读取 STATE.md 以加载项目上下文。
</required_reading>

<process>

<step name="initialize" priority="first">
在一次调用中加载所有上下文：

```bash
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js init execute-phase "${PHASE_ARG}")
```

解析 JSON 以获取：`executor_model`、`verifier_model`、`commit_docs`、`parallelization`、`branching_strategy`、`branch_name`、`phase_found`、`phase_dir`、`phase_number`、`phase_name`、`phase_slug`、`plans`、`incomplete_plans`、`plan_count`、`incomplete_count`、`state_exists`、`roadmap_exists`。

**如果 `phase_found` 为 false：** 错误 — 未找到阶段目录。
**如果 `plan_count` 为 0：** 错误 — 阶段中未找到计划。
**如果 `state_exists` 为 false 但 `.planning/` 存在：** 提供重建或继续。

当 `parallelization` 为 false 时，波内的计划顺序执行。
</step>

<step name="handle_branching">
检查 init 中的 `branching_strategy`：

**"none"：** 跳过，继续当前分支。

**"phase" 或 "milestone"：** 使用 init 中预计算的 `branch_name`：
```bash
git checkout -b "$BRANCH_NAME" 2>/dev/null || git checkout "$BRANCH_NAME"
```

所有后续提交都到此分支。用户处理合并。
</step>

<step name="validate_phase">
来自 init JSON：`phase_dir`、`plan_count`、`incomplete_count`。

报告："在 {phase_dir} 中找到 {plan_count} 个计划（{incomplete_count} 个未完成）"
</step>

<step name="discover_and_group_plans">
在一次调用中加载波分组的计划清单：

```bash
PLAN_INDEX=$(node ~/.claude/get-shit-done/bin/gsd-tools.js phase-plan-index "${PHASE_NUMBER}")
```

解析 JSON 以获取：`phase`、`plans[]`（每个有 `id`、`wave`、`autonomous`、`objective`、`files_modified`、`task_count`、`has_summary`）、`waves`（波编号 → 计划 ID 的映射）、`incomplete`、`has_checkpoints`。

**过滤：** 跳过 `has_summary: true` 的计划。如果 `--gaps-only`：也跳过非 gap_closure 计划。如果全部过滤："无匹配的未完成计划" → 退出。

报告：
```
## 执行计划

**阶段 {X}：{Name}** — {total_plans} 个计划跨 {wave_count} 个波

| 波 | 计划 | 构建内容 |
|------|-------|----------------|
| 1 | 01-01, 01-02 | {来自计划目标，3-8 个词} |
| 2 | 01-03 | ... |
```
</step>

<step name="execute_waves">
顺序执行每个波。在波内：如果 `PARALLELIZATION=true` 则并行，如果 `false` 则顺序。

**对于每个波：**

1. **描述正在构建的内容（在生成之前）：**

   读取每个计划的 `<objective>`。提取正在构建的内容和原因。

   ```
   ---
   ## 波 {N}

   **{计划 ID}：{计划名称}**
   {2-3 句话：这构建什么、技术方法、为什么重要}

   正在生成 {count} 个代理...
   ---
   ```

   - 坏："正在执行地形生成计划"
   - 好："使用 Perlin 噪声的过程地形生成器 — 创建高度图、生物区域和碰撞网格。车辆物理与地面交互之前需要。"

2. **生成执行代理：**

   仅传递路径 — 执行器使用其新鲜的 200k 上下文自己读取文件。
   这使编排器上下文保持精简（约 10-15%）。

   ```
   Task(
     subagent_type="gsd-executor",
     model="{executor_model}",
     prompt="
       <objective>
       执行阶段 {phase_number}-{phase_name} 的计划 {plan_number}。
       原子地提交每个任务。创建 SUMMARY.md。更新 STATE.md。
       </objective>

       <execution_context>
       @~/.claude/get-shit-done/workflows/execute-plan.md
       @~/.claude/get-shit-done/templates/summary.md
       @~/.claude/get-shit-done/references/checkpoints.md
       @~/.claude/get-shit-done/references/tdd.md
       </execution_context>

       <files_to_read>
       在执行开始时使用 Read 工具读取这些文件：
       - 计划：{phase_dir}/{plan_file}
       - 状态：.planning/STATE.md
       - 配置：.planning/config.json（如存在）
       </files_to_read>

       <success_criteria>
       - [ ] 所有任务已执行
       - [ ] 每个任务单独提交
       - [ ] 在计划目录中创建 SUMMARY.md
       - [ ] STATE.md 更新位置和决策
       </success_criteria>
     "
   )
   ```

3. **等待波中的所有代理完成。**

4. **报告完成 — 首先抽查声明：**

   对于每个 SUMMARY.md：
   - 验证 `key-files.created` 的前 2 个文件存在于磁盘上
   - 检查 `git log --oneline --all --grep="{phase}-{plan}"` 返回 ≥1 个提交
   - 检查 `## Self-Check: FAILED` 标记

   如果任何抽查失败：报告哪个计划失败，路由到失败处理程序 — 询问 "重试计划？" 还是 "继续剩余的波？"

   如果通过：
   ```
   ---
   ## 波 {N} 完成

   **{计划 ID}：{计划名称}**
   {构建的内容 — 来自 SUMMARY.md}
   {值得注意的偏差（如有）}

   {如果有更多波：这为下一个波启用什么}
   ---
   ```

   - 坏："波 2 完成。继续到波 3。"
   - 好："地形系统完成 — 3 种生物类型、基于高度的纹理、物理碰撞网格。车辆物理（波 3）现在可以参考地面表面。"

5. **处理失败：**

   **已知的 Claude Code 错误（classifyHandoffIfNeeded）：** 如果代理报告 "failed" 且错误包含 `classifyHandoffIfNeeded is not defined`，这是一个 Claude Code 运行时错误 — 不是 GSD 或代理问题。错误在所有工具调用完成后的完成处理程序中触发。在这种情况下：运行与步骤 4 相同的抽查（SUMMARY.md 存在、git 提交存在、无 Self-Check: FAILED）。如果抽查通过 → 视为**成功**。如果抽查失败 → 视为下面的真实失败。

   对于真实失败：报告哪个计划失败 → 询问 "继续？" 还是 "停止？" → 如果继续，依赖计划也可能失败。如果停止，部分完成报告。

6. **在波之间执行检查点计划** — 参见 `<checkpoint_handling>`。

7. **继续到下一个波。"
</step>

<step name="checkpoint_handling">
带有 `autonomous: false` 的计划需要用户交互。

**流程：**

1. 为检查点计划生成代理
2. 代理运行直到检查点任务或授权门 → 返回结构化状态
3. 代理返回包括：已完成任务表、当前任务 + 阻塞器、检查点类型/详细信息、等待的内容
4. **展示给用户：**
   ```
   ## 检查点：[类型]

   **计划：** 03-03 仪表板布局
   **进度：** 2/3 任务完成

   [来自代理返回的检查点详细信息]
   [来自代理返回的等待部分]
   ```
5. 用户响应："approved"/"done" | 问题描述 | 决策选择
6. **使用 continuation-prompt.md 模板生成继续代理（不恢复）：**
   - `{completed_tasks_table}`：来自检查点返回
   - `{resume_task_number}` + `{resume_task_name}`：当前任务
   - `{user_response}`：用户提供的内容
   - `{resume_instructions}`：基于检查点类型
7. 继续代理验证以前的提交，从恢复点继续
8. 重复直到计划完成或用户停止

**为什么是新鲜代理而不是恢复：** 恢复依赖于并行工具调用会破坏的内部序列化。具有显式状态的新鲜代理更可靠。

**并行波中的检查点：** 代理暂停并返回，而其他并行代理可能完成。展示检查点，生成继续，等待所有后再下一个波。
</step>

<step name="aggregate_results">
所有波之后：

```markdown
## 阶段 {X}：{Name} 执行完成

**波：** {N} | **计划：** {M}/{total} 完成

| 波 | 计划 | 状态 |
|------|-------|--------|
| 1 | plan-01, plan-02 | ✓ 完成 |
| CP | plan-03 | ✓ 已验证 |
| 2 | plan-04 | ✓ 完成 |

### 计划详细信息
1. **03-01**：[来自 SUMMARY.md 的 one-liner]
2. **03-02**：[来自 SUMMARY.md 的 one-liner]

### 遇到的问题
[从 SUMMARY 聚合，或 "无"]
```
</step>

<step name="verify_phase_goal">
验证阶段实现了其目标，而不仅仅是完成任务。

```
Task(
  prompt="验证阶段 {phase_number} 目标实现。
阶段目录：{phase_dir}
阶段目标：{来自 ROADMAP.md 的 goal}
根据实际代码库检查 must_haves。创建 VERIFICATION.md。",
  subagent_type="gsd-verifier",
  model="{verifier_model}"
)
```

读取状态：
```bash
grep "^status:" "$PHASE_DIR"/*-VERIFICATION.md | cut -d: -f2 | tr -d ' '
```

| 状态 | 操作 |
|--------|--------|
| `passed` | → update_roadmap |
| `human_needed` | 展示人工测试项目，获得批准或反馈 |
| `gaps_found` | 展示缺陷摘要，提供 `/gsd:plan-phase {phase} --gaps` |

**如果 human_needed：**
```
## ✓ 阶段 {X}：{Name} — 需要人工验证

所有自动检查通过。{N} 项需要人工测试：

{来自 VERIFICATION.md human_verification 部分}

"approved" → 继续 | 报告问题 → 缺陷关闭
```

**如果 gaps_found：**
```
## ⚠ 阶段 {X}：{Name} — 发现缺陷

**得分：** {N}/{M} must-haves 已验证
**报告：** {phase_dir}/{phase}-VERIFICATION.md

### 缺少什么
{来自 VERIFICATION.md 的缺陷摘要}

---
## ▶ 下一步

`/gsd:plan-phase {X} --gaps`

<sub>`/clear` 首先 → 新的上下文窗口</sub>

还有：`cat {phase_dir}/{phase}-VERIFICATION.md` — 完整报告
还有：`/gsd:verify-work {X}` — 首先手动测试
```

缺陷关闭周期：`/gsd:plan-phase {X} --gaps` 读取 VERIFICATION.md → 创建带有 `gap_closure: true` 的缺陷计划 → 用户运行 `/gsd:execute-phase {X} --gaps-only` → 验证器重新运行。
</step>

<step name="update_roadmap">
在 ROADMAP.md 中标记阶段完成（日期、状态）。

```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "docs(phase-{X}): 完成阶段执行" --files .planning/ROADMAP.md .planning/STATE.md .planning/phases/{phase_dir}/*-VERIFICATION.md .planning/REQUIREMENTS.md
```
</step>

<step name="offer_next">

**如果有更多阶段：**
```
## 下一步

**阶段 {X+1}：{Name}** — {Goal}

`/gsd:plan-phase {X+1}`

<sub>`/clear` 首先以获得新上下文</sub>
```

**如果里程碑完成：**
```
里程碑完成！

所有 {N} 个阶段已执行。

`/gsd:complete-milestone`
```
</step>

</process>

<context_efficiency>
编排器：约 10-15% 上下文。子代理：每个新鲜 200k。无轮询（Task 阻塞）。无上下文泄漏。
</context_efficiency>

<failure_handling>
- **classifyHandoffIfNeeded 假失败：** 代理报告 "failed" 但错误是 `classifyHandoffIfNeeded is not defined` → Claude Code 错误，不是 GSD。抽查（SUMMARY 存在、提交存在）→ 如果通过，视为成功
- **代理中途失败：** 缺少 SUMMARY.md → 报告，询问用户如何继续
- **依赖链断开：** 波 1 失败 → 波 2 依赖项可能失败 → 用户选择尝试或跳过
- **波中的所有代理失败：** 系统性问题 → 停止，报告调查
- **检查点无法解决：** "跳过此计划？" 还是 "中止阶段执行？" → 在 STATE.md 中记录部分进度
</failure_handling>

<resumption>
重新运行 `/gsd:execute-phase {phase}` → discover_plans 找到完成的 SUMMARY → 跳过它们 → 从第一个未完成的计划恢复 → 继续波执行。

STATE.md 跟踪：最后完成的计划、当前波、待处理检查点。
</resumption>
