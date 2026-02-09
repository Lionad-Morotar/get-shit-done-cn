<purpose>
在适当的深度级别执行发现。
生成 DISCOVERY.md（用于级别 2-3）来指导 PLAN.md 创建。

从 plan-phase.md 的 mandatory_discovery 步骤调用并传入深度参数。

注意：对于综合生态系统研究（"专家如何构建这个"），请改用 /gsd:research-phase，它生成 RESEARCH.md。
</purpose>

<depth_levels>
**此工作流程支持三个深度级别：**

| 级别 | 名称      | 时间     | 输出                         | 场景                                      |
| ----- | --------- | -------- | ---------------------------- | ----------------------------------------- |
| 1     | 快速验证  | 2-5 分钟 | 无文件，继续验证后的知识     | 单个库，确认当前语法                      |
| 2     | 标准      | 15-30 分钟 | DISCOVERY.md                 | 在选项之间选择、新集成                    |
| 3     | 深入探索  | 1+ 小时  | 带有验证门的详细 DISCOVERY.md | 架构决策、新问题                          |

**深度由 plan-phase.md 在路由之前确定。**
</depth_levels>

<source_hierarchy>
**强制：Context7 在 WebSearch 之前**

Claude 的训练数据滞后 6-18 个月。始终验证。

1. **Context7 MCP 优先** - 当前文档，无幻觉
2. **官方文档** - 当 Context7 缺少覆盖时
3. **WebSearch 最后** - 仅用于比较和趋势

完整协议见 ~/.claude/get-shit-done/templates/discovery.md `<discovery_protocol>`。
</source_hierarchy>

<process>

<step name="determine_depth">
检查从 plan-phase.md 传入的深度参数：
- `depth=verify` → 级别 1（快速验证）
- `depth=standard` → 级别 2（标准发现）
- `depth=deep` → 级别 3（深入探索）

路由到下面适当的级别工作流程。
</step>

<step name="level_1_quick_verify">
**级别 1：快速验证（2-5 分钟）**

用于：单个已知库，确认语法/版本仍然正确。

**流程：**

1. 在 Context7 中解析库：

   ```
   mcp__context7__resolve-library-id with libraryName: "[library]"
   ```

2. 获取相关文档：

   ```
   mcp__context7__get-library-docs with:
   - context7CompatibleLibraryID: [from step 1]
   - topic: [specific concern]
   ```

3. 验证：

   - 当前版本符合预期
   - API 语法未更改
   - 最近版本中没有破坏性更改

4. **如果验证通过：** 返回 plan-phase.md 并确认。无需 DISCOVERY.md。

5. **如果发现问题：** 升级到级别 2。

**输出：** 继续的口头确认，或升级到级别 2。
</step>

<step name="level_2_standard">
**级别 2：标准发现（15-30 分钟）**

用于：在选项之间选择、新的外部集成。

**流程：**

1. **确定要发现什么：**

   - 存在哪些选项？
   - 关键比较标准是什么？
   - 我们的具体用例是什么？

2. **为每个选项使用 Context7：**

   ```
   对于每个库/框架：
   - mcp__context7__resolve-library-id
   - mcp__context7__get-library-docs (mode: "code" 用于 API，"info" 用于概念)
   ```

3. **官方文档** 用于 Context7 缺少的任何内容。

4. **WebSearch** 用于比较：

   - "[选项 A] vs [选项 B] {current_year}"
   - "[选项] 已知问题"
   - "[选项] 与 [我们的技术栈]"

5. **交叉验证：** 任何 WebSearch 发现 → 用 Context7/官方文档确认。

6. **使用 ~/.claude/get-shit-done/templates/discovery.md 结构创建 DISCOVERY.md：**

   - 带有建议的摘要
   - 每个选项的关键发现
   - 来自 Context7 的代码示例
   - 置信度级别（级别 2 应该为中等-高）

7. 返回 plan-phase.md。

**输出：** `.planning/phases/XX-name/DISCOVERY.md`
</step>

<step name="level_3_deep_dive">
**级别 3：深入探索（1+ 小时）**

用于：架构决策、新问题、高风险选择。

**流程：**

1. **使用 ~/.claude/get-shit-done/templates/discovery.md 界定发现范围：**

   - 定义清晰范围
   - 定义包含/排除边界
   - 列出要回答的具体问题

