# 用户设置模板

用于 `.planning/phases/XX-name/{phase}-USER-SETUP.md` 的模板 - Claude 无法自动化的需要人工配置的设置。

**目的：** 记录字面上需要人工操作的设置任务 - 账户创建、仪表板配置、秘密检索。Claude 尽可能自动执行所有操作；此文件仅捕获剩余的内容。

---

## 文件模板

```markdown
# 阶段 {X}: 需要用户设置

**生成时间：** [YYYY-MM-DD]
**阶段：** {phase-name}
**状态：** 未完成

完成这些项目以使集成正常工作。Claude 已尽可能自动化；这些项目需要人工访问外部仪表板/账户。

## 环境变量

| 状态 | 变量 | 来源 | 添加到 |
|--------|----------|--------|--------|
| [ ] | `ENV_VAR_NAME` | [服务仪表板 → 路径 → 到 → 值] | `.env.local` |
| [ ] | `ANOTHER_VAR` | [服务仪表板 → 路径 → 到 → 值] | `.env.local` |

## 账户设置

[仅在需要新账户创建时]

- [ ] **创建 [服务] 账户**
  - URL: [注册 URL]
  - 跳过条件：已有账户

## 仪表板配置

[仅在需要仪表板配置时]

- [ ] **[配置任务]**
  - 位置：[服务仪表板 → 路径 → 到 → 设置]
  - 设置为：[所需值或配置]
  - 注意：[任何重要详细信息]

## 验证

完成设置后，使用以下命令验证：

```bash
# [验证命令]
```

预期结果：
- [成功看起来像什么]

---

**完成所有项目后：** 在文件顶部将状态标记为"Complete"。
```

---

## 何时生成

当计划前置元数据包含 `user_setup` 字段时生成 `{phase}-USER-SETUP.md`。

**触发器：** PLAN.md 前置元数据中存在 `user_setup` 并且有项目。

**位置：** 与 PLAN.md 和 SUMMARY.md 相同的目录。

**时机：** 在 execute-plan.md 期间在任务完成后、创建 SUMMARY.md 之前生成。

---

## 前置元数据架构

在 PLAN.md 中，`user_setup` 声明人工所需的配置：

```yaml
user_setup:
  - service: stripe
    why: "支付处理需要 API 密钥"
    env_vars:
      - name: STRIPE_SECRET_KEY
        source: "Stripe Dashboard → Developers → API keys → Secret key"
      - name: STRIPE_WEBHOOK_SECRET
        source: "Stripe Dashboard → Developers → Webhooks → Signing secret"
    dashboard_config:
      - task: "创建 webhook 端点"
        location: "Stripe Dashboard → Developers → Webhooks → Add endpoint"
        details: "URL: https://[your-domain]/api/webhooks/stripe, Events: checkout.session.completed, customer.subscription.*"
    local_dev:
      - "运行：stripe listen --forward-to localhost:3000/api/webhooks/stripe"
      - "对本地测试使用 CLI 输出中的 webhook 密钥"
```

---

## 自动化优先规则

**USER-SETUP.md 仅包含 Claude 字面上无法做的事情。**

| Claude 可以做（不在 USER-SETUP 中） | Claude 不能做（→ USER-SETUP） |
|-----------------------------------|--------------------------------|
| `npm install stripe` | 创建 Stripe 账户 |
| 编写 webhook 处理程序代码 | 从仪表板获取 API 密钥 |
| 创建 `.env.local` 文件结构 | 复制实际的秘密值 |
| 运行 `stripe listen` | 通过浏览器 OAuth 认证 Stripe CLI |
| 配置 package.json | 访问外部服务仪表板 |
| 编写任何代码 | 从第三方系统检索秘密 |

**测试：** "这是否需要浏览器中的人类、访问 Claude 没有凭据的账户？"
- 是 → USER-SETUP.md
- 否 → Claude 自动执行

---

## 特定于服务的示例

