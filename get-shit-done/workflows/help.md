<purpose>
显示完整的 GSD 命令参考。仅输出参考内容。不要添加特定于项目的分析、git 状态、下一步建议或参考之外的任何评论。
</purpose>

<reference>
# GSD 命令参考

**GSD** (Get Shit Done) 创建针对 Claude Code 独立代理开发优化的分层项目计划。

## 快速开始

1. `/gsd:new-project` - 初始化项目（包括研究、需求、路线图）
2. `/gsd:plan-phase 1` - 为第一阶段创建详细计划
3. `/gsd:execute-phase 1` - 执行阶段

## 保持更新

GSD 发展很快。定期更新：

```bash
npx get-shit-done-cc@latest
```

## 核心工作流程

```
/gsd:new-project → /gsd:plan-phase → /gsd:execute-phase → 重复
```

### 项目初始化

**`/gsd:new-project`**
通过统一流程初始化新项目。

一个命令带您从想法到准备规划：
- 深入提问以了解您正在构建什么
- 可选的领域研究（生成 4 个并行研究代理）
- 带有 v1/v2/范围外范围定义的需求定义
- 带有阶段分解和成功标准的路线图创建

创建所有 `.planning/` 文件：
- `PROJECT.md` — 愿景和需求
- `config.json` — 工作流程模式（交互式/yolo）
- `research/` — 领域研究（如选择）
- `REQUIREMENTS.md` — 带有 REQ-ID 的范围需求
- `ROADMAP.md` — 映射到需求的阶段
- `STATE.md` — 项目记忆

用法：`/gsd:new-project`

**`/gsd:map-codebase`**
为棕地项目映射现有代码库。

- 使用并行探索代理分析代码库
- 创建 `.planning/codebase/` 并包含 7 个专注文档
- 覆盖堆栈、架构、结构、约定、测试、集成、关注点
- 在现有代码库的 `/gsd:new-project` 之前使用

用法：`/gsd:map-codebase`

### 阶段规划

**`/gsd:discuss-phase <number>`**
在规划之前帮助阐明您对阶段的愿景。

- 捕获您想象此阶段如何工作
- 创建包含您的愿景、必要内容和边界的 CONTEXT.md
- 当您对某些内容的外观/感觉有想法时使用

用法：`/gsd:discuss-phase 2`

**`/gsd:research-phase <number>`**
针对小众/复杂领域的综合生态系统研究。

- 发现标准堆栈、架构模式、陷阱
- 创建带有 "专家如何构建这个" 知识的 RESEARCH.md
- 用于 3D、游戏、音频、着色器、ML 和其他专业领域
- 超越 "哪个库" 到生态系统知识

用法：`/gsd:research-phase 3`

**`/gsd:list-phase-assumptions <number>`**
在 Claude 开始之前查看它计划做什么。

- 显示 Claude 对阶段的预期方法
- 如果 Claude 误解了您的愿景，让您纠正方向
- 不创建文件 - 仅对话输出

用法：`/gsd:list-phase-assumptions 3`

**`/gsd:plan-phase <number>`**
为特定阶段创建详细执行计划。

- 生成 `.planning/phases/XX-phase-name/XX-YY-PLAN.md`
- 将阶段分解为具体、可操作的任务
- 包括验证标准和成功措施
- 每阶段支持多个计划（XX-01、XX-02 等）

用法：`/gsd:plan-phase 1`
结果：创建 `.planning/phases/01-foundation/01-01-PLAN.md`

### 执行

**`/gsd:execute-phase <phase-number>`**
执行阶段中的所有计划。

- 按 wave（来自 frontmatter）分组计划，顺序执行 wave
- 每个 wave 中的计划通过 Task 工具并行运行
- 所有计划完成后验证阶段目标
- 更新 REQUIREMENTS.md、ROADMAP.md、STATE.md

用法：`/gsd:execute-phase 5`

### 快速模式

**`/gsd:quick`**
使用 GSD 保证执行小型、临时任务，但跳过可选代理。

快速模式使用相同的系统但路径更短：
- 生成规划器 + 执行器（跳过研究者、检查器、验证器）
- 快速任务位于 `.planning/quick/` 中，与规划阶段分开
- 更新 STATE.md 跟踪（不是 ROADMAP.md）

当您确切知道要做什么并且任务足够小而不需要研究或验证时使用。

用法：`/gsd:quick`
结果：创建 `.planning/quick/NNN-slug/PLAN.md`、`.planning/quick/NNN-slug/SUMMARY.md`

### 路线图管理

**`/gsd:add-phase <description>`**
在当前里程碑末尾添加新阶段。

- 附加到 ROADMAP.md
- 使用下一个顺序编号
- 更新阶段目录结构

用法：`/gsd:add-phase "添加管理仪表板"`

**`/gsd:insert-phase <after> <description>`**
在现有阶段之间插入紧急工作作为十进制阶段。

- 创建中间阶段（例如，7 和 8 之间的 7.1）
- 对于必须在里程碑中期发现的任务有用
- 维护阶段排序

