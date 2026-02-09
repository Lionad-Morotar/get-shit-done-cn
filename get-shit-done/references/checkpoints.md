<overview>
计划自动执行。检查点(checkpoint)形式化交互点,在这些点需要人工验证或决策。

**核心原则:** Claude 通过 CLI/API 自动化所有操作。检查点用于验证和决策,而非手动工作。

**黄金规则:**
1. **如果 Claude 可以运行它,Claude 就运行它** - 永远不要要求用户执行 CLI 命令、启动服务器或运行构建
2. **Claude 设置验证环境** - 启动开发服务器、填充数据库、配置环境变量
3. **用户只执行需要人类判断的操作** - 视觉检查、UX 评估、"这感觉对吗?"
4. **密钥来自用户,自动化来自 Claude** - 询问 API 密钥,然后 Claude 通过 CLI 使用它们
</overview>

<checkpoint_types>

<type name="human-verify">
## checkpoint:human-verify (最常见 - 90%)

**何时使用:** Claude 完成了自动化工作,人类确认它正确工作。

**用于:**
- 视觉 UI 检查(布局、样式、响应式)
- 交互流程(点击向导、测试用户流程)
- 功能验证(功能按预期工作)
- 音频/视频播放质量
- 动画流畅度
- 无障碍测试

**结构:**
```xml
<task type="checkpoint:human-verify" gate="blocking">
  <what-built>[Claude 自动化并部署/构建的内容]</what-built>
  <how-to-verify>
    [测试的确切步骤 - URL、命令、预期行为]
  </how-to-verify>
  <resume-signal>[如何继续 - "approved"、"yes" 或描述问题]</resume-signal>
</task>
```

**示例: UI 组件(展示关键模式:Claude 在检查点之前启动服务器)**
```xml
<task type="auto">
  <name>构建响应式仪表板布局</name>
  <files>src/components/Dashboard.tsx, src/app/dashboard/page.tsx</files>
  <action>创建带有侧边栏、头部和内容区域的仪表板。使用 Tailwind 响应式类适配移动端。</action>
  <verify>npm run build 成功,无 TypeScript 错误</verify>
  <done>仪表板组件构建无错误</done>
</task>

<task type="auto">
  <name>启动开发服务器用于验证</name>
  <action>在后台运行 `npm run dev`,等待"ready"消息,捕获端口</action>
  <verify>curl http://localhost:3000 返回 200</verify>
  <done>开发服务器运行于 http://localhost:3000</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>响应式仪表板布局 - 开发服务器运行于 http://localhost:3000</what-built>
  <how-to-verify>
    访问 http://localhost:3000/dashboard 并验证:
    1. 桌面(>1024px):侧边栏在左,内容在右,头部在顶
    2. 平板(768px):侧边栏折叠为汉堡菜单
    3. 移动(375px):单列布局,底部导航出现
    4. 任何尺寸无布局偏移或横向滚动
  </how-to-verify>
  <resume-signal>输入 "approved" 或描述布局问题</resume-signal>
</task>
```

**示例: Xcode 构建**
```xml
<task type="auto">
  <name>使用 Xcode 构建 macOS 应用</name>
  <files>App.xcodeproj, Sources/</files>
  <action>运行 `xcodebuild -project App.xcodeproj -scheme App build`。检查输出中的编译错误。</action>
  <verify>构建输出包含 "BUILD SUCCEEDED",无错误</verify>
  <done>应用成功构建</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>已构建的 macOS 应用位于 DerivedData/Build/Products/Debug/App.app</what-built>
  <how-to-verify>
    打开 App.app 并测试:
    - 应用无崩溃启动
    - 菜单栏图标出现
    - 偏好窗口正确打开
    - 无视觉故障或布局问题
  </how-to-verify>
  <resume-signal>输入 "approved" 或描述问题</resume-signal>
</task>
```
</type>

<type name="decision">
## checkpoint:decision (9%)

**何时使用:** 人类必须做出影响实现方向的选择。

**用于:**
- 技术选择(哪个认证提供商、哪个数据库)
- 架构决策(monorepo vs 独立仓库)
- 设计选择(配色方案、布局方法)
- 功能优先级(构建哪个变体)
- 数据模型决策(模式结构)

