# 阶段提示词模板

> **注意：** 规划方法在 `agents/gsd-planner.md` 中。
> 此模板定义代理生成的 PLAN.md 输出格式。

用于 `.planning/phases/XX-name/{phase}-{plan}-PLAN.md` 的模板 — 针对并行执行优化的可执行阶段计划。

**命名：** 使用 `{phase}-{plan}-PLAN.md` 格式（例如，阶段 1、计划 2 为 `01-02-PLAN.md`）

---

## 文件模板

```markdown
---
phase: XX-name
plan: NN
type: execute
wave: N                     # 执行波次（1、2、3...）。在规划时预计算。
depends_on: []              # 此计划所需的计划 ID（例如，["01-01"]）。
files_modified: []          # 此计划修改的文件。
autonomous: true            # 如果计划有需要用户交互的检查点，则为 false
user_setup: []              # Claude 无法自动执行的人工必需设置（见下文）

# 目标反向验证（在规划期间派生，执行后验证）
must_haves:
  truths: []                # 目标实现必须为真的可观察行为
  artifacts: []             # 必须存在真实实现的文件
  key_links: []             # 制品之间的关键连接
---

<objective>
[此计划完成的内容]

目的：[这对项目为何重要]
输出：[将创建什么制品]
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
[如果计划包含检查点任务（type="checkpoint:*"），添加：]
@~/.claude/get-shit-done/references/checkpoints.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

# 仅在真正需要时引用先前的计划 SUMMARY：
# - 此计划使用来自先前计划的类型/导出
# - 先前计划做出了影响此计划的决策
# 不要反射性链接：计划 02 引用 01，计划 03 引用 02...

[相关源文件：]
@src/path/to/relevant.ts
</context>

<tasks>

<task type="auto">
  <name>任务 1：[以行动为导向的名称]</name>
  <files>path/to/file.ext, another/file.ext</files>
  <action>[具体实施 - 做什么、如何做、避免什么以及为什么]</action>
  <verify>[证明它有效的命令或检查]</verify>
  <done>[可测量的验收标准]</done>
</task>

<task type="auto">
  <name>任务 2：[以行动为导向的名称]</name>
  <files>path/to/file.ext</files>
  <action>[具体实施]</action>
  <verify>[命令或检查]</verify>
  <done>[验收标准]</done>
</task>

<!-- 有关检查点任务示例和模式，请参阅 @~/.claude/get-shit-done/references/checkpoints.md -->
<!-- 关键规则：Claude 在人工验证检查点之前启动开发服务器。用户只访问 URL。 -->

<task type="checkpoint:decision" gate="blocking">
  <decision>[需要决定的内容]</decision>
  <context>[此决策为何重要]</context>
  <options>
    <option id="option-a"><name>[名称]</name><pros>[好处]</pros><cons>[权衡]</cons></option>
    <option id="option-b"><name>[名称]</name><pros>[好处]</pros><cons>[权衡]</cons></option>
  </options>
  <resume-signal>选择：option-a 或 option-b</resume-signal>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>[Claude 构建的内容] - 服务器运行于 [URL]</what-built>
  <how-to-verify>访问 [URL] 并验证：[仅视觉检查，无 CLI 命令]</how-to-verify>
  <resume-signal>输入 "approved" 或描述问题</resume-signal>
</task>

</tasks>

<verification>
在声明计划完成之前：
- [ ] [具体测试命令]
- [ ] [构建/类型检查通过]
- [ ] [行为验证]
</verification>

<success_criteria>

- 所有任务已完成
- 所有验证检查通过
- 未引入错误或警告
- [计划特定标准]
  </success_criteria>

<output>
完成后，创建 `.planning/phases/XX-name/{phase}-{plan}-SUMMARY.md`
</output>
```

---

## 前置元数据字段

| 字段 | 必需 | 目的 |
|-------|----------|---------|
| `phase` | 是 | 阶段标识符（例如，`01-foundation`） |
| `plan` | 是 | 阶段内的计划编号（例如，`01`、`02`） |
| `type` | 是 | 标准计划始终为 `execute`，TDD 计划为 `tdd` |
| `wave` | 是 | 执行波次编号（1、2、3...）。在规划时预计算。 |
| `depends_on` | 是 | 此计划所需的计划 ID 数组。 |
| `files_modified` | 是 | 此计划触及的文件。 |
| `autonomous` | 是 | 如果没有检查点则为 `true`，如果有检查点则为 `false` |
| `user_setup` | 否 | 人工必需设置项数组（外部服务） |
| `must_haves` | 是 | 目标反向验证标准（见下文） |