用法：`/gsd:insert-phase 7 "修复关键授权错误"`
结果：创建阶段 7.1

**`/gsd:remove-phase <number>`**
删除未来阶段并重新编号后续阶段。

- 删除阶段目录和所有引用
- 重新编号所有后续阶段以关闭差距
- 仅适用于未来（未开始）的阶段
- Git 提交保留历史记录

用法：`/gsd:remove-phase 17`
结果：阶段 17 已删除，阶段 18-20 变为 17-19

### 里程碑管理

**`/gsd:new-milestone <name>`**
通过统一流程开始新里程碑。

- 深入提问以了解您接下来要构建什么
- 可选的领域研究（生成 4 个并行研究代理）
- 带有范围定义的需求定义
- 带有阶段分解的路线图创建

镜像棕地项目的 `/gsd:new-project` 流程（现有 PROJECT.md）。

用法：`/gsd:new-milestone "v2.0 功能"`

**`/gsd:complete-milestone <version>`**
归档完成的里程碑并为下一个版本做准备。

- 创建带有统计信息的 MILESTONES.md 条目
- 将完整详细信息归档到 milestones/ 目录
- 为发布创建 git 标签
- 为下一个版本准备工作区

用法：`/gsd:complete-milestone 1.0.0`

### 进度跟踪

**`/gsd:progress`**
检查项目状态并智能路由到下一个操作。

- 显示可视进度条和完成百分比
- 从 SUMMARY 文件总结最近的工作
- 显示当前位置和下一步
- 列出关键决策和未决问题
- 提供执行下一个计划或在缺失时创建计划
- 检测 100% 里程碑完成

用法：`/gsd:progress`

### 会话管理

**`/gsd:resume-work`**
从上一个会话恢复工作并完全恢复上下文。

- 读取 STATE.md 以获取项目上下文
- 显示当前位置和最近进度
- 基于项目状态提供下一步操作

用法：`/gsd:resume-work`

**`/gsd:pause-work`**
在阶段中途暂停工作时创建上下文交接。

- 创建带有当前状态的 .continue-here 文件
- 更新 STATE.md 会话连续性部分
- 捕获进行中工作上下文

用法：`/gsd:pause-work`

### 调试

**`/gsd:debug [问题描述]`**
通过上下文重置之间的持久状态进行系统调试。

- 通过自适应提问收集症状
- 创建 `.planning/debug/[slug].md` 以跟踪调查
- 使用科学方法调查（证据 → 假设 → 测试）
- 在 `/clear` 中存活 — 无参数运行 `/gsd:debug` 以恢复
- 将已解决问题归档到 `.planning/debug/resolved/`

用法：`/gsd:debug "登录按钮不工作"`
用法：`/gsd:debug`（恢复活动会话）

### 待办事项管理

**`/gsd:add-todo [description]`**
从当前对话捕获想法或任务作为待办事项。

- 从对话中提取上下文（或使用提供的描述）
- 在 `.planning/todos/pending/` 中创建结构化待办事项文件
- 从文件路径推断区域以进行分组
- 在创建之前检查重复
- 更新 STATE.md 待办事项计数

用法：`/gsd:add-todo`（从对话推断）
用法：`/gsd:add-todo 添加授权令牌刷新`

**`/gsd:check-todos [area]`**
列出待处理的待办事项并选择一个进行处理。

- 列出所有待处理的待办事项，带有标题、区域、年龄
- 可选区域过滤器（例如，`/gsd:check-todos api`）
- 加载所选待办事项的完整上下文
- 路由到适当的操作（现在工作、添加到阶段、头脑风暴）
- 当工作开始时将待办事项移动到 done/

用法：`/gsd:check-todos`
用法：`/gsd:check-todos api`

### 用户验收测试

**`/gsd:verify-work [phase]`**
通过对话式 UAT 验证构建的功能。

- 从 SUMMARY.md 文件中提取可测试的交付物
- 一次展示一个测试（是/否响应）
- 自动诊断失败并创建修复计划
- 如果发现问题，准备好重新执行

用法：`/gsd:verify-work 3`

### 里程碑审计

**`/gsd:audit-milestone [version]`**
根据原始意图审计里程碑完成情况。

- 读取所有阶段 VERIFICATION.md 文件
- 检查需求覆盖
- 生成集成检查器以进行跨阶段连线
- 创建带有缺陷和技术债务的 MILESTONE-AUDIT.md

用法：`/gsd:audit-milestone`

**`/gsd:plan-milestone-gaps`**
创建阶段以关闭审计发现的缺陷。

- 读取 MILESTONE-AUDIT.md 并将缺陷分组到阶段
- 按需求优先级排序（必须/应该/最好）
- 将缺陷关闭阶段添加到 ROADMAP.md
- 准备在新阶段上执行 `/gsd:plan-phase`

用法：`/gsd:plan-milestone-gaps`

### 配置

**`/gsd:settings`**
交互式配置工作流程切换和模型配置文件。

- 切换研究者、计划检查器、验证器代理
- 选择模型配置文件（质量/平衡/预算）
- 更新 `.planning/config.json`