**结构:**
```xml
<task type="checkpoint:decision" gate="blocking">
  <decision>[要决定的内容]</decision>
  <context>[为什么这个决策很重要]</context>
  <options>
    <option id="option-a">
      <name>[选项名称]</name>
      <pros>[优点]</pros>
      <cons>[权衡]</cons>
    </option>
    <option id="option-b">
      <name>[选项名称]</name>
      <pros>[优点]</pros>
      <cons>[权衡]</cons>
    </option>
  </options>
  <resume-signal>[如何指示选择]</resume-signal>
</task>
```

**示例: 认证提供商选择**
```xml
<task type="checkpoint:decision" gate="blocking">
  <decision>选择认证提供商</decision>
  <context>
    应用需要用户认证。三个可靠的选项,各有不同的权衡。
  </context>
  <options>
    <option id="supabase">
      <name>Supabase Auth</name>
      <pros>与我们要用的 Supabase DB 内置集成,慷慨的免费层,行级安全集成</pros>
      <cons>UI 可定制性较差,绑定 Supabase 生态系统</cons>
    </option>
    <option id="clerk">
      <name>Clerk</name>
      <pros>漂亮的预制 UI,最佳开发体验,优秀的文档</pros>
      <cons>10k MAU 后付费,厂商锁定</cons>
    </option>
    <option id="nextauth">
      <name>NextAuth.js</name>
      <pros>免费,自托管,最大控制,广泛采用</pros>
      <cons>更多设置工作,你管理安全更新,UI 需要自己构建</cons>
    </option>
  </options>
  <resume-signal>选择: supabase, clerk, 或 nextauth</resume-signal>
</task>
```

**示例: 数据库选择**
```xml
<task type="checkpoint:decision" gate="blocking">
  <decision>为用户数据选择数据库</decision>
  <context>
    应用需要用户、会话和用户生成内容的持久存储。
    预期规模:10k 用户,第一年 100万记录。
  </context>
  <options>
    <option id="supabase">
      <name>Supabase (Postgres)</name>
      <pros>完整的 SQL,慷慨的免费层,内置认证,实时订阅</pros>
      <cons>实时功能厂商锁定,不如原生 Postgres 灵活</cons>
    </option>
    <option id="planetscale">
      <name>PlanetScale (MySQL)</name>
      <pros>无服务器扩展,分支工作流,优秀的 DX</pros>
      <cons>是 MySQL 而非 Postgres,免费层无外键</cons>
    </option>
    <option id="convex">
      <name>Convex</name>
      <pros>默认实时,TypeScript 原生,自动缓存</pros>
      <cons>较新平台,不同的思维模型,SQL 灵活性较低</cons>
    </option>
  </options>
  <resume-signal>选择: supabase, planetscale, 或 convex</resume-signal>
</task>
```
</type>

<type name="human-action">
## checkpoint:human-action (1% - 罕见)

**何时使用:** 操作没有 CLI/API 且需要仅人类的交互,或 Claude 在自动化期间遇到认证网关。

**仅用于:**
- **认证网关** - Claude 尝试了 CLI/API 但需要凭据(这不是失败)
- 邮箱验证链接(点击邮件)
- 短信 2FA 验证码(手机验证)
- 手动账户审批(平台需要人工审核)
- 信用卡 3D Secure 流程(基于 Web 的支付授权)
- OAuth 应用审批(基于 Web 的审批)

**不要用于预计划的手动工作:**
- 部署(使用 CLI - 如需要则认证网关)
- 创建 webhook/数据库(使用 API/CLI - 如需要则认证网关)
- 运行构建/测试(使用 Bash 工具)
- 创建文件(使用 Write 工具)

**结构:**
```xml
<task type="checkpoint:human-action" gate="blocking">
  <action>[人类必须做什么 - Claude 已经自动化了所有可自动化的内容]</action>
  <instructions>
    [Claude 已经自动化的内容]
    [一件需要人类操作的事情]
  </instructions>
  <verification>[Claude 之后可以检查的内容]</verification>
  <resume-signal>[如何继续]</resume-signal>
</task>
```

