# 模型配置文件

模型配置文件控制每个 GSD 代理使用哪个 Claude 模型。这允许平衡质量与 token 消耗。

## 配置文件定义

| 代理 | `quality` | `balanced` | `budget` |
|-------|-----------|------------|----------|
| gsd-planner | opus | opus | sonnet |
| gsd-roadmapper | opus | sonnet | sonnet |
| gsd-executor | opus | sonnet | sonnet |
| gsd-phase-researcher | opus | sonnet | haiku |
| gsd-project-researcher | opus | sonnet | haiku |
| gsd-research-synthesizer | sonnet | sonnet | haiku |
| gsd-debugger | opus | sonnet | sonnet |
| gsd-codebase-mapper | sonnet | haiku | haiku |
| gsd-verifier | sonnet | sonnet | haiku |
| gsd-plan-checker | sonnet | sonnet | haiku |
| gsd-integration-checker | sonnet | sonnet | haiku |

## 配置理念

**quality** - 最大推理能力
- 所有决策代理使用 Opus
- 只读验证使用 Sonnet
- 使用场景：配额可用、关键架构工作

**balanced**（默认）- 智能分配
- 仅在规划时使用 Opus（在此进行架构决策）
- 执行和研究使用 Sonnet（遵循明确指令）
- 验证使用 Sonnet（需要推理，不仅仅是模式匹配）
- 使用场景：正常开发、质量和成本的良好平衡

**budget** - 最少 Opus 使用
- 编写代码的任何任务使用 Sonnet
- 研究和验证使用 Haiku
- 使用场景：节省配额、大批量工作、非关键阶段

## 解析逻辑

编排器在生成代理之前解析模型：

```
1. 读取 .planning/config.json
2. 获取 model_profile（默认： "balanced"）
3. 在上表中查找代理
4. 将模型参数传递给任务调用
```

## 切换配置文件

运行时：`/gsd:set-profile <profile>`

项目级默认设置：在 `.planning/config.json` 中设置：
```json
{
  "model_profile": "balanced"
}
```

## 设计原因

**为什么 gsd-planner 使用 Opus？**
规划涉及架构决策、目标分解和任务设计。这是模型质量影响最大的地方。

**为什么 gsd-executor 使用 Sonnet？**
执行器遵循明确的 PLAN.md 指令。计划已包含推理；执行只是实现。

**为什么在 balanced 中验证器使用 Sonnet（而非 Haiku）？**
验证需要目标反向推理——检查代码是否*交付*了阶段承诺的内容，而不仅仅是模式匹配。Sonnet 能很好地处理这个问题；Haiku 可能会遗漏细微的差距。

**为什么 gsd-codebase-mapper 使用 Haiku？**
只读探索和模式提取。不需要推理，只需从文件内容中提取结构化输出。