<stripe_example>
```markdown
# 阶段 10: 需要用户设置

**生成时间：** 2025-01-14
**阶段：** 10-monetization
**状态：** 未完成

完成这些项目以使 Stripe 集成正常工作。

## 环境变量

| 状态 | 变量 | 来源 | 添加到 |
|--------|----------|--------|--------|
| [ ] | `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys → Secret key | `.env.local` |
| [ ] | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys → Publishable key | `.env.local` |
| [ ] | `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks → [endpoint] → Signing secret | `.env.local` |

## 账户设置

- [ ] **创建 Stripe 账户**（如果需要）
  - URL: https://dashboard.stripe.com/register
  - 跳过条件：已有 Stripe 账户

## 仪表板配置

- [ ] **创建 webhook 端点**
  - 位置：Stripe Dashboard → Developers → Webhooks → Add endpoint
  - 端点 URL: `https://[your-domain]/api/webhooks/stripe`
  - 要发送的事件：
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`

- [ ] **创建产品和价格**（如果使用订阅层）
  - 位置：Stripe Dashboard → Products → Add product
  - 创建每个订阅层
  - 复制 Price ID 到：
    - `STRIPE_STARTER_PRICE_ID`
    - `STRIPE_PRO_PRICE_ID`

## 本地开发

对于本地 webhook 测试：
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
使用 CLI 输出中的 webhook 签名密钥（以 `whsec_` 开头）。

## 验证

完成设置后：

```bash
# 检查是否设置了环境变量
grep STRIPE .env.local

# 验证构建通过
npm run build

# 测试 webhook 端点（应返回 400 错误签名，而不是 500 崩溃）
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{}'
```

预期：构建通过，webhook 返回 400（签名验证工作）。

---

**完成所有项目后：** 在文件顶部将状态标记为"Complete"。
```
</stripe_example>

<supabase_example>
```markdown
# 阶段 2: 需要用户设置

**生成时间：** 2025-01-14
**阶段：** 02-authentication
**状态：** 未完成

完成这些项目以使 Supabase Auth 正常工作。

## 环境变量

| 状态 | 变量 | 来源 | 添加到 |
|--------|----------|--------|--------|
| [ ] | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | `.env.local` |
| [ ] | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon public | `.env.local` |
| [ ] | `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role | `.env.local` |

## 账户设置

- [ ] **创建 Supabase 项目**
  - URL: https://supabase.com/dashboard/new
  - 跳过条件：已有此应用的项目

## 仪表板配置

- [ ] **启用电子邮件身份验证**
  - 位置：Supabase Dashboard → Authentication → Providers
  - 启用：电子邮件提供者
  - 配置：确认电子邮件（根据偏好开/关）

- [ ] **配置 OAuth 提供者**（如果使用社交登录）
  - 位置：Supabase Dashboard → Authentication → Providers
  - 对于 Google：从 Google Cloud Console 添加客户端 ID 和密钥
  - 对于 GitHub：从 GitHub OAuth Apps 添加客户端 ID 和密钥

## 验证

完成设置后：

```bash
# 检查环境变量
grep SUPABASE .env.local

# 验证连接（在项目目录中运行）
npx supabase status
```

---

**完成所有项目后：** 在文件顶部将状态标记为"Complete"。
```
</supabase_example>

<sendgrid_example>
```markdown
# 阶段 5: 需要用户设置

**生成时间：** 2025-01-14
**阶段：** 05-notifications
**状态：** 未完成

完成这些项目以使 SendGrid 电子邮件正常工作。

## 环境变量

| 状态 | 变量 | 来源 | 添加到 |
|--------|----------|--------|--------|
| [ ] | `SENDGRID_API_KEY` | SendGrid Dashboard → Settings → API Keys → Create API Key | `.env.local` |
| [ ] | `SENDGRID_FROM_EMAIL` | 您的验证发件人电子邮件地址 | `.env.local` |

## 账户设置

- [ ] **创建 SendGrid 账户**
  - URL: https://signup.sendgrid.com/
  - 跳过条件：已有账户

## 仪表板配置

- [ ] **验证发件人身份**
  - 位置：SendGrid Dashboard → Settings → Sender Authentication
  - 选项 1：单一发件人验证（快速，用于开发）
  - 选项 2：域身份验证（生产）

- [ ] **创建 API 密钥**
  - 位置：SendGrid Dashboard → Settings → API Keys → Create API Key
  - 权限：Restricted Access → Mail Send (Full Access)
  - 立即复制密钥（仅显示一次）

## 验证

完成设置后：

```bash
# 检查环境变量
grep SENDGRID .env.local

# 测试电子邮件发送（替换为您的测试电子邮件）
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your@email.com"}'
```

---

**完成所有项目后：** 在文件顶部将状态标记为"Complete"。
```
</sendgrid_example>

---

## 指南

**从不包括：** 实际的秘密值。Claude 可以自动执行的步骤（包安装、代码更改）。

**命名：** `{phase}-USER-SETUP.md` 匹配阶段编号模式。
**状态跟踪：** 用户在完成后标记复选框并更新状态行。
**可搜索性：** `grep -r "USER-SETUP" .planning/` 查找所有具有用户要求的阶段。