**示例: 邮箱验证**
```xml
<task type="auto">
  <name>通过 API 创建 SendGrid 账户</name>
  <action>使用 SendGrid API 创建带有提供邮箱的子用户账户。请求验证邮件。</action>
  <verify>API 返回 201,账户已创建</verify>
  <done>账户已创建,验证邮件已发送</done>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <action>完成 SendGrid 账户的邮箱验证</action>
  <instructions>
    我创建了账户并请求了验证邮件。
    检查你的收件箱中是否有 SendGrid 验证链接并点击它。
  </instructions>
  <verification>SendGrid API 密钥有效:curl 测试成功</verification>
  <resume-signal>邮箱验证后输入 "done"</resume-signal>
</task>
```

**示例: 认证网关(动态检查点)**
```xml
<task type="auto">
  <name>部署到 Vercel</name>
  <files>.vercel/, vercel.json</files>
  <action>运行 `vercel --yes` 部署</action>
  <verify>vercel ls 显示部署,curl 返回 200</verify>
</task>

<!-- 如果 vercel 返回 "Error: Not authenticated",Claude 动态创建检查点 -->

<task type="checkpoint:human-action" gate="blocking">
  <action>验证 Vercel CLI 以便我继续部署</action>
  <instructions>
    我尝试部署但遇到认证错误。
    运行: vercel login
    这将打开你的浏览器 - 完成认证流程。
  </instructions>
  <verification>vercel whoami 返回你的账户邮箱</verification>
  <resume-signal>认证后输入 "done"</resume-signal>
</task>

<!-- 认证后,Claude 重试部署 -->

<task type="auto">
  <name>重试 Vercel 部署</name>
  <action>运行 `vercel --yes`(现已认证)</action>
  <verify>vercel ls 显示部署,curl 返回 200</verify>
</task>
```

**关键区别:** 认证网关是 Claude 遇到认证错误时动态创建的。不是预计划的 — Claude 先自动化,仅在受阻时请求凭据。
</type>
</checkpoint_types>

<execution_protocol>

当 Claude 遇到 `type="checkpoint:*"` 时:

1. **立即停止** - 不要继续下一个任务
2. **清晰显示检查点** 使用下面的格式
3. **等待用户响应** - 不要臆造完成
4. **尽可能验证** - 检查文件、运行测试、任何指定的内容
5. **恢复执行** - 仅在确认后继续下一个任务

**对于 checkpoint:human-verify:**
```
╔═══════════════════════════════════════════════════════╗
║  CHECKPOINT: 需要验证                                ║
╚═══════════════════════════════════════════════════════╝

进度: 5/8 任务完成
任务: 响应式仪表板布局

已构建: /dashboard 处的响应式仪表板

如何验证:
  1. 访问: http://localhost:3000/dashboard
  2. 桌面(>1024px): 侧边栏可见,内容填充剩余空间
  3. 平板(768px): 侧边栏折叠为图标
  4. 移动(375px): 侧边栏隐藏,出现汉堡菜单

────────────────────────────────────────────────────────
→ 你的操作: 输入 "approved" 或描述问题
────────────────────────────────────────────────────────
```

**对于 checkpoint:decision:**
```
╔═══════════════════════════════════════════════════════╗
║  CHECKPOINT: 需要决策                                ║
╚═══════════════════════════════════════════════════════╝

进度: 2/6 任务完成
任务: 选择认证提供商

决策: 我们应该使用哪个认证提供商?

上下文: 需要用户认证。三个选项各有不同权衡。

选项:
  1. supabase - 与我们的 DB 内置,免费层
     优点: 行级安全集成,慷慨的免费层
     缺点: UI 可定制性较差,生态系统锁定

  2. clerk - 最佳 DX,10k 用户后付费
     优点: 漂亮的预制 UI,优秀的文档
     缺点: 厂商锁定,规模定价

  3. nextauth - 自托管,最大控制
     优点: 免费,无厂商锁定,广泛采用
     缺点: 更多设置工作,DIY 安全更新

────────────────────────────────────────────────────────
→ 你的操作: 选择 supabase, clerk, 或 nextauth
────────────────────────────────────────────────────────
```

**对于 checkpoint:human-action:**
```
╔═══════════════════════════════════════════════════════╗
║  CHECKPOINT: 需要操作                                ║
╚═══════════════════════════════════════════════════════╝

进度: 3/8 任务完成
任务: 部署到 Vercel

尝试: vercel --yes
错误: 未认证。请运行 'vercel login'

你需要做什么:
  1. 运行: vercel login
  2. 打开时完成浏览器认证
  3. 完成后返回这里

我将验证: vercel whoami 返回你的账户

────────────────────────────────────────────────────────
→ 你的操作: 认证后输入 "done"
────────────────────────────────────────────────────────
```
</execution_protocol>

