<trigger>
在以下情况下使用此工作流程：
- 在现有项目上开始新会话
- 用户说"继续"、"下一步"、"我们在哪里"、"恢复"
- 当 .planning/ 已存在时的任何规划操作
- 用户离开项目后返回
</trigger>

<purpose>
立即恢复完整的项目上下文，以便"我们在哪里？"有一个即时、完整的答案。
</purpose>

<required_reading>
@~/.claude/get-shit-done/references/continuation-format.md
</required_reading>

<process>

<step name="initialize">
在一次调用中加载所有上下文：

```bash
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js init resume)
```

解析 JSON 获取：`state_exists`、`roadmap_exists`、`project_exists`、`planning_exists`、`has_interrupted_agent`、`interrupted_agent_id`、`commit_docs`。

**如果 `state_exists` 为 true：** 继续到 load_state
**如果 `state_exists` 为 false 但 `roadmap_exists` 或 `project_exists` 为 true：** 提供重建 STATE.md
**如果 `planning_exists` 为 false：** 这是一个新项目 - 路由到 /gsd:new-project
</step>

<step name="load_state">

读取并解析 STATE.md，然后 PROJECT.md：

```bash
cat .planning/STATE.md
cat .planning/PROJECT.md
```

**从 STATE.md 提取：**

- **项目参考：** 核心价值和当前焦点
- **当前位置：** 阶段 X 共 Y，计划 A 共 B，状态
- **进度：** 可视进度条
- **最近决策：** 影响当前工作的关键决策
- **待处理待办事项：** 会话期间捕获的想法
- **阻塞因素/关注点：** 带来的问题
- **会话连续性：** 我们离开的地方，任何恢复文件

**从 PROJECT.md 提取：**

- **这是什么：** 当前准确描述
- **需求：** 已验证、活动、范围外
- **关键决策：** 带有结果的完整决策日志
- **约束：** 实现的硬限制

</step>

<step name="check_incomplete_work">
查找需要注意的不完整工作：

```bash
# 检查 continue-here 文件（中期计划恢复）
ls .planning/phases/*/.continue-here*.md 2>/dev/null

# 检查没有摘要的计划（未完成执行）
for plan in .planning/phases/*/*-PLAN.md; do
  summary="${plan/PLAN/SUMMARY}"
  [ ! -f "$summary" ] && echo "未完成：$plan"
done 2>/dev/null

# 检查中断的代理（使用来自 init 的 has_interrupted_agent 和 interrupted_agent_id）
if [ "$has_interrupted_agent" = "true" ]; then
  echo "中断的代理：$interrupted_agent_id"
fi
```

**如果 .continue-here 文件存在：**

- 这是一个中期计划恢复点
- 读取文件以获取特定恢复上下文
- 标记："发现中期计划检查点"

**如果存在没有 SUMMARY 的 PLAN：**

- 执行已开始但未完成
- 标记："发现未完成的计划执行"

**如果发现中断的代理：**

- 子代理已生成但会话在完成前结束
- 读取 agent-history.json 以获取任务详细信息
- 标记："发现中断的代理"
  </step>

<step name="present_status">
向用户展示完整的项目状态：

```
╔══════════════════════════════════════════════════════════════╗
║  项目状态                                               ║
╠══════════════════════════════════════════════════════════════╣
║  构建：[来自 PROJECT.md "这是什么"的一句话]         ║
║                                                               ║
║  阶段：[X] 共 [Y] - [阶段名称]                            ║
║  计划：  [A] 共 [B] - [状态]                                ║
║  进度：[██████░░░░] XX%                                  ║
║                                                               ║
║  最后活动：[日期] - [发生了什么]                     ║
╚══════════════════════════════════════════════════════════════╝

[如果发现不完整工作:]
⚠️  检测到不完整工作：
    - [.continue-here 文件或未完成计划]

[如果发现中断的代理:]
⚠️  检测到中断的代理：
    代理 ID：[id]
    任务：[来自 agent-history.json 的任务描述]
    中断时间：[时间戳]

    使用恢复：Task 工具（带有代理 ID 的 resume 参数）

[如果存在待处理待办事项:]
📋 [N] 个待处理待办事项 — /gsd:check-todos 以审查

[如果存在阻塞因素:]
⚠️  带来的关注点：
    - [阻塞因素 1]
    - [阻塞因素 2]

[如果一致性不是 ✓:]
⚠️  简要一致性：[状态] - [评估]
```

</step>

<step name="determine_next_action">
根据项目状态，确定最合理的下一步操作：

**如果存在中断的代理：**
→ 主要：恢复中断的代理（带有 resume 参数的 Task 工具）
→ 选项：重新开始（放弃代理工作）

