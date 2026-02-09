<purpose>
通过 npm 检查 GSD 更新，显示已安装和最新版本之间的变更日志，获取用户确认，并执行清除缓存的清洁安装。
</purpose>

<required_reading>
在开始之前读取调用提示的 execution_context 引用的所有文件。
</required_reading>

<process>

<step name="get_installed_version">
通过检查两个位置来检测 GSD 是本地还是全局安装：

```bash
# 首先检查本地（优先）
if [ -f "./.claude/get-shit-done/VERSION" ]; then
  cat "./.claude/get-shit-done/VERSION"
  echo "LOCAL"
elif [ -f ~/.claude/get-shit-done/VERSION ]; then
  cat ~/.claude/get-shit-done/VERSION
  echo "GLOBAL"
else
  echo "UNKNOWN"
fi
```

解析输出：
- 如果最后一行是"LOCAL"：已安装版本是第一行，使用 `--local` 标志进行更新
- 如果最后一行是"GLOBAL"：已安装版本是第一行，使用 `--global` 标志进行更新
- 如果"UNKNOWN"：继续到安装步骤（视为版本 0.0.0）

**如果 VERSION 文件丢失：**
```
## GSD 更新

**已安装版本：** 未知

您的安装不包含版本跟踪。

正在运行全新安装...
```

继续到安装步骤（比较时视为版本 0.0.0）。
</step>

<step name="check_latest_version">
检查 npm 的最新版本：

```bash
npm view get-shit-done-cc version 2>/dev/null
```

**如果 npm 检查失败：**
```
无法检查更新（离线或 npm 不可用）。

要手动更新：`npx get-shit-done-cc --global`
```

退出。
</step>

<step name="compare_versions">
比较已安装与最新：

**如果已安装 == 最新：**
```
## GSD 更新

**已安装：** X.Y.Z
**最新：** X.Y.Z

您已经是最新版本。
```

退出。

**如果已安装 > 最新：**
```
## GSD 更新

**已安装：** X.Y.Z
**最新：** A.B.C

您领先于最新发布版本（开发版本？）。
```

退出。
</step>

<step name="show_changes_and_confirm">
**如果有可用更新**，在更新之前获取并显示新内容：

1. 从 GitHub 原始 URL 获取变更日志
2. 提取已安装和最新版本之间的条目
3. 显示预览并请求确认：

```
## GSD 更新可用

**已安装：** 1.5.10
**最新：** 1.5.15

### 新功能
────────────────────────────────────────────────────────────

## [1.5.15] - 2026-01-20

### 已添加
- 功能 X

## [1.5.14] - 2026-01-18

### 已修复
- 错误修复 Y

────────────────────────────────────────────────────────────

⚠️  **注意：** 安装程序执行 GSD 文件夹的清洁安装：
- `commands/gsd/` 将被擦除并替换
- `get-shit-done/` 将被擦除并替换
- `agents/gsd-*` 文件将被替换

（路径相对于您的安装位置：全局为 `~/.claude/`，本地为 `./.claude/`）

您在其他位置的自定义文件将被保留：
- 不在 `commands/gsd/` 中的自定义命令 ✓
- 不带 `gsd-` 前缀的自定义代理 ✓
- 自定义钩子 ✓
- 您的 CLAUDE.md 文件 ✓

如果您直接修改了任何 GSD 文件，它们将自动备份到 `gsd-local-patches/`，并可以在更新后通过 `/gsd:reapply-patches` 重新应用。
```

使用 AskUserQuestion：
- 问题："继续更新？"
- 选项：
  - "是，现在更新"
  - "否，取消"

**如果用户取消：** 退出。
</step>

<step name="run_update">
使用步骤 1 中检测的安装类型运行更新：

**如果是本地安装：**
```bash
npx get-shit-done-cc --local
```

**如果是全局安装（或未知）：**
```bash
npx get-shit-done-cc --global
```

捕获输出。如果安装失败，显示错误并退出。

清除更新缓存以使状态行指示器消失：

**如果是本地安装：**
```bash
rm -f ./.claude/cache/gsd-update-check.json
```

**如果是全局安装：**
```bash
rm -f ~/.claude/cache/gsd-update-check.json
```
</step>

<step name="display_result">
格式化完成消息（变更日志已在确认步骤中显示）：

```
╔═══════════════════════════════════════════════════════════╗
║  GSD 已更新：v1.5.10 → v1.5.15                           ║
╚═══════════════════════════════════════════════════════════╝

⚠️  重启 Claude Code 以使用新命令。

[查看完整变更日志](https://github.com/glittercowboy/get-shit-done/blob/main/CHANGELOG.md)
```
</step>


<step name="check_local_patches">
更新完成后，检查安装程序是否检测到并备份了任何本地修改的文件：

检查配置目录中的 gsd-local-patches/backup-meta.json。

**如果发现补丁：**

```
本地补丁在更新前已备份。
运行 /gsd:reapply-patches 将您的修改合并到新版本中。
```

**如果没有补丁：** 正常继续。
</step>
</process>

<success_criteria>
- [ ] 已正确读取已安装版本
- [ ] 通过 npm 检查了最新版本
- [ ] 如果已是最新则跳过更新
- [ ] 更新前已获取并显示变更日志
- [ ] 已显示清洁安装警告
- [ ] 已获得用户确认
- [ ] 更新已成功执行
- [ ] 已显示重启提醒
</success_criteria>