**Wave 是预计算的：** 波次编号在 `/gsd:plan-phase` 期间分配。Execute-phase 直接从前置元数据读取 `wave` 并按波次编号对计划进行分组。无需运行时依赖分析。

**Must-haves 启用验证：** `must_haves` 字段将目标反向要求从规划传递到执行。在所有计划完成后，execute-phase 生成一个验证子代理，根据实际代码库检查这些标准。

---

## 并行与顺序

<parallel_examples>

**波次 1 候选（并行）：**

```yaml
# 计划 01 - 用户功能
wave: 1
depends_on: []
files_modified: [src/models/user.ts, src/api/users.ts]
autonomous: true

# 计划 02 - 产品功能（与计划 01 无重叠）
wave: 1
depends_on: []
files_modified: [src/models/product.ts, src/api/products.ts]
autonomous: true

# 计划 03 - 订单功能（无重叠）
wave: 1
depends_on: []
files_modified: [src/models/order.ts, src/api/orders.ts]
autonomous: true
```

这三个全部并行运行（波次 1）- 无依赖、无文件冲突。

**顺序（真正的依赖）：**

```yaml
# 计划 01 - 身份验证基础
wave: 1
depends_on: []
files_modified: [src/lib/auth.ts, src/middleware/auth.ts]
autonomous: true

# 计划 02 - 受保护的功能（需要身份验证）
wave: 2
depends_on: ["01"]
files_modified: [src/features/dashboard.ts]
autonomous: true
```

波次 2 中的计划 02 等待波次 1 中的计划 01 - 对身份验证类型/中间件的真正依赖。

**检查点计划：**

```yaml
# 计划 03 - 带验证的 UI
wave: 3
depends_on: ["01", "02"]
files_modified: [src/components/Dashboard.tsx]
autonomous: false  # 有 checkpoint:human-verify
```

波次 3 在波次 1 和 2 之后运行。在检查点处暂停，协调器向用户展示，批准后恢复。

</parallel_examples>

---

## 上下文部分

**并行感知上下文：**

```markdown
<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

# 仅在真正需要时包括 SUMMARY 引用：
# - 此计划从先前计划导入类型
# - 先前计划做出了影响此计划的决策
# - 先前计划的输出是此计划的输入
#
# 独立计划不需要先前的 SUMMARY 引用。
# 不要反射性链接：02 引用 01，03 引用 02...

@src/relevant/source.ts
</context>
```

**不良模式（创建虚假依赖）：**
```markdown
<context>
@.planning/phases/03-features/03-01-SUMMARY.md  # 只因为它更早
@.planning/phases/03-features/03-02-SUMMARY.md  # 反射性链接
</context>
```

---

## 范围指导

**计划大小：**

- 每个计划 2-3 个任务
- 最多约 50% 的上下文使用
- 复杂阶段：多个专注的计划，而不是一个大计划

**何时拆分：**

- 不同的子系统（身份验证 vs API vs UI）
- >3 个任务
- 上下文溢出风险
- TDD 候选 - 独立计划

**首选垂直切片：**

```
首选：计划 01 = 用户（模型 + API + UI）
      计划 02 = 产品（模型 + API + UI）

避免：  计划 01 = 所有模型
      计划 02 = 所有 API
      计划 03 = 所有 UI
```

---

## TDD 计划

TDD 功能使用 `type: tdd` 获得专用计划。

**启发式：** 你能在编写 `fn` 之前编写 `expect(fn(input)).toBe(output)` 吗？
→ 是：创建 TDD 计划
→ 否：标准计划中的标准任务

有关 TDD 计划结构，请参阅 `~/.claude/get-shit-done/references/tdd.md`。

---

## 任务类型

| 类型 | 用于 | 自主性 |
|------|---------|----------|
| `auto` | Claude 可以独立完成的所有事情 | 完全自主 |
| `checkpoint:human-verify` | 视觉/功能验证 | 暂停，返回到协调器 |
| `checkpoint:decision` | 实施选择 | 暂停，返回到协调器 |
| `checkpoint:human-action` | 真正不可避免的手动步骤（罕见） | 暂停，返回到协调器 |