**如果存在 .continue-here 文件：**
→ 主要：从检查点恢复
→ 选项：在当前计划上重新开始

**如果未完成计划（没有 SUMMARY 的 PLAN）：**
→ 主要：完成未完成的计划
→ 选项：放弃并继续

**如果阶段进行中，所有计划完成：**
→ 主要：转换到下一个阶段
→ 选项：审查已完成的工作

**如果阶段准备规划：**
→ 检查此阶段是否存在 CONTEXT.md：

- 如果缺少 CONTEXT.md：
  → 主要：讨论阶段愿景（用户想象如何工作）
  → 次要：直接规划（跳过上下文收集）
- 如果存在 CONTEXT.md：
  → 主要：规划阶段
  → 选项：审查路线图

**如果阶段准备执行：**
→ 主要：执行下一个计划
→ 选项：首先审查计划
</step>

<step name="offer_options">
基于项目状态提供上下文选项：

```
您想做什么？

[基于状态的主要操作 - 例如：]
1. 恢复中断的代理 [如果发现中断的代理]
   或者
1. 执行阶段 (/gsd:execute-phase {phase})
   或者
1. 讨论阶段 3 上下文 (/gsd:discuss-phase 3) [如果缺少 CONTEXT.md]
   或者
1. 规划阶段 3 (/gsd:plan-phase 3) [如果存在 CONTEXT.md 或拒绝讨论选项]

[次要选项:]
2. 审查当前阶段状态
3. 检查待处理待办事项（[N] 个待处理）
4. 审查简要一致性
5. 其他
```

**注意：** 提供阶段规划时，首先检查 CONTEXT.md 是否存在：

```bash
ls .planning/phases/XX-name/*-CONTEXT.md 2>/dev/null
```

如果缺少，建议在规划之前讨论阶段。如果存在，直接提供规划。

等待用户选择。
</step>

<step name="route_to_workflow">
根据用户选择，路由到适当的工作流程：

- **执行计划** → 显示用户在清空后运行的命令：
  ```
  ---

  ## ▶ 接下来

  **{phase}-{plan}: [计划名称]** — [来自 PLAN.md 的目标]

  `/gsd:execute-phase {phase}`

  <sub>`/clear` 首先 → 清空上下文窗口</sub>

  ---
  ```
- **规划阶段** → 显示用户在清空后运行的命令：
  ```
  ---

  ## ▶ 接下来

  **阶段 [N]: [名称]** — [来自 ROADMAP.md 的目标]

  `/gsd:plan-phase [phase-number]`

  <sub>`/clear` 首先 → 清空上下文窗口</sub>

  ---

  **也可用：**
  - `/gsd:discuss-phase [N]` — 首先收集上下文
  - `/gsd:research-phase [N]` — 调查未知

  ---
  ```
- **转换** → ./transition.md
- **检查待办事项** → 读取 .planning/todos/pending/，展示摘要
- **审查一致性** → 读取 PROJECT.md，比较到当前状态
- **其他** → 询问他们需要什么
</step>

<step name="update_session">
在继续到路由工作流程之前，更新会话连续性：

更新 STATE.md：

```markdown
## 会话连续性

最后会话：[现在]
停止于：会话已恢复，正在继续到 [操作]
恢复文件：[如果适用则更新]
```

这确保如果会话意外结束，下次恢复知道状态。
</step>

</process>

<reconstruction>
如果 STATE.md 丢失但其他工件存在：

"STATE.md 丢失。从工件重建..."

1. 读取 PROJECT.md → 提取"这是什么"和核心价值
2. 读取 ROADMAP.md → 确定阶段，查找当前位置
3. 扫描 *-SUMMARY.md 文件 → 提取决策、关注点
4. 计算 .planning/todos/pending/ 中的待处理待办事项
5. 检查 .continue-here 文件 → 会话连续性

重建并写入 STATE.md，然后正常继续。

这处理以下情况：

- 项目早于 STATE.md 引入
- 文件被意外删除
- 在没有完整 .planning/ 状态的情况下克隆仓库
  </reconstruction>

<quick_resume>
如果用户说"继续"或"去"：
- 静默加载状态
- 确定主要操作
- 立即执行而不展示选项

"从 [状态] 继续... [操作]"
</quick_resume>

<success_criteria>
恢复完成时：

- [ ] STATE.md 已加载（或重建）
- [ ] 不完整工作已检测和标记
- [ ] 清晰状态已展示给用户
- [ ] 上下文下一步操作已提供
- [ ] 用户确切知道项目位置
- [ ] 会话连续性已更新
      </success_criteria>
