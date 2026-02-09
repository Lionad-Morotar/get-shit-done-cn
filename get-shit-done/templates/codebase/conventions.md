# 编码约定模板

`.planning/codebase/CONVENTIONS.md` 的模板——捕获编码风格和模式。

**目的：** 记录代码库中代码的编写方式。供 Claude 匹配现有风格的规范性指南。

---

## 文件模板

```markdown
# 编码约定

**分析日期：** [YYYY-MM-DD]

## 命名模式

**文件：**
- [模式：例如，"所有文件使用 kebab-case"]
- [测试文件：例如，"源文件旁边的 *.test.ts"]
- [组件：例如，"React 组件使用 PascalCase.tsx"]

**函数：**
- [模式：例如，"所有函数使用 camelCase"]
- [异步：例如，"异步函数没有特殊前缀"]
- [处理器：例如，"事件处理器使用 handleEventName"]

**变量：**
- [模式：例如，"变量使用 camelCase"]
- [常量：例如，"常量使用 UPPER_SNAKE_CASE"]
- [私有：例如，"私有成员使用 _ 前缀"或"无前缀"]

**类型：**
- [接口：例如，"PascalCase，无 I 前缀"]
- [类型：例如，"类型别名使用 PascalCase"]
- [枚举：例如，"枚举名使用 PascalCase，值使用 UPPER_CASE"]

## 代码风格

**格式化：**
- [工具：例如，"Prettier 配置在 .prettierrc 中"]
- [行长度：例如，"最大 100 个字符"]
- [引号：例如，"字符串使用单引号"]
- [分号：例如，"必需"或"省略"]

**Linting：**
- [工具：例如，"ESLint 配置在 eslint.config.js 中"]
- [规则：例如，"extends airbnb-base，生产环境无 console"]
- [运行：例如，"npm run lint"]

## 导入组织

**顺序：**
1. [例如，"外部包（react、express 等）"]
2. [例如，"内部模块（@/lib、@/components）"]
3. [例如，"相对导入（.、..）"]
4. [例如，"类型导入（import type {}）"]

**分组：**
- [空行：例如，"组之间有空行"]
- [排序：例如，"每组内按字母顺序"]

**路径别名：**
- [使用的别名：例如，"@/ 映射到 src/，@components/ 映射到 src/components/"]

## 错误处理

**模式：**
- [策略：例如，"抛出错误，在边界捕获"]
- [自定义错误：例如，"扩展 Error 类，命名为 *Error"]
- [异步：例如，"使用 try/catch，无 .catch() 链"]

**错误类型：**
- [何时抛出：例如，"无效输入、缺少依赖项"]
- [何时返回：例如，"预期失败返回 Result<T, E>"]
- [日志记录：例如，"抛出前记录带有上下文的错误"]

## 日志记录

**框架：**
- [工具：例如，"console.log、pino、winston"]
- [级别：例如，"debug、info、warn、error"]

**模式：**
- [格式：例如，"带有上下文对象的结构化日志记录"]
- [何时：例如，"记录状态转换、外部调用"]
- [位置：例如，"在服务边界记录，不在工具中"]

## 注释

**何时注释：**
- [例如，"解释为什么，而不是什么"]
- [例如，"记录业务逻辑、算法、边缘情况"]
- [例如，"避免明显的注释，如 // 递增计数器"]

**JSDoc/TSDoc：**
- [使用：例如，"公共 API 必需，内部可选"]
- [格式：例如，"使用 @param、@returns、@throws 标签"]

**TODO 注释：**
- [模式：例如，"// TODO(username): 描述"]
- [跟踪：例如，"如果可用，链接到问题编号"]

## 函数设计

**大小：**
- [例如，"保持在 50 行以下，提取助手"]

**参数：**
- [例如，"最多 3 个参数，更多使用对象"]
- [例如，"在参数列表中解构对象"]

**返回值：**
- [例如，"显式返回，无隐式 undefined"]
- [例如，"保护子句提前返回"]

## 模块设计

**导出：**
- [例如，"首选命名导出，React 组件使用默认导出"]
- [例如，"从 index.ts 导出公共 API"]

**Barrel 文件：**
- [例如，"使用 index.ts 重新导出公共 API"]
- [例如，"避免循环依赖"]

---

*约定分析：[日期]*
*模式更改时更新*
```

