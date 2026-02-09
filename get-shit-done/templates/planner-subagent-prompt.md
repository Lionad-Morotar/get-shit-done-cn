# 规划器子代理提示词模板

用于生成 gsd-planner 代理的模板。代理包含所有规划专业知识 — 此模板仅提供规划上下文。

---

## 模板

```markdown
<planning_context>

**阶段：** {phase_number}
**模式：** {standard | gap_closure}

**项目状态：**
@.planning/STATE.md

**路线图：**
@.planning/ROADMAP.md

**需求（如果存在）：**
@.planning/REQUIREMENTS.md

**阶段上下文（如果存在）：**
@.planning/phases/{phase_dir}/{phase}-CONTEXT.md

**研究（如果存在）：**
@.planning/phases/{phase_dir}/{phase}-RESEARCH.md

**差距关闭（如果是 --gaps 模式）：**
@.planning/phases/{phase_dir}/{phase}-VERIFICATION.md
@.planning/phases/{phase_dir}/{phase}-UAT.md

</planning_context>

<downstream_consumer>
输出由 /gsd:execute-phase 使用
计划必须是可执行的提示词，包括：
- 前置元数据（wave、depends_on、files_modified、autonomous）
- XML 格式的任务
- 验证标准
- 用于目标反向验证的 must_haves
</downstream_consumer>

<quality_gate>
在返回规划完成之前：
- [ ] 在阶段目录中创建了 PLAN.md 文件
- [ ] 每个计划都有有效的前置元数据
- [ ] 任务具体且可操作
- [ ] 正确识别了依赖关系
- [ ] 为并行执行分配了波次
- [ ] 从阶段目标派生了 must_haves
</quality_gate>
```

---

## 占位符

| 占位符 | 来源 | 示例 |
|-------------|--------|---------|
| `{phase_number}` | 来自路线图/参数 | `5` 或 `2.1` |
| `{phase_dir}` | 阶段目录名称 | `05-user-profiles` |
| `{phase}` | 阶段前缀 | `05` |
| `{standard \| gap_closure}` | 模式标志 | `standard` |

---

## 使用

**从 /gsd:plan-phase（标准模式）：**
```python
Task(
  prompt=filled_template,
  subagent_type="gsd-planner",
  description="规划阶段 {phase}"
)
```

**从 /gsd:plan-phase --gaps（差距关闭模式）：**
```python
Task(
  prompt=filled_template,  # 使用 mode: gap_closure
  subagent_type="gsd-planner",
  description="规划阶段 {phase} 的差距"
)
```

---

## 继续

对于检查点，生成新代理并附带：

```markdown
<objective>
继续规划阶段 {phase_number}：{phase_name}
</objective>

<prior_state>
阶段目录：@.planning/phases/{phase_dir}/
现有计划：@.planning/phases/{phase_dir}/*-PLAN.md
</prior_state>

<checkpoint_response>
**类型：** {checkpoint_type}
**响应：** {user_response}
</checkpoint_response>

<mode>
继续：{standard | gap_closure}
</mode>
```

---

**注意：** 规划方法、任务分解、依赖分析、波次分配、TDD 检测和目标反向派生都内置于 gsd-planner 代理中。此模板仅传递上下文。
