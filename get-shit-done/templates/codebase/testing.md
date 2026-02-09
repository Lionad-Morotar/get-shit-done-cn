# 测试模式模板

`.planning/codebase/TESTING.md` 的模板——捕获测试框架和模式。

**目的：** 记录如何编写和运行测试。用于添加匹配现有模式的测试的指南。

---

## 文件模板

```markdown
# 测试模式

**分析日期：** [YYYY-MM-DD]

## 测试框架

**运行器：**
- [框架：例如，"Jest 29.x"、"Vitest 1.x"]
- [配置：例如，"项目根目录中的 jest.config.js"]

**断言库：**
- [库：例如，"内置 expect"、"chai"]
- [匹配器：例如，"toBe、toEqual、toThrow"]

**运行命令：**
```bash
[例如，"npm test" 或 "npm run test"]              # 运行所有测试
[例如，"npm test -- --watch"]                     # 监视模式
[例如，"npm test -- path/to/file.test.ts"]       # 单个文件
[例如，"npm run test:coverage"]                   # 覆盖率报告
```

## 测试文件组织

**位置：**
- [模式：例如，"源文件旁边的 *.test.ts"]
- [替代：例如，"__tests__/ 目录"或"单独的 tests/ 树"]

**命名：**
- [单元测试：例如，"module-name.test.ts"]
- [集成：例如，"feature-name.integration.test.ts"]
- [E2E：例如，"user-flow.e2e.test.ts"]

**结构：**
```
[显示实际目录模式，例如：
src/
  lib/
    utils.ts
    utils.test.ts
  services/
    user-service.ts
    user-service.test.ts
]
```

## 测试结构

**套件组织：**
```typescript
[显示使用的实际模式，例如：

describe('ModuleName', () => {
  describe('functionName', () => {
    it('should handle success case', () => {
      // arrange
      // act
      // assert
    });

    it('should handle error case', () => {
      // 测试代码
    });
  });
});
]
```

**模式：**
- [设置：例如，"beforeEach 用于共享设置，避免 beforeAll"]
- [拆卸：例如，"afterEach 清理、恢复模拟"]
- [结构：例如，"需要 arrange/act/assert 模式"]

## 模拟

**框架：**
- [工具：例如，"Jest 内置模拟"、"Vitest vi"、"Sinon"]
- [导入模拟：例如，"文件顶部的 vi.mock()"]

**模式：**
```typescript
[显示实际模拟模式，例如：

// 模拟外部依赖
vi.mock('./external-service', () => ({
  fetchData: vi.fn()
}));

// 在测试中模拟
const mockFetch = vi.mocked(fetchData);
mockFetch.mockResolvedValue({ data: 'test' });
]
```

**模拟什么：**
- [例如，"外部 API、文件系统、数据库"]
- [例如，"时间/日期（使用 vi.useFakeTimers）"]
- [例如，"网络调用（使用模拟 fetch）"]

**不模拟什么：**
- [例如，"纯函数、工具"]
- [例如，"内部业务逻辑"]

## 夹具和工厂

**测试数据：**
```typescript
[显示创建测试数据的模式，例如：

// 工厂模式
function createTestUser(overrides?: Partial<User>): User {
  return {
    id: 'test-id',
    name: 'Test User',
    email: 'test@example.com',
    ...overrides
  };
}

// 夹具文件
// tests/fixtures/users.ts
export const mockUsers = [/* ... */];
]
```

**位置：**
- [例如，"tests/fixtures/ 用于共享夹具"]
- [例如，"测试文件或 tests/factories/ 中的工厂函数"]

## 覆盖率

**要求：**
- [目标：例如，"80% 行覆盖率"、"无特定目标"]
- [强制：例如，"CI 阻止 <80%"、"仅用于覆盖率的意识"]

**配置：**
- [工具：例如，"通过 --coverage 标志的内置覆盖率"]
- [排除：例如，"排除 *.test.ts、配置文件"]

**查看覆盖率：**
```bash
[例如，"npm run test:coverage"]
[例如，"open coverage/index.html"]
```

## 测试类型

**单元测试：**
- [范围：例如，"单独测试单个函数/类"]
- [模拟：例如，"模拟所有外部依赖项"]
- [速度：例如，"必须在每个测试 <1s 内运行"]

**集成测试：**
- [范围：例如，"一起测试多个模块"]
- [模拟：例如，"模拟外部服务，使用真实内部模块"]
- [设置：例如，"使用测试数据库、种子数据"]

**E2E 测试：**
- [框架：例如，"用于 E2E 的 Playwright"]
- [范围：例如，"测试完整的用户流程"]
- [位置：例如，"与单元测试分开的 e2e/ 目录"]

## 常见模式

**异步测试：**
```typescript
[显示模式，例如：

it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBe('expected');
});
]
```

**错误测试：**
```typescript
[显示模式，例如：

it('should throw on invalid input', () => {
  expect(() => functionCall()).toThrow('error message');
});

// 异步错误
it('should reject on failure', async () => {
  await expect(asyncCall()).rejects.toThrow('error message');
});
]
```

**快照测试：**
- [用法：例如，"仅用于 React 组件"或"未使用"]
- [位置：例如，"__snapshots__/ 目录"]

---

*测试分析：[日期]*
*测试模式更改时更新*
```

