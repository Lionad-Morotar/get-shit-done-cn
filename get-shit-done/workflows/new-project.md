<purpose>
通过统一流程初始化新项目：提问、研究（可选）、需求、路线图。这是任何项目中杠杆作用最大的时刻 — 深入提问意味着更好的计划、更好的执行、更好的结果。一个工作流程将您从想法带到准备规划。
</purpose>

<required_reading>
在开始之前读取执行上下文引用的所有文件。
</required_reading>

<auto_mode>
## 自动模式检测

检查 $ARGUMENTS 中是否存在 `--auto` 标志。

**如果是自动模式：**
- 跳过棕地映射提议（假设绿地项目）
- 跳过深入提问（从提供的文档中提取上下文）
- 配置问题仍然需要（步骤 5）
- 配置后：使用智能默认值自动运行步骤 6-9：
  - 研究：始终是
  - 需求：包括所提供文档中的所有基本功能和功能
  - 需求批准：自动批准
  - 路线图批准：自动批准

**文档要求：**
自动模式需要通过 @ 引用提供的想法文档（例如，`/gsd:new-project --auto @prd.md`）。如果未提供文档，错误：

```
错误：--auto 需要通过 @ 引用的想法文档。

用法：/gsd:new-project --auto @your-idea.md

文档应该描述您想要构建的内容。
```
</auto_mode>

<process>

## 1. 设置

**强制第一步 — 在任何用户交互之前执行这些检查：**

```bash
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js init new-project)
```

解析 JSON 以获取：`researcher_model`、`synthesizer_model`、`roadmapper_model`、`commit_docs`、`project_exists`、`has_codebase_map`、`planning_exists`、`has_existing_code`、`has_package_file`、`is_brownfield`、`needs_codebase_map`、`has_git`。

**如果 `project_exists` 为 true：** 错误 — 项目已初始化。使用 `/gsd:progress`。

**如果 `has_git` 为 false：** 初始化 git：
```bash
git init
```

## 2. 棕地提议

**如果是自动模式：** 跳到步骤 4（假设绿地项目，从提供的文档合成 PROJECT.md）。

**如果 `needs_codebase_map` 为 true**（来自 init — 检测到现有代码但没有代码库映射）：

使用 AskUserQuestion：
- header: "现有代码"
- question: "我检测到此目录中存在现有代码。您想先映射代码库吗？"
- options:
  - "先映射代码库" — 运行 /gsd:map-codebase 以了解现有架构（推荐）
  - "跳过映射" — 继续项目初始化

**如果 "先映射代码库"：**
```
先运行 `/gsd:map-codebase`，然后返回到 `/gsd:new-project`
```
退出命令。

**如果 "跳过映射" 或 `needs_codebase_map` 为 false：** 继续到步骤 3。

## 3. 深入提问

**如果是自动模式：** 跳过。改为从提供的文档中提取项目上下文并继续到步骤 4。

**显示阶段横幅：**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 提问
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**打开对话：**

内联询问（自由形式，而不是 AskUserQuestion）：

"您想构建什么？"

等待他们的响应。这为您提供了询问智能后续问题所需的上下文。

**跟随线索：**

根据他们所说的内容，提出深入挖掘其响应的后续问题。使用带有选项的 AskUserQuestion 来探测他们提到的内容 — 解释、澄清、具体示例。

继续跟随线索。每个答案都会开辟新的探索线索。询问：
- 什么让他们兴奋
- 什么问题引发了这一点
- 什么意味着模糊术语
- 它实际上会是什么样子
- 已经决定了什么

查阅 `questioning.md` 以获取技巧：
- 挑战模糊性
- 使抽象具体化
- 揭示假设
- 寻找边缘
- 揭示动机

**检查上下文（背景，而不是大声说出来）：**

随着您的进行，心理上检查来自 `questioning.md` 的上下文检查清单。如果仍然存在差距，自然地编织问题。不要突然切换到检查清单模式。

