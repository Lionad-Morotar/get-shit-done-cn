<purpose>

标记已发布的版本（v1.0、v1.1、v2.0）为完成。在 MILESTONES.md 中创建历史记录，执行完整的 PROJECT.md 演变审查，使用里程碑分组重新组织 ROADMAP.md，并在 git 中标记发布。

</purpose>

<required_reading>

1. templates/milestone.md
2. templates/milestone-archive.md
3. `.planning/ROADMAP.md`
4. `.planning/REQUIREMENTS.md`
5. `.planning/PROJECT.md`

</required_reading>

<archival_behavior>

里程碑完成时：

1. 将完整的里程碑详情提取到 `.planning/milestones/v[X.Y]-ROADMAP.md`
2. 将需求归档到 `.planning/milestones/v[X.Y]-REQUIREMENTS.md`
3. 更新 ROADMAP.md — 用一行摘要替换里程碑详情
4. 删除 REQUIREMENTS.md（为下一个里程碑创建新的）
5. 执行完整的 PROJECT.md 演变审查
6. 提供内联创建下一个里程碑

**上下文效率：** 归档保持 ROADMAP.md 恒定大小和 REQUIREMENTS.md 里程碑范围。

**ROADMAP 归档**使用 `templates/milestone-archive.md` — 包括里程碑头部（状态、阶段、日期）、完整阶段详情、里程碑摘要（决策、问题、技术债务）。

**REQUIREMENTS 归档**包含所有标记为完成的需求及其结果、具有最终状态的追溯性表、有关需求更改的注释。

</archival_behavior>

<process>

<step name="verify_readiness">

**使用 `roadmap analyze` 进行全面的准备情况检查：**

```bash
ROADMAP=$(node ~/.claude/get-shit-done/bin/gsd-tools.js roadmap analyze)
```

这将返回所有阶段及其计划/摘要计数和磁盘状态。使用此来验证：
- 哪些阶段属于此里程碑？
- 所有阶段完成（所有计划都有摘要）？检查每个的 `disk_status === 'complete'`
- `progress_percent` 应该为 100%

展示：

```
里程碑：[Name, 例如 "v1.0 MVP"]

包括：
- 阶段 1：基础（2/2 计划完成）
- 阶段 2：身份验证（2/2 计划完成）
- 阶段 3：核心功能（3/3 计划完成）
- 阶段 4：打磨（1/1 计划完成）

总计：{phase_count} 个阶段，{total_plans} 个计划，全部完成
```

<config-check>

```bash
cat .planning/config.json 2>/dev/null
```

</config-check>

<if mode="yolo">

```
⚡ 自动批准：里程碑范围验证
[显示分解摘要而不提示]
继续进行统计收集...
```

继续到 gather_stats。

</if>

<if mode="interactive" OR="custom with gates.confirm_milestone_scope true">

```
准备好将此里程碑标记为已发布？
(yes / wait / adjust scope)
```

等待确认。
- "adjust scope"：询问包括哪些阶段。
- "wait"：停止，用户准备好时返回。

</if>

</step>

<step name="gather_stats">

计算里程碑统计：

```bash
git log --oneline --grep="feat(" | head -20
git diff --stat FIRST_COMMIT..LAST_COMMIT | tail -1
find . -name "*.swift" -o -name "*.ts" -o -name "*.py" | xargs wc -l 2>/dev/null
git log --format="%ai" FIRST_COMMIT | tail -1
git log --format="%ai" LAST_COMMIT | head -1
```

展示：

```
里程碑统计：
- 阶段：[X-Y]
- 计划：[Z] 总计
- 任务：[N] 总计（来自阶段摘要）
- 修改的文件：[M]
- 代码行数：[LOC] [language]
- 时间线：[Days] 天（[Start] → [End]）
- Git 范围：feat(XX-XX) → feat(YY-YY)
```

</step>

<step name="extract_accomplishments">

使用 summary-extract 从 SUMMARY.md 文件中提取一句话：