<authentication_gates>

**认证网关 = Claude 尝试了 CLI/API,得到认证错误。** 不是失败 — 一个需要人类输入来解除的网关。

**模式:** Claude 尝试自动化 → 认证错误 → 创建 checkpoint:human-action → 用户认证 → Claude 重试 → 继续

**网关协议:**
1. 认识到这不是失败 - 缺少认证是预期的
2. 停止当前任务 - 不要重复重试
3. 动态创建 checkpoint:human-action
4. 提供确切的认证步骤
5. 验证认证有效
6. 重试原始任务
7. 正常继续

**关键区别:**
- 预计划的检查点:"我需要你做 X"(错误 - Claude 应该自动化)
- 认证网关:"我尝试自动化 X 但需要凭据"(正确 - 解除自动化阻塞)

</authentication_gates>

<automation_reference>

**规则:** 如果它有 CLI/API,Claude 就做它。永远不要要求人类执行可自动化的工作。

## 服务 CLI 参考

| 服务 | CLI/API | 关键命令 | 认证网关 |
|---------|---------|--------------|-----------|
| Vercel | `vercel` | `--yes`, `env add`, `--prod`, `ls` | `vercel login` |
| Railway | `railway` | `init`, `up`, `variables set` | `railway login` |
| Fly | `fly` | `launch`, `deploy`, `secrets set` | `fly auth login` |
| Stripe | `stripe` + API | `listen`, `trigger`, API 调用 | .env 中的 API 密钥 |
| Supabase | `supabase` | `init`, `link`, `db push`, `gen types` | `supabase login` |
| Upstash | `upstash` | `redis create`, `redis get` | `upstash auth login` |
| PlanetScale | `pscale` | `database create`, `branch create` | `pscale auth login` |
| GitHub | `gh` | `repo create`, `pr create`, `secret set` | `gh auth login` |
| Node | `npm`/`pnpm` | `install`, `run build`, `test`, `run dev` | 不适用 |
| Xcode | `xcodebuild` | `-project`, `-scheme`, `build`, `test` | 不适用 |
| Convex | `npx convex` | `dev`, `deploy`, `env set`, `env get` | `npx convex login` |

## 环境变量自动化

**环境文件:** 使用 Write/Edit 工具。永远不要要求人类手动创建 .env。

**通过 CLI 的仪表板环境变量:**

| 平台 | CLI 命令 | 示例 |
|----------|-------------|---------|
| Convex | `npx convex env set` | `npx convex env set OPENAI_API_KEY sk-...` |
| Vercel | `vercel env add` | `vercel env add STRIPE_KEY production` |
| Railway | `railway variables set` | `railway variables set API_KEY=value` |
| Fly | `fly secrets set` | `fly secrets set DATABASE_URL=...` |
| Supabase | `supabase secrets set` | `supabase secrets set MY_SECRET=value` |

**密钥收集模式:**
```xml
<!-- 错误:要求用户在仪表板中添加环境变量 -->
<task type="checkpoint:human-action">
  <action>将 OPENAI_API_KEY 添加到 Convex 仪表板</action>
  <instructions>访问 dashboard.convex.dev → Settings → Environment Variables → Add</instructions>
</task>

<!-- 正确:Claude 询问值,然后通过 CLI 添加 -->
<task type="checkpoint:human-action">
  <action>提供你的 OpenAI API 密钥</action>
  <instructions>
    我需要你的 OpenAI API 密钥用于 Convex 后端。
    从以下地址获取: https://platform.openai.com/api-keys
    粘贴密钥(以 sk- 开头)
  </instructions>
  <verification>我将通过 `npx convex env set` 添加并验证</verification>
  <resume-signal>粘贴你的 API 密钥</resume-signal>
</task>

<task type="auto">
  <name>在 Convex 中配置 OpenAI 密钥</name>
  <action>运行 `npx convex env set OPENAI_API_KEY {用户提供的密钥}`</action>
  <verify>`npx convex env get OPENAI_API_KEY` 返回密钥(已掩码)</verify>
</task>
```

## 开发服务器自动化

