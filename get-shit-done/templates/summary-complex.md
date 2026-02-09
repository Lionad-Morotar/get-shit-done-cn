---
phase: XX-name
plan: YY
subsystem: [主要类别]
tags: [可搜索的技术]
requires:
  - phase: [先前阶段]
    provides: [该阶段构建的内容]
provides:
  - [构建/交付的内容的项目符号列表]
affects: [阶段名称或关键字的列表]
tech-stack:
  added: [库/工具]
  patterns: [架构/代码模式]
key-files:
  created: [创建的重要文件]
  modified: [修改的重要文件]
key-decisions:
  - "决策 1"
patterns-established:
  - "模式 1：描述"
duration: Xmin
completed: YYYY-MM-DD
---

# 阶段 [X]: [名称] 摘要（复杂）

**[描述结果的有意义的一句话]**

## 性能
- **持续时间：** [时间]
- **任务：** [已完成计数]
- **修改的文件：** [计数]

## 成就
- [关键结果 1]
- [关键结果 2]

## 任务提交
1. **任务 1：[任务名称]** - `hash`
2. **任务 2：[任务名称]** - `hash`
3. **任务 3：[任务名称]** - `hash`

## 创建/修改的文件
- `path/to/file.ts` - 功能
- `path/to/another.ts` - 功能

## 做出的决策
[带有简要理由的关键决策]

## 偏离计划（自动修复）
[根据 GSD 偏离规则的详细自动修复记录]

## 遇到的问题
[计划工作期间的问题和解决方案]

## 下一阶段就绪
[为下一阶段准备的内容]
[阻塞或问题]