**决策门：**

当您可以编写清晰的 PROJECT.md 时，使用 AskUserQuestion：

- header: "准备好了吗？"
- question: "我想我了解您的目标。准备好创建 PROJECT.md 了吗？"
- options:
  - "创建 PROJECT.md" — 让我们继续前进
  - "继续探索" — 我想分享更多 / 问我更多

如果 "继续探索" — 询问他们想要添加什么，或者识别差距并自然地探查。

循环直到选择 "创建 PROJECT.md"。

## 4. 编写 PROJECT.md

**如果是自动模式：** 从提供的文档合成。未显示 "准备好了吗？" 门 — 直接继续到提交。

使用 `templates/project.md` 中的模板将所有上下文综合到 `.planning/PROJECT.md` 中。

**对于绿地项目：**

将需求初始化为假设：

```markdown
## 需求

### 已验证

（尚未 — 发布以验证）

### 活跃

- [ ] [需求 1]
- [ ] [需求 2]
- [ ] [需求 3]

### 超出范围

- [排除 1] — [为什么]
- [排除 2] — [为什么]
```

所有活跃需求都是假设，直到已发布和验证。

**对于棕地项目（代码库映射存在）：**

从现有代码推断已验证的需求：

1. 读取 `.planning/codebase/ARCHITECTURE.md` 和 `STACK.md`
2. 识别代码库已经做的事情
3. 这些成为初始已验证集

```markdown
## 需求

### 已验证

- ✓ [现有功能 1] — 现有
- ✓ [现有功能 2] — 现有
- ✓ [现有功能 3] — 现有

### 活跃

- [ ] [新需求 1]
- [ ] [新需求 2]

### 超出范围

- [排除 1] — [为什么]
```

**关键决策：**

使用提问期间所做的任何决策进行初始化：

```markdown
## 关键决策

| 决策 | 基本原理 | 结果 |
|----------|-----------|---------|
| [来自提问的选择] | [为什么] | — 待定 |
```

**最后更新页脚：**

```markdown
---
*最后更新：[date] 初始化后*
```

不要压缩。捕获收集的所有内容。

**提交 PROJECT.md：**

```bash
mkdir -p .planning
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "docs: initialize project" --files .planning/PROJECT.md
```

## 5. 工作流偏好

**第一轮 — 核心工作流设置（4 个问题）：**

```
questions: [
  {
    header: "模式",
    question: "您想如何工作？",
    multiSelect: false,
    options: [
      { label: "YOLO（推荐）", description: "自动批准，只执行" },
      { label: "交互式", description: "在每一步确认" }
    ]
  },
  {
    header: "深度",
    question: "规划应该多彻底？",
    multiSelect: false,
    options: [
      { label: "快速", description: "快速发布（3-5 个阶段，每个 1-3 个计划）" },
      { label: "标准", description: "平衡范围和速度（5-8 个阶段，每个 3-5 个计划）" },
      { label: "综合", description: "彻底覆盖（8-12 个阶段，每个 5-10 个计划）" }
    ]
  },
  {
    header: "执行",
    question: "并行运行计划？",
    multiSelect: false,
    options: [
      { label: "并行（推荐）", description: "独立计划同时运行" },
      { label: "顺序", description: "一次一个计划" }
    ]
  },
  {
    header: "Git 跟踪",
    question: "将规划文档提交到 git？",
    multiSelect: false,
    options: [
      { label: "是（推荐）", description: "规划文档在版本控制中跟踪" },
      { label: "否", description: "保持 .planning/ 仅本地（添加到 .gitignore）" }
    ]
  }
]
```

**第二轮 — 工作流代理：**

这些在规划/执行期间生成额外的代理。它们增加令牌和时间但提高质量。

| 代理 | 它何时运行 | 它做什么 |
|-------|--------------|--------------|
| **研究者** | 在规划每个阶段之前 | 调查领域、查找模式、揭示陷阱 |
| **计划检查器** | 计划创建后 | 验证计划实际上实现了阶段目标 |
| **验证器** | 阶段执行后 | 确认必须项已交付 |

