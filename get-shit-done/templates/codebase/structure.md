# 结构模板

`.planning/codebase/STRUCTURE.md` 的模板——捕获物理文件组织。

**目的：** 记录事物在代码库中的物理位置。回答"我应该把 X 放在哪里？"

---

## 文件模板

```markdown
# 代码库结构

**分析日期：** [YYYY-MM-DD]

## 目录布局

[顶级目录的 ASCII 框线树，带有目的 - 仅使用 ├── └── │ 字符作为树结构]

```
[project-root]/
├── [dir]/          # [目的]
├── [dir]/          # [目的]
├── [dir]/          # [目的]
└── [file]          # [目的]
```

## 目录目的

**[目录名称]：**
- 目的：[这里有什么]
- 包含：[文件类型：例如，"*.ts 源文件"、"组件目录"]
- 关键文件：[此目录中的重要文件]
- 子目录：[如果是嵌套，描述结构]

**[目录名称]：**
- 目的：[这里有什么]
- 包含：[文件类型]
- 关键文件：[重要文件]
- 子目录：[结构]

## 关键文件位置

**入口点：**
- [路径]：[目的：例如，"CLI 入口点"]
- [路径]：[目的：例如，"服务器启动"]

**配置：**
- [路径]：[目的：例如，"TypeScript 配置"]
- [路径]：[目的：例如，"构建配置"]
- [路径]：[目的：例如，"环境变量"]

**核心逻辑：**
- [路径]：[目的：例如，"业务服务"]
- [路径]：[目的：例如，"数据库模型"]
- [路径]：[目的：例如，"API 路由"]

**测试：**
- [路径]：[目的：例如，"单元测试"]
- [路径]：[目的：例如，"测试夹具"]

**文档：**
- [路径]：[目的：例如，"面向用户的文档"]
- [路径]：[目的：例如，"开发者指南"]

## 命名约定

**文件：**
- [模式]：[示例：例如，"模块使用 kebab-case.ts"]
- [模式]：[示例：例如，"React 组件使用 PascalCase.tsx"]
- [模式]：[示例：例如，"测试文件使用 *.test.ts"]

**目录：**
- [模式]：[示例：例如，"功能目录使用 kebab-case"]
- [模式]：[示例：例如，"集合使用复数名称"]

**特殊模式：**
- [模式]：[示例：例如，"目录导出使用 index.ts"]
- [模式]：[示例：例如，"测试目录使用 __tests__"]

## 添加新代码的位置

**新功能：**
- 主要代码：[目录路径]
- 测试：[目录路径]
- 配置（如果需要）：[目录路径]

**新组件/模块：**
- 实现：[目录路径]
- 类型：[目录路径]
- 测试：[目录路径]

**新路由/命令：**
- 定义：[目录路径]
- 处理程序：[目录路径]
- 测试：[目录路径]

**工具：**
- 共享助手：[目录路径]
- 类型定义：[目录路径]

## 特殊目录

[任何具有特殊含义或生成的目录]

**[目录]：**
- 目的：[例如，"生成的代码"、"构建输出"]
- 源：[例如，"由 X 自动生成"、"构建工件"]
- 已提交：[是/否 - 在 .gitignore 中？]

---

*结构分析：[日期]*
*目录结构更改时更新*
```

