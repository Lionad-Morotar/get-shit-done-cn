---
name: gsd:map-codebase
description: 使用并行映射器代理分析代码库以生成 .planning/codebase/ 文档
argument-hint: "[可选：要映射的特定区域，例如 'api' 或 'auth']"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Write
  - Task
---

<objective>
使用并行 gsd-codebase-mapper 代理分析现有代码库以生成结构化代码库文档。

每个映射器代理探索一个焦点区域并**直接将文档写入** `.planning/codebase/`。编排器仅接收确认，保持上下文使用最少。

输出：.planning/codebase/ 文件夹，其中包含 7 份关于代码库状态的结构化文档。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/map-codebase.md
</execution_context>

<context>
焦点区域: $ARGUMENTS（可选 - 如果提供，指示代理专注于特定子系统）

**如果存在则加载项目状态：**
检查 .planning/STATE.md - 如果项目已初始化则加载上下文

**此命令可以运行：**
- 在 /gsd:new-project 之前（棕地代码库）- 首先创建代码库映射
- 在 /gsd:new-project 之后（绿地代码库）- 随着代码演进而更新代码库映射
- 随时刷新代码库理解
</context>

<when_to_use>
**使用 map-codebase 用于：**
- 初始化之前的棕地项目（首先了解现有代码）
- 在重大更改后刷新代码库映射
- 接触不熟悉的代码库
- 重大重构之前（了解当前状态）
- 当 STATE.md 引用过时的代码库信息时

**跳过 map-codebase 用于：**
- 尚无代码的绿地项目（无内容可映射）
- 微不足道的代码库（<5 个文件）
</when_to_use>

<process>
1. 检查 .planning/codebase/ 是否已存在（提供刷新或跳过选项）
2. 创建 .planning/codebase/ 目录结构
3. 生成 4 个并行 gsd-codebase-mapper 代理：
   - 代理 1：技术焦点 → 写入 STACK.md、INTEGRATIONS.md
   - 代理 2：架构焦点 → 写入 ARCHITECTURE.md、STRUCTURE.md
   - 代理 3：质量焦点 → 写入 CONVENTIONS.md、TESTING.md
   - 代理 4：关注点焦点 → 写入 CONCERNS.md
4. 等待代理完成，收集确认（而非文档内容）
5. 验证所有 7 个文档是否存在且包含行计数
6. 提交代码库映射
7. 提供后续步骤（通常是：/gsd:new-project 或 /gsd:plan-phase）
</process>

<success_criteria>
- [ ] .planning/codebase/ 目录已创建
- [ ] 映射器代理已写入所有 7 个代码库文档
- [ ] 文档遵循模板结构
- [ ] 并行代理完成无错误
- [ ] 用户知道后续步骤
</success_criteria>
