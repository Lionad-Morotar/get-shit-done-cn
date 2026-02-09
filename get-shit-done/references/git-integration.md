<overview>
GSD 框架的 Git 集成。
</overview>

<core_principle>

**提交结果,而非过程。**

git log 应该读起来像已交付内容的变更日志,而不是规划活动的日记。
</core_principle>

<commit_points>

| 事件                   | 提交? | 原因                                              |
| ----------------------- | ------- | ------------------------------------------------ |
| 创建 BRIEF + ROADMAP | 是     | 项目初始化                           |
| 创建 PLAN.md         | 否      | 中间产物 - 与计划完成一起提交       |
| 创建 RESEARCH.md     | 否      | 中间产物                                     |
| 创建 DISCOVERY.md    | 否      | 中间产物                                     |
| **任务完成**      | 是     | 原子工作单位(每个任务 1 次提交)         |
| **计划完成**      | 是     | 元数据提交(SUMMARY + STATE + ROADMAP)     |
| 创建交接文档         | 是     | 保留 WIP 状态                              |

</commit_points>

<git_check>

```bash
[ -d .git ] && echo "GIT_EXISTS" || echo "NO_GIT"
```

如果是 NO_GIT: 静默运行 `git init`。GSD 项目总是有自己的仓库。
</git_check>

<commit_formats>

<format name="initialization">
## 项目初始化(brief + roadmap 一起)

```
docs: initialize [项目名称] ([N] 个阶段)

[来自 PROJECT.md 的单行描述]

阶段:
1. [阶段名称]: [目标]
2. [阶段名称]: [目标]
3. [阶段名称]: [目标]
```

提交内容:

```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "docs: initialize [项目名称] ([N] 个阶段)" --files .planning/
```

</format>

<format name="task-completion">
## 任务完成(计划执行期间)

每个任务在完成后立即获得自己的提交。

```
{类型}({阶段}-{计划}): {任务名称}

- [关键更改 1]
- [关键更改 2]
- [关键更改 3]
```

**提交类型:**
- `feat` - 新功能/功能
- `fix` - Bug 修复
- `test` - 仅测试(TDD RED 阶段)
- `refactor` - 代码清理(TDD REFACTOR 阶段)
- `perf` - 性能改进
- `chore` - 依赖、配置、工具

**示例:**

```bash
# 标准任务
git add src/api/auth.ts src/types/user.ts
git commit -m "feat(08-02): create user registration endpoint

- POST /auth/register validates email and password
- 检查重复用户
- 成功时返回 JWT 令牌
"

# TDD 任务 - RED 阶段
git add src/__tests__/jwt.test.ts
git commit -m "test(07-02): add failing test for JWT generation

- 测试令牌包含用户 ID 声明
- 测试令牌在 1 小时后过期
- 测试签名验证
"

# TDD 任务 - GREEN 阶段
git add src/utils/jwt.ts
git commit -m "feat(07-02): implement JWT generation

- 使用 jose 库进行签名
- 包含用户 ID 和过期声明
- 使用 HS256 算法签名
"
```

</format>

<format name="plan-completion">
## 计划完成(所有任务完成后)

所有任务提交后,最后一次元数据提交捕获计划完成。

```
docs({阶段}-{计划}): complete [计划名称] plan

已完成任务: [N]/[N]
- [任务 1 名称]
- [任务 2 名称]
- [任务 3 名称]

SUMMARY: .planning/phases/XX-name/{阶段}-{计划}-SUMMARY.md
```

提交内容:

```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "docs({阶段}-{计划}): complete [计划名称] plan" --files .planning/phases/XX-name/{阶段}-{计划}-PLAN.md .planning/phases/XX-name/{阶段}-{计划}-SUMMARY.md .planning/STATE.md .planning/ROADMAP.md
```

**注意:** 代码文件不包含 - 已按任务提交。
</format>

<format name="handoff">
## 交接(WIP)

```
wip: [阶段名称] paused at task [X]/[Y]

当前: [任务名称]
[如被阻塞:] 阻塞: [原因]
```

提交内容:

```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "wip: [阶段名称] paused at task [X]/[Y]" --files .planning/
```

</format>
</commit_formats>

<example_log>

**旧方法(按计划提交):**
```
a7f2d1 feat(checkout): Stripe payments with webhook verification
3e9c4b feat(products): catalog with search, filters, and pagination
8a1b2c feat(auth): JWT with refresh rotation using jose
5c3d7e feat(foundation): Next.js 15 + Prisma + Tailwind scaffold
2f4a8d docs: initialize ecommerce-app (5 phases)
```

**新方法(按任务提交):**
```
# 阶段 04 - Checkout
1a2b3c docs(04-01): complete checkout flow plan
4d5e6f feat(04-01): add webhook signature verification
7g8h9i feat(04-01): implement payment session creation
0j1k2l feat(04-01): create checkout page component

# 阶段 03 - Products
3m4n5o docs(03-02): complete product listing plan
6p7q8r feat(03-02): add pagination controls
9s0t1u feat(03-02): implement search and filters
2v3w4x feat(03-01): create product catalog schema

# 阶段 02 - Auth
5y6z7a docs(02-02): complete token refresh plan
8b9c0d feat(02-02): implement refresh token rotation
1e2f3g test(02-02): add failing test for token refresh
4h5i6j docs(02-01): complete JWT setup plan
7k8l9m feat(02-01): add JWT generation and validation
0n1o2p chore(02-01): install jose library

# 阶段 01 - Foundation
3q4r5s docs(01-01): complete scaffold plan
6t7u8v feat(01-01): configure Tailwind and globals
9w0x1y feat(01-01): set up Prisma with database
2z3a4b feat(01-01): create Next.js 15 project

# 初始化
5c6d7e docs: initialize ecommerce-app (5 phases)
```

每个计划产生 2-4 次提交(任务 + 元数据)。清晰、可颗粒化、可二分查找。

</example_log>

<anti_patterns>

**仍然不要提交(中间产物):**
- PLAN.md 创建(与计划完成一起提交)
- RESEARCH.md(中间产物)
- DISCOVERY.md(中间产物)
- 次要规划调整
- "修复路线图中的拼写错误"

**要提交(结果):**
- 每个任务完成(feat/fix/test/refactor)
- 计划完成元数据(docs)
- 项目初始化(docs)

**关键原则:** 提交工作代码和已交付的结果,而非规划过程。

</anti_patterns>

<commit_strategy_rationale>

## 为什么按任务提交?

**AI 的上下文工程:**
- Git 历史成为未来 Claude 会话的主要上下文来源
- `git log --grep="{阶段}-{计划}"` 显示计划的所有工作
- `git diff <hash>^..<hash>` 显示每个任务的确切更改
- 减少对解析 SUMMARY.md 的依赖 = 更多实际工作的上下文

**故障恢复:**
- 任务 1 已提交 ✅,任务 2 失败 ❌
- 下一次会话中的 Claude: 看到任务 1 完成,可以重试任务 2
- 可以 `git reset --hard` 到上次成功的任务

**调试:**
- `git bisect` 查找确切失败的任务,而不仅仅是失败的计划
- `git blame` 将行追溯到特定任务上下文
- 每个提交都可独立回退

**可观察性:**
- 独立开发者 + Claude 工作流受益于颗粒化归因
- 原子提交是 Git 最佳实践
- "提交噪音"与消费者无关,因为消费者是 Claude,而不是人类

</commit_strategy_rationale>
