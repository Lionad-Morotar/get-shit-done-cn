<div align="center">

# 把事情搞定

**一款轻量而强大的元提示、上下文工程和规范驱动开发系统,适用于 Claude Code、OpenCode 和 Gemini CLI。**

**解决上下文腐烂 — 当 Claude 填满其上下文窗口时发生的质量下降问题。**

[![npm version](https://img.shields.io/npm/v/get-shit-done-cc?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/get-shit-done-cc)
[![npm downloads](https://img.shields.io/npm/dm/get-shit-done-cc?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/get-shit-done-cc)
[![Discord](https://img.shields.io/badge/Discord-Join%20Server-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/5JJgD5svVS)
[![GitHub stars](https://img.shields.io/github/stars/glittercowboy/get-shit-done?style=for-the-badge&logo=github&color=181717)](https://github.com/glittercowboy/get-shit-done)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

<br>

```bash
npx get-shit-done-cc@latest
```

**适用于 Mac、Windows 和 Linux。**

<br>

![GSD Install](assets/terminal.svg)

<br>

*"如果你清楚自己想要什么,这系统会为你构建出来。没有废话。"*

*"我用过 SpecKit、OpenSpec 和 Taskmaster — 这个为我产生了最好的结果。"*

*"这是我的 Claude Code 最强大的补充。没有过度设计。真的就是能把事情搞定。"*

<br>

**受到 Amazon、Google、Shopify 和 Webflow 工程师的信赖。**

[为什么构建这个](#为什么构建这个) · [如何工作](#如何工作) · [命令](#命令) · [为什么有效](#为什么有效)

</div>

---

## 为什么构建这个

我是一个独立开发者。我不写代码 — Claude Code 来写。

其他的规范驱动开发工具也存在;BMAD、Speckit... 但它们似乎都把事情搞得比需要的复杂得多(冲刺仪式、故事点、利益相关者同步、回顾会议、Jira 工作流)或者缺乏对你正在构建的东西的真正大局理解。我不是一家 50 人的软件公司。我不想扮演企业剧场的角色。我只是一个有创造力的人,试图构建能够正常运行的优秀作品。

所以我构建了 GSD。复杂性在系统中,而不是在你的工作流中。在幕后:上下文工程、XML 提示格式化、subagent 编排、状态管理。你看到的:几个就能正常工作的命令。

系统为 Claude 提供完成工作*并*验证工作所需的一切。我信任这个工作流。它就是做得很好。

这就是这个项目的本质。没有企业角色扮演的废话。只是一个使用 Claude Code 持续构建酷东西的极其有效的系统。

— **TÂCHES**

---

Vibecoding 名声不佳。你描述你想要的东西,AI 生成代码,你得到不一致的垃圾,在规模化时就崩溃了。

GSD 修复了这个问题。它是使 Claude Code 可靠的上下文工程层。描述你的想法,让系统提取它需要知道的一切,然后让 Claude Code 开始工作。

---

## 适用对象

那些想要描述自己想要的东西并让它被正确构建的人 — 而不需要假装自己在运营一家 50 人的工程组织。

---

## 快速开始

```bash
npx get-shit-done-cc@latest
```

安装程序会提示你选择:
1. **运行时** — Claude Code、OpenCode、Gemini 或全部
2. **位置** — 全局(所有项目)或本地(仅当前项目)

在你选择的运行时中使用 `/gsd:help` 进行验证。

### 保持更新

GSD 发展很快。定期更新:

```bash
npx get-shit-done-cc@latest
```

<details>
<summary><strong>非交互式安装 (Docker、CI、脚本)</strong></summary>

```bash
# Claude Code
npx get-shit-done-cc --claude --global   # 安装到 ~/.claude/
npx get-shit-done-cc --claude --local    # 安装到 ./.claude/

# OpenCode (开源,免费模型)
npx get-shit-done-cc --opencode --global # 安装到 ~/.config/opencode/

# Gemini CLI
npx get-shit-done-cc --gemini --global   # 安装到 ~/.gemini/

# 所有运行时
npx get-shit-done-cc --all --global      # 安装到所有目录
```

使用 `--global` (`-g`) 或 `--local` (`-l`) 跳过位置提示。
使用 `--claude`、`--opencode`、`--gemini` 或 `--all` 跳过运行时提示。

</details>

<details>
<summary><strong>开发安装</strong></summary>

克隆仓库并在本地运行安装程序:

```bash
git clone https://github.com/glittercowboy/get-shit-done.git
cd get-shit-done
node bin/install.js --claude --local
```

安装到 `./.claude/` 以便在贡献前测试修改。

</details>

### 推荐:跳过权限模式

GSD 专为无摩擦自动化而设计。使用以下命令运行 Claude Code:

```bash
claude --dangerously-skip-permissions
```

> [!TIP]
> 这就是 GSD 的预期使用方式 — 停下来批准 `date` 和 `git commit` 50 次会违背初衷。

<details>
<summary><strong>替代方案:细粒度权限</strong></summary>

如果你不想使用该标志,请将其添加到项目的 `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(date:*)",
      "Bash(echo:*)",
      "Bash(cat:*)",
      "Bash(ls:*)",
      "Bash(mkdir:*)",
      "Bash(wc:*)",
      "Bash(head:*)",
      "Bash(tail:*)",
      "Bash(sort:*)",
      "Bash(grep:*)",
      "Bash(tr:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git status:*)",
      "Bash(git log:*)",
      "Bash(git diff:*)",
      "Bash(git tag:*)"
    ]
  }
}
```

</details>

---

## 如何工作

> **已有代码?** 首先运行 `/gsd:map-codebase`。它会生成并行代理来分析你的技术栈、架构、约定和关注点。然后 `/gsd:new-project` 就会知道你的代码库 — 问题专注于你正在添加的内容,规划会自动加载你的模式。

### 1. 初始化项目

```
/gsd:new-project
```

一个命令,一个流程。系统会:

1. **提问** — 一直提问直到完全理解你的想法(目标、约束、技术偏好、边缘情况)
2. **研究** — 生成并行代理来调查领域(可选但推荐)
3. **需求** — 提取什么是 v1、v2 和超出范围
4. **路线图** — 创建映射到需求的阶段

你批准路线图。现在你准备好构建了。

**创建:** `PROJECT.md`、`REQUIREMENTS.md`、`ROADMAP.md`、`STATE.md`、`.planning/research/`

---

### 2. 讨论阶段

```
/gsd:discuss-phase 1
```

**这是你塑造实现的地方。**

你的路线图每个阶段有一两句话。这不足以按照*你*想象的方式构建东西。这一步在研究或规划之前捕获你的偏好。

系统分析阶段并根据正在构建的内容识别灰色区域:

- **视觉功能** → 布局、密度、交互、空状态
- **APIs/CLIs** → 响应格式、标志、错误处理、详细程度
- **内容系统** → 结构、语气、深度、流程
- **组织任务** → 分组标准、命名、重复项、例外

对于你选择的每个区域,它会一直提问直到你满意。输出 — `CONTEXT.md` — 直接输入到接下来的两个步骤:

1. **研究人员阅读它** — 知道要调查什么模式("用户想要卡片布局" → 调查卡片组件库)
2. **规划人员阅读它** — 知道哪些决定已锁定("已决定无限滚动" → 规划包括滚动处理)

你在这里做得越深入,系统就越能构建你真正想要的东西。跳过它,你会得到合理的默认值。使用它,你会得到*你的*愿景。

**创建:** `{phase}-CONTEXT.md`

---

### 3. 规划阶段

```
/gsd:plan-phase 1
```

系统会:

1. **研究** — 调查如何实现这个阶段,由你的 CONTEXT.md 决策指导
2. **规划** — 创建 2-3 个带有 XML 结构的原子任务计划
3. **验证** — 对照需求检查计划,循环直到通过

每个计划都足够小,可以在全新的上下文窗口中执行。没有退化,没有"我现在会更简洁"。

**创建:** `{phase}-RESEARCH.md`、`{phase}-{N}-PLAN.md`

---

### 4. 执行阶段

```
/gsd:execute-phase 1
```

系统会:

1. **分波运行计划** — 尽可能并行,依赖时顺序
2. **每个计划全新上下文** — 200k token 纯用于实现,零累积垃圾
3. **每个任务提交** — 每个任务都有自己的原子提交
4. **对照目标验证** — 检查代码库是否提供了阶段承诺的内容

走开,回到已完成的工作和干净的 git 历史。

**创建:** `{phase}-{N}-SUMMARY.md`、`{phase}-VERIFICATION.md`

---

### 5. 验证工作

```
/gsd:verify-work 1
```

**这是你确认它真正有效的地方。**

自动验证检查代码存在和测试通过。但功能是否按*你*预期的*方式*工作?这是你使用它的机会。

系统会:

1. **提取可测试的交付物** — 你现在应该能够做什么
2. **逐一引导你** — "你能用电子邮件登录吗?" 是/否,或描述问题
3. **自动诊断失败** — 生成调试代理以找到根本原因
4. **创建经过验证的修复计划** — 准备立即重新执行

如果一切通过,你继续。如果出现问题,你不会手动调试 — 你只需使用它创建的修复计划再次运行 `/gsd:execute-phase`。

**创建:** `{phase}-UAT.md`,如果发现问题则创建修复计划

---

### 6. 重复 → 完成 → 下一个里程碑

```
/gsd:discuss-phase 2
/gsd:plan-phase 2
/gsd:execute-phase 2
/gsd:verify-work 2
...
/gsd:complete-milestone
/gsd:new-milestone
```

循环 **讨论 → 规划 → 执行 → 验证** 直到里程碑完成。

每个阶段都会得到你的输入(discuss)、适当的研究(plan)、干净的执行(execute)和人工验证(verify)。上下文保持新鲜。质量保持高水准。

当所有阶段完成时,`/gsd:complete-milestone` 会归档里程碑并标记版本。

然后 `/gsd:new-milestone` 开始下一个版本 — 与 `new-project` 相同的流程,但针对你现有的代码库。你描述你接下来想要构建的东西,系统研究领域,你界定需求,它创建一个新的路线图。每个里程碑都是一个干净的循环:定义 → 构建 → 发布。

---

### 快速模式

```
/gsd:quick
```

**用于不需要完整规划的临时任务。**

快速模式为你提供 GSD 保证(原子提交、状态跟踪)和更快的路径:

- **相同的代理** — 规划器 + 执行器,相同的质量
- **跳过可选步骤** — 无研究、无计划检查器、无验证器
- **单独跟踪** — 存在于 `.planning/quick/`,而不是阶段

用于:错误修复、小功能、配置更改、一次性任务。

```
/gsd:quick
> 你想做什么? "为设置添加深色模式切换"
```

**创建:** `.planning/quick/001-add-dark-mode-toggle/PLAN.md`、`SUMMARY.md`

---

## 为什么有效

### 上下文工程

Claude Code 非常强大*如果你*给它所需的上下文。大多数人不会。

GSD 为你处理:

| 文件 | 它的作用 |
|------|--------------|
| `PROJECT.md` | 项目愿景,始终加载 |
| `research/` | 生态系统知识(技术栈、功能、架构、陷阱) |
| `REQUIREMENTS.md` | 界定范围的 v1/v2 需求,具有阶段可追溯性 |
| `ROADMAP.md` | 你要去哪里,完成了什么 |
| `STATE.md` | 决策、阻塞因素、位置 — 跨会话记忆 |
| `PLAN.md` | 带有 XML 结构的原子任务,验证步骤 |
| `SUMMARY.md` | 发生了什么,改变了什么,提交到历史 |
| `todos/` | 捕获的想法和任务,供以后工作 |

基于 Claude 质量下降的位置的大小限制。保持在限制下,获得持续的优秀。

### XML 提示格式化

每个计划都是为 Claude 优化的结构化 XML:

```xml
<task type="auto">
  <name>创建登录端点</name>
  <files>src/app/api/auth/login/route.ts</files>
  <action>
    使用 jose 处理 JWT(不是 jsonwebtoken - CommonJS 问题)。
    针对用户表验证凭据。
    成功时返回 httpOnly cookie。
  </action>
  <verify>curl -X POST localhost:3000/api/auth/login 返回 200 + Set-Cookie</verify>
  <done>有效凭据返回 cookie,无效凭据返回 401</done>
</task>
```

精确的指令。没有猜测。内置验证。

### 多代理编排

每个阶段使用相同的模式:一个轻量级编排器生成专门的代理,收集结果,并路由到下一步。

| 阶段 | 编排器做什么 | 代理做什么 |
|-------|------------------|-----------|
| 研究 | 协调,展示发现 | 4 个并行研究人员调查技术栈、功能、架构、陷阱 |
| 规划 | 验证,管理迭代 | 规划器创建计划,检查器验证,循环直到通过 |
| 执行 | 分组成波,跟踪进度 | 执行器并行实现,每个都有全新的 200k 上下文 |
| 验证 | 展示结果,路由下一步 | 验证器对照目标检查代码库,调试器诊断失败 |

编排器从不做繁重的工作。它生成代理,等待,整合结果。

**结果:** 你可以运行整个阶段 — 深入研究、多个计划创建和验证、跨并行执行器编写的数千行代码、对照目标的自动验证 — 而你的主上下文窗口保持在 30-40%。工作发生在全新的 subagent 上下文中。你的会话保持快速和响应。

### 原子 Git 提交

每个任务在完成后立即获得自己的提交:

```bash
abc123f docs(08-02): 完成用户注册计划
def456g feat(08-02): 添加电子邮件确认流程
hij789k feat(08-02): 实现密码哈希
lmn012o feat(08-02): 创建注册端点
```

> [!NOTE]
> **好处:** Git bisect 找到确切失败的任务。每个任务可独立回滚。为 Claude 在未来会话中提供清晰的历史记录。AI 自动化工作流中的更好可观察性。

每个提交都是精确的、可追溯的和有意义的。

### 模块化设计

- 向当前里程碑添加阶段
- 在阶段之间插入紧急工作
- 完成里程碑并重新开始
- 调整计划而无需重建一切

你永远不会被锁定。系统会适应。

---

## 命令

### 核心工作流

| 命令 | 它的作用 |
|---------|--------------|
| `/gsd:new-project [--auto]` | 完整初始化:问题 → 研究 → 需求 → 路线图 |
| `/gsd:discuss-phase [N]` | 在规划之前捕获实现决策 |
| `/gsd:plan-phase [N]` | 为阶段进行研究 + 规划 + 验证 |
| `/gsd:execute-phase <N>` | 在并行波中执行所有计划,完成时验证 |
| `/gsd:verify-work [N]` | 手动用户验收测试 ¹ |
| `/gsd:audit-milestone` | 验证里程碑是否实现了其完成定义 |
| `/gsd:complete-milestone` | 归档里程碑,标记版本 |
| `/gsd:new-milestone [name]` | 开始下一个版本:问题 → 研究 → 需求 → 路线图 |

### 导航

| 命令 | 它的作用 |
|---------|--------------|
| `/gsd:progress` | 我在哪里?接下来是什么? |
| `/gsd:help` | 显示所有命令和使用指南 |
| `/gsd:update` | 使用变更日志预览更新 GSD |
| `/gsd:join-discord` | 加入 GSD Discord 社区 |

### 现有项目

| 命令 | 它的作用 |
|---------|--------------|
| `/gsd:map-codebase` | 在 new-project 之前分析现有代码库 |

### 阶段管理

| 命令 | 它的作用 |
|---------|--------------|
| `/gsd:add-phase` | 将阶段追加到路线图 |
| `/gsd:insert-phase [N]` | 在阶段之间插入紧急工作 |
| `/gsd:remove-phase [N]` | 删除未来阶段,重新编号 |
| `/gsd:list-phase-assumptions [N]` | 在规划之前查看 Claude 的预期方法 |
| `/gsd:plan-milestone-gaps` | 创建阶段以关闭审计中的差距 |

### 会话

| 命令 | 它的作用 |
|---------|--------------|
| `/gsd:pause-work` | 在阶段中途停止时创建交接 |
| `/gsd:resume-work` | 从上次会话恢复 |

### 工具

| 命令 | 它的作用 |
|---------|--------------|
| `/gsd:settings` | 配置模型配置文件和工作流代理 |
| `/gsd:set-profile <profile>` | 切换模型配置文件(质量/平衡/预算) |
| `/gsd:add-todo [desc]` | 捕获想法以供后用 |
| `/gsd:check-todos` | 列出待办事项 |
| `/gsd:debug [desc]` | 使用持久状态进行系统调试 |
| `/gsd:quick` | 使用 GSD 保证执行临时任务 |

<sup>¹ 由 reddit 用户 OracleGreyBeard 贡献</sup>

---

## 配置

GSD 在 `.planning/config.json` 中存储项目设置。在 `/gsd:new-project` 期间配置,或稍后使用 `/gsd:settings` 更新。

### 核心设置

| 设置 | 选项 | 默认 | 它控制什么 |
|---------|---------|---------|------------------|
| `mode` | `yolo`、`interactive` | `interactive` | 自动批准 vs 在每一步确认 |
| `depth` | `quick`、`standard`、`comprehensive` | `standard` | 规划彻底性(阶段 × 计划) |

### 模型配置文件

控制每个代理使用哪个 Claude 模型。平衡质量 vs token 支出。

| 配置文件 | 规划 | 执行 | 验证 |
|---------|----------|-----------|--------------|
| `quality` | Opus | Opus | Sonnet |
| `balanced` (默认) | Opus | Sonnet | Sonnet |
| `budget` | Sonnet | Sonnet | Haiku |

切换配置文件:
```
/gsd:set-profile budget
```

或通过 `/gsd:settings` 配置。

### 工作流代理

这些在规划/执行期间生成额外的代理。它们提高质量但增加 token 和时间。

| 设置 | 默认 | 它的作用 |
|---------|---------|--------------|
| `workflow.research` | `true` | 在规划每个阶段之前研究领域 |
| `workflow.plan_check` | `true` | 在执行之前验证计划是否实现阶段目标 |
| `workflow.verifier` | `true` | 在执行之后确认必须交付的内容已交付 |

使用 `/gsd:settings` 切换这些,或每次调用时覆盖:
- `/gsd:plan-phase --skip-research`
- `/gsd:plan-phase --skip-verify`

### 执行

| 设置 | 默认 | 它控制什么 |
|---------|---------|------------------|
| `parallelization.enabled` | `true` | 同时运行独立计划 |
| `planning.commit_docs` | `true` | 在 git 中跟踪 `.planning/` |

### Git 分支

控制 GSD 在执行期间如何处理分支。

| 设置 | 选项 | 默认 | 它的作用 |
|---------|---------|---------|--------------|
| `git.branching_strategy` | `none`、`phase`、`milestone` | `none` | 分支创建策略 |
| `git.phase_branch_template` | string | `gsd/phase-{phase}-{slug}` | 阶段分支的模板 |
| `git.milestone_branch_template` | string | `gsd/{milestone}-{slug}` | 里程碑分支的模板 |

**策略:**
- **`none`** — 提交到当前分支(默认 GSD 行为)
- **`phase`** — 每个阶段创建一个分支,在阶段完成时合并
- **`milestone`** — 为整个里程碑创建一个分支,在完成时合并

在里程碑完成时,GSD 提供 squash 合并(推荐)或带历史的合并。

---

## 安全

### 保护敏感文件

GSD 的代码库映射和分析命令读取文件以了解你的项目。**通过将包含机密的文件添加到 Claude Code 的拒绝列表来保护它们:**

1. 打开 Claude Code 设置(`.claude/settings.json` 或全局)
2. 将敏感文件模式添加到拒绝列表:

```json
{
  "permissions": {
    "deny": [
      "Read(.env)",
      "Read(.env.*)",
      "Read(**/secrets/*)",
      "Read(**/*credential*)",
      "Read(**/*.pem)",
      "Read(**/*.key)"
    ]
  }
}
```

这会完全阻止 Claude 读取这些文件,无论你运行什么命令。

> [!IMPORTANT]
> GSD 包括内置的保护机制,防止提交机密,但纵深防御是最佳实践。拒绝读取敏感文件作为第一道防线。

---

## 故障排除

**安装后找不到命令?**
- 重新启动 Claude Code 以重新加载斜杠命令
- 验证文件存在于 `~/.claude/commands/gsd/`(全局)或 `./.claude/commands/gsd/`(本地)

**命令未按预期工作?**
- 运行 `/gsd:help` 验证安装
- 重新运行 `npx get-shit-done-cc` 重新安装

**更新到最新版本?**
```bash
npx get-shit-done-cc@latest
```

**使用 Docker 或容器化环境?**

如果文件读取因波浪号路径(`~/.claude/...`)而失败,请在安装前设置 `CLAUDE_CONFIG_DIR`:
```bash
CLAUDE_CONFIG_DIR=/home/youruser/.claude npx get-shit-done-cc --global
```
这确保使用绝对路径而不是 `~`,后者可能无法在容器中正确扩展。

### 卸载

要完全删除 GSD:

```bash
# 全局安装
npx get-shit-done-cc --claude --global --uninstall
npx get-shit-done-cc --opencode --global --uninstall

# 本地安装(当前项目)
npx get-shit-done-cc --claude --local --uninstall
npx get-shit-done-cc --opencode --local --uninstall
```

这会删除所有 GSD 命令、代理、钩子和设置,同时保留你的其他配置。

---

## 社区移植

OpenCode 和 Gemini CLI 现在通过 `npx get-shit-done-cc` 受到原生支持。

这些社区移植率先支持多运行时:

| 项目 | 平台 | 描述 |
|---------|----------|-------------|
| [gsd-opencode](https://github.com/rokicool/gsd-opencode) | OpenCode | 原始 OpenCode 适配 |
| gsd-gemini (已归档) | Gemini CLI | uberfuzzy 的原始 Gemini 适配 |

---

## Star 历史

<a href="https://star-history.com/#glittercowboy/get-shit-done&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=glittercowboy/get-shit-done&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=glittercowboy/get-shit-done&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=glittercowboy/get-shit-done&type=Date" />
 </picture>
</a>

---

## 许可证

MIT 许可证。详见 [LICENSE](LICENSE)。

---

<div align="center">

**Claude Code 很强大。GSD 使其可靠。**

</div>