<good_examples>
```markdown
# 测试模式

**分析日期：** 2025-01-20

## 测试框架

**运行器：**
- Vitest 1.0.4
- 配置：项目根目录中的 vitest.config.ts

**断言库：**
- Vitest 内置 expect
- 匹配器：toBe、toEqual、toThrow、toMatchObject

**运行命令：**
```bash
npm test                              # 运行所有测试
npm test -- --watch                   # 监视模式
npm test -- path/to/file.test.ts     # 单个文件
npm run test:coverage                 # 覆盖率报告
```

## 测试文件组织

**位置：**
- 源文件旁边的 *.test.ts
- 无单独的 tests/ 目录

**命名：**
- 所有测试使用 unit-name.test.ts
- 文件名中单元/集成之间没有区别

**结构：**
```
src/
  lib/
    parser.ts
    parser.test.ts
  services/
    install-service.ts
    install-service.test.ts
  bin/
    install.ts
    (无测试 - 通过 CLI 集成测试)
```

## 测试结构

**套件组织：**
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ModuleName', () => {
  describe('functionName', () => {
    beforeEach(() => {
      // 重置状态
    });

    it('should handle valid input', () => {
      // arrange
      const input = createTestInput();

      // act
      const result = functionName(input);

      // assert
      expect(result).toEqual(expectedOutput);
    });

    it('should throw on invalid input', () => {
      expect(() => functionName(null)).toThrow('Invalid input');
    });
  });
});
```

**模式：**
- 使用 beforeEach 进行每个测试的设置，避免 beforeAll
- 使用 afterEach 恢复模拟：vi.restoreAllMocks()
- 在复杂测试中显式的 arrange/act/assert 注释
- 每个测试一个断点焦点（但多个 expect 可以）

## 模拟

**框架：**
- Vitest 内置模拟 (vi)
- 模块模拟通过测试文件顶部的 vi.mock()

**模式：**
```typescript
// 文件顶部
vi.mock('fs-extra', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn()
}));

// 在测试中
const mockReadFile = vi.mocked(readFile);
mockReadFile.mockResolvedValue('file content');
```

**模拟什么：**
- 文件系统操作（readFile、writeFile）
- 外部 CLI 工具（child_process.exec）
- 时间/日期（vi.useFakeTimers）

**不模拟什么：**
- 纯解析函数
- 字符串/对象工具
- 业务逻辑

## 夹具和工厂

**测试数据：**
```typescript
// 工厂模式
function createTestConfig(overrides?: Partial<Config>): Config {
  return {
    name: 'test-project',
    version: '1.0.0',
    phases: [],
    ...overrides
  };
};
```

**位置：**
- 在测试文件内（每个文件的工厂）
- 无共享夹具目录

## 覆盖率

**要求：**
- 无特定目标（用于意识，不强制）
- 新功能应包含测试

**配置：**
- 通过 --coverage 标志的内置 Vitest 覆盖率
- 排除：*.test.ts、vitest.config.ts、bin/

**查看覆盖率：**
```bash
npm run test:coverage
open coverage/index.html
```

## 测试类型

**单元测试：**
- 范围：单独测试单个函数/类
- 模拟：模拟所有外部依赖项（fs、child_process）
- 速度：必须在每个测试 <100ms 内运行

**集成测试：**
- 无单独集成测试（所有单元测试）
- 通过 CLI 命令手动集成测试

**E2E 测试：**
- 无 E2E 测试

## 常见模式

**异步测试：**
```typescript
it('should handle async parse', async () => {
  const result = await parseConfig('valid-config.yaml');
  expect(result).toEqual(expectedConfig);
});
```

**错误测试：**
```typescript
it('should throw on missing file', () => {
  expect(() => parseConfig('missing.yaml')).toThrow('File not found');
});

// 异步错误
it('should reject on invalid yaml', async () => {
  await expect(parseConfig('invalid.yaml')).rejects.toThrow('Invalid YAML');
});
```

**快照测试：**
- 未使用

---

*测试分析：2025-01-20*
*测试模式更改时更新*
```
</good_examples>

<guidelines>
**什么属于 TESTING.md：**
- 测试框架和运行器
- 运行测试的命令
- 测试文件位置和命名约定
- 测试结构模式（describe/it 组织）
- 模拟框架和模式
- 测试数据/工厂
- 覆盖率要求和配置
- 单元/集成/E2E 测试的范围
- 异步和错误测试的模式

**什么不属于这里：**
- 架构决策（那是 ARCHITECTURE.md）
- 编码约定（那是 CONVENTIONS.md）
- 代码演练（推迟到代码读取）
- TDD 工作流（那是 references/tdd.md）

**填充此模板时：**
- 检查 package.json 脚本中的测试命令
- 查找现有测试文件以识别模式
- 注意测试运行器配置（jest.config.js、vitest.config.ts）
- 检查覆盖率配置和报告
- 记录实际观察到的模式，而不是理想模式

**在以下情况下对阶段规划有用：**
- 为新功能编写测试
- 调试测试失败
- 了解测试策略
- 设置测试环境
- 添加新测试类型
</guidelines>
