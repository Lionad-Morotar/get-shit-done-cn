<purpose>
为路线图阶段创建可执行的阶段提示（PLAN.md 文件），具有集成的研究和验证。默认流程：研究（如果需要）→ 规划 → 验证 → 完成。编排 gsd-phase-researcher、gsd-planner 和 gsd-plan-checker 代理并具有修订循环（最多 3 次迭代）。
</purpose>

<required_reading>
在开始之前读取执行上下文引用的所有文件。

@~/.claude/get-shit-done/references/ui-brand.md
</required_reading>

<process>

## 1. 初始化

在一次调用中加载所有上下文（包括文件内容以避免冗余读取）：

```bash
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js init plan-phase "$PHASE" --include state,roadmap,requirements,context,research,verification,uat)
```

解析 JSON 以获取：`researcher_model`、`planner_model`、`checker_model`、`research_enabled`、`plan_checker_enabled`、`commit_docs`、`phase_found`、`phase_dir`、`phase_number`、`phase_name`、`phase_slug`、`padded_phase`、`has_research`、`has_context`、`has_plans`、`plan_count`、`planning_exists`、`roadmap_exists`。

**文件内容（来自 --include）：** `state_content`、`roadmap_content`、`requirements_content`、`context_content`、`research_content`、`verification_content`、`uat_content`。如果文件不存在，这些为 null。

**如果 `planning_exists` 为 false：** 错误 — 首先运行 `/gsd:new-project`。

## 2. 解析和规范化参数

从 $ARGUMENTS 提取：阶段编号（整数或十进制，如 `2.1`）、标志（`--research`、`--skip-research`、`--gaps`、`--skip-verify`）。

**如果没有阶段编号：** 从路线图检测下一个未计划的阶段。

**如果 `phase_found` 为 false：** 在 ROADMAP.md 中验证阶段是否存在。如果有效，使用 init 中的 `phase_slug` 和 `padded_phase` 创建目录：
```bash
mkdir -p ".planning/phases/${padded_phase}-${phase_slug}"
```

**来自 init 的现有工件：** `has_research`、`has_plans`、`plan_count`。

## 3. 验证阶段

```bash
PHASE_INFO=$(node ~/.claude/get-shit-done/bin/gsd-tools.js roadmap get-phase "${PHASE}")
```

**如果 `found` 为 false：** 错误并显示可用阶段。**如果 `found` 为 true：** 从 JSON 提取 `phase_number`、`phase_name`、`goal`。

## 4. 加载 CONTEXT.md

使用 init JSON 中的 `context_content`（已通过 `--include context` 加载）。

**关键：** 使用 INIT 中的 `context_content` — 传递给研究者、规划器、检查器和修订代理。

如果 `context_content` 不为 null，显示：`Using phase context from: ${PHASE_DIR}/*-CONTEXT.md`

## 5. 处理研究

**跳过如果：** `--gaps` 标志、`--skip-research` 标志或 `research_enabled` 为 false（来自 init）而没有 `--research` 覆盖。

**如果 `has_research` 为 true（来自 init）且没有 `--research` 标志：** 使用现有，跳到步骤 6。

**如果缺少 RESEARCH.md 或存在 `--research` 标志：**

显示横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 研究阶段 {X}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 生成研究者...
```

### 生成 gsd-phase-researcher

```bash
PHASE_DESC=$(node ~/.claude/get-shit-done/bin/gsd-tools.js roadmap get-phase "${PHASE}" | jq -r '.section')
# 使用来自 INIT 的 requirements_content（已通过 --include requirements 加载）
REQUIREMENTS=$(echo "$INIT" | jq -r '.requirements_content // empty' | grep -A100 "## Requirements" | head -50)
STATE_SNAP=$(node ~/.claude/get-shit-done/bin/gsd-tools.js state-snapshot)
# 从 state-snapshot JSON 提取决策：jq '.decisions[] | "\(.phase): \(.summary) - \(.rationale)"'
```

研究提示：

```markdown
<objective>
研究如何实现阶段 {phase_number}：{phase_name}
回答："要很好地规划此阶段我需要知道什么？"
</objective>

<phase_context>
重要：如果下面存在 CONTEXT.md，它包含来自 /gsd:discuss-phase 的用户决策。
- **决策** = 已锁定 — 深入研究这些，无替代方案
- **Claude 的自决** = 自由区域 — 研究选项、推荐
- **延迟的想法** = 超出范围 — 忽略

