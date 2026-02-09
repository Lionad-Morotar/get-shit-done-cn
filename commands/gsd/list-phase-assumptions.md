---
name: gsd:list-phase-assumptions
description: 在规划之前展示 Claude 关于阶段方法的假设
argument-hint: "[阶段]"
allowed-tools:
  - Read
  - Bash
  - Grep
  - Glob
---

<objective>
分析阶段并展示 Claude 关于技术方法、实现顺序、范围边界、风险区域和依赖关系的假设。

目的：帮助用户在规划开始前了解 Claude 的想法 - 当假设错误时能够早期进行方向修正。
输出：仅对话输出（无文件创建）- 以"你怎么看？"提示结束
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/list-phase-assumptions.md
</execution_context>

<context>
阶段编号: $ARGUMENTS（必需）

**首先加载项目状态：**
@.planning/STATE.md

**加载路线图：**
@.planning/ROADMAP.md
</context>

<process>
1. 验证阶段编号参数（如果缺失或无效则报错）
2. 检查阶段是否存在于路线图中
3. 遵循 list-phase-assumptions.md 工作流：
   - 分析路线图描述
   - 展示关于以下方面的假设：技术方法、实现顺序、范围、风险、依赖关系
   - 清晰呈现假设
   - 提示"你怎么看？"
4. 收集反馈并提供后续步骤
</process>

<success_criteria>

- 根据路线图验证阶段
- 跨五个区域展示假设
- 提示用户反馈
- 用户知道后续步骤（讨论上下文、规划阶段或纠正假设）
  </success_criteria>
