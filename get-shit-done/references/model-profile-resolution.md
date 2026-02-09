# 模型配置文件解析

在编排开始时解析一次模型配置文件，然后在所有任务生成中使用它。

## 解析模式

```bash
MODEL_PROFILE=$(cat .planning/config.json 2>/dev/null | grep -o '"model_profile"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || echo "balanced")
```

默认值：如果未设置或配置文件缺失，则为 `balanced`。

## 查找表

@~/.claude/get-shit-done/references/model-profiles.md

在表中查找已解析配置文件对应的代理。将模型参数传递给任务调用：

```
Task(
  prompt="...",
  subagent_type="gsd-planner",
  model="{resolved_model}"  # e.g., "opus" for quality profile
)
```

## 使用方法

1. 在编排开始时解析一次
2. 存储配置文件值
3. 在生成时从表中查找每个代理的模型
4. 将模型参数传递给每个任务调用
