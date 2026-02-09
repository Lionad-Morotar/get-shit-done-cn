# 外部集成模板

`.planning/codebase/INTEGRATIONS.md` 的模板——捕获外部服务依赖项。

**目的：** 记录此代码库与哪些外部系统通信。重点关注"在我们的代码之外我们依赖什么。"

---

## 文件模板

```markdown
# 外部集成

**分析日期：** [YYYY-MM-DD]

## API 和外部服务

**支付处理：**
- [服务] - [用途：例如，"订阅计费、一次性支付"]
  - SDK/客户端：[例如，"stripe npm package v14.x"]
  - 认证：[例如，"STRIPE_SECRET_KEY env var 中的 API 密钥"]
  - 使用的端点：[例如，"checkout sessions、webhooks"]

**电子邮件/SMS：**
- [服务] - [用途：例如，"事务性电子邮件"]
  - SDK/客户端：[例如，"sendgrid/mail v8.x"]
  - 认证：[例如，"SENDGRID_API_KEY env var 中的 API 密钥"]
  - 模板：[例如，"在 SendGrid 仪表板中管理"]

**外部 API：**
- [服务] - [用途]
  - 集成方法：[例如，"通过 fetch 的 REST API"、"GraphQL 客户端"]
  - 认证：[例如，"AUTH_TOKEN env var 中的 OAuth2 令牌"]
  - 速率限制：[如适用]

## 数据存储

**数据库：**
- [类型/提供商] - [例如，"Supabase 上的 PostgreSQL"]
  - 连接：[例如，"通过 DATABASE_URL env var"]
  - 客户端：[例如，"Prisma ORM v5.x"]
  - 迁移：[例如，"migrations/ 中的 prisma migrate"]

**文件存储：**
- [服务] - [例如，"用于用户上传的 AWS S3"]
  - SDK/客户端：[例如，"@aws-sdk/client-s3"]
  - 认证：[例如，"AWS_* env var 中的 IAM 凭证"]
  - 存储桶：[例如，"prod-uploads、dev-uploads"]

**缓存：**
- [服务] - [例如，"用于会话存储的 Redis"]
  - 连接：[例如，"REDIS_URL env var"]
  - 客户端：[例如，"ioredis v5.x"]

## 认证和身份

**认证提供商：**
- [服务] - [例如，"Supabase Auth"、"Auth0"、"自定义 JWT"]
  - 实现：[例如，"Supabase 客户端 SDK"]
  - 令牌存储：[例如，"httpOnly cookies"、"localStorage"]
  - 会话管理：[例如，"JWT 刷新令牌"]

**OAuth 集成：**
- [提供商] - [例如，"用于登录的 Google OAuth"]
  - 凭证：[例如，"GOOGLE_CLIENT_ID、GOOGLE_CLIENT_SECRET"]
  - 范围：[例如，"email、profile"]

## 监控和可观察性

**错误跟踪：**
- [服务] - [例如，"Sentry"]
  - DSN：[例如，"SENTRY_DSN env var"]
  - 发布跟踪：[例如，"通过 SENTRY_RELEASE"]

**分析：**
- [服务] - [例如，"用于产品分析的 Mixpanel"]
  - 令牌：[例如，"MIXPANEL_TOKEN env var"]
  - 跟踪的事件：[例如，"用户操作、页面浏览"]

**日志：**
- [服务] - [例如，"CloudWatch"、"Datadog"、"无（仅 stdout）"]
  - 集成：[例如，"AWS Lambda 内置"]

## CI/CD 和部署

**托管：**
- [平台] - [例如，"Vercel"、"AWS Lambda"、"ECS 上的 Docker"]
  - 部署：[例如，"main 分支推送时自动"]
  - 环境变量：[例如，"在 Vercel 仪表板中配置"]

**CI 管道：**
- [服务] - [例如，"GitHub Actions"]
  - 工作流：[例如，"test.yml、deploy.yml"]
  - 密钥：[例如，"存储在 GitHub 存储库密钥中"]

## 环境配置

**开发：**
- 所需的 env var：[列出关键变量]
- 密钥位置：[例如，".env.local（gitignored）、1Password 保险库"]
- 模拟/存根服务：[例如，"Stripe 测试模式"、"本地 PostgreSQL"]

**预发布：**
- 特定环境的差异：[例如，"使用 staging Stripe 账户"]
- 数据：[例如，"单独的 staging 数据库"]

**生产：**
- 密钥管理：[例如，"Vercel 环境变量"]
- 故障转移/冗余：[例如，"多区域 DB 复制"]

## Webhook 和回调

**传入：**
- [服务] - [端点：例如，"/api/webhooks/stripe"]
  - 验证：[例如，"通过 stripe.webhooks.constructEvent 进行签名验证"]
  - 事件：[例如，"payment_intent.succeeded、customer.subscription.updated"]

**传出：**
- [服务] - [触发它的内容]
  - 端点：[例如，"用户注册时的外部 CRM webhook"]
  - 重试逻辑：[如适用]

---

*集成审计：[日期]*
*添加/删除外部服务时更新*
```

