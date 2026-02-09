<purpose>
通过多问题提示交互式配置 GSD 工作流程代理（研究、计划检查、验证器）和模型配置选择。使用用户偏好更新 .planning/config.json。
</purpose>

<required_reading>
在开始之前读取调用提示的 execution_context 引用的所有文件。
</required_reading>

<process>

<step name="ensure_and_load_config">
确保配置存在并加载当前状态：

```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js config-ensure-section
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js state load)
```

如果缺少，这将使用默认值创建 `.planning/config.json` 并加载当前配置值。
</step>

<step name="read_current">
```bash
cat .planning/config.json
```

解析当前值（如果不存在则默认为 `true`）：
- `workflow.research` — 在 plan-phase 期间生成研究者
- `workflow.plan_check` — 在 plan-phase 期间生成计划检查器
- `workflow.verifier` — 在 execute-phase 期间生成验证器
- `model_profile` — 每个代理使用哪个模型（默认：`balanced`）
- `git.branching_strategy` — 分支方法（默认：`"none"`）
</step>

<step name="present_settings">
使用 AskUserQuestion 并预先选择当前值：

```
AskUserQuestion([
  {
    question: "代理使用哪个模型配置？",
    header: "Model",
    multiSelect: false,
    options: [
      { label: "质量", description: "到处使用 Opus，除了验证（最高成本）" },
      { label: "平衡（推荐）", description: "规划使用 Opus，执行/验证使用 Sonnet" },
      { label: "预算", description: "写作使用 Sonnet，研究/验证使用 Haiku（最低成本）" }
    ]
  },
  {
    question: "生成计划研究者？（在规划之前研究领域）",
    header: "Research",
    multiSelect: false,
    options: [
      { label: "是", description: "在规划之前研究阶段目标" },
      { label: "否", description: "跳过研究，直接规划" }
    ]
  },
  {
    question: "生成计划检查器？（在执行之前验证计划）",
    header: "Plan Check",
    multiSelect: false,
    options: [
      { label: "是", description: "验证计划满足阶段目标" },
      { label: "否", description: "跳过计划验证" }
    ]
  },
  {
    question: "生成执行验证器？（验证阶段完成）",
    header: "Verifier",
    multiSelect: false,
    options: [
      { label: "是", description: "在执行后验证 must-haves" },
      { label: "否", description: "跳过执行后验证" }
    ]
  },
  {
    question: "Git 分支策略？",
    header: "Branching",
    multiSelect: false,
    options: [
      { label: "无（推荐）", description: "直接提交到当前分支" },
      { label: "每个阶段", description: "为每个阶段创建分支 (gsd/phase-{N}-{name})" },
      { label: "每个里程碑", description: "为整个里程碑创建分支 (gsd/{version}-{name})" }
    ]
  }
])
```
</step>

<step name="update_config">
将新设置合并到现有 config.json：

```json
{
  ...existing_config,
  "model_profile": "quality" | "balanced" | "budget",
  "workflow": {
    "research": true/false,
    "plan_check": true/false,
    "verifier": true/false
  },
  "git": {
    "branching_strategy": "none" | "phase" | "milestone"
  }
}
```

将更新的配置写入 `.planning/config.json`。
</step>

<step name="confirm">
显示：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 设置已更新
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| 设置              | 值 |
|----------------------|-------|
| 模型配置        | {quality/balanced/budget} |
| 计划研究者      | {On/Off} |
| 计划检查器         | {On/Off} |
| 执行验证器   | {On/Off} |
| Git 分支        | {None/Per Phase/Per Milestone} |

这些设置应用于未来的 /gsd:plan-phase 和 /gsd:execute-phase 运行。

快速命令：
- /gsd:set-profile <profile> — 切换模型配置
- /gsd:plan-phase --research — 强制研究
- /gsd:plan-phase --skip-research — 跳过研究
- /gsd:plan-phase --skip-verify — 跳过计划检查
```
</step>

</process>

<success_criteria>
- [ ] 已读取当前配置
- [ ] 向用户展示 5 个设置（配置 + 3 个工作流程切换 + git 分支）
- [ ] 已更新配置并带有 model_profile、workflow 和 git 部分
- [ ] 已向用户确认更改
      </success_criteria>
