<purpose>
创建关闭 `/gsd:audit-milestone` 识别的差距所需的所有阶段。读取 MILESTONE-AUDIT.md，将差距分组为逻辑阶段，在 ROADMAP.md 中创建阶段条目，并提供规划每个阶段。一个命令创建所有修复阶段 — 无需手动为每个差距执行 `/gsd:add-phase`。
</purpose>

<required_reading>
在开始之前读取调用提示的 execution_context 引用的所有文件。
</required_reading>

<process>

## 1. 加载审计结果

```bash
# 查找最近的审计文件
ls -t .planning/v*-MILESTONE-AUDIT.md 2>/dev/null | head -1
```

解析 YAML 前置元数据以提取结构化差距：
- `gaps.requirements` — 未满足的需求
- `gaps.integration` — 缺少的跨阶段连接
- `gaps.flows` — 中断的端到端流程

如果不存在审计文件或没有差距，错误：
```
未发现审计差距。首先运行 `/gsd:audit-milestone`。
```

## 2. 差距优先级排序

根据 REQUIREMENTS.md 中的优先级对差距进行分组：

| 优先级 | 操作 |
|---------|---------|
| `must` | 创建阶段，阻塞里程碑 |
| `should` | 创建阶段，推荐 |
| `nice` | 询问用户：包括或推迟？ |

对于集成/流程差距，从受影响的需求推断优先级。

## 3. 将差距分组为阶段

将相关差距聚类为逻辑阶段：

**分组规则：**
- 相同的受影响阶段 → 合并为一个修复阶段
- 相同的子系统（auth、API、UI） → 合并
- 依赖顺序（在连接之前修复存根）
- 保持阶段专注：每个 2-4 个任务

**分组示例：**
```
差距：DASH-01 未满足（Dashboard 不获取）
差距：集成 阶段 1→3（Auth 未传递到 API 调用）
差距：流程"查看仪表板"在数据获取处中断

→ 阶段 6："将 Dashboard 连接到 API"
  - 向 Dashboard.tsx 添加 fetch
  - 在 fetch 中包含 auth 头
  - 处理响应，更新状态
  - 渲染用户数据
```

## 4. 确定阶段编号

查找最高的现有阶段：
```bash
# 获取排序的阶段列表，提取最后一个
PHASES=$(node ~/.claude/get-shit-done/bin/gsd-tools.js phases list)
HIGHEST=$(echo "$PHASES" | jq -r '.directories[-1]')
```

新阶段从那里继续：
- 如果阶段 5 是最高的，差距成为阶段 6、7、8...

## 5. 展示差距关闭计划

```markdown
## 差距关闭计划

**里程碑：** {version}
**要关闭的差距：** {N} 个需求、{M} 个集成、{K} 个流程

### 建议的阶段

**阶段 {N}：{Name}**
关闭：
- {REQ-ID}：{description}
- 集成：{from} → {to}
任务：{count}

**阶段 {N+1}：{Name}**
关闭：
- {REQ-ID}：{description}
- 流程：{flow name}
任务：{count}

{如果存在 nice-to-have 差距：}

### 已推迟（nice-to-have）

这些差距是可选的。包括它们吗？
- {gap description}
- {gap description}

---

创建这 {X} 个阶段？(yes / adjust / defer all optional)
```

等待用户确认。

## 6. 更新 ROADMAP.md

将新阶段添加到当前里程碑：

```markdown
### 阶段 {N}：{Name}
**目标：** {从正在关闭的差距派生}
**需求：** {正在满足的 REQ-IDs}
**差距关闭：** 关闭审计中的差距

### 阶段 {N+1}：{Name}
...
```

## 7. 创建阶段目录

```bash
mkdir -p ".planning/phases/{NN}-{name}"
```

## 8. 提交路线图更新

```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js commit "docs(roadmap): add gap closure phases {N}-{M}" --files .planning/ROADMAP.md
```

## 9. 提供下一步

```markdown
## ✓ 差距关闭阶段已创建

**已添加阶段：** {N} - {M}
**已解决的差距：** {count} 个需求、{count} 个集成、{count} 个流程

---

## ▶ 接下来

**规划第一个差距关闭阶段**

`/gsd:plan-phase {N}`

<sub>`/clear` 首先 → 清空上下文窗口</sub>

---

**也可用：**
- `/gsd:execute-phase {N}` — 如果计划已存在
- `cat .planning/ROADMAP.md` — 查看更新的路线图

---

**所有差距阶段完成后：**

`/gsd:audit-milestone` — 重新审计以验证差距已关闭
`/gsd:complete-milestone {version}` — 审计通过时归档
```

</process>

<gap_to_phase_mapping>

## 差距如何成为任务

**需求差距 → 任务：**
```yaml
gap:
  id: DASH-01
  description: "用户看到他们的数据"
  reason: "Dashboard 存在但不从 API 获取"
  missing:
    - "useEffect 和对 /api/user/data 的 fetch"
    - "用户数据的状态"
    - "在 JSX 中渲染用户数据"

becomes:

phase: "连接 Dashboard 数据"
tasks:
  - name: "添加数据获取"
    files: [src/components/Dashboard.tsx]
    action: "添加 useEffect，在挂载时获取 /api/user/data"

  - name: "添加状态管理"
    files: [src/components/Dashboard.tsx]
    action: "为 userData、loading、error 状态添加 useState"

  - name: "渲染用户数据"
    files: [src/components/Dashboard.tsx]
    action: "用 userData.map 渲染替换占位符"
```

**集成差距 → 任务：**
```yaml
gap:
  from_phase: 1
  to_phase: 3
  connection: "Auth 令牌 → API 调用"
  reason: "Dashboard API 调用不包括 auth 头"
  missing:
    - "fetch 调用中的 auth 头"
    - "401 上的令牌刷新"

becomes:

phase: "向 Dashboard API 调用添加 Auth"
tasks:
  - name: "向 fetches 添加 auth 头"
    files: [src/components/Dashboard.tsx, src/lib/api.ts]
    action: "在所有 API 调用中包含带有令牌的 Authorization 头"

  - name: "处理 401 响应"
    files: [src/lib/api.ts]
    action: "添加拦截器以刷新令牌或在 401 时重定向到登录"
```

**流程差距 → 任务：**
```yaml
gap:
  name: "用户在登录后查看仪表板"
  broken_at: "Dashboard 数据加载"
  reason: "无 fetch 调用"
  missing:
    - "在挂载时获取用户数据"
    - "显示加载状态"
    - "渲染用户数据"

becomes:

# 通常与需求/集成差距相同的阶段
# 流程差距经常与其他差距类型重叠
```

</gap_to_phase_mapping>

<success_criteria>
- [ ] 已加载 MILESTONE-AUDIT.md 并解析差距
- [ ] 差距已优先级排序（must/should/nice）
- [ ] 差距已分组为逻辑阶段
- [ ] 用户已确认阶段计划
- [ ] 已更新 ROADMAP.md 并带有新阶段
- [ ] 已创建阶段目录
- [ ] 更改已提交
- [ ] 用户知道接下来运行 `/gsd:plan-phase`
      </success_criteria>