<good_examples>
```markdown
# 外部集成

**分析日期：** 2025-01-20

## API 和外部服务

**支付处理：**
- Stripe - 订阅计费和一次性课程支付
  - SDK/客户端：stripe npm package v14.8
  - 认证：STRIPE_SECRET_KEY env var 中的 API 密钥
  - 使用的端点：checkout sessions、customer portal、webhooks

**电子邮件/SMS：**
- SendGrid - 事务性电子邮件（收据、密码重置）
  - SDK/客户端：@sendgrid/mail v8.1
  - 认证：SENDGRID_API_KEY env var 中的 API 密钥
  - 模板：在 SendGrid 仪表板中管理（代码中的模板 ID）

**外部 API：**
- OpenAI API - 课程内容生成
  - 集成方法：通过 openai npm package v4.x 的 REST API
  - 认证：OPENAI_API_KEY env var 中的不记名令牌
  - 速率限制：3500 请求/分钟（第 3 层）

## 数据存储

**数据库：**
- Supabase 上的 PostgreSQL - 主数据存储
  - 连接：通过 DATABASE_URL env var
  - 客户端：Prisma ORM v5.8
  - 迁移：prisma/migrations/ 中的 prisma migrate

**文件存储：**
- Supabase Storage - 用户上传（个人资料图像、课程材料）
  - SDK/客户端：@supabase/supabase-js v2.x
  - 认证：SUPABASE_SERVICE_ROLE_KEY 中的服务角色密钥
  - 存储桶：avatars（公共）、course-materials（私有）

**缓存：**
- 当前无（所有数据库查询，无 Redis）

## 认证和身份

**认证提供商：**
- Supabase Auth - 电子邮件/密码 + OAuth
  - 实现：具有服务器端会话管理的 Supabase 客户端 SDK
  - 令牌存储：通过 @supabase/ssr 的 httpOnly cookies
  - 会话管理：由 Supabase 处理的 JWT 刷新令牌

**OAuth 集成：**
- Google OAuth - 社交登录
  - 凭证：GOOGLE_CLIENT_ID、GOOGLE_CLIENT_SECRET（Supabase 仪表板）
  - 范围：email、profile

## 监控和可观察性

**错误跟踪：**
- Sentry - 服务器和客户端错误
  - DSN：SENTRY_DSN env var
  - 发布跟踪：通过 SENTRY_RELEASE 的 Git 提交 SHA

**分析：**
- 无（计划：Mixpanel）

**日志：**
- Vercel 日志 - 仅 stdout/stderr
  - 保留：Pro 计划 7 天

## CI/CD 和部署

**托管：**
- Vercel - Next.js 应用托管
  - 部署：main 分支推送时自动
  - 环境变量：在 Vercel 仪表板中配置（同步到 .env.example）

**CI 管道：**
- GitHub Actions - 测试和类型检查
  - 工作流：.github/workflows/ci.yml
  - 密钥：无（仅公共存储库测试）

## 环境配置

**开发：**
- 所需的 env var：DATABASE_URL、NEXT_PUBLIC_SUPABASE_URL、NEXT_PUBLIC_SUPABASE_ANON_KEY
- 密钥位置：.env.local（gitignored），通过 1Password 保险库团队共享
- 模拟/存根服务：Stripe 测试模式、Supabase 本地开发项目

**预发布：**
- 使用单独的 Supabase staging 项目
- Stripe 测试模式
- 同一 Vercel 账户，不同环境

**生产：**
- 密钥管理：Vercel 环境变量
- 数据库：Supabase 生产项目，每日备份

## Webhook 和回调

**传入：**
- Stripe - /api/webhooks/stripe
  - 验证：通过 stripe.webhooks.constructEvent 进行签名验证
  - 事件：payment_intent.succeeded、customer.subscription.updated、customer.subscription.deleted

**传出：**
- 无

---

*集成审计：2025-01-20*
*添加/删除外部服务时更新*
```
</good_examples>

<guidelines>
**什么属于 INTEGRATIONS.md：**
- 代码与之通信的外部服务
- 认证模式（密钥所在位置，而不是密钥本身）
- 使用的 SDK 和客户端库
- 环境变量名称（而不是值）
- Webhook 端点和验证方法
- 数据库连接模式
- 文件存储位置
- 监控和日志记录服务

**什么不属于这里：**
- 实际的 API 密钥或密钥（绝不写入这些）
- 内部架构（那是 ARCHITECTURE.md）
- 代码模式（那是 PATTERNS.md）
- 技术选择（那是 STACK.md）
- 性能问题（那是 CONCERNS.md）

**填充此模板时：**
- 检查 .env.example 或 .env.template 以获取所需的 env var
- 查找 SDK 导入（stripe、@sendgrid/mail 等）
- 检查路由/端点中的 webhook 处理程序
- 注意密钥管理的位置（而不是密钥）
- 记录特定于环境的差异（dev/staging/prod）
- 包括每个服务的认证模式

**在以下情况下对阶段规划有用：**
- 添加新的外部服务集成
- 调试认证问题
- 理解应用程序外部的数据流
- 设置新环境
- 审计第三方依赖项
- 规划服务中断或迁移

**安全说明：**
记录密钥所在位置（env var、Vercel 仪表板、1Password），绝不是密钥本身。
</guidelines>