| 框架 | 启动命令 | 就绪信号 | 默认 URL |
|-----------|---------------|--------------|-------------|
| Next.js | `npm run dev` | "Ready in" 或 "started server" | http://localhost:3000 |
| Vite | `npm run dev` | "ready in" | http://localhost:5173 |
| Convex | `npx convex dev` | "Convex functions ready" | 不适用(仅后端) |
| Express | `npm start` | "listening on port" | http://localhost:3000 |
| Django | `python manage.py runserver` | "Starting development server" | http://localhost:8000 |

**服务器生命周期:**
```bash
# 在后台运行,捕获 PID
npm run dev &
DEV_SERVER_PID=$!

# 等待就绪(最多 30s)
timeout 30 bash -c 'until curl -s localhost:3000 > /dev/null 2>&1; do sleep 1; done'
```

**端口冲突:** 杀死停滞进程(`lsof -ti:3000 | xargs kill`)或使用备用端口(`--port 3001`)。

**服务器保持运行**通过检查点。仅在计划完成、切换到生产或不同服务需要端口时才杀死。

## CLI 安装处理

| CLI | 自动安装? | 命令 |
|-----|---------------|---------|
| npm/pnpm/yarn | 否 - 询问用户 | 用户选择包管理器 |
| vercel | 是 | `npm i -g vercel` |
| gh (GitHub) | 是 | `brew install gh` (macOS) 或 `apt install gh` (Linux) |
| stripe | 是 | `npm i -g stripe` |
| supabase | 是 | `npm i -g supabase` |
| convex | 否 - 使用 npx | `npx convex`(无需安装) |
| fly | 是 | `brew install flyctl` 或 curl 安装程序 |
| railway | 是 | `npm i -g @railway/cli` |

**协议:** 尝试命令 → "command not found" → 可自动安装? → 是:静默安装,重试 → 否:创建检查点要求用户安装。

## 检查点前的自动化失败

| 失败 | 响应 |
|---------|----------|
| 服务器无法启动 | 检查错误,修复问题,重试(不要继续检查点) |
| 端口被占用 | 杀死停滞进程或使用备用端口 |
| 缺少依赖 | 运行 `npm install`,重试 |
| 构建错误 | 首先修复错误(bug,不是检查点问题) |
| 认证错误 | 创建认证网关检查点 |
| 网络超时 | 用退避重试,如果持续则检查点 |

**永远不要呈现带有损坏验证环境的检查点。** 如果 `curl localhost:3000` 失败,不要要求用户"访问 localhost:3000"。

```xml
<!-- 错误:带有损坏环境的检查点 -->
<task type="checkpoint:human-verify">
  <what-built>仪表板(服务器启动失败)</what-built>
  <how-to-verify>访问 http://localhost:3000...</how-to-verify>
</task>

<!-- 正确:先修复,然后检查点 -->
<task type="auto">
  <name>修复服务器启动问题</name>
  <action>调查错误,修复根本原因,重启服务器</action>
  <verify>curl http://localhost:3000 返回 200</verify>
</task>

<task type="checkpoint:human-verify">
  <what-built>仪表板 - 服务器运行于 http://localhost:3000</what-built>
  <how-to-verify>访问 http://localhost:3000/dashboard...</how-to-verify>
</task>
```

## 可自动化快速参考

| 操作 | 可自动化? | Claude 做吗? |
|--------|--------------|-----------------|
| 部署到 Vercel | 是 (`vercel`) | 是 |
| 创建 Stripe webhook | 是 (API) | 是 |
| 写 .env 文件 | 是 (Write 工具) | 是 |
| 创建 Upstash DB | 是 (`upstash`) | 是 |
| 运行测试 | 是 (`npm test`) | 是 |
| 启动开发服务器 | 是 (`npm run dev`) | 是 |
| 向 Convex 添加环境变量 | 是 (`npx convex env set`) | 是 |
| 向 Vercel 添加环境变量 | 是 (`vercel env add`) | 是 |
| 填充数据库 | 是 (CLI/API) | 是 |
| 点击邮箱验证链接 | 否 | 否 |
| 输入带 3DS 的信用卡 | 否 | 否 |
| 在浏览器中完成 OAuth | 否 | 否 |
| 视觉验证 UI 看起来正确 | 否 | 否 |
| 测试交互式用户流程 | 否 | 否 |

</automation_reference>

<writing_guidelines>