```bash
# 对于里程碑中的每个阶段，提取一句话
for summary in .planning/phases/*-*/*-SUMMARY.md; do
  node ~/.claude/get-shit-done/bin/gsd-tools.js summary-extract "$summary" --fields one_liner | jq -r '.one_liner'
done
```

提取 4-6 个关键成就。展示：

```
此里程碑的关键成就：
1. [来自阶段 1 的成就]
2. [来自阶段 2 的成就]
3. [来自阶段 3 的成就]
4. [来自阶段 4 的成就]
5. [来自阶段 5 的成就]
```

</step>

<step name="create_milestone_entry">

**注意：** MILESTONES.md 条目现在由 `gsd-tools milestone complete` 在 archive_milestone 步骤中自动创建。条目包括版本、日期、阶段/计划/任务计数以及从 SUMMARY.md 文件提取的成就。

如果需要其他详细信息（例如，用户提供的"已交付"摘要、git 范围、LOC 统计），请在 CLI 创建基本条目后手动添加。

</step>

<step name="evolve_project_full_review">

里程碑完成时的完整 PROJECT.md 演变审查。

读取所有阶段摘要：

```bash
cat .planning/phases/*-*/*-SUMMARY.md
```

**完整审查检查清单：**

1. **"这是什么"准确性：**
   - 将当前描述与构建的内容进行比较
   - 如果产品有重大更改则更新

2. **核心价值检查：**
   - 仍然是正确的优先级吗？发布是否揭示了不同的核心价值？
   - 如果一件事发生了变化则更新

3. **需求审查：**

   **已验证部分：**
   - 所有活跃需求在此里程碑中发布 → 移动到已验证
   - 格式：`- ✓ [需求] — v[X.Y]`

   **活跃部分：**
   - 删除移动到已验证的需求
   - 为下一个里程碑添加新需求
   - 保留未解决的需求

   **超出范围审查：**
   - 审查每个项目 — 推理仍然有效？
   - 删除不相关的项目
   - 添加在里程碑期间失效的需求

4. **上下文更新：**
   - 当前代码库状态（LOC、技术栈）
   - 用户反馈主题（如果有）
   - 已知问题或技术债务

5. **关键决策审查：**
   - 从里程碑阶段摘要中提取所有决策
   - 添加到关键决策表并附带结果
   - 标记 ✓ 良好、⚠️ 重访或 — 待定

6. **约束检查：**
   - 开发期间任何约束发生了变化？根据需要更新

内联更新 PROJECT.md。更新"最后更新"页脚：

```markdown
---
*最后更新：[date]，v[X.Y] 里程碑后*
```

**示例完整演变（v1.0 → v1.1 准备）：**

之前：

```markdown
## 这是什么

为远程团队设计的实时协作白板。

## 核心价值

感觉即时的实时同步。

## 需求

### 已验证

（尚未 — 发布以验证）

### 活跃

- [ ] 画布绘图工具
- [ ] 实时同步 < 500ms
- [ ] 用户身份验证
- [ ] 导出为 PNG

### 超出范围

- 移动应用 — Web 优先方法
- 视频聊天 — 使用外部工具
```

v1.0 后：

```markdown
## 这是什么

为远程团队设计的实时协作白板，具有即时同步和绘图工具。

## 核心价值

感觉即时的实时同步。

## 需求

### 已验证

- ✓ 画布绘图工具 — v1.0
- ✓ 实时同步 < 500ms — v1.0（达到 200ms 平均）
- ✓ 用户身份验证 — v1.0

### 活跃

- [ ] 导出为 PNG
- [ ] 撤销/重做历史
- [ ] 形状工具（矩形、圆形）

### 超出范围

- 移动应用 — Web 优先方法，PWA 运行良好
- 视频聊天 — 使用外部工具
- 离线模式 — 实时是核心价值

## 上下文

v1.0 发布，2400 行 TypeScript 代码。
技术栈：Next.js、Supabase、Canvas API。
初始用户测试显示对形状工具的需求。
```

**步骤完成时：**

