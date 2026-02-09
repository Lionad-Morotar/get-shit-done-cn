<purpose>
执行阶段提示（PLAN.md）并创建结果摘要（SUMMARY.md）。
</purpose>

<required_reading>
在任何操作之前读取 STATE.md 以加载项目上下文。
读取 config.json 以获取规划行为设置。

@~/.claude/get-shit-done/references/git-integration.md
</required_reading>

<process>

<step name="init_context" priority="first">
加载执行上下文（使用 `init execute-phase` 获取完整上下文，包括文件内容）：

```bash
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js init execute-phase "${PHASE}" --include state,config)
```

从 init JSON 提取：`executor_model`、`commit_docs`、`phase_dir`、`phase_number`、`plans`、`summaries`、`incomplete_plans`。

**文件内容（来自 --include）：** `state_content`、`config_content`。访问方式：
```bash
STATE_CONTENT=$(echo "$INIT" | jq -r '.state_content // empty')
CONFIG_CONTENT=$(echo "$INIT" | jq -r '.config_content // empty')
```

如果 `.planning/` 缺失：错误。
</step>

<step name="identify_plan">
```bash
# 使用 INIT JSON 中的 plans/summaries，或列出文件
ls .planning/phases/XX-name/*-PLAN.md 2>/dev/null | sort
ls .planning/phases/XX-name/*-SUMMARY.md 2>/dev/null | sort
```

查找第一个没有匹配 SUMMARY 的 PLAN。支持十进制阶段（`01.1-hotfix/`）：

```bash
PHASE=$(echo "$PLAN_PATH" | grep -oE '[0-9]+(\.[0-9]+)?-[0-9]+')
# config_content 已通过 init_context 中的 --include config 加载
```

<if mode="yolo">
自动批准：`⚡ Execute {phase}-{plan}-PLAN.md [阶段 Z 的计划 X 共 Y]` → parse_segments。
</if>

<if mode="interactive" OR="custom with gates.execute_next_plan true">
展示计划识别，等待确认。
</if>
</step>

<step name="record_start_time">
```bash
PLAN_START_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
PLAN_START_EPOCH=$(date +%s)
```
</step>

<step name="parse_segments">
```bash
grep -n "type=\"checkpoint" .planning/phases/XX-name/{phase}-{plan}-PLAN.md
```

**通过检查点类型路由：**

| 检查点 | 模式 | 执行 |
|-------------|---------|-----------|
| 无 | A（自主） | 单个子代理：完整计划 + SUMMARY + 提交 |
| 仅验证 | B（分段） | 检查点之间的段。在 none/human-verify 之后 → 子代理。在 decision/human-action 之后 → 主代理 |
| 决策 | C（主） | 完全在主上下文中执行 |

**模式 A：** init_agent_tracking → 生成 Task(subagent_type="gsd-executor", model=executor_model)，提示：在 [path] 处执行计划、自主、所有任务 + SUMMARY + 提交、遵循偏差/授权规则、报告：计划名称、任务、SUMMARY 路径、提交哈希 → 跟踪 agent_id → 等待 → 更新跟踪 → 报告。

**模式 B：** 逐段执行。自主段：仅为分配的任务生成子代理（无 SUMMARY/提交）。检查点：主上下文。所有段之后：聚合、创建 SUMMARY、提交。参见 segment_execution。

**模式 C：** 使用标准流程在主上下文中执行（步骤名称 "execute"）。

每个子代理的新鲜上下文保持峰值质量。主上下文保持精简。
</step>

<step name="init_agent_tracking">
```bash
if [ ! -f .planning/agent-history.json ]; then
  echo '{"version":"1.0","max_entries":50,"entries":[]}' > .planning/agent-history.json
fi
rm -f .planning/current-agent-id.txt
if [ -f .planning/current-agent-id.txt ]; then
  INTERRUPTED_ID=$(cat .planning/current-agent-id.txt)
  echo "发现中断的代理：$INTERRUPTED_ID"
fi
```

如果中断：询问用户恢复（Task `resume` 参数）或重新开始。

