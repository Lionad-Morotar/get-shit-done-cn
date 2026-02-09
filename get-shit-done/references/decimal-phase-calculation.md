# 十进制阶段计算

为紧急插入计算下一个十进制阶段编号。

## 使用 gsd-tools

```bash
# 获取阶段 6 之后的下一个十进制阶段
node ~/.claude/get-shit-done/bin/gsd-tools.js phase next-decimal 6
```

输出:
```json
{
  "found": true,
  "base_phase": "06",
  "next": "06.1",
  "existing": []
}
```

带有现有十进制阶段:
```json
{
  "found": true,
  "base_phase": "06",
  "next": "06.3",
  "existing": ["06.1", "06.2"]
}
```

## 提取值

```bash
DECIMAL_INFO=$(node ~/.claude/get-shit-done/bin/gsd-tools.js phase next-decimal "${AFTER_PHASE}")
DECIMAL_PHASE=$(echo "$DECIMAL_INFO" | jq -r '.next')
BASE_PHASE=$(echo "$DECIMAL_INFO" | jq -r '.base_phase')
```

或使用 --raw 标志:
```bash
DECIMAL_PHASE=$(node ~/.claude/get-shit-done/bin/gsd-tools.js phase next-decimal "${AFTER_PHASE}" --raw)
# 仅返回: 06.1
```

## 示例

| 现有阶段 | 下一个阶段 |
|-----------------|------------|
| 06 仅 | 06.1 |
| 06, 06.1 | 06.2 |
| 06, 06.1, 06.2 | 06.3 |
| 06, 06.1, 06.3 (间隔) | 06.4 |

## 目录命名

十进制阶段目录使用完整的十进制数字:

```bash
SLUG=$(node ~/.claude/get-shit-done/bin/gsd-tools.js generate-slug "$DESCRIPTION" --raw)
PHASE_DIR=".planning/phases/${DECIMAL_PHASE}-${SLUG}"
mkdir -p "$PHASE_DIR"
```

示例: `.planning/phases/06.1-fix-critical-auth-bug/`
