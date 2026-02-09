<purpose>
通过聚合阶段验证、检查跨阶段集成和评估需求覆盖率来验证里程碑是否达到其完成定义。读取现有的 VERIFICATION.md 文件（在 execute-phase 期间已验证的阶段），聚合技术债务和延迟的差距，然后生成集成检查器以进行跨阶段连接。
</purpose>

<required_reading>
在开始之前读取调用提示的 execution_context 引用的所有文件。
</required_reading>

<process>

## 0. 初始化里程碑上下文

```bash
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js init milestone-op)
```

从 init JSON 中提取：`milestone_version`、`milestone_name`、`phase_count`、`completed_phases`、`commit_docs`。

解析集成检查器模型：
```bash
CHECKER_MODEL=$(node ~/.claude/get-shit-done/bin/gsd-tools.js resolve-model gsd-integration-checker --raw)
```

## 1. 确定里程碑范围

```bash
# 获取里程碑中的阶段（按数字排序，处理小数）
node ~/.claude/get-shit-done/bin/gsd-tools.js phases list
```

- 从参数解析版本或从 ROADMAP.md 检测当前版本
- 识别范围内的所有阶段目录
- 从 ROADMAP.md 提取里程碑完成定义
- 从 REQUIREMENTS.md 提取映射到此里程碑的需求

## 2. 读取所有阶段验证

对于每个阶段目录，读取 VERIFICATION.md：

```bash
cat .planning/phases/01-*/*-VERIFICATION.md
cat .planning/phases/02-*/*-VERIFICATION.md
# 等等。
```

从每个 VERIFICATION.md 中提取：
- **状态：** passed | gaps_found
- **关键差距：**（如果有 — 这些是阻塞因素）
- **非关键差距：** 技术债务、延迟项目、警告
- **发现的反模式：** TODOs、存根、占位符
- **需求覆盖：** 哪些需求已满足/被阻塞

如果阶段缺少 VERIFICATION.md，将其标记为"未验证阶段" — 这是一个阻塞因素。

## 3. 生成集成检查器

收集阶段上下文后：

```
Task(
  prompt="检查跨阶段集成和端到端流程。

阶段：{phase_dirs}
阶段导出：{from SUMMARYs}
API 路由：{created routes}

验证跨阶段连接和端到端用户流程。",
  subagent_type="gsd-integration-checker",
  model="{integration_checker_model}"
)
```

## 4. 收集结果

组合：
- 阶段级别的差距和技术债务（来自步骤 2）
- 集成检查器的报告（连接差距、中断的流程）

## 5. 检查需求覆盖

对于 REQUIREMENTS.md 中映射到此里程碑的每个需求：
- 查找拥有阶段
- 检查阶段验证状态
- 确定：satisfied | partial | unsatisfied

## 6. 聚合到 v{version}-MILESTONE-AUDIT.md

创建 `.planning/v{version}-v{version}-MILESTONE-AUDIT.md`，包含：

```yaml
---
milestone: {version}
audited: {timestamp}
status: passed | gaps_found | tech_debt
scores:
  requirements: N/M
  phases: N/M
  integration: N/M
  flows: N/M
gaps:  # 关键阻塞因素
  requirements: [...]
  integration: [...]
  flows: [...]
tech_debt:  # 非关键、延迟
  - phase: 01-auth
    items:
      - "TODO: 添加速率限制"
      - "警告：无密码强度验证"
  - phase: 03-dashboard
    items:
      - "延迟：移动响应式布局"
---
```

加上完整的 markdown 报告，包含需求、阶段、集成、技术债务的表格。

**状态值：**
- `passed` — 所有需求已满足，无关键差距，最少技术债务
- `gaps_found` — 存在关键阻塞因素
- `tech_debt` — 无阻塞因素但累积的延迟项目需要审查

## 7. 展示结果

按状态路由（见 `<offer_next>`）。

</process>

<offer_next>
直接输出此 markdown（不是代码块）。基于状态路由：

---

**如果通过：**

## ✓ 里程碑 {version} — 审计通过

**得分：** {N}/{M} 个需求已满足
**报告：** .planning/v{version}-MILESTONE-AUDIT.md

所有需求已覆盖。跨阶段集成已验证。端到端流程完成。

───────────────────────────────────────────────────────────────

## ▶ 接下来

**完成里程碑** — 归档和标记

/gsd:complete-milestone {version}

<sub>/clear 首先 → 清空上下文窗口</sub>

───────────────────────────────────────────────────────────────

---

**如果发现差距：**

## ⚠ 里程碑 {version} — 发现差距

**得分：** {N}/{M} 个需求已满足
**报告：** .planning/v{version}-MILESTONE-AUDIT.md

### 未满足的需求

{对于每个未满足的需求：}
- **{REQ-ID}: {description}**（阶段 {X}）
  - {reason}

### 跨阶段问题

{对于每个集成差距：}
- **{from} → {to}:** {issue}

### 中断的流程

{对于每个流程差距：}
- **{flow name}:** 在 {step} 处中断

───────────────────────────────────────────────────────────────

## ▶ 接下来

**规划差距关闭** — 创建阶段以完成里程碑

/gsd:plan-milestone-gaps

<sub>/clear 首先 → 清空上下文窗口</sub>

───────────────────────────────────────────────────────────────

**也可用：**
- cat .planning/v{version}-MILESTONE-AUDIT.md — 查看完整报告
- /gsd:complete-milestone {version} — 无论如何继续（接受技术债务）

───────────────────────────────────────────────────────────────

---

**如果是技术债务（无阻塞因素但累积债务）：**

## ⚡ 里程碑 {version} — 技术债务审查

**得分：** {N}/{M} 个需求已满足
**报告：** .planning/v{version}-MILESTONE-AUDIT.md

所有需求已满足。无关键阻塞因素。累积的技术债务需要审查。

### 按阶段的技术债务

{对于有债务的每个阶段：}
**阶段 {X}: {name}**
- {item 1}
- {item 2}

### 总计：{N} 个项目跨 {M} 个阶段

───────────────────────────────────────────────────────────────

## ▶ 选项

**A. 完成里程碑** — 接受债务，在待办事项中跟踪

/gsd:complete-milestone {version}

**B. 规划清理阶段** — 完成前解决债务

/gsd:plan-milestone-gaps

<sub>/clear 首先 → 清空上下文窗口</sub>

───────────────────────────────────────────────────────────────
</offer_next>

<success_criteria>
- [ ] 里程碑范围已识别
- [ ] 所有阶段 VERIFICATION.md 文件已读取
- [ ] 技术债务和延迟的差距已聚合
- [ ] 集成检查器已生成以进行跨阶段连接
- [ ] v{version}-MILESTONE-AUDIT.md 已创建
- [ ] 结果已展示并可操作的下一步
</success_criteria>
