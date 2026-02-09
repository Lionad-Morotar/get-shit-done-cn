<purpose>
在现有整数阶段之间插入十进制阶段以处理里程碑中期发现的紧急工作。使用十进制编号（72.1、72.2 等）来保留计划阶段的逻辑序列，同时适应紧急插入而无需重新编号整个路线图。
</purpose>

<required_reading>
在开始之前读取执行上下文引用的所有文件。
</required_reading>

<process>

<step name="parse_arguments">
解析命令参数：
- 第一个参数：要插入在其后的整数阶段编号
- 剩余参数：阶段描述

示例：`/gsd:insert-phase 72 Fix critical auth bug`
-> after = 72
-> description = "Fix critical auth bug"

如果缺少参数：

```
错误：需要阶段编号和描述
用法：/gsd:insert-phase <after> <description>
示例：/gsd:insert-phase 72 Fix critical auth bug
```

退出。

验证第一个参数是整数。
</step>

<step name="init_context">
加载阶段操作上下文：

```bash
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js init phase-op "${after_phase}")
```

从 init JSON 检查 `roadmap_exists`。如果为 false：
```
错误：未找到路线图 (.planning/ROADMAP.md)
```
退出。
</step>

<step name="insert_phase">
**将阶段插入委托给 gsd-tools：**

```bash
RESULT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js phase insert "${after_phase}" "${description}")
```

CLI 处理：
- 验证目标阶段在 ROADMAP.md 中存在
- 计算下一个十进制阶段编号（检查磁盘上的现有小数）
- 从描述生成 slug
- 创建阶段目录 (`.planning/phases/{N.M}-{slug}/`)
- 在目标阶段之后将阶段条目插入到 ROADMAP.md 中并带有 (INSERTED) 标记

从结果中提取：`phase_number`、`after_phase`、`name`、`slug`、`directory`。
</step>

<step name="update_project_state">
更新 STATE.md 以反映插入的阶段：

1. 读取 `.planning/STATE.md`
2. 在 "## 累积上下文" → "### 路线图演变" 下添加条目：
   ```
   - 阶段 {decimal_phase} 插入到阶段 {after_phase} 之后：{description} (URGENT)
   ```

如果 "路线图演变" 部分不存在，则创建它。
</step>

<step name="completion">
展示完成摘要：

```
阶段 {decimal_phase} 已插入到阶段 {after_phase} 之后：
- 描述：{description}
- 目录：.planning/phases/{decimal-phase}-{slug}/
- 状态：尚未规划
- 标记：(INSERTED) - 表示紧急工作

路线图已更新：.planning/ROADMAP.md
项目状态已更新：.planning/STATE.md

---

## ▶ 接下来

**阶段 {decimal_phase}：{description}** -- 紧急插入

`/gsd:plan-phase {decimal_phase}`

<sub>`/clear` 首先 → 新的上下文窗口</sub>

---

**也可用：**
- 审查插入影响：检查阶段 {next_integer} 依赖项是否仍然合理
- 审查路线图

---
```
</step>

</process>

<anti_patterns>

- 不要用于里程碑末尾的计划工作（使用 /gsd:add-phase）
- 不要在阶段 1 之前插入（十进制 0.1 没有意义）
- 不要重新编号现有阶段
- 不要修改目标阶段内容
- 尚未创建计划（那是 /gsd:plan-phase）
- 不要提交更改（用户决定何时提交）
</anti_patterns>

<success_criteria>
阶段插入完成时：

- [ ] `gsd-tools phase insert` 成功执行
- [ ] 阶段目录已创建
- [ ] 路线图已使用新阶段条目更新（包括 "(INSERTED)" 标记）
- [ ] STATE.md 已使用路线图演变注释更新
- [ ] 用户已通知下一步和依赖项影响
</success_criteria>