{context_content}
</phase_context>

<additional_context>
**阶段描述：** {phase_description}
**需求：** {requirements}
**先前的决策：** {decisions}
</additional_context>

<output>
写入到：{phase_dir}/{phase}-RESEARCH.md
</output>
```

```
Task(
  prompt="首先，读取 ~/.claude/agents/gsd-phase-researcher.md 以获取您的角色和说明。\n\n" + research_prompt,
  subagent_type="general-purpose",
  model="{researcher_model}",
  description="Research Phase {phase}"
)
```

### 处理研究者返回

- **`## RESEARCH COMPLETE`：** 显示确认，继续到步骤 6
- **`## RESEARCH BLOCKED`：** 显示阻塞因素，提供：1) 提供上下文，2) 跳过研究，3) 中止

## 6. 检查现有计划

```bash
ls "${PHASE_DIR}"/*-PLAN.md 2>/dev/null
```

**如果存在：** 提供：1) 添加更多计划，2) 查看现有，3) 从头重新规划。

## 7. 使用来自 INIT 的上下文文件

所有文件内容已在步骤 1 中通过 `--include` 加载（`@` 语法在 Task() 边界之间不起作用）：

```bash
# 从 INIT JSON 提取（无需重新读取文件）
STATE_CONTENT=$(echo "$INIT" | jq -r '.state_content // empty')
ROADMAP_CONTENT=$(echo "$INIT" | jq -r '.roadmap_content // empty')
REQUIREMENTS_CONTENT=$(echo "$INIT" | jq -r '.requirements_content // empty')
RESEARCH_CONTENT=$(echo "$INIT" | jq -r '.research_content // empty')
VERIFICATION_CONTENT=$(echo "$INIT" | jq -r '.verification_content // empty')
UAT_CONTENT=$(echo "$INIT" | jq -r '.uat_content // empty')
CONTEXT_CONTENT=$(echo "$INIT" | jq -r '.context_content // empty')
```

## 8. 生成 gsd-planner 代理

显示横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 规划阶段 {X}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 生成规划器...
```

规划器提示：

```markdown
<planning_context>
**阶段：** {phase_number}
**模式：** {standard | gap_closure}

**项目状态：** {state_content}
**路线图：** {roadmap_content}
**需求：** {requirements_content}

**阶段上下文：**
重要：如果下面存在上下文，它包含来自 /gsd:discuss-phase 的用户决策。
- **决策** = 已锁定 — 完全遵守，不要重新访问
- **Claude 的自决** = 自由 — 做出实现选择
- **延迟的想法** = 超出范围 — 不要包括

{context_content}

**研究：** {research_content}
**缺陷关闭（如果是 --gaps）：** {verification_content} {uat_content}
</planning_context>

<downstream_consumer>
输出由 /gsd:execute-phase 消费。计划需要：
- Frontmatter（wave、depends_on、files_modified、autonomous）
- XML 格式的任务
- 验证标准
- 用于目标反向验证的 must_haves
</downstream_consumer>

<quality_gate>
- [ ] 在阶段目录中创建了 PLAN.md 文件
- [ ] 每个计划都有有效的 frontmatter
- [ ] 任务具体且可操作
- [ ] 正确识别了依赖项
- [ ] 为并行执行分配了波
- [ ] 从阶段目标派生了 must_haves
</quality_gate>
```

```
Task(
  prompt="首先，读取 ~/.claude/agents/gsd-planner.md 以获取您的角色和说明。\n\n" + filled_prompt,
  subagent_type="general-purpose",
  model="{planner_model}",
  description="Plan Phase {phase}"
)
```

## 9. 处理规划器返回

- **`## PLANNING COMPLETE`：** 显示计划计数。如果 `--skip-verify` 或 `plan_checker_enabled` 为 false（来自 init）：跳到步骤 13。否则：步骤 10。
- **`## CHECKPOINT REACHED`：** 展示给用户，获取响应，生成继续（步骤 12）
- **`## PLANNING INCONCLUSIVE`：** 显示尝试，提供：添加上下文 / 重试 / 手动

## 10. 生成 gsd-plan-checker 代理