**跟踪协议：** 生成时：将 agent_id 写入 `current-agent-id.txt`，附加到 agent-history.json：`{"agent_id":"[id]","task_description":"[desc]","phase":"[phase]","plan":"[plan]","segment":[num|null],"timestamp":"[ISO]","status":"spawned","completion_timestamp":null}`。完成时：status → "completed"，设置 completion_timestamp，删除 current-agent-id.txt。修剪：如果条目 > max_entries，删除最旧的 "completed"（从不删除 "spawned"）。

在模式 A/B 生成之前运行。模式 C：跳过。
</step>

<step name="segment_execution">
仅模式 B（仅验证检查点）。跳过 A/C。

1. 解析段映射：检查点位置和类型
2. 每段：
   - 子代理路由：仅为分配的任务生成 gsd-executor。提示：任务范围、计划路径、读取完整计划作为上下文、执行分配的任务、跟踪偏差、无 SUMMARY/提交。通过代理协议跟踪。
   - 主路由：使用标准流程执行任务（步骤名称 "execute"）
3. 所有段之后：聚合文件/偏差/决策 → 创建 SUMMARY.md → 提交 → 自检：
   - 使用 `[ -f ]` 验证 key-files.created 存在于磁盘上
   - 检查 `git log --oneline --all --grep="{phase}-{plan}"` 返回 ≥1 个提交
   - 将 `## Self-Check: PASSED` 或 `## Self-Check: FAILED` 附加到 SUMMARY

   **已知的 Claude Code 错误（classifyHandoffIfNeeded）：** 如果任何段代理报告 "failed" 且带有 `classifyHandoffIfNeeded is not defined`，这是一个 Claude Code 运行时错误 — 不是真正的失败。运行抽查；如果通过，视为成功。



</step>

<step name="load_prompt">
```bash
cat .planning/phases/XX-name/{phase}-{plan}-PLAN.md
```
这就是执行指令。完全遵循。如果计划引用 CONTEXT.md：始终尊重用户的愿景。
</step>

<step name="previous_phase_check">
```bash
ls .planning/phases/*/SUMMARY.md 2>/dev/null | sort -r | head -2 | tail -1
```
如果以前的 SUMMARY 有未解决的 "遇到的问题" 或 "下一阶段就绪" 阻塞器：AskUserQuestion(header="以前的问题"，选项："无论如何继续" | "先解决" | "审查以前的")。
</step>

<step name="execute">
偏差是正常的 — 通过以下规则处理。

1. 从提示读取 @context 文件
2. 每个任务：
   - `type="auto"`：如果 `tdd="true"` → TDD 执行。使用偏差规则 + 授权门实现。验证完成标准。提交（参见 task_commit）。跟踪哈希用于摘要。
   - `type="checkpoint:*"`：停止 → checkpoint_protocol → 等待用户 → 仅在确认后继续。
3. 运行 `<verification>` 检查
4. 确认满足 `<success_criteria>`
5. 在摘要中记录偏差
</step>

<authentication_gates>

## 授权门

执行期间的授权错误不是失败 — 它们是预期的交互点。

**指示器：** "未授权"、"未经授权"、401/403、"请运行 {tool} login"、"设置 {ENV_VAR}"

**协议：**
1. 识别授权门（不是错误）
2. 停止任务执行
3. 创建动态检查点：human-action 并带有确切的授权步骤
4. 等待用户授权
5. 验证凭据有效
6. 重试原始任务
7. 正常继续

**示例：** `vercel --yes` → "未授权" → 检查点要求用户 `vercel login` → 使用 `vercel whoami` 验证 → 重试部署 → 继续

**在摘要中：** 在 "## 授权门" 下记录为正常流程，而不是偏差。

</authentication_gates>

<deviation_rules>

## 偏差规则

您将发现计划外的工作。自动应用，跟踪所有用于摘要。