- [ ] "这是什么"已审查并根据需要更新
- [ ] 核心价值验证为仍然正确
- [ ] 所有已发布需求已移动到已验证
- [ ] 新需求已添加到下一个里程碑的活跃
- [ ] 超出范围推理已审查
- [ ] 上下文已更新当前状态
- [ ] 所有里程碑决策已添加到关键决策
- [ ] "最后更新"页脚反映里程碑完成

</step>

<step name="reorganize_roadmap">

更新 `.planning/ROADMAP.md` — 分组已完成的里程碑阶段：

```markdown
# 路线图：[项目名称]

## 里程碑

- ✅ **v1.0 MVP** — 阶段 1-4（已于 YYYY-MM-DD 发布）
- 🚧 **v1.1 安全** — 阶段 5-6（进行中）
- 📋 **v2.0 重新设计** — 阶段 7-10（已规划）

## 阶段

<details>
<summary>✅ v1.0 MVP（阶段 1-4）— 已于 YYYY-MM-DD 发布</summary>

- [x] 阶段 1：基础（2/2 计划）— 已完成 YYYY-MM-DD
- [x] 阶段 2：身份验证（2/2 计划）— 已完成 YYYY-MM-DD
- [x] 阶段 3：核心功能（3/3 计划）— 已完成 YYYY-MM-DD
- [x] 阶段 4：打磨（1/1 计划）— 已完成 YYYY-MM-DD

</details>

### 🚧 v[Next] [名称]（进行中 / 已规划）

- [ ] 阶段 5：[名称]（[N] 个计划）
- [ ] 阶段 6：[名称]（[N] 个计划）

## 进度

| 阶段             | 里程碑   | 已完成计划 | 状态       | 完成       |
| ---------------- | --------- | ---------- | ---------- | ---------- |
| 1. 基础         | v1.0      | 2/2        | 完成       | YYYY-MM-DD |
| 2. 身份验证     | v1.0      | 2/2        | 完成       | YYYY-MM-DD |
| 3. 核心功能     | v1.0      | 3/3        | 完成       | YYYY-MM-DD |
| 4. 打磨         | v1.0      | 1/1        | 完成       | YYYY-MM-DD |
| 5. 安全审查     | v1.1      | 0/1        | 未开始     | -          |
| 6. 加固         | v1.1      | 0/2        | 未开始     | -          |
```

</step>

<step name="archive_milestone">

**将归档委托给 gsd-tools：**

```bash
ARCHIVE=$(node ~/.claude/get-shit-done/bin/gsd-tools.js milestone complete "v[X.Y]" --name "[里程碑名称]")
```

CLI 处理：
- 创建 `.planning/milestones/` 目录
- 将 ROADMAP.md 归档到 `milestones/v[X.Y]-ROADMAP.md`
- 使用归档头部将 REQUIREMENTS.md 归档到 `milestones/v[X.Y]-REQUIREMENTS.md`
- 如果存在审计文件，则移动到里程碑
- 使用来自 SUMMARY.md 文件的成就创建/附加 MILESTONES.md 条目
- 更新 STATE.md（状态、最后活动）

从结果中提取：`version`、`date`、`phases`、`plans`、`tasks`、`accomplishments`、`archived`。

验证：`✅ 里程碑已归档到 .planning/milestones/`

**注意：** 阶段目录（`.planning/phases/`）不会被删除 — 它们在里程碑之间累积作为原始执行历史。阶段编号继续（v1.0 阶段 1-4，v1.1 阶段 5-8，等）。

归档后，AI 仍然处理：
- 使用里程碑分组重新组织 ROADMAP.md（需要判断）
- 完整的 PROJECT.md 演变审查（需要理解）
- 删除原始 ROADMAP.md 和 REQUIREMENTS.md
- 这些没有完全委托，因为它们需要 AI 对内容的解释

</step>

<step name="reorganize_roadmap_and_delete_originals">

在 `milestone complete` 归档后，使用里程碑分组重新组织 ROADMAP.md，然后删除原始文件：