显示横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 验证计划
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 生成计划检查器...
```

```bash
PLANS_CONTENT=$(cat "${PHASE_DIR}"/*-PLAN.md 2>/dev/null)
```

检查器提示：

```markdown
<verification_context>
**阶段：** {phase_number}
**阶段目标：** {来自 ROADMAP 的 goal}

**要验证的计划：** {plans_content}
**需求：** {requirements_content}

**阶段上下文：**
重要：计划必须遵守用户决策。如果计划矛盾则标记为问题。
- **决策** = 已锁定 — 计划必须完全实现
- **Claude 的自决** = 自由区域 — 计划可以选择方法
- **延迟的想法** = 超出范围 — 计划不得包括

{context_content}
</verification_context>

<expected_output>
- ## VERIFICATION PASSED — 所有检查通过
- ## ISSUES FOUND — 结构化问题列表
</expected_output>
```

```
Task(
  prompt=checker_prompt,
  subagent_type="gsd-plan-checker",
  model="{checker_model}",
  description="Verify Phase {phase} plans"
)
```

## 11. 处理检查器返回

- **`## VERIFICATION PASSED`：** 显示确认，继续到步骤 13。
- **`## ISSUES FOUND`：** 显示问题，检查迭代计数，继续到步骤 12。

## 12. 修订循环（最多 3 次迭代）

跟踪 `iteration_count`（在初始计划 + 检查后从 1 开始）。

**如果 iteration_count < 3：**

显示：`发送回规划器进行修订...（迭代 {N}/3）`

```bash
PLANS_CONTENT=$(cat "${PHASE_DIR}"/*-PLAN.md 2>/dev/null)
```

修订提示：

```markdown
<revision_context>
**阶段：** {phase_number}
**模式：** 修订

**现有计划：** {plans_content}
**检查器问题：** {来自检查器的 structured_issues}

**阶段上下文：**
修订仍必须遵守用户决策。
{context_content}
</revision_context>

<instructions>
进行针对性更新以解决检查器问题。
除非问题是根本性的，否则不要从头重新规划。
返回更改了什么。
</instructions>
```

```
Task(
  prompt="首先，读取 ~/.claude/agents/gsd-planner.md 以获取您的角色和说明。\n\n" + revision_prompt,
  subagent_type="general-purpose",
  model="{planner_model}",
  description="Revise Phase {phase} plans"
)
```

规划器返回后 -> 再次生成检查器（步骤 10），增加 iteration_count。

**如果 iteration_count >= 3：**

显示：`达到最大迭代次数。{N} 个问题仍然存在：` + 问题列表

提供：1) 强制继续，2) 提供指导并重试，3) 放弃

## 13. 展示最终状态

路由到 `<offer_next>`。

</process>

<offer_next>
直接输出此 markdown（不是作为代码块）：

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 阶段 {X} 已规划 ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**阶段 {X}：{Name}** — {M} 个波中的 {N} 个计划

| 波 | 计划 | 构建内容 |
|------|-------|----------------|
| 1    | 01, 02 | [目标] |
| 2    | 03     | [目标]  |

研究：{已完成 | 使用现有 | 已跳过}
验证：{已通过 | 覆盖通过 | 已跳过}

───────────────────────────────────────────────────────────────

## ▶ 接下来

**执行阶段 {X}** — 运行所有 {N} 个计划

/gsd:execute-phase {X}

<sub>/clear first → 新的上下文窗口</sub>

───────────────────────────────────────────────────────────────

**也可用：**
- cat .planning/phases/{phase-dir}/*-PLAN.md — 审查计划
- /gsd:plan-phase {X} --research — 首先重新研究

───────────────────────────────────────────────────────────────
</offer_next>

<success_criteria>
- [ ] 验证了 .planning/ 目录
- [ ] 根据路线图验证了阶段
- [ ] 如需要创建了阶段目录
- [ ] 尽早加载了 CONTEXT.md（步骤 4）并传递给所有代理
- [ ] 研究已完成（除非 --skip-research 或 --gaps 或存在）
- [ ] 使用 CONTEXT.md 生成了 gsd-phase-researcher
- [ ] 检查了现有计划
- [ ] 使用 CONTEXT.md + RESEARCH.md 生成了 gsd-planner
- [ ] 创建了计划（PLANNING COMPLETE 或处理了 CHECKPOINT）
- [ ] 使用 CONTEXT.md 生成了 gsd-plan-checker
- [ ] 验证通过或用户覆盖或达到最大迭代并具有用户决策
- [ ] 用户在代理生成之间看到状态
- [ ] 用户知道下一步
</success_criteria>