| 规则 | 触发器 | 操作 | 权限 |
|------|---------|--------|------------|
| **1：错误** | 错误行为、错误、错误查询、类型错误、安全漏洞、竞态条件、泄漏 | 修复 → 测试 → 验证 → 跟踪 `[规则 1 - 错误]` | 自动 |
| **2：缺少关键** | 缺少必要内容：错误处理、验证、授权、CSRF/CORS、速率限制、索引、日志记录 | 添加 → 测试 → 验证 → 跟踪 `[规则 2 - 缺少关键]` | 自动 |
| **3：阻塞** | 阻止完成：缺少依赖、错误类型、损坏的导入、缺少环境/配置/文件、循环依赖 | 修复阻塞器 → 验证继续 → 跟踪 `[规则 3 - 阻塞]` | 自动 |
| **4：架构** | 结构更改：新数据库表、架构更改、新服务、切换库、破坏性 API、新基础设施 | 停止 → 展示决策（下面）→ 跟踪 `[规则 4 - 架构]` | 询问用户 |

**规则 4 格式：**
```
⚠️ 需要架构决策

当前任务：[任务名称]
发现：[提示此内容的内容]
建议更改：[修改]
为什么需要：[理由]
影响：[受影响的内容]
替代方案：[其他方法]

继续建议的更改？（是 / 不同方法 / 延迟）
```

**优先级：** 规则 4（停止）> 规则 1-3（自动）> 不确定 → 规则 4
**边缘情况：** 缺少验证 → R2 | null 崩溃 → R1 | 新表 → R4 | 新列 → R1/2
**启发式：** 影响正确性/安全性/完成？→ R1-3。也许？→ R4。

</deviation_rules>

<deviation_documentation>

## 记录偏差

摘要必须包括偏差部分。无？→ `## 计划偏差\n\n无 - 计划完全按书面执行。`

每个偏差：**[规则 N - 类别] 标题** — 发现于：任务 X | 问题 | 修复 | 修改的文件 | 验证 | 提交哈希

结束于：**总偏差：** N 个自动修复（细分）。**影响：** 评估。

</deviation_documentation>

<tdd_plan_execution>
## TDD 执行

对于 `type: tdd` 计划 — 红-绿-重构：

1. **基础设施**（仅第一个 TDD 计划）：检测项目、安装框架、配置、验证空套件
2. **红：** 读取 `<behavior>` → 失败测试 → 运行（必须失败）→ 提交：`test({phase}-{plan}): 为 [功能] 添加失败测试`
3. **绿：** 读取 `<implementation>` → 最小代码 → 运行（必须通过）→ 提交：`feat({phase}-{plan}): 实现 [功能]`
4. **重构：** 清理 → 测试必须通过 → 提交：`refactor({phase}-{plan}): 清理 [功能]`

错误：红不失败 → 调查测试/现有功能。绿不通 → 调试、迭代。重构破坏 → 撤销。

结构见 `~/.claude/get-shit-done/references/tdd.md`。
</tdd_plan_execution>

<task_commit>
## 任务提交协议

在每个任务之后（验证通过、满足完成标准），立即提交。

**1. 检查：** `git status --short`

**2. 单独暂存**（从不使用 `git add .` 或 `git add -A`）：
```bash
git add src/api/auth.ts
git add src/types/user.ts
```

**3. 提交类型：**

| 类型 | 当 | 示例 |
|------|------|---------|
| `feat` | 新功能 | feat(08-02): 创建用户注册端点 |
| `fix` | 错误修复 | fix(08-02): 更正电子邮件验证正则表达式 |
| `test` | 仅测试（TDD 红） | test(08-02): 为密码哈希添加失败测试 |
| `refactor` | 无行为更改（TDD 重构） | refactor(08-02): 将验证提取到辅助程序 |
| `perf` | 性能 | perf(08-02): 添加数据库索引 |
| `docs` | 文档 | docs(08-02): 添加 API 文档 |
| `style` | 格式化 | style(08-02): 格式化授权模块 |
| `chore` | 配置/依赖 | chore(08-02): 添加 bcrypt 依赖 |

**4. 格式：** `{type}({phase}-{plan}): {description}` 并带有关键更改的要点。

**5. 记录哈希：**
```bash
TASK_COMMIT=$(git rev-parse --short HEAD)
TASK_COMMITS+=("任务 ${TASK_NUM}: ${TASK_COMMIT}")
```

</task_commit>