**并行执行中的检查点行为：**
- 计划运行直到检查点
- 代理返回检查点详细信息 + agent_id
- 协调器向用户展示
- 用户响应
- 协调器使用 `resume: agent_id` 恢复代理

---

## 示例

**自主并行计划：**

```markdown
---
phase: 03-features
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [src/features/user/model.ts, src/features/user/api.ts, src/features/user/UserList.tsx]
autonomous: true
---

<objective>
作为垂直切片实现完整的用户功能。

目的：可以与其他功能并行运行的自包含用户管理。
输出：用户模型、API 端点和 UI 组件。
</objective>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
</context>

<tasks>
<task type="auto">
  <name>任务 1：创建用户模型</name>
  <files>src/features/user/model.ts</files>
  <action>定义带有 id、email、name、createdAt 的 User 类型。导出 TypeScript 接口。</action>
  <verify>tsc --noEmit 通过</verify>
  <done>User 类型已导出且可用</done>
</task>

<task type="auto">
  <name>任务 2：创建用户 API 端点</name>
  <files>src/features/user/api.ts</files>
  <action>GET /users（列表）、GET /users/:id（单个）、POST /users（创建）。使用来自模型的 User 类型。</action>
  <verify>curl 测试对所有端点通过</verify>
  <done>所有 CRUD 操作都有效</done>
</task>
</tasks>

<verification>
- [ ] npm run build 成功
- [ ] API 端点正确响应
</verification>

<success_criteria>
- 所有任务已完成
- 用户功能端到端工作
</success_criteria>

<output>
完成后，创建 `.planning/phases/03-features/03-01-SUMMARY.md`
</output>
```

**带检查点的计划（非自主）：**

```markdown
---
phase: 03-features
plan: 03
type: execute
wave: 2
depends_on: ["03-01", "03-02"]
files_modified: [src/components/Dashboard.tsx]
autonomous: false
---

<objective>
构建带有视觉验证的仪表板。

目的：将用户和产品功能集成到统一视图中。
输出：工作的仪表板组件。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
@~/.claude/get-shit-done/references/checkpoints.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/03-features/03-01-SUMMARY.md
@.planning/phases/03-features/03-02-SUMMARY.md
</context>

<tasks>
<task type="auto">
  <name>任务 1：构建仪表板布局</name>
  <files>src/components/Dashboard.tsx</files>
  <action>使用 UserList 和 ProductList 组件创建响应式网格。使用 Tailwind 进行样式设置。</action>
  <verify>npm run build 成功</verify>
  <done>仪表板无错误渲染</done>
</task>

<!-- 检查点模式：Claude 启动服务器，用户访问 URL。有关完整模式，请参阅 checkpoints.md。 -->
<task type="auto">
  <name>启动开发服务器</name>
  <action>在后台运行 `npm run dev`，等待就绪</action>
  <verify>curl localhost:3000 返回 200</verify>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>仪表板 - 服务器位于 http://localhost:3000</what-built>
  <how-to-verify>访问 localhost:3000/dashboard。检查：桌面网格、移动堆叠、无滚动问题。</how-to-verify>
  <resume-signal>输入 "approved" 或描述问题</resume-signal>
</task>
</tasks>

<verification>
- [ ] npm run build 成功
- [ ] 视觉验证通过
</verification>

<success_criteria>
- 所有任务已完成
- 用户批准视觉布局
</success_criteria>

<output>
完成后，创建 `.planning/phases/03-features/03-03-SUMMARY.md`
</output>
```

---

## 反模式

**不良：反射性依赖链接**
```yaml
depends_on: ["03-01"]  # 只因为 01 在 02 之前
```

**不良：水平层分组**
```
计划 01：所有模型
计划 02：所有 API（依赖于 01）
计划 03：所有 UI（依赖于 02）
```

**不良：缺少自主标志**
```yaml
# 有检查点但没有 autonomous: false
depends_on: []
files_modified: [...]
# autonomous: ???  <- 缺失！
```

**不良：模糊的任务**
```xml
<task type="auto">
  <name>设置身份验证</name>
  <action>向应用添加身份验证</action>
</task>
```

---

## 指南