对于重要项目，推荐所有。对于快速实验，跳过。

```
questions: [
  {
    header: "研究",
    question: "在规划每个阶段之前研究？（增加令牌/时间）",
    multiSelect: false,
    options: [
      { label: "是（推荐）", description: "调查领域、查找模式、揭示陷阱" },
      { label: "否", description: "直接从需求规划" }
    ]
  },
  {
    header: "计划检查",
    question: "验证计划将实现其目标？（增加令牌/时间）",
    multiSelect: false,
    options: [
      { label: "是（推荐）", description: "在执行开始之前发现差距" },
      { label: "否", description: "执行计划而无需验证" }
    ]
  },
  {
    header: "验证器",
    question: "在每个阶段之后验证工作是否满足需求？（增加令牌/时间）",
    multiSelect: false,
    options: [
      { label: "是（推荐）", description: "确认交付成果与阶段目标匹配" },
      { label: "否", description: "信任执行，跳过验证" }
    ]
  },
  {
    header: "模型配置文件",
    question: "规划代理使用哪些 AI 模型？",
    multiSelect: false,
    options: [
      { label: "平衡（推荐）", description: "大多数代理使用 Sonnet — 良好的质量/成本比" },
      { label: "质量", description: "研究/路线图使用 Opus — 更高成本、更深入分析" },
      { label: "预算", description: "尽可能使用 Haiku — 最快、最低成本" }
    ]
  }
]
```

使用所有设置创建 `.planning/config.json`：

```json
{
  "mode": "yolo|interactive",
  "depth": "quick|standard|comprehensive",
  "parallelization": true|false,
  "commit_docs": true|false,
  "model_profile": "quality|balanced|budget",
  "workflow": {
    "research": true|false,
    "plan_check": true|false,
    "verifier": true|false
  }
}
```

**如果 commit_docs = 否：**
- 在 config.json 中设置 `commit_docs: false`
- 将 `.planning/` 添加到 `.gitignore`（如果需要则创建）

**如果 commit_docs = 是：**
- 不需要额外的 gitignore 条目

**提交 config.json：**

```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "chore: add project config" --files .planning/config.json
```

**注意：** 随时运行 `/gsd:settings` 以更新这些首选项。

## 5.5. 解析模型配置文件

使用来自 init 的模型：`researcher_model`、`synthesizer_model`、`roadmapper_model`。

## 6. 研究决策

**如果是自动模式：** 默认为 "先研究" 而不询问。

使用 AskUserQuestion：
- header: "研究"
- question: "在定义需求之前研究领域生态系统？"
- options:
  - "先研究（推荐）" — 发现行标准栈、预期功能、架构模式
  - "跳过研究" — 我很了解这个领域，直接进入需求

**如果 "先研究"：**

显示阶段横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 研究中
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

研究 [领域] 生态系统...
```

创建研究目录：
```bash
mkdir -p .planning/research
```

**确定里程碑上下文：**

检查这是绿地项目还是后续里程碑：
- 如果 PROJECT.md 中没有 "已验证" 需求 → 绿地项目（从头开始构建）
- 如果存在 "已验证" 需求 → 后续里程碑（添加到现有应用程序）

显示生成指示器：
```
◆ 生成 4 个并行研究代理...
  → 技术栈研究
  → 功能研究
  → 架构研究
  → 陷阱研究