<good_examples>
```markdown
# 代码库结构

**分析日期：** 2025-01-20

## 目录布局

```
get-shit-done/
├── bin/                # 可执行入口点
├── commands/           # 斜杠命令定义
│   └── gsd/           # GSD 特定命令
├── get-shit-done/     # Skill 资源
│   ├── references/    # 原则文档
│   ├── templates/     # 文件模板
│   └── workflows/     # 多步骤程序
├── src/               # 源代码（如果适用）
├── tests/             # 测试文件
├── package.json       # 项目清单
└── README.md          # 用户文档
```

## 目录目的

**bin/**
- 目的：CLI 入口点
- 包含：install.js（安装程序脚本）
- 关键文件：install.js - 处理 npx 安装
- 子目录：无

**commands/gsd/**
- 目的：Claude Code 的斜杠命令定义
- 包含：*.md 文件（每个命令一个）
- 关键文件：new-project.md、plan-phase.md、execute-plan.md
- 子目录：无（扁平结构）

**get-shit-done/references/**
- 目的：核心哲学和指导文档
- 包含：principles.md、questioning.md、plan-format.md
- 关键文件：principles.md - 系统哲学
- 子目录：无

**get-shit-done/templates/**
- 目的：.planning/ 文件的文档模板
- 包含：带有 frontmatter 的模板定义
- 关键文件：project.md、roadmap.md、plan.md、summary.md
- 子目录：codebase/（新 - 用于 stack/architecture/structure 模板）

**get-shit-done/workflows/**
- 目的：可重用的多步骤程序
- 包含：命令调用的工作流定义
- 关键文件：execute-plan.md、research-phase.md
- 子目录：无

## 关键文件位置

**入口点：**
- `bin/install.js` - 安装脚本（npx 入口）

**配置：**
- `package.json` - 项目元数据、依赖项、bin 入口
- `.gitignore` - 排除的文件

**核心逻辑：**
- `bin/install.js` - 所有安装逻辑（文件复制、路径替换）

**测试：**
- `tests/` - 测试文件（如果存在）

**文档：**
- `README.md` - 面向用户的安装和使用指南
- `CLAUDE.md` - 在此存储库中工作时给 Claude Code 的说明

## 命名约定

**文件：**
- kebab-case.md：Markdown 文档
- kebab-case.js：JavaScript 源文件
- UPPERCASE.md：重要项目文件（README、CLAUDE、CHANGELOG）

**目录：**
- kebab-case：所有目录
- 集合使用复数：templates/、commands/、workflows/

**特殊模式：**
- {command-name}.md：斜杠命令定义
- *-template.md：可以使用，但 templates/ 目录更首选

## 添加新代码的位置

**新斜杠命令：**
- 主要代码：`commands/gsd/{command-name}.md`
- 测试：`tests/commands/{command-name}.test.js`（如果实现了测试）
- 文档：使用新命令更新 `README.md`

**新模板：**
- 实现：`get-shit-done/templates/{name}.md`
- 文档：模板是自文档化的（包括指南）

**新工作流：**
- 实现：`get-shit-done/workflows/{name}.md`
- 用法：使用 `@~/.claude/get-shit-done/workflows/{name}.md` 从命令引用

**新参考文档：**
- 实现：`get-shit-done/references/{name}.md`
- 用法：根据需要从命令/工作流引用

**工具：**
- 尚无工具（`install.js` 是整体的）
- 如果提取：`src/utils/`

## 特殊目录

**get-shit-done/**
- 目的：安装到 ~/.claude/ 的资源
- 源：安装期间由 bin/install.js 复制
- 已提交：是（真实来源）

**commands/**
- 目的：安装到 ~/.claude/commands/ 的斜杠命令
- 源：安装期间由 bin/install.js 复制
- 已提交：是（真实来源）

---

*结构分析：2025-01-20*
*目录结构更改时更新*
```
</good_examples>

<guidelines>
**什么属于 STRUCTURE.md：**
- 目录布局（ASCII 框线树用于结构可视化）
- 每个目录的目的
- 关键文件位置（入口点、配置、核心逻辑）
- 命名约定
- 添加新代码的位置（按类型）
- 特殊/生成的目录

**什么不属于这里：**
- 概念架构（那是 ARCHITECTURE.md）
- 技术栈（那是 STACK.md）
- 代码实现细节（推迟到代码读取）
- 每个单个文件（专注于目录和关键文件）

**填充此模板时：**
- 使用 `tree -L 2` 或类似工具可视化结构
- 识别顶级目录及其目的
- 通过观察现有文件来注意命名模式
- 定位入口点、配置和主要逻辑区域
- 保持目录树简洁（最多 2-3 级）

**树格式（仅结构的 ASCII 框线字符）：**
```
root/
├── dir1/           # 目的
│   ├── subdir/    # 目的
│   └── file.ts    # 目的
├── dir2/          # 目的
└── file.ts        # 目的
```

**在以下情况下对阶段规划有用：**
- 添加新功能（文件应该放在哪里？）
- 了解项目组织
- 查找特定逻辑所在位置
- 遵循现有约定
</guidelines>