- 始终使用 XML 结构以便 Claude 解析
- 在每个计划中包括 `wave`、`depends_on`、`files_modified`、`autonomous`
- 优先选择垂直切片而非水平层
- 仅在真正需要时引用先前的 SUMMARY
- 将检查点与相关的自动任务分组在同一计划中
- 每个计划 2-3 个任务，最多约 50% 上下文

---

## 用户设置（外部服务）

当计划引入需要人工配置的外部服务时，在前置元数据中声明：

```yaml
user_setup:
  - service: stripe
    why: "支付处理需要 API 密钥"
    env_vars:
      - name: STRIPE_SECRET_KEY
        source: "Stripe 控制台 → 开发者 → API 密钥 → 密钥"
      - name: STRIPE_WEBHOOK_SECRET
        source: "Stripe 控制台 → 开发者 → Webhooks → 签名密钥"
    dashboard_config:
      - task: "创建 webhook 端点"
        location: "Stripe 控制台 → 开发者 → Webhooks → 添加端点"
        details: "URL: https://[your-domain]/api/webhooks/stripe"
    local_dev:
      - "stripe listen --forward-to localhost:3000/api/webhooks/stripe"
```

**自动化优先规则：** `user_setup` 仅包含 Claude 字面上无法做的事情：
- 账户创建（需要人工注册）
- 密钥检索（需要控制台访问）
- 控制台配置（需要浏览器中的人工操作）

**不包括：** 包安装、代码更改、文件创建、Claude 可以运行的 CLI 命令。

**结果：** Execute-plan 为用户生成带有检查清单的 `{phase}-USER-SETUP.md`。

有关完整架构和示例，请参阅 `~/.claude/get-shit-done/templates/user-setup.md`

---

## Must-Haves（目标反向验证）

`must_haves` 字段定义了阶段目标实现必须为真的内容。在规划期间派生，执行后验证。

**结构：**

```yaml
must_haves:
  truths:
    - "用户可以看到现有消息"
    - "用户可以发送消息"
    - "消息在刷新之间持久化"
  artifacts:
    - path: "src/components/Chat.tsx"
      provides: "消息列表渲染"
      min_lines: 30
    - path: "src/app/api/chat/route.ts"
      provides: "消息 CRUD 操作"
      exports: ["GET", "POST"]
    - path: "prisma/schema.prisma"
      provides: "消息模型"
      contains: "model Message"
  key_links:
    - from: "src/components/Chat.tsx"
      to: "/api/chat"
      via: "useEffect 中的 fetch"
      pattern: "fetch.*api/chat"
    - from: "src/app/api/chat/route.ts"
      to: "prisma.message"
      via: "数据库查询"
      pattern: "prisma\\.message\\.(find|create)"
```

**字段描述：**

| 字段 | 目的 |
|-------|---------|
| `truths` | 用户视角的可观察行为。每个必须可测试。 |
| `artifacts` | 必须存在真实实现的文件。 |
| `artifacts[].path` | 相对于项目根目录的文件路径。 |
| `artifacts[].provides` | 此制品提供的内容。 |
| `artifacts[].min_lines` | 可选。被认为是实质性的最小行数。 |
| `artifacts[].exports` | 可选。预期要验证的导出。 |
| `artifacts[].contains` | 可选。文件中必须存在的模式。 |
| `key_links` | 制品之间的关键连接。 |
| `key_links[].from` | 源制品。 |
| `key_links[].to` | 目标制品或端点。 |
| `key_links[].via` | 它们如何连接（描述）。 |
| `key_links[].pattern` | 可选。验证连接存在的正则表达式。 |

**为什么这很重要：**

任务完成 ≠ 目标实现。任务"创建聊天组件"可以通过创建占位符来完成。`must_haves` 字段捕获必须实际工作的内容，使验证能够在问题复合之前发现差距。

**验证流程：**

1. Plan-phase 从阶段目标派生 must_haves（目标反向）
2. Must_haves 写入 PLAN.md 前置元数据
3. Execute-phase 运行所有计划
4. 验证子代理根据代码库检查 must_haves
5. 发现差距 → 创建修复计划 → 执行 → 重新验证
6. 所有 must_haves 通过 → 阶段完成

有关验证逻辑，请参阅 `~/.claude/get-shit-done/workflows/verify-phase.md`。
