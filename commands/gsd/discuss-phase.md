---
name: gsd:discuss-phase
description: 通过自适应质疑在规划之前收集阶段上下文
argument-hint: "<阶段>"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
---

<objective>
提取下游 agent 需要的实现决策 — researcher 和 planner 将使用 CONTEXT.md 来知道要调查什么以及哪些选择已锁定。

**工作原理：**
1. 分析阶段以识别灰色区域（UI、UX、行为等）
2. 呈现灰色区域 — 用户选择要讨论的区域
3. 深入探讨每个选定区域直到满意
4. 创建 CONTEXT.md，其中包含指导研究和规划的决策

**输出：** `{phase}-CONTEXT.md` — 决策足够清晰，下游 agent 可以操作而无需再次询问用户
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/discuss-phase.md
@~/.claude/get-shit-done/templates/context.md
</execution_context>

<context>
阶段编号: $ARGUMENTS（必需）

**加载项目状态：**
@.planning/STATE.md

**加载路线图：**
@.planning/ROADMAP.md
</context>

<process>
1. 验证阶段编号（如果缺失或不在路线图中则报错）
2. 检查 CONTEXT.md 是否存在（如果存在则提供更新/查看/跳过）
3. **分析阶段** — 识别领域并生成阶段特定的灰色区域
4. **呈现灰色区域** — 多选：要讨论哪些？（无跳过选项）
5. **深入探讨每个区域** — 每个区域 4 个问题，然后提供更多/下一步
6. **写入 CONTEXT.md** — 部分与讨论的区域匹配
7. 提供后续步骤（研究或规划）

**关键：范围护栏**
- ROADMAP.md 中的阶段边界是固定的
- 讨论澄清如何实现，而不是是否添加更多
- 如果用户建议新功能："那是它自己的阶段。我会记录它供以后使用。"
- 捕获延迟的想法 — 不要丢失它们，不要对它们采取行动

**领域感知的灰色区域：**
灰色区域取决于正在构建的内容。分析阶段目标：
- 用户看到的东西 → 布局、密度、交互、状态
- 用户调用的东西 → 响应、错误、认证、版本控制
- 用户运行的东西 → 输出格式、标志、模式、错误处理
- 用户阅读的东西 → 结构、语气、深度、流程
- 正在组织的东西 → 标准、分组、命名、例外

生成 3-4 个**阶段特定的**灰色区域，而不是通用类别。

**探索深度：**
- 每个区域问 4 个问题后再检查
- "关于 [区域] 的更多问题，还是继续下一个？"
- 如果更多 → 再问 4 个，再次检查
- 所有区域后 → "准备好创建上下文了吗？"

**不要询问（Claude 处理这些）：**
- 技术实现
- 架构选择
- 性能问题
- 范围扩大
</process>

<success_criteria>
- 通过智能分析识别灰色区域
- 用户选择了要讨论的区域
- 每个选定区域探索到满意
- 范围蔓延重定向到延迟的想法
- CONTEXT.md 捕获决策，而不是模糊的愿景
- 用户知道后续步骤
</success_criteria>