**应该:**
- 在检查点之前通过 CLI/API 自动化所有内容
- 具体:"访问 https://myapp.vercel.app" 而非"检查部署"
- 编号验证步骤
- 陈述预期结果:"你应该看到 X"
- 提供上下文:为什么这个检查点存在

**不应该:**
- 要求人类做 Claude 可以自动化的工作 ❌
- 假设知识:"配置常规设置" ❌
- 跳过步骤:"设置数据库"(太模糊) ❌
- 在一个检查点中混合多个验证 ❌

**放置:**
- **自动化完成后** - 而非在 Claude 做工作之前
- **UI 构建后** - 在声明阶段完成之前
- **依赖工作之前** - 实现之前的决策
- **集成点** - 配置外部服务之后

**错误放置:** 自动化之前 ❌ | 太频繁 ❌ | 太晚(依赖任务已经需要结果) ❌
</writing_guidelines>

<examples>

### 示例 1: 数据库设置(无需检查点)

```xml
<task type="auto">
  <name>创建 Upstash Redis 数据库</name>
  <files>.env</files>
  <action>
    1. 运行 `upstash redis create myapp-cache --region us-east-1`
    2. 从输出捕获连接 URL
    3. 写入 .env: UPSTASH_REDIS_URL={url}
    4. 用测试命令验证连接
  </action>
  <verify>
    - upstash redis list 显示数据库
    - .env 包含 UPSTASH_REDIS_URL
    - 测试连接成功
  </verify>
  <done>Redis 数据库已创建和配置</done>
</task>

<!-- 无需检查点 - Claude 自动化所有内容并通过编程验证 -->
```

### 示例 2: 完整认证流程(末尾单个检查点)

```xml
<task type="auto">
  <name>创建用户模式</name>
  <files>src/db/schema.ts</files>
  <action>使用 Drizzle ORM 定义 User、Session、Account 表</action>
  <verify>npm run db:generate 成功</verify>
</task>

<task type="auto">
  <name>创建认证 API 路由</name>
  <files>src/app/api/auth/[...nextauth]/route.ts</files>
  <action>使用 GitHub 提供商和 JWT 策略设置 NextAuth</action>
  <verify>TypeScript 编译,无错误</verify>
</task>

<task type="auto">
  <name>创建登录 UI</name>
  <files>src/app/login/page.tsx, src/components/LoginButton.tsx</files>
  <action>创建带有 GitHub OAuth 按钮的登录页面</action>
  <verify>npm run build 成功</verify>
</task>

<task type="auto">
  <name>启动开发服务器用于认证测试</name>
  <action>在后台运行 `npm run dev`,等待就绪信号</action>
  <verify>curl http://localhost:3000 返回 200</verify>
  <done>开发服务器运行于 http://localhost:3000</done>
</task>

<!-- 末尾的一个检查点验证完整流程 -->
<task type="checkpoint:human-verify" gate="blocking">
  <what-built>完整的认证流程 - 开发服务器运行于 http://localhost:3000</what-built>
  <how-to-verify>
    1. 访问: http://localhost:3000/login
    2. 点击 "Sign in with GitHub"
    3. 完成 GitHub OAuth 流程
    4. 验证: 重定向到 /dashboard,显示用户名
    5. 刷新页面: 会话持久化
    6. 点击注销: 会话清除
  </how-to-verify>
  <resume-signal>输入 "approved" 或描述问题</resume-signal>
</task>
```
</examples>

<anti_patterns>

### ❌ 错误:要求用户启动开发服务器

```xml
<task type="checkpoint:human-verify" gate="blocking">
  <what-built>仪表板组件</what-built>
  <how-to-verify>
    1. 运行: npm run dev
    2. 访问: http://localhost:3000/dashboard
    3. 检查布局正确
  </how-to-verify>
</task>
```

**为什么错误:** Claude 可以运行 `npm run dev`。用户应该只访问 URL,而不是执行命令。

### ✅ 正确:Claude 启动服务器,用户访问

```xml
<task type="auto">
  <name>启动开发服务器</name>
  <action>在后台运行 `npm run dev`</action>
  <verify>curl localhost:3000 返回 200</verify>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>仪表板位于 http://localhost:3000/dashboard(服务器运行中)</what-built>
  <how-to-verify>
    访问 http://localhost:3000/dashboard 并验证:
    1. 布局匹配设计
    2. 无控制台错误
  </how-to-verify>
</task>
```

