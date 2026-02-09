# 发现模板

用于 `.planning/phases/XX-name/DISCOVERY.md` 的模板 — 用于库/选项决策的浅层研究。

**目的：** 在 plan-phase 的强制性发现期间回答"我们应该使用哪个库/选项"问题。

对于深度生态系统研究（"专家如何构建这个"），使用 `/gsd:research-phase`，它产生 RESEARCH.md。

---

## 文件模板

```markdown
---
phase: XX-name
type: discovery
topic: [发现主题]
---

<session_initialization>
在开始发现之前，验证今天的日期：
!`date +%Y-%m-%d`

搜索"当前"或"最新"信息时使用此日期。
示例：如果今天是 2025-11-22，搜索 "2025" 而不是 "2024"。
</session_initialization>

<discovery_objective>
发现 [主题] 以支持 [阶段名称] 实施。

目的：[这启用什么决策/实施]
范围：[边界]
输出：带有建议的 DISCOVERY.md
</discovery_objective>

<discovery_scope>
<include>
- [要回答的问题]
- [要调查的领域]
- [需要时的具体比较]
</include>

<exclude>
- [超出此发现的范围]
- [推迟到实施阶段]
</exclude>
</discovery_scope>

<discovery_protocol>

**来源优先级：**
1. **Context7 MCP** - 用于库/框架文档（当前、权威）
2. **官方文档** - 用于平台特定或未索引的库
3. **WebSearch** - 用于比较、趋势、社区模式（验证所有发现）

**质量检查清单：**
在完成发现之前，验证：
- [ ] 所有声明都有权威来源（Context7 或官方文档）
- [ ] 否定声明（"X 是不可能的"）已通过官方文档验证
- [ ] API 语法/配置来自 Context7 或官方文档（绝不单独使用 WebSearch）
- [ ] WebSearch 发现与权威来源交叉检查
- [ ] 最近更新/变更日志已检查破坏性更改
- [ ] 考虑了替代方法（不只是找到的第一个解决方案）

**置信度级别：**
- 高：Context7 或官方文档确认
- 中：WebSearch + Context7/官方文档确认
- 低：仅 WebSearch 或仅训练知识（标记以进行验证）

</discovery_protocol>


<output_structure>
创建 `.planning/phases/XX-name/DISCOVERY.md`：

```markdown
# [主题] 发现

## 摘要
[2-3 段执行摘要 — 研究了什么、发现了什么、推荐什么]

## 主要建议
[做什么以及为什么 — 要具体和可操作]

## 考虑的替代方案
[评估了什么以及为什么不选择]

## 关键发现

### [类别 1]
- [带有源 URL 和与我们案例相关性的发现]

### [类别 2]
- [带有源 URL 和相关性的发现]

## 代码示例
[相关的实施模式（如果适用）]

## 元数据

<metadata>
<confidence level="high|medium|low">
[为什么是这个置信度级别 - 基于来源质量和验证]
</confidence>

<sources>
- [使用的主要权威来源]
</sources>

<open_questions>
[无法确定或在实施期间需要验证的内容]
</open_questions>

<validation_checkpoints>
[如果置信度为低或中，列出实施期间要验证的具体内容]
</validation_checkpoints>
</metadata>
```
</output_structure>

<success_criteria>
- 所有范围问题都有权威来源回答
- 质量检查清单项目已完成
- 明确的主要建议
- 低置信度发现标记了验证检查点
- 准备支持 PLAN.md 创建
</success_criteria>

<guidelines>
**何时使用发现：**
- 技术选择不明确（库 A vs B）
- 不熟悉的集成需要最佳实践
- 需要调查 API/库
- 单个待定决策

**何时不使用：**
- 既定模式（CRUD、使用已知库的身份验证）
- 实施细节（推迟到执行）
- 可从现有项目上下文回答的问题

**何时改用 RESEARCH.md：**
- 小众/复杂领域（3D、游戏、音频、着色器）
- 需要生态系统知识，而不仅仅是库选择
- "专家如何构建这个"问题
- 对这些使用 `/gsd:research-phase`
</guidelines>
