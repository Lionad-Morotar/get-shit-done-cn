---
type: prompt
name: gsd:complete-milestone
description: 归档已完成的里程碑并准备下一个版本
argument-hint: <版本>
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
标记里程碑 {{version}} 为完成，归档到 milestones/，并更新 ROADMAP.md 和 REQUIREMENTS.md。

目的：创建已发布版本的历史记录，归档里程碑工件（路线图 + 需求），并准备下一个里程碑。
输出：里程碑已归档（路线图 + 需求），PROJECT.md 已演进，git 已打标签。
</objective>

<execution_context>
**现在加载这些文件（在继续之前）：**

- @~/.claude/get-shit-done/workflows/complete-milestone.md（主工作流）
- @~/.claude/get-shit-done/templates/milestone-archive.md（归档模板）
  </execution_context>

<context>
**项目文件：**
- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/PROJECT.md`

**用户输入：**

- 版本: {{version}}（例如，"1.0"、"1.1"、"2.0"）
  </context>

<process>

**遵循 complete-milestone.md 工作流：**

0. **检查审计：**

   - 查找 `.planning/v{{version}}-MILESTONE-AUDIT.md`
   - 如果缺失或过时：建议先运行 `/gsd:audit-milestone`
   - 如果审计状态是 `gaps_found`：建议先运行 `/gsd:plan-milestone-gaps`
   - 如果审计状态是 `passed`：继续到步骤 1

   ```markdown
   ## 飞行前检查

   {如果不存在 v{{version}}-MILESTONE-AUDIT.md:}
   ⚠ 未找到里程碑审计。先运行 `/gsd:audit-milestone` 以验证
   需求覆盖、跨阶段集成和端到端流程。

   {如果审计有差距：}
   ⚠ 里程碑审计发现差距。运行 `/gsd:plan-milestone-gaps` 创建
   关闭差距的阶段，或继续进行以接受为技术债务。

   {如果审计通过：}
   ✓ 里程碑审计通过。继续完成。
   ```

1. **验证就绪性：**

   - 检查里程碑中的所有阶段都有完成的计划（存在 SUMMARY.md）
   - 呈现里程碑范围和统计
   - 等待确认

2. **收集统计：**

   - 计算阶段、计划、任务
   - 计算 git 范围、文件更改、LOC
   - 从 git log 提取时间线
   - 呈现摘要，确认

3. **提取成就：**

   - 读取里程碑范围内的所有阶段 SUMMARY.md 文件
   - 提取 4-6 个关键成就
   - 呈现以供批准

4. **归档里程碑：**

   - 创建 `.planning/milestones/v{{version}}-ROADMAP.md`
   - 从 ROADMAP.md 提取完整阶段详情
   - 填充 milestone-archive.md 模板
   - 更新 ROADMAP.md 为单行摘要和链接

5. **归档需求：**

   - 创建 `.planning/milestones/v{{version}}-REQUIREMENTS.md`
   - 标记所有 v1 需求为完成（复选框已选中）
   - 注明需求结果（已验证、已调整、已删除）
   - 删除 `.planning/REQUIREMENTS.md`（为下一个里程碑创建新的）

6. **更新 PROJECT.md：**

   - 添加"当前状态"部分，包含已发布版本
   - 添加"下一里程碑目标"部分
   - 在 `<details>` 中归档以前的内容（如果是 v1.1+）

7. **提交和标记：**

   - 暂存：MILESTONES.md、PROJECT.md、ROADMAP.md、STATE.md、归档文件
   - 提交：`chore: archive v{{version}} milestone`
   - 标签：`git tag -a v{{version}} -m "[milestone summary]"`
   - 询问关于推送标签

8. **提供后续步骤：**
   - `/gsd:new-milestone` — 开始下一个里程碑（质疑 → 研究 → 需求 → 路线图）

</process>

<success_criteria>

- 里程碑已归档到 `.planning/milestones/v{{version}}-ROADMAP.md`
- 需求已归档到 `.planning/milestones/v{{version}}-REQUIREMENTS.md`
- `.planning/REQUIREMENTS.md` 已删除（为下一个里程碑准备新的）
- ROADMAP.md 折叠为单行条目
- PROJECT.md 已更新当前状态
- Git 标签 v{{version}} 已创建
- 提交成功
- 用户知道后续步骤（包括需要新需求）
  </success_criteria>

<critical_rules>

- **先加载工作流：** 在执行之前读取 complete-milestone.md
- **验证完成：** 所有阶段必须有 SUMMARY.md 文件
- **用户确认：** 在验证关卡等待批准
- **先归档后删除：** 在更新/删除原始文件之前始终创建归档文件
- **单行摘要：** ROADMAP.md 中折叠的里程碑应该是带链接的单行
- **上下文效率：** 归档保持 ROADMAP.md 和 REQUIREMENTS.md 每个里程碑的恒定大小
- **新需求：** 下一个里程碑以 `/gsd:new-milestone` 开始，其中包括需求定义
  </critical_rules>
