<purpose>
切换 GSD 代理使用的模型配置。控制每个代理使用哪个 Claude 模型，平衡质量与令牌消耗。
</purpose>

<required_reading>
在开始之前读取调用提示的 execution_context 引用的所有文件。
</required_reading>

<process>

<step name="validate">
验证参数：

```
如果 $ARGUMENTS.profile 不在 ["quality"、"balanced"、"budget"] 中：
  错误：无效的配置 "$ARGUMENTS.profile"
  有效配置：quality、balanced、budget
  退出
```</step>

<step name="ensure_and_load_config">
确保配置存在并加载当前状态：

```bash
node ~/.claude/get-shit-done/bin/gsd-tools.js config-ensure-section
INIT=$(node ~/.claude/get-shit-done/bin/gsd-tools.js state load)
```

如果缺少，这将使用默认值创建 `.planning/config.json` 并加载当前配置。
</step>

<step name="update_config">
从状态加载或直接读取当前配置：

更新 `model_profile` 字段：
```json
{
  "model_profile": "$ARGUMENTS.profile"
}
```

将更新的配置写回到 `.planning/config.json`。
</step>

<step name="confirm">
显示确认并展示所选配置的模型表：

```
✓ 模型配置已设置为：$ARGUMENTS.profile

代理现在将使用：

[从 gsd-tools.js 中所选配置的 MODEL_PROFILES 显示表]

示例：
| 代理 | 模型 |
|-------|-------|
| gsd-planner | opus |
| gsd-executor | sonnet |
| gsd-verifier | haiku |
| ... | ... |

下一个生成的代理将使用新配置。
```

映射配置名称：
- quality：使用 MODEL_PROFILES 中的 "quality" 列
- balanced：使用 MODEL_PROFILES 中的 "balanced" 列
- budget：使用 MODEL_PROFILES 中的 "budget" 列
</step>

</process>

<success_criteria>
- [ ] 参数已验证
- [ ] 配置文件已确保
- [ ] 配置已更新并带有新的 model_profile
- [ ] 已显示确认并带有模型表
      </success_criteria>