**重新组织 ROADMAP.md** — 分组已完成的里程碑阶段：

```markdown
# 路线图：[项目名称]

## 里程碑

- ✅ **v1.0 MVP** — 阶段 1-4（已于 YYYY-MM-DD 发布）
- 🚧 **v1.1 安全** — 阶段 5-6（进行中）

## 阶段

<details>
<summary>✅ v1.0 MVP（阶段 1-4）— 已于 YYYY-MM-DD 发布</summary>

- [x] 阶段 1：基础（2/2 计划）— 已完成 YYYY-MM-DD
- [x] 阶段 2：身份验证（2/2 计划）— 已完成 YYYY-MM-DD

</details>
```

**然后删除原始文件：**

```bash
rm .planning/ROADMAP.md
rm .planning/REQUIREMENTS.md
```

</step>

<step name="update_state">

大多数 STATE.md 更新由 `milestone complete` 处理，但验证并更新剩余字段：

**项目参考：**

```markdown
## 项目参考

请参阅：.planning/PROJECT.md（更新于 [today]）

**核心价值：** [来自 PROJECT.md 的当前核心价值]
**当前重点：** [下一个里程碑或"规划下一个里程碑"]
```

**累积上下文：**
- 清除决策摘要（完整日志在 PROJECT.md 中）
- 清除已解决的阻塞因素
- 保留下一个里程碑的开放阻塞因素

</step>

<step name="handle_branches">

检查分支策略并提供合并选项。

使用 `init milestone-op` 获取上下文，或直接加载配置：

```bash
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js init execute-phase "1")
```

从 init JSON 中提取 `branching_strategy`、`phase_branch_template`、`milestone_branch_template`。

**如果是 "none"：** 跳转到 git_tag。

**对于 "phase" 策略：**

```bash
BRANCH_PREFIX=$(echo "$PHASE_BRANCH_TEMPLATE" | sed 's/{.*//')
PHASE_BRANCHES=$(git branch --list "${BRANCH_PREFIX}*" 2>/dev/null | sed 's/^\*//' | tr -d ' ')
```

**对于 "milestone" 策略：**

```bash
BRANCH_PREFIX=$(echo "$MILESTONE_BRANCH_TEMPLATE" | sed 's/{.*//')
MILESTONE_BRANCH=$(git branch --list "${BRANCH_PREFIX}*" 2>/dev/null | sed 's/^\*//' | tr -d ' ' | head -1)
```

**如果未找到分支：** 跳转到 git_tag。

**如果分支存在：**

```
## 检测到 Git 分支

分支策略：{phase/milestone}
分支：{list}

选项：
1. **合并到 main** — 将分支合并到 main
2. **不合并删除** — 已合并或不需要
3. **保留分支** — 留给手动处理
```

AskUserQuestion 提供选项：压缩合并（推荐）、历史合并、不合并删除、保留分支。

**压缩合并：**

```bash
CURRENT_BRANCH=$(git branch --show-current)
git checkout main

if [ "$BRANCHING_STRATEGY" = "phase" ]; then
  for branch in $PHASE_BRANCHES; do
    git merge --squash "$branch"
    git commit -m "feat: v[X.Y] 的 $branch"
  done
fi

if [ "$BRANCHING_STRATEGY" = "milestone" ]; then
  git merge --squash "$MILESTONE_BRANCH"
  git commit -m "feat: v[X.Y] 的 $MILESTONE_BRANCH"
fi

git checkout "$CURRENT_BRANCH"
```

**历史合并：**

```bash
CURRENT_BRANCH=$(git branch --show-current)
git checkout main

if [ "$BRANCHING_STRATEGY" = "phase" ]; then
  for branch in $PHASE_BRANCHES; do
    git merge --no-ff "$branch" -m "为 v[X.Y] 合并分支 '$branch'"
  done
fi

if [ "$BRANCHING_STRATEGY" = "milestone" ]; then
  git merge --no-ff "$MILESTONE_BRANCH" -m "为 v[X.Y] 合并分支 '$MILESTONE_BRANCH'"
fi

git checkout "$CURRENT_BRANCH"
```