2. **详尽的 Context7 研究：**

   - 所有相关库
   - 相关模式和概念
   - 每个库的多个主题（如需要）

3. **官方文档深入阅读：**

   - 架构指南
   - 最佳实践部分
   - 迁移/升级指南
   - 已知限制

4. **WebSearch 用于生态系统上下文：**

   - 其他人如何解决类似问题
   - 生产经验
   - 陷阱和反模式
   - 最近更改/公告

5. **交叉验证所有发现：**

   - 每个 WebSearch 声称 → 用权威来源验证
   - 标记已验证 vs 假设的内容
   - 标记矛盾

6. **创建综合 DISCOVERY.md：**

   - 来自 ~/.claude/get-shit-done/templates/discovery.md 的完整结构
   - 带有来源归属的质量报告
   - 按发现区分的置信度
   - 如果任何关键发现的置信度低 → 添加验证检查点

7. **置信度门：** 如果整体置信度低，在继续之前展示选项。

8. 返回 plan-phase.md。

**输出：** `.planning/phases/XX-name/DISCOVERY.md`（综合）
</step>

<step name="identify_unknowns">
**对于级别 2-3：** 定义我们需要学习什么。

询问：在规划此阶段之前我们需要学习什么？

- 技术选择？
- 最佳实践？
- API 模式？
- 架构方法？
  </step>

<step name="create_discovery_scope">
使用 ~/.claude/get-shit-done/templates/discovery.md。

包括：

- 清晰的发现目标
- 范围化的包含/排除列表
- 来源偏好（官方文档、Context7、当前年份）
- DISCOVERY.md 的输出结构
  </step>

<step name="execute_discovery">
运行发现：
- 使用网络搜索获取当前信息
- 使用 Context7 MCP 获取库文档
- 偏好当前年份的来源
- 按模板结构化发现
</step>

<step name="create_discovery_output">
写入 `.planning/phases/XX-name/DISCOVERY.md`：
- 带有建议的摘要
- 带有来源的关键发现
- 代码示例（如适用）
- 元数据（置信度、依赖项、未决问题、假设）
</step>

<step name="confidence_gate">
创建 DISCOVERY.md 后，检查置信度级别。

如果置信度低：
使用 AskUserQuestion：

- header: "低置信度"
- question: "发现置信度低：[reason]。您想如何继续？"
- options:
  - "深入挖掘" - 在规划之前做更多研究
  - "无论如何继续" - 接受不确定性，带警告规划
  - "暂停" - 我需要考虑这个

如果置信度为中：
内联："发现完成（中等置信度）。[brief reason]。继续规划？"

如果置信度高：
直接继续，只需注意："发现完成（高置信度）。"
</step>

<step name="open_questions_gate">
如果 DISCOVERY.md 有 open_questions：

内联展示：
"发现中的未决问题：

- [问题 1]
- [问题 2]

这些可能会影响实现。确认并继续？（是 / 先解决）"

如果 "先解决"：收集用户对问题的输入，更新发现。
</step>

<step name="offer_next">
```
发现完成：.planning/phases/XX-name/DISCOVERY.md
建议：[one-liner]
置信度：[level]

下一步是什么？

1. 讨论阶段上下文 (/gsd:discuss-phase [current-phase])
2. 创建阶段计划 (/gsd:plan-phase [current-phase])
3. 完善发现（深入挖掘）
4. 审查发现

```

注意：DISCOVERY.md 不会单独提交。它将在阶段完成时一起提交。
</step>

</process>

<success_criteria>
**级别 1（快速验证）：**
- 上下文 7 咨询了库/主题
- 当前状态已验证或问题已升级
- 继续的口头确认（无文件）

**级别 2（标准）：**
- 所有选项都咨询了 Context7
- WebSearch 发现已交叉验证
- 创建了带有建议的 DISCOVERY.md
- 置信度级别中等或更高
- 准备指导 PLAN.md 创建

**级别 3（深入探索）：**
- 发现范围已定义
- 详尽咨询了 Context7
- 所有 WebSearch 发现已根据权威来源验证
- 创建了带有综合分析的 DISCOVERY.md
- 带有来源归属的质量报告
- 如果置信度低发现 → 定义了验证检查点
- 通过了置信度门
- 准备指导 PLAN.md 创建
</success_criteria>
