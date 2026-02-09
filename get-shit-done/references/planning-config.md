<planning_config>

`.planning/` 目录行为的配置选项。

<config_schema>
```json
"planning": {
  "commit_docs": true,
  "search_gitignored": false
},
"git": {
  "branching_strategy": "none",
  "phase_branch_template": "gsd/phase-{phase}-{slug}",
  "milestone_branch_template": "gsd/{milestone}-{slug}"
}
```

| 选项 | 默认值 | 说明 |
|--------|---------|-------------|
| `commit_docs` | `true` | 是否将计划文件提交到 git |
| `search_gitignored` | `false` | 为广泛的 rg 搜索添加 `--no-ignore` |
| `git.branching_strategy` | `"none"` | Git 分支方法：`"none"`、`"phase"` 或 `"milestone"` |
| `git.phase_branch_template` | `"gsd/phase-{phase}-{slug}"` | phase 策略的分支模板 |
| `git.milestone_branch_template` | `"gsd/{milestone}-{slug}"` | milestone 策略的分支模板 |
</config_schema>

<commit_docs_behavior>

**当 `commit_docs: true` 时（默认）：**
- 计划文件正常提交
- SUMMARY.md、STATE.md、ROADMAP.md 在 git 中跟踪
- 保留计划决策的完整历史

**当 `commit_docs: false` 时：**
- 跳过 `.planning/` 文件的所有 `git add`/`git commit`
- 用户必须将 `.planning/` 添加到 `.gitignore`
- 适用于：开源贡献、客户项目、保持计划私密

**使用 gsd-tools.js（推荐）：**

```bash
# 通过自动的 commit_docs + gitignore 检查提交：
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "docs: update state" --files .planning/STATE.md

# 通过 state load 加载配置（返回 JSON）：
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js state load)
# commit_docs 在 JSON 输出中可用

# 或使用包含 commit_docs 的 init 命令：
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js init execute-phase "1")
# commit_docs 包含在所有 init 命令输出中
```

**自动检测：** 如果 `.planning/` 被 gitignore，无论 config.json 如何设置，`commit_docs` 都会自动为 `false`。这可以防止用户在 `.gitignore` 中包含 `.planning/` 时出现 git 错误。

**通过 CLI 提交（自动处理检查）：**

```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "docs: update state" --files .planning/STATE.md
```

CLI 内部会检查 `commit_docs` 配置和 gitignore 状态——无需手动条件判断。

</commit_docs_behavior>

<search_behavior>

**当 `search_gitignored: false` 时（默认）：**
- 标准 rg 行为（遵守 .gitignore）
- 直接路径搜索有效：`rg "pattern" .planning/` 可找到文件
- 广泛搜索跳过 gitignore：`rg "pattern"` 跳过 `.planning/`

**当 `search_gitignored: true` 时：**
- 为应包含 `.planning/` 的广泛 rg 搜索添加 `--no-ignore`
- 仅在搜索整个仓库并期望 `.planning/` 匹配时需要

**注意：** 大多数 GSD 操作使用直接文件读取或显式路径，无论 gitignore 状态如何都能工作。

</search_behavior>

<setup_uncommitted_mode>

使用未提交模式：

1. **设置配置：**
   ```json
   "planning": {
     "commit_docs": false,
     "search_gitignored": true
   }
   ```

2. **添加到 .gitignore：**
   ```
   .planning/
   ```

3. **现有跟踪文件：** 如果 `.planning/` 之前已被跟踪：
   ```bash
   git rm -r --cached .planning/
   git commit -m "chore: stop tracking planning docs"
   ```

</setup_uncommitted_mode>

<branching_strategy_behavior>

**分支策略：**

| 策略 | 创建分支时机 | 分支范围 | 合并点 |
|----------|---------------------|--------------|-------------|
| `none` | 从不 | N/A | N/A |
| `phase` | `execute-phase` 开始时 | 单个阶段 | 阶段完成后用户合并 |
| `milestone` | milestone 的首个 `execute-phase` | 整个 milestone | `complete-milestone` 时 |

**当 `git.branching_strategy: "none"` 时（默认）：**
- 所有工作提交到当前分支
- 标准 GSD 行为

**当 `git.branching_strategy: "phase"` 时：**
- `execute-phase` 在执行前创建/切换到分支
- 分支名称来自 `phase_branch_template`（如 `gsd/phase-03-authentication`）
- 所有计划提交都到该分支
- 用户在阶段完成后手动合并分支
- `complete-milestone` 提供合并所有阶段分支

**当 `git.branching_strategy: "milestone"` 时：**
- milestone 的首个 `execute-phase` 创建 milestone 分支
- 分支名称来自 `milestone_branch_template`（如 `gsd/v1.0-mvp`）
- milestone 中的所有阶段提交到同一分支
- `complete-milestone` 提供将 milestone 分支合并到 main

**模板变量：**

| 变量 | 可用于 | 说明 |
|----------|--------------|-------------|
| `{phase}` | phase_branch_template | 零填充的阶段编号（如 "03"） |
| `{slug}` | 两者 | 小写、连字符分隔的名称 |
| `{milestone}` | milestone_branch_template | Milestone 版本（如 "v1.0"） |

**检查配置：**

使用返回所有配置为 JSON 的 `init execute-phase`：
```bash
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js init execute-phase "1")
# JSON 输出包括：branching_strategy、phase_branch_template、milestone_branch_template
```

或使用 `state load` 获取配置值：
```bash
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js state load)
# 从 JSON 解析 branching_strategy、phase_branch_template、milestone_branch_template
```

**创建分支：**

```bash
# 对于 phase 策略
if [ "$BRANCHING_STRATEGY" = "phase" ]; then
  PHASE_SLUG=$(echo "$PHASE_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
  BRANCH_NAME=$(echo "$PHASE_BRANCH_TEMPLATE" | sed "s/{phase}/$PADDED_PHASE/g" | sed "s/{slug}/$PHASE_SLUG/g")
  git checkout -b "$BRANCH_NAME" 2>/dev/null || git checkout "$BRANCH_NAME"
fi

# 对于 milestone 策略
if [ "$BRANCHING_STRATEGY" = "milestone" ]; then
  MILESTONE_SLUG=$(echo "$MILESTONE_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
  BRANCH_NAME=$(echo "$MILESTONE_BRANCH_TEMPLATE" | sed "s/{milestone}/$MILESTONE_VERSION/g" | sed "s/{slug}/$MILESTONE_SLUG/g")
  git checkout -b "$BRANCH_NAME" 2>/dev/null || git checkout "$BRANCH_NAME"
fi
```

**complete-milestone 时的合并选项：**

| 选项 | Git 命令 | 结果 |
|--------|-------------|--------|
| Squash 合并（推荐） | `git merge --squash` | 每个分支单个干净提交 |
| 带历史合并 | `git merge --no-ff` | 保留所有单独提交 |
| 不合并删除 | `git branch -D` | 丢弃分支工作 |
| 保留分支 | (无) | 稍后手动处理 |

推荐使用 squash 合并——保持主分支历史干净，同时在分支中保留完整的开发历史（直到删除）。

**用例：**

| 策略 | 最适合 |
|----------|----------|
| `none` | 个人开发、简单项目 |
| `phase` | 每阶段代码审查、细粒度回滚、团队协作 |
| `milestone` | 发布分支、暂存环境、每个版本的 PR |

</branching_strategy_behavior>

</planning_config>