用法：`/gsd:settings`

**`/gsd:set-profile <profile>`**
快速切换 GSD 代理的模型配置文件。

- `quality` — 除了验证之外到处使用 Opus
- `balanced` — 规划使用 Opus，执行使用 Sonnet（默认）
- `budget` — 写作使用 Sonnet，研究/验证使用 Haiku

用法：`/gsd:set-profile budget`

### 实用命令

**`/gsd:help`**
显示此命令参考。

**`/gsd:update`**
使用变更日志预览将 GSD 更新到最新版本。

- 显示已安装与最新版本的比较
- 显示您错过的版本的变更日志条目
- 突出显示破坏性更改
- 在运行安装之前确认
- 比原始 `npx get-shit-done-cc` 更好

用法：`/gsd:update`

**`/gsd:join-discord`**
加入 GSD Discord 社区。

- 获取帮助、分享您正在构建的内容、保持更新
- 与其他 GSD 用户连接

用法：`/gsd:join-discord`

## 文件和结构

```
.planning/
├── PROJECT.md            # 项目愿景
├── ROADMAP.md            # 当前阶段分解
├── STATE.md              # 项目记忆和上下文
├── config.json           # 工作流程模式和门
├── todos/                # 捕获的想法和任务
│   ├── pending/          # 等待处理的待办事项
│   └── done/             # 已完成的待办事项
├── debug/                # 活动调试会话
│   └── resolved/         # 已归档的已解决问题
├── codebase/             # 代码库映射（棕地项目）
│   ├── STACK.md          # 语言、框架、依赖
│   ├── ARCHITECTURE.md   # 模式、层、数据流
│   ├── STRUCTURE.md      # 目录布局、关键文件
│   ├── CONVENTIONS.md    # 编码标准、命名
│   ├── TESTING.md        # 测试设置、模式
│   ├── INTEGRATIONS.md   # 外部服务、API
│   └── CONCERNS.md       # 技术债务、已知问题
└── phases/
    ├── 01-foundation/
    │   ├── 01-01-PLAN.md
    │   └── 01-01-SUMMARY.md
    └── 02-core-features/
        ├── 02-01-PLAN.md
        └── 02-01-SUMMARY.md
```

## 工作流程模式

在 `/gsd:new-project` 期间设置：

**交互模式**

- 确认每个主要决策
- 在检查点暂停以获得批准
- 全程更多指导

**YOLO 模式**

- 自动批准大多数决策
- 无确认执行计划
- 仅在关键检查点停止

随时编辑 `.planning/config.json` 进行更改。

## 规划配置

在 `.planning/config.json` 中配置如何管理规划文件：

**`planning.commit_docs`**（默认：`true`）
- `true`：规划文件提交到 git（标准工作流程）
- `false`：规划文件仅保持本地，不提交

当 `commit_docs: false` 时：
- 将 `.planning/` 添加到您的 `.gitignore`
- 适用于 OSS 贡献、客户项目或保持规划私密
- 所有规划文件仍然正常工作，只是不在 git 中跟踪

**`planning.search_gitignored`**（默认：`false`）
- `true`：将 `--no-ignore` 添加到广泛的 ripgrep 搜索
- 仅当 `.planning/` 被 gitignored 并且您希望项目范围搜索包含它时才需要

配置示例：
```json
{
  "planning": {
    "commit_docs": false,
    "search_gitignored": true
  }
}
```

## 常见工作流程

**开始新项目：**

```
/gsd:new-project        # 统一流程：提问 → 研究 → 需求 → 路线图
/clear
/gsd:plan-phase 1       # 为第一阶段创建计划
/clear
/gsd:execute-phase 1    # 执行阶段中的所有计划
```

**休息后恢复工作：**

```
/gsd:progress  # 查看您停止的地方并继续
```

**添加紧急里程碑中期工作：**

```
/gsd:insert-phase 5 "关键安全修复"
/gsd:plan-phase 5.1
/gsd:execute-phase 5.1
```

**完成里程碑：**

```
/gsd:complete-milestone 1.0.0
/clear
/gsd:new-milestone  # 开始下一个里程碑（提问 → 研究 → 需求 → 路线图）
```

**在工作期间捕获想法：**

```
/gsd:add-todo                    # 从对话上下文捕获
/gsd:add-todo 修复模态框 z-index  # 使用显式描述捕获
/gsd:check-todos                 # 审查和处理待办事项
/gsd:check-todos api             # 按区域过滤
```

**调试问题：**

```
/gsd:debug "表单提交静默失败"  # 开始调试会话
# ... 发生调查，上下文填满 ...
/clear
/gsd:debug                       # 从您停止的地方恢复
```

## 获取帮助

- 阅读 `.planning/PROJECT.md` 以获取项目愿景
- 阅读 `.planning/STATE.md` 以获取当前上下文
- 检查 `.planning/ROADMAP.md` 以获取阶段状态
- 运行 `/gsd:progress` 以检查您的进度
</reference>
