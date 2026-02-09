<purpose>
在当前里程碑的路线图末尾添加一个新的整数阶段。自动计算下一个阶段编号、创建阶段目录并更新路线图结构。
</purpose>

<required_reading>
在开始之前读取调用提示的 execution_context 引用的所有文件。
</required_reading>

<process>

<step name="parse_arguments">
解析命令参数：
- 所有参数成为阶段描述
- 示例：`/gsd:add-phase 添加身份验证` → description = "添加身份验证"
- 示例：`/gsd:add-phase 修复关键性能问题` → description = "修复关键性能问题"

如果未提供参数：

```
错误：需要阶段描述
用法：/gsd:add-phase <描述>
示例：/gsd:add-phase 添加身份验证系统
```

退出。
</step>

<step name="init_context">
加载阶段操作上下文：

```bash
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js init phase-op "0")
```

检查 init JSON 中的 `roadmap_exists`。如果为 false：
```
错误：未找到路线图（.planning/ROADMAP.md）
运行 /gsd:new-project 进行初始化。
```
退出。
</step>

<step name="add_phase">
**将阶段添加委托给 gsd-tools：**

```bash
RESULT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js phase add "${description}")
```

CLI 处理：
- 查找最高的现有整数阶段编号
- 计算下一个阶段编号（max + 1）
- 从描述生成 slug
- 创建阶段目录（`.planning/phases/{NN}-{slug}/`）
- 使用目标、依赖和计划部分在 ROADMAP.md 中插入阶段条目

从结果中提取：`phase_number`、`padded`、`name`、`slug`、`directory`。
</step>

<step name="update_project_state">
更新 STATE.md 以反映新阶段：

1. 读取 `.planning/STATE.md`
2. 在"## 累积上下文" → "### 路线图演变"下添加条目：
   ```
   - 添加阶段 {N}：{描述}
   ```

如果"路线图演变"部分不存在，则创建它。
</step>

<step name="completion">
展示完成摘要：

```
阶段 {N} 已添加到当前里程碑：
- 描述：{description}
- 目录：.planning/phases/{phase-num}-{slug}/
- 状态：尚未规划

路线图已更新：.planning/ROADMAP.md

---

## ▶ 下一步

**阶段 {N}：{description}**

`/gsd:plan-phase {N}`

<sub>`/clear` 首先进行 → 清空上下文窗口</sub>

---

**还可以：**
- `/gsd:add-phase <描述>` — 添加另一个阶段
- 查看路线图

---
```
</step>

</process>

<success_criteria>
- [ ] `gsd-tools phase add` 成功执行
- [ ] 阶段目录已创建
- [ ] 路线图已更新新阶段条目
- [ ] STATE.md 已更新路线图演变注释
- [ ] 用户已通知下一步
</success_criteria>