<step name="checkpoint_protocol">
在 `type="checkpoint:*"` 上：首先尽可能自动化。检查点仅用于验证/决策。

显示：`CHECKPOINT: [类型]` 框 → 进度 {X}/{Y} → 任务名称 → 特定类型的内容 → `您的操作：[signal]`

| 类型 | 内容 | 恢复信号 |
|------|---------|---------------|
| human-verify（90%） | 构建的内容 + 验证步骤（命令/URL） | "approved" 或描述问题 |
| decision（9%） | 需要决策 + 上下文 + 带有优点/缺点的选项 | "选择：option-id" |
| human-action（1%） | 自动化的内容 + 一个手动步骤 + 验证计划 | "done"`

响应后：如果指定则验证。通过 → 继续。失败 → 通知、等待。等待用户 — 不要臆测完成。

详细信息见 ~/.claude/get-shit-done/references/checkpoints.md。
</step>

<step name="checkpoint_return_for_orchestrator">
当通过 Task 生成并遇到检查点时：返回结构化状态（无法直接与用户交互）。

**必需返回：** 1) 已完成任务表（哈希 + 文件）2) 当前任务（阻塞的内容）3) 检查点详细信息（面向用户的内容）4) 等待（需要用户提供的内容）

编排器解析 → 展示给用户 → 使用您的已完成任务状态生成新鲜的继续。您不会被恢复。在主上下文中：使用上面的 checkpoint_protocol。
</step>

<step name="verification_failure_gate">
如果验证失败：停止。展示："任务 [X] 的验证失败：[name]。预期：[标准]。实际：[result]。"。选项：重试 | 跳过（标记未完成） | 停止（调查）。如果跳过 → 摘要 "遇到的问题"。
</step>

<step name="record_completion_time">
```bash
PLAN_END_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
PLAN_END_EPOCH=$(date +%s)

DURATION_SEC=$(( PLAN_END_EPOCH - PLAN_START_EPOCH ))
DURATION_MIN=$(( DURATION_SEC / 60 ))

if [[ $DURATION_MIN -ge 60 ]]; then
  HRS=$(( DURATION_MIN / 60 ))
  MIN=$(( DURATION_MIN % 60 ))
  DURATION="${HRS}h ${MIN}m"
else
  DURATION="${DURATION_MIN} min"
fi
```
</step>

<step name="generate_user_setup">
```bash
grep -A 50 "^user_setup:" .planning/phases/XX-name/{phase}-{plan}-PLAN.md | head -50
```

如果 user_setup 存在：使用模板 `~/.claude/get-shit-done/templates/user-setup.md` 创建 `{phase}-USER-SETUP.md`。每个服务：环境变量表、帐户设置清单、仪表板配置、本地开发注释、验证命令。状态 "未完成"。设置 `USER_SETUP_CREATED=true`。如果为空/缺失：跳过。
</step>

<step name="create_summary">
在 `.planning/phases/XX-name/` 处创建 `{phase}-{plan}-SUMMARY.md`。使用 `~/.claude/get-shit-done/templates/summary.md`。

**Frontmatter：** 阶段、计划、子系统、标签 | requires/provides/affects | tech-stack.added/patterns | key-files.created/modified | key-decisions | 持续时间（$DURATION）、完成时间（$PLAN_END_TIME 日期）。

标题：`# 阶段 [X] 计划 [Y]：[名称] 摘要`

One-liner 实质性："使用 jose 库的刷新轮换 JWT 授权" 而不是 "已实现授权"

包括：持续时间、开始/结束时间、任务计数、文件计数。

下一步：更多计划 → "准备 {next-plan}" | 最后 → "阶段完成，准备过渡"。
</step>

<step name="update_current_position">
使用 gsd-tools 更新 STATE.md：

```bash
# 前进计划计数器（处理最后计划边缘情况）
node ~/.claude/get-shit-done/bin/gsd-tools.js state advance-plan

# 从磁盘状态重新计算进度条
node ~/.claude/get-shit-done/bin/gsd-tools.js state update-progress

# 记录执行指标
node ~/.claude/get-shit-done/bin/gsd-tools.js state record-metric \
  --phase "${PHASE}" --plan "${PLAN}" --duration "${DURATION}" \
  --tasks "${TASK_COUNT}" --files "${FILE_COUNT}"
```
</step>