**不合并删除：**

```bash
if [ "$BRANCHING_STRATEGY" = "phase" ]; then
  for branch in $PHASE_BRANCHES; do
    git branch -d "$branch" 2>/dev/null || git branch -D "$branch"
  done
fi

if [ "$BRANCHING_STRATEGY" = "milestone" ]; then
  git branch -d "$MILESTONE_BRANCH" 2>/dev/null || git branch -D "$MILESTONE_BRANCH"
fi
```

**保留分支：** 报告"分支已保留供手动处理"

</step>

<step name="git_tag">

创建 git 标签：

```bash
git tag -a v[X.Y] -m "v[X.Y] [名称]

已交付：[一句话]

关键成就：
- [项目 1]
- [项目 2]
- [项目 3]

详细信息请参阅 .planning/MILESTONES.md。"
```

确认："已标记：v[X.Y]"

询问："将标签推送到远程吗？(y/n)"

如果是：
```bash
git push origin v[X.Y]
```

</step>

<step name="git_commit_milestone">

提交里程碑完成。

```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "chore: 完成 v[X.Y] 里程碑" --files .planning/milestones/v[X.Y]-ROADMAP.md .planning/milestones/v[X.Y]-REQUIREMENTS.md .planning/milestones/v[X.Y]-MILESTONE-AUDIT.md .planning/MILESTONES.md .planning/PROJECT.md .planning/STATE.md
```
```

确认："已提交：chore: 完成 v[X.Y] 里程碑"

</step>

<step name="offer_next">

```
✅ 里程碑 v[X.Y] [名称] 完成

已发布：
- [N] 个阶段（[M] 个计划，[P] 个任务）
- [已发布内容的一句话]

已归档：
- milestones/v[X.Y]-ROADMAP.md
- milestones/v[X.Y]-REQUIREMENTS.md

摘要：.planning/MILESTONES.md
标签：v[X.Y]

---

## ▶ 接下来

**开始下一个里程碑** — 质疑 → 研究 → 需求 → 路线图

`/gsd:new-milestone`

<sub>`/clear` 首先 → 清空上下文窗口</sub>

---
```

</step>

</process>

<milestone_naming>

**版本约定：**
- **v1.0** — 初始 MVP
- **v1.1、v1.2** — 次要更新、新功能、修复
- **v2.0、v3.0** — 重大重写、破坏性更改、新方向

**名称：** 短 1-2 个词（v1.0 MVP、v1.1 安全、v1.2 性能、v2.0 重新设计）。

</milestone_naming>

<what_qualifies>

**为以下情况创建里程碑：** 初始发布、公共发布、已发布的主要功能集、归档规划前。

**不要为以下情况创建里程碑：** 每个阶段完成（太细粒度）、进行中的工作、内部开发迭代（除非真正发布）。

启发式："这是已部署/可用/已发布吗？"如果是 → 里程碑。如果否 → 继续工作。

</what_qualifies>

<success_criteria>

里程碑完成成功时：

- [ ] MILESTONES.md 条目已创建，包含统计和成就
- [ ] PROJECT.md 完整演变审查已完成
- [ ] 所有已发布需求已在 PROJECT.md 中移动到已验证
- [ ] 关键决策已更新结果
- [ ] ROADMAP.md 已使用里程碑分组重新组织
- [ ] 路线图归档已创建（milestones/v[X.Y]-ROADMAP.md）
- [ ] 需求归档已创建（milestones/v[X.Y]-REQUIREMENTS.md）
- [ ] REQUIREMENTS.md 已删除（为下一个里程碑新建）
- [ ] STATE.md 已更新新的项目参考
- [ ] Git 标签已创建（v[X.Y]）
- [ ] 里程碑提交已创建（包括归档文件和删除）
- [ ] 用户知道下一步（/gsd:new-milestone）

</success_criteria>
