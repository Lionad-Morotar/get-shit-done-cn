<purpose>
使用 GSD 保证（原子提交、STATE.md 跟踪）执行小型、临时任务，同时跳过可选代理（研究、计划检查器、验证器）。快速模式生成 gsd-planner（快速模式）+ gsd-executor(s)，在 `.planning/quick/` 中跟踪任务，并更新 STATE.md 的"快速任务已完成"表。
</purpose>

<required_reading>
在开始之前读取调用提示的 execution_context 引用的所有文件。
</required_reading>

<process>
**步骤 1：获取任务描述**

以交互方式提示用户输入任务描述：

```
AskUserQuestion(
  header: "快速任务",
  question: "您想做什么？",
  followUp: null
)
```

将响应存储为 `$DESCRIPTION`。

如果为空，重新提示："请提供任务描述。"

---

**步骤 2：初始化**

```bash
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js init quick "$DESCRIPTION")
```

解析 JSON 获取：`planner_model`、`executor_model`、`commit_docs`、`next_num`、`slug`、`date`、`timestamp`、`quick_dir`、`task_dir`、`roadmap_exists`、`planning_exists`。

**如果 `roadmap_exists` 为 false：** 错误 — 快速模式需要带有 ROADMAP.md 的活动项目。首先运行 `/gsd:new-project`。

快速任务可以在阶段中期运行 — 验证仅检查 ROADMAP.md 是否存在，而不是阶段状态。

---

**步骤 3：创建任务目录**

```bash
mkdir -p "${task_dir}"
```

---

**步骤 4：创建快速任务目录**

为此快速任务创建目录：

```bash
QUICK_DIR=".planning/quick/${next_num}-${slug}"
mkdir -p "$QUICK_DIR"
```

向用户报告：
```
创建快速任务 ${next_num}：${DESCRIPTION}
目录：${QUICK_DIR}
```

存储 `$QUICK_DIR` 以在编排中使用。

---

**步骤 5：生成规划器（快速模式）**

使用快速模式上下文生成 gsd-planner：

```
Task(
  prompt="
<planning_context>

**模式：** quick
**目录：** ${QUICK_DIR}
**描述：** ${DESCRIPTION}

**项目状态：**
@.planning/STATE.md

</planning_context>

<constraints>
- 创建具有 1-3 个专注任务的单一计划
- 快速任务应该是原子和自包含的
- 无研究阶段，无检查器阶段
- 目标约 30% 上下文使用（简单、专注）
</constraints>

<output>
将计划写入到：${QUICK_DIR}/${next_num}-PLAN.md
返回：## PLANNING COMPLETE 并带有计划路径
</output>
",
  subagent_type="gsd-planner",
  model="{planner_model}",
  description="Quick plan: ${DESCRIPTION}"
)
```

规划器返回后：
1. 验证计划存在于 `${QUICK_DIR}/${next_num}-PLAN.md`
2. 提取计划计数（快速任务通常为 1）
3. 报告："计划已创建：${QUICK_DIR}/${next_num}-PLAN.md"

如果未找到计划，错误："规划器未能创建 ${next_num}-PLAN.md"

---

**步骤 6：生成执行器**

使用计划引用生成 gsd-executor：

```
Task(
  prompt="
执行快速任务 ${next_num}。

计划：@${QUICK_DIR}/${next_num}-PLAN.md
项目状态：@.planning/STATE.md

<constraints>
- 执行计划中的所有任务
- 原子地提交每个任务
- 在此处创建摘要：${QUICK_DIR}/${next_num}-SUMMARY.md
- 不要更新 ROADMAP.md（快速任务与计划的阶段分开）
</constraints>
",
  subagent_type="gsd-executor",
  model="{executor_model}",
  description="Execute: ${DESCRIPTION}"
)
```

执行器返回后：
1. 验证摘要存在于 `${QUICK_DIR}/${next_num}-SUMMARY.md`
2. 从执行器输出中提取提交哈希
3. 报告完成状态

**已知的 Claude Code 错误 (classifyHandoffIfNeeded)：** 如果执行器报告"失败"并带有错误 `classifyHandoffIfNeeded is not defined`，这是一个 Claude Code 运行时错误 — 不是真正的失败。检查摘要文件是否存在以及 git log 显示提交。如果是，则视为成功。

如果未找到摘要，错误："执行器未能创建 ${next_num}-SUMMARY.md"

注意：对于生成多个计划的快速任务（罕见），按照 execute-phase 模式在并行波中生成执行器。

---

**步骤 7：更新 STATE.md**

使用快速任务完成记录更新 STATE.md。

**7a. 检查"快速任务已完成"部分是否存在：**

读取 STATE.md 并检查 `### Quick Tasks Completed` 部分。

**7b. 如果部分不存在，创建它：**

在 `### Blockers/Concerns` 部分后插入：

```markdown
### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
```

**7c. 向表追加新行：**

使用来自 init 的 `date`：
```markdown
| ${next_num} | ${DESCRIPTION} | ${date} | ${commit_hash} | [${next_num}-${slug}](./quick/${next_num}-${slug}/) |
```

**7d. 更新"最后活动"行：**

使用来自 init 的 `date`：
```
最后活动：${date} - 已完成快速任务 ${next_num}：${DESCRIPTION}
```

使用 Edit 工具原子地进行这些更改

---

**步骤 8：最终提交和完成**

暂存并提交快速任务工件：

```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "docs(quick-${next_num}): ${DESCRIPTION}" --files ${QUICK_DIR}/${next_num}-PLAN.md ${QUICK_DIR}/${next_num}-SUMMARY.md .planning/STATE.md
```

获取最终提交哈希：
```bash
commit_hash=$(git rev-parse --short HEAD)
```

显示完成输出：
```
---

GSD > 快速任务完成

快速任务 ${next_num}：${DESCRIPTION}

摘要：${QUICK_DIR}/${next_num}-SUMMARY.md
提交：${commit_hash}

---

准备好下一个任务：/gsd:quick
```

</process>

<success_criteria>
- [ ] ROADMAP.md 验证通过
- [ ] 用户提供任务描述
- [ ] 生成了 slug（小写、连字符、最多 40 个字符）
- [ ] 计算了下一个编号（001、002、003...）
- [ ] 在 `.planning/quick/NNN-slug/` 创建了目录
- [ ] 由规划器创建了 `${next_num}-PLAN.md`
- [ ] 由执行器创建了 `${next_num}-SUMMARY.md`
- [ ] STATE.md 已更新并带有快速任务行
- [ ] 工件已提交
      </success_criteria>