### ❌ 错误:要求人类部署 / ✅ 正确:Claude 自动化

```xml
<!-- 错误:要求用户通过仪表板部署 -->
<task type="checkpoint:human-action" gate="blocking">
  <action>部署到 Vercel</action>
  <instructions>访问 vercel.com/new → Import repo → Click Deploy → Copy URL</instructions>
</task>

<!-- 正确:Claude 部署,用户验证 -->
<task type="auto">
  <name>部署到 Vercel</name>
  <action>运行 `vercel --yes`。捕获 URL。</action>
  <verify>vercel ls 显示部署,curl 返回 200</verify>
</task>

<task type="checkpoint:human-verify">
  <what-built>已部署到 {url}</what-built>
  <how-to-verify>访问 {url},检查主页加载</how-to-verify>
  <resume-signal>输入 "approved"</resume-signal>
</task>
```

### ❌ 错误:太多检查点 / ✅ 正确:单个检查点

```xml
<!-- 错误:每个任务后都有检查点 -->
<task type="auto">创建模式</task>
<task type="checkpoint:human-verify">检查模式</task>
<task type="auto">创建 API 路由</task>
<task type="checkpoint:human-verify">检查 API</task>
<task type="auto">创建 UI 表单</task>
<task type="checkpoint:human-verify">检查表单</task>

<!-- 正确:末尾一个检查点 -->
<task type="auto">创建模式</task>
<task type="auto">创建 API 路由</task>
<task type="auto">创建 UI 表单</task>

<task type="checkpoint:human-verify">
  <what-built>完整认证流程(模式 + API + UI)</what-built>
  <how-to-verify>测试完整流程:注册、登录、访问受保护页面</how-to-verify>
  <resume-signal>输入 "approved"</resume-signal>
</task>
```

### ❌ 错误:模糊的验证 / ✅ 正确:具体步骤

```xml
<!-- 错误 -->
<task type="checkpoint:human-verify">
  <what-built>仪表板</what-built>
  <how-to-verify>检查它工作</how-to-verify>
</task>

<!-- 正确 -->
<task type="checkpoint:human-verify">
  <what-built>响应式仪表板 - 服务器运行于 http://localhost:3000</what-built>
  <how-to-verify>
    访问 http://localhost:3000/dashboard 并验证:
    1. 桌面(>1024px): 侧边栏可见,内容区域填充剩余空间
    2. 平板(768px): 侧边栏折叠为图标
    3. 移动(375px): 侧边栏隐藏,头部出现汉堡菜单
    4. 任何尺寸无横向滚动
  </how-to-verify>
  <resume-signal>输入 "approved" 或描述布局问题</resume-signal>
</task>
```

### ❌ 错误:要求用户运行 CLI 命令

```xml
<task type="checkpoint:human-action">
  <action>运行数据库迁移</action>
  <instructions>运行: npx prisma migrate deploy && npx prisma db seed</instructions>
</task>
```

**为什么错误:** Claude 可以运行这些命令。用户永远不应该执行 CLI 命令。

### ❌ 错误:要求用户在服务之间复制值

```xml
<task type="checkpoint:human-action">
  <action>在 Stripe 中配置 webhook URL</action>
  <instructions>复制部署 URL → Stripe 仪表板 → Webhooks → 添加端点 → 复制密钥 → 添加到 .env</instructions>
</task>
```

**为什么错误:** Stripe 有一个 API。Claude 应该通过 API 创建 webhook 并直接写入 .env。

</anti_patterns>

<summary>

检查点形式化人在环中的验证和决策点,而非手动工作。

**黄金规则:** 如果 Claude 可以自动化它,Claude 必须自动化它。

**检查点优先级:**
1. **checkpoint:human-verify**(90%) - Claude 自动化所有内容,人类确认视觉/功能正确性
2. **checkpoint:decision**(9%) - 人类做出架构/技术选择
3. **checkpoint:human-action**(1%) - 真正无法避免的无 API/CLI 的手动步骤

**何时不使用检查点:**
- Claude 可以通过编程验证的事情(测试、构建)
- 文件操作(Claude 可以读取文件)
- 代码正确性(测试和静态分析)
- 任何可通过 CLI/API 自动化的事情
</summary>