<good_examples>
```markdown
# 编码约定

**分析日期：** 2025-01-20

## 命名模式

**文件：**
- 所有文件使用 kebab-case（command-handler.ts、user-service.ts）
- 源文件旁边的 *.test.ts
- Barrel 导出使用 index.ts

**函数：**
- 所有函数使用 camelCase
- 异步函数没有特殊前缀
- 事件处理器使用 handleEventName（handleClick、handleSubmit）

**变量：**
- 变量使用 camelCase
- 常量使用 UPPER_SNAKE_CASE（MAX_RETRIES、API_BASE_URL）
- 无下划线前缀（TS 中无私有标记）

**类型：**
- 接口使用 PascalCase，无 I 前缀（User，不是 IUser）
- 类型别名使用 PascalCase（UserConfig、ResponseData）
- 枚举名使用 PascalCase，值使用 UPPER_CASE（Status.PENDING）

## 代码风格

**格式化：**
- Prettier 配置在 .prettierrc 中
- 100 个字符行长度
- 字符串使用单引号
- 需要分号
- 2 空格缩进

**Linting：**
- ESLint 配置在 eslint.config.js 中
- Extends @typescript-eslint/recommended
- 生产代码中无 console.log（使用 logger）
- 运行：npm run lint

## 导入组织

**顺序：**
1. 外部包（react、express、commander）
2. 内部模块（@/lib、@/services）
3. 相对导入（./utils、../types）
4. 类型导入（import type { User }）

**分组：**
- 组之间有空行
- 每组内按字母顺序
- 每组内类型导入在最后

**路径别名：**
- @/ 映射到 src/
- 未定义其他别名

## 错误处理

**模式：**
- 抛出错误，在边界捕获（路由处理器、主函数）
- 为自定义错误扩展 Error 类（ValidationError、NotFoundError）
- 异步函数使用 try/catch，无 .catch() 链

**错误类型：**
- 无效输入、缺少依赖项、不变量违规时抛出
- 抛出前记录带有上下文的错误：logger.error({ err, userId }, 'Failed to process')
- 在错误消息中包含原因：new Error('Failed to X', { cause: originalError })

## 日志记录

**框架：**
- 从 lib/logger.ts 导出的 pino logger 实例
- 级别：debug、info、warn、error（无 trace）

**模式：**
- 带有上下文的结构化日志记录：logger.info({ userId, action }, 'User action')
- 在服务边界记录，不在工具函数中
- 记录状态转换、外部 API 调用、错误
- 提交的代码中无 console.log

## 注释

**何时注释：**
- 解释为什么，而不是什么：// Retry 3 times because API has transient failures
- 记录业务规则：// Users must verify email within 24 hours
- 解释非显而易见的算法或变通方法
- 避免明显的注释：// set count to 0

**JSDoc/TSDoc：**
- 公共 API 函数必需
- 如果签名不言自明，内部函数可选
- 使用 @param、@returns、@throws 标签

**TODO 注释：**
- 格式：// TODO: description（无用户名，使用 git blame）
- 如果存在问题则链接：// TODO: Fix race condition (issue #123)

## 函数设计

**大小：**
- 保持在 50 行以下
- 为复杂逻辑提取助手
- 每个函数一个抽象级别

**参数：**
- 最多 3 个参数
- 4+ 个参数使用选项对象：function create(options: CreateOptions)
- 在参数列表中解构：function process({ id, name }: ProcessParams)

**返回值：**
- 显式 return 语句
- 保护子句提前返回
- 预期失败使用 Result<T, E> 类型

## 模块设计

**导出：**
- 首选命名导出
- React 组件仅使用默认导出
- 从 index.ts barrel 文件导出公共 API

**Barrel 文件：**
- index.ts 重新导出公共 API
- 保持内部助手私有（不从 index 导出）
- 避免循环依赖（如果需要，从特定文件导入）

---

*约定分析：2025-01-20*
*模式更改时更新*
```
</good_examples>

<guidelines>
**什么属于 CONVENTIONS.md：**
- 代码库中观察到的命名模式
- 格式化规则（Prettier 配置、linting 规则）
- 导入组织模式
- 错误处理策略
- 日志记录方法
- 注释约定
- 函数和模块设计模式

**什么不属于这里：**
- 架构决策（那是 ARCHITECTURE.md）
- 技术选择（那是 STACK.md）
- 测试模式（那是 TESTING.md）
- 文件组织（那是 STRUCTURE.md）

**填充此模板时：**
- 检查 .prettierrc、.eslintrc 或类似的配置文件
- 检查 5-10 个代表性源文件的模式
- 寻找一致性：如果 80%+ 遵循模式，记录它
- 要规范性："使用 X"而不是"有时使用 Y"
- 注意偏差："旧代码使用 Y，新代码应使用 X"
- 保持在约 150 行以内

**在以下情况下对阶段规划有用：**
- 编写新代码（匹配现有风格）
- 添加功能（遵循命名模式）
- 重构（应用一致的约定）
- 代码审查（根据记录的模式检查）
- 入职（了解风格期望）

**分析方法：**
- 扫描 src/ 目录以查找文件命名模式
- 检查 package.json 脚本以查找 lint/format 命令
- 读取 5-10 个文件以识别函数命名、错误处理
- 查找配置文件（.prettierrc、eslint.config.js）
- 注意导入、注释、函数签名中的模式
</guidelines>