<step name="extract_decisions_and_issues">
从摘要：提取决策并添加到 STATE.md：

```bash
# 从摘要 key-decisions 添加每个决策
node ~/.claude/get-shit-done/bin/gsd-tools.js state add-decision \
  --phase "${PHASE}" --summary "${DECISION_TEXT}" --rationale "${RATIONALE}"

# 如果发现阻塞器则添加
node ~/.claude/get-shit-done/bin/gsd-tools.js state add-blocker "阻塞器描述"
```
</step>

<step name="update_session_continuity">
使用 gsd-tools 更新会话信息：

```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js state record-session \
  --stopped-at "已完成 ${PHASE}-${PLAN}-PLAN.md" \
  --resume-file "无"
```

保持 STATE.md 低于 150 行。
</step>

<step name="issues_review_gate">
如果摘要 "遇到的问题" ≠ "无"：yolo → 记录并继续。交互 → 展示问题，等待确认。
</step>

<step name="update_roadmap">
更多计划 → 更新计划计数，保持 "进行中"。最后计划 → 标记阶段 "完成"，添加日期。
</step>

<step name="git_commit_metadata">
任务代码已按任务提交。提交计划元数据：

```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "docs({phase}-{plan}): 完成 [plan-name] 计划" --files .planning/phases/XX-name/{phase}-{plan}-SUMMARY.md .planning/STATE.md .planning/ROADMAP.md
```
</step>

<step name="update_codebase_map">
如果 .planning/codebase/ 不存在：跳过。

```bash
FIRST_TASK=$(git log --oneline --grep="feat({phase}-{plan}):" --grep="fix({phase}-{plan}):" --grep="test({phase-{plan}):" --reverse | head -1 | cut -d' ' -f1)
git diff --name-only ${FIRST_TASK}^..HEAD 2>/dev/null
```

仅更新结构更改：新的 src/ 目录 → STRUCTURE.md | 依赖 → STACK.md | 文件模式 → CONVENTIONS.md | API 客户端 → INTEGRATIONS.md | 配置 → STACK.md | 重命名 → 更新路径。跳过仅代码/错误修复/内容更改。

```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "" --files .planning/codebase/*.md --amend
```
</step>

<step name="offer_next">
如果 `USER_SETUP_CREATED=true`：在顶部显示 `⚠️ 需要用户设置` 并带有路径 + 环境/配置任务。

```bash
ls -1 .planning/phases/[current-phase-dir]/*-PLAN.md 2>/dev/null | wc -l
ls -1 .planning/phases/[current-phase-dir]/*-SUMMARY.md 2>/dev/null | wc -l
```

| 条件 | 路由 | 操作 |
|-----------|-------|--------|
| summaries < plans | **A：更多计划** | 查找下一个没有 SUMMARY 的 PLAN。Yolo：自动继续。交互：显示下一个计划，建议 `/gsd:execute-phase {phase}` + `/gsd:verify-work`。在此停止。 |
| summaries = plans，当前 < 最高阶段 | **B：阶段完成** | 显示完成，建议 `/gsd:plan-phase {Z+1}` + `/gsd:verify-work {Z}` + `/gsd:discuss-phase {Z+1}` |
| summaries = plans，当前 = 最高阶段 | **C：里程碑完成** | 显示横幅，建议 `/gsd:complete-milestone` + `/gsd:verify-work` + `/gsd:add-phase` |

所有路由：首先 `/clear` 以获得新上下文。
</step>

</process>

<success_criteria>

- PLAN.md 的所有任务已完成
- 所有验证通过
- 如果 frontmatter 中有 user_setup，则生成 USER-SETUP.md
- 创建了带有实质性内容的 SUMMARY.md
- STATE.md 已更新（位置、决策、问题、会话）
- ROADMAP.md 已更新
- 如果存在代码库映射：使用执行更改更新映射（或如果没有重大更改则跳过）
- 如果创建了 USER-SETUP.md：在完成输出中突出显示
</success_criteria>