```

生成 4 个具有丰富上下文的并行 gsd-project-researcher 代理：

```
Task(prompt="首先，读取 ~/.claude/agents/gsd-project-researcher.md 以获取您的角色和说明。

<research_type>
项目研究 — [领域] 的技术栈维度。
</research_type>

<milestone_context>
[绿地项目 OR 后续]

绿地项目：研究从头开始构建 [领域] 的标准技术栈。
后续：研究将 [目标功能] 添加到现有 [领域] 应用程序需要什么。不要重新研究现有系统。
</milestone_context>

<question>
[领域] 的 2025 年标准技术栈是什么？
</question>

<project_context>
[PROJECT.md 摘要 - 核心价值、约束、他们正在构建的内容]
</project_context>

<downstream_consumer>
您的 STACK.md 输入到路线图创建。具有规范性：
- 带有版本的具体库
- 每个选择的清晰基本原理
- 不使用什么以及为什么
</downstream_consumer>

<quality_gate>
- [ ] 版本是当前的（使用 Context7/官方文档验证，而不是训练数据）
- [ ] 基本原理解释为什么，而不仅仅是是什么
- [ ] 为每个建议分配置信度级别
</quality_gate>

<output>
写入到：.planning/research/STACK.md
使用模板：~/.claude/get-shit-done/templates/research-project/STACK.md
</output>
", subagent_type="general-purpose", model="{researcher_model}", description="Stack research")

Task(prompt="首先，读取 ~/.claude/agents/gsd-project-researcher.md 以获取您的角色和说明。

<research_type>
项目研究 — [领域] 的功能维度。
</research_type>

<milestone_context>
[绿地项目 OR 后续]

绿地项目：[领域] 产品有什么功能？什么是基本功能 vs 差异化？
后续：[目标功能] 通常如何工作？预期行为是什么？
</milestone_context>

<question>
[领域] 产品有什么功能？什么是基本功能 vs 差异化？
</question>

<project_context>
[PROJECT.md 摘要]
</project_context>

<downstream_consumer>
您的 FEATURES.md 输入到需求定义。清楚地分类：
- 基本功能（必须有，否则用户离开）
- 差异化功能（竞争优势）
- 反功能（故意不构建的东西）
</downstream_consumer>

<quality_gate>
- [ ] 类别清晰（基本功能 vs 差异化功能 vs 反功能）
- [ ] 为每个功能注明了复杂性
- [ ] 功能之间的依赖已识别
</quality_gate>

<output>
写入到：.planning/research/FEATURES.md
使用模板：~/.claude/get-shit-done/templates/research-project/FEATURES.md
</output>
", subagent_type="general-purpose", model="{researcher_model}", description="Features research")

Task(prompt="首先，读取 ~/.claude/agents/gsd-project-researcher.md 以获取您的角色和说明。

<research_type>
项目研究 — [领域] 的架构维度。
</research_type>

<milestone_context>
[绿地项目 OR 后续]

绿地项目：[领域] 系统通常如何结构化？主要组件是什么？
后续：[目标功能] 如何与现有 [领域] 架构集成？
</milestone_context>

<question>
[领域] 系统通常如何结构化？主要组件是什么？
</question>

<project_context>
[PROJECT.md 摘要]
</project_context>

<downstream_consumer>
您的 ARCHITECTURE.md 为路线图中的阶段结构提供信息。包括：
- 组件边界（什么与什么交谈）
- 数据流（信息如何移动）
- 建议的构建顺序（组件之间的依赖项）
</downstream_consumer>

<quality_gate>
- [ ] 组件明确定义并带有边界
- [ ] 数据流方向明确
- [ ] 注意了构建顺序含义
</quality_gate>

<output>
写入到：.planning/research/ARCHITECTURE.md
使用模板：~/.claude/get-shit-done/templates/research-project/ARCHITECTURE.md
</output>
", subagent_type="general-purpose", model="{researcher_model}", description="Architecture research")

Task(prompt="首先，读取 ~/.claude/agents/gsd-project-researcher.md 以获取您的角色和说明。

<research_type>
项目研究 — [领域] 的陷阱维度。
</research_type>

<milestone_context>
[绿地项目 OR 后续]

绿地项目：[领域] 项目通常做错了什么？关键错误？
后续：将 [目标功能] 添加到 [领域] 时的常见错误？
</milestone_context>

<question>
[领域] 项目通常做错了什么？关键错误？
</question>

<project_context>
[PROJECT.md 摘要]
</project_context>

<downstream_consumer>
您的 PITFALLS.md 防止路线图/规划中的错误。对于每个陷阱：
- 警告信号（如何早期检测）
- 预防策略（如何避免）
- 哪个阶段应该解决它
</downstream_consumer>

<quality_gate>
- [ ] 陷阱特定于此领域（不是通用建议）
- [ ] 预防策略可操作
- [ ] 包括阶段映射（如相关）
</quality_gate>

<output>
写入到：.planning/research/PITFALLS.md
使用模板：~/.claude/get-shit-done/templates/research-project/PITFALLS.md
</output>
", subagent_type="general-purpose", model="{researcher_model}", description="Pitfalls research")
```

所有 4 个代理完成后，生成合成器以创建 SUMMARY.md：

```
Task(prompt="
<task>
将研究输出合成为 SUMMARY.md。
</task>

<research_files>
读取这些文件：
- .planning/research/STACK.md
- .planning/research/FEATURES.md
- .planning/research/ARCHITECTURE.md
- .planning/research/PITFALLS.md
</research_files>

<output>
写入到：.planning/research/SUMMARY.md
使用模板：~/.claude/get-shit-done/templates/research-project/SUMMARY.md
写入后提交。
</output>
", subagent_type="gsd-research-synthesizer", model="{synthesizer_model}", description="Synthesize research")
```

显示研究完成横幅和关键发现：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 研究完成 ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 关键发现

**技术栈：** [来自 SUMMARY.md]
**基本功能：** [来自 SUMMARY.md]
**注意：** [来自 SUMMARY.md]

文件：`.planning/research/`
```

**如果 "跳过研究"：** 继续到步骤 7。

## 7. 定义需求

显示阶段横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 定义需求
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**加载上下文：**

读取 PROJECT.md 并提取：
- 核心价值（必须工作的一件事）
- 陈述的约束（预算、时间表、技术限制）
- 任何明确的范围边界

**如果研究存在：** 读取 research/FEATURES.md 并提取功能类别。

**如果是自动模式：**
- 自动包括所有基本功能（用户期望这些）
- 包括所提供文档中明确提到的功能
- 自动推迟文档中未提及的差异化功能
- 跳过每类 AskUserQuestion 循环
- 跳过 "任何添加？" 问题
- 跳过需求批准门
- 生成 REQUIREMENTS.md 并直接提交

**按类别展示功能（仅交互模式）：**

```
以下是 [领域] 的功能：

## 身份验证
**基本功能：**
- 使用电子邮件/密码注册
- 电子邮件验证
- 密码重置
- 会话管理

**差异化功能：**
- 魔术链接登录
- OAuth（Google、GitHub）
- 2FA

**研究注释：** [任何相关注释]

---

## [下一个类别]
...
```

**如果没有研究：** 改为通过对话收集需求。

询问："用户需要能够做的主要事情是什么？"

对于提到的每个功能：
- 提出澄清问题以使其具体化
- 探查相关功能
- 分组到类别

**范围化每个类别：**

对于每个类别，使用 AskUserQuestion：

- header: "[类别名称]"
- question: "v1 中包括哪些 [类别] 功能？"
- multiSelect: true
- options:
  - "[功能 1]" — [简短描述]
  - "[功能 2]" — [简短描述]
  - "[功能 3]" — [简短描述]
  - "v1 无" — 推迟整个类别

跟踪响应：
- 选定的功能 → v1 需求
- 未选中的基本功能 → v2（用户期望这些）
- 未选中的差异化功能 → 超出范围

**识别差距：**

使用 AskUserQuestion：
- header: "添加"
- question: "研究遗漏了任何需求吗？（特定于您愿景的功能）"
- options:
  - "不，研究已覆盖" — 继续
  - "是的，让我添加一些" — 捕获添加内容

**验证核心价值：**

根据 PROJECT.md 的核心价值交叉检查需求。如果检测到差距，将其浮现。

**生成 REQUIREMENTS.md：**

创建 `.planning/REQUIREMENTS.md`，包括：
- v1 需求按类别分组（复选框、REQ-ID）
- v2 需求（已推迟）
- 超出范围（明确排除及其基本原理）
- 可追溯性部分（空，由路线图填充）

**REQ-ID 格式：** `[CATEGORY]-[NUMBER]`（AUTH-01、CONTENT-02）

**需求质量标准：**

好的需求是：
- **具体和可测试：** "用户可以通过电子邮件链接重置密码"（而不是 "处理密码重置"）
- **以用户为中心：** "用户可以 X"（而不是 "系统做 Y"）
- **原子性：** 每个需求一个功能（而不是 "用户可以登录和管理个人资料"）
- **独立性：** 对其他需求的依赖最小

拒绝模糊需求。推动具体性：
- "处理身份验证" → "用户可以使用电子邮件/密码登录并跨会话保持登录状态"
- "支持共享" → "用户可以通过链接共享帖子，该链接在收件人的浏览器中打开"

**展示完整需求列表（仅交互模式）：**

向用户确认显示每个需求（而不是计数）：

```
## v1 需求

### 身份验证
- [ ] **AUTH-01**：用户可以使用电子邮件/密码创建帐户
- [ ] **AUTH-02**：用户可以登录并跨会话保持登录状态
- [ ] **AUTH-03**：用户可以从任何页面注销

### 内容
- [ ] **CONT-01**：用户可以使用文本创建帖子
- [ ] **CONT-02**：用户可以编辑自己的帖子

[... 完整列表 ...]

---

这是否捕获了您正在构建的内容？(yes / adjust)
```

如果 "adjust"：返回到范围设定。

**提交需求：**

```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "docs: define v1 requirements" --files .planning/REQUIREMENTS.md
```

## 8. 创建路线图

显示阶段横幅：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 创建路线图
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ 生成路线图器...
```

生成具有上下文的 gsd-roadmapper 代理：

```
Task(prompt="
<planning_context>

**项目：**
@.planning/PROJECT.md

**需求：**
@.planning/REQUIREMENTS.md

**研究（如果存在）：**
@.planning/research/SUMMARY.md

**配置：**
@.planning/config.json

</planning_context>

<instructions>
创建路线图：
1. 从需求派生阶段（不要强加结构）
2. 将每个 v1 需求映射到恰好一个阶段
3. 为每个阶段派生 2-5 个成功标准（可观察的用户行为）
4. 验证 100% 覆盖
5. 立即写入文件（ROADMAP.md、STATE.md、更新 REQUIREMENTS.md 可追溯性）
6. 返回已创建路线图并带有摘要

首先写入文件，然后返回。这确保即使上下文丢失，工件也会持久化。
</instructions>
", subagent_type="gsd-roadmapper", model="{roadmapper_model}", description="Create roadmap")
```

**处理路线图器返回：**

**如果 `## ROADMAP BLOCKED`：**
- 展示阻塞因素信息
- 与用户合作解决
- 解决后重新生成

**如果 `## ROADMAP CREATED`：**

读取创建的 ROADMAP.md 并很好地内联展示：

```
---

## 提议的路线图

**[N] 个阶段** | **[X] 个需求已映射** | 所有 v1 需求已覆盖 ✓

| # | 阶段 | 目标 | 需求 | 成功标准 |
|---|-------|------|--------------|------------------|
| 1 | [名称] | [目标] | [REQ-ID] | [count] |
| 2 | [名称] | [目标] | [REQ-ID] | [count] |
| 3 | [名称] | [目标] | [REQ-ID] | [count] |
...

### 阶段详细信息

**阶段 1：[名称]**
目标：[goal]
需求：[REQ-IDs]
成功标准：
1. [criterion]
2. [criterion]
3. [criterion]

**阶段 2：[名称]**
目标：[goal]
需求：[REQ-IDs]
成功标准：
1. [criterion]
2. [criterion]

[... 继续所有阶段 ...]

---
```

**如果是自动模式：** 跳过批准门 — 自动批准并直接提交。

**关键：在提交之前请求批准（仅交互模式）：**

使用 AskUserQuestion：
- header: "路线图"
- question: "此路线图结构适合您吗？"
- options:
  - "批准" — 提交并继续
  - "调整阶段" — 告诉我要更改什么
  - "审查完整文件" — 显示原始 ROADMAP.md

**如果 "批准"：** 继续提交。

**如果 "调整阶段"：**
- 获取用户的调整注释
- 使用修订上下文重新生成路线图器：
  ```
  Task(prompt="
  <revision>
  用户对路线图的反馈：
  [用户的注释]

  当前 ROADMAP.md：@.planning/ROADMAP.md

  根据反馈更新路线图。就地编辑文件。
  返回已修订的路线图并进行了更改。
  </revision>
  ", subagent_type="gsd-roadmapper", model="{roadmapper_model}", description="Revise roadmap")
  ```
- 展示修订的路线图
- 循环直到用户批准

**如果 "审查完整文件"：** 显示原始 `cat .planning/ROADMAP.md`，然后重新询问。

**提交路线图（批准后或自动模式）：**

```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "docs: create roadmap ([N] phases)" --files .planning/ROADMAP.md .planning/STATE.md .planning/REQUIREMENTS.md
```

## 9. 完成

展示完成并给出下一步：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► 项目已初始化 ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**[项目名称]**

| 工件       | 位置                    |
|----------------|-----------------------------|
| 项目        | `.planning/PROJECT.md`      |
| 配置         | `.planning/config.json`     |
| 研究       | `.planning/research/`       |
| 需求   | `.planning/REQUIREMENTS.md` |
| 路线图        | `.planning/ROADMAP.md`      |

**[N] 个阶段** | **[X] 个需求** | 准备构建 ✓

───────────────────────────────────────────────────────────────

## ▶ 接下来

**阶段 1：[阶段名称]** — [来自 ROADMAP.md 的目标]

/gsd:discuss-phase 1 — 收集上下文并阐明方法

<sub>/clear first → 新的上下文窗口</sub>

---

**也可用：**
- /gsd:plan-phase 1 — 跳过讨论，直接规划

───────────────────────────────────────────────────────────────
```

</process>

<output>

- `.planning/PROJECT.md`
- `.planning/config.json`
- `.planning/research/`（如果选择了研究）
  - `STACK.md`
  - `FEATURES.md`
  - `ARCHITECTURE.md`
  - `PITFALLS.md`
  - `SUMMARY.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`

</output>

<success_criteria>

- [ ] 创建了 .planning/ 目录
- [ ] Git 存储库已初始化
- [ ] 棕地检测已完成
- [ ] 深入提问已完成（跟随线索，不匆忙）
- [ ] PROJECT.md 捕获完整上下文 → **已提交**
- [ ] config.json 具有工作流模式、深度、并行化 → **已提交**
- [ ] 研究已完成（如果选中）— 生成 4 个并行代理 → **已提交**
- [ ] 需求已收集（来自研究或对话）
- [ ] 用户范围化每个类别（v1/v2/超出范围）
- [ ] REQUIREMENTS.md 使用 REQ-ID 创建 → **已提交**
- [ ] 使用上下文生成 gsd-roadmapper
- [ ] 路线图文件立即写入（不是草稿）
- [ ] 用户反馈已合并（如果有）
- [ ] ROADMAP.md 创建了阶段、需求映射、成功标准
- [ ] STATE.md 已初始化
- [ ] REQUIREMENTS.md 可追溯性已更新
- [ ] 用户知道下一步是 `/gsd:discuss-phase 1`

**原子提交：** 每个阶段立即提交其工件。如果上下文丢失，工件持久化。

</success_criteria>
