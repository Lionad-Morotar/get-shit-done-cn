# 里程碑归档模板

此模板由 complete-milestone 工作流使用，用于在 `.planning/milestones/` 中创建归档文件。

---

## 文件模板

# 里程碑 v{{VERSION}}: {{MILESTONE_NAME}}

**状态：** ✅ 已交付 {{DATE}}
**阶段：** {{PHASE_START}}-{{PHASE_END}}
**总计划数：** {{TOTAL_PLANS}}

## 概述

{{MILESTONE_DESCRIPTION}}

## 阶段

{{PHASES_SECTION}}

[对于此里程碑中的每个阶段，包括：]

### 阶段 {{PHASE_NUM}}: {{PHASE_NAME}}

**目标**: {{PHASE_GOAL}}
**依赖**: {{DEPENDS_ON}}
**计划**: {{PLAN_COUNT}} 个计划

计划：

- [x] {{PHASE}}-01: {{PLAN_DESCRIPTION}}
- [x] {{PHASE}}-02: {{PLAN_DESCRIPTION}}
      [... 所有计划 ...]

**详情：**
{{PHASE_DETAILS_FROM_ROADMAP}}

**对于小数阶段，包括（已插入）标记：**

### 阶段 2.1: 关键安全补丁（已插入）

**目标**: 修复身份验证绕过漏洞
**依赖**: 阶段 2
**计划**: 1 个计划

计划：

- [x] 02.1-01: 修复身份验证漏洞

**详情：**
{{PHASE_DETAILS_FROM_ROADMAP}}

---

## 里程碑摘要

**小数阶段：**

- 阶段 2.1: 关键安全补丁（在阶段 2 后插入以进行紧急修复）
- 阶段 5.1: 性能热修复（在阶段 5 后插入以修复生产问题）

**关键决策：**
{{DECISIONS_FROM_PROJECT_STATE}}
[示例：]

- 决策：使用 ROADMAP.md 拆分（原因：持续的上下文成本）
- 决策：小数阶段编号（原因：清晰的插入语义）

**已解决问题：**
{{ISSUES_RESOLVED_DURING_MILESTONE}}
[示例：]

- 修复了 100+ 阶段时的上下文溢出
- 解决了阶段插入混乱

**延迟问题：**
{{ISSUES_DEFERRED_TO_LATER}}
[示例：]

- PROJECT-STATE.md 分层（延迟到决策 > 300）

**产生技术债务：**
{{SHORTCUTS_NEEDING_FUTURE_WORK}}
[示例：]

- 一些工作流仍有硬编码路径（在阶段 5 中修复）

---

_当前项目状态，请参阅 .planning/ROADMAP.md_

---

## 使用指南

<guidelines>
**何时创建里程碑归档：**
- 在完成里程碑中的所有阶段后（v1.0、v1.1、v2.0 等）
- 由 complete-milestone 工作流触发
- 在规划下一个里程碑工作之前

**如何填写模板：**

- 用实际值替换 {{PLACEHOLDERS}}
- 从 ROADMAP.md 提取阶段详情
- 使用（已插入）标记记录小数阶段
- 包括来自 PROJECT-STATE.md 或 SUMMARY 文件的关键决策
- 列出已解决与延迟的问题
- 捕获技术债务以供将来参考

**归档位置：**

- 保存到 `.planning/milestones/v{VERSION}-{NAME}.md`
- 示例：`.planning/milestones/v1.0-mvp.md`

**归档后：**

- 更新 ROADMAP.md 以在 `<details>` 标签中折叠完成的里程碑
- 更新 PROJECT.md 为带有当前状态部分的地字段格式
- 在下一个里程碑中继续阶段编号（永远不要从 01 重新开始）
</guidelines>
