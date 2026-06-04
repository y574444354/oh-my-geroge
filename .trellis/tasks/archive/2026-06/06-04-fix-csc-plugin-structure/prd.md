# 修复 NPM 包 — 添加 .claude-plugin/ 结构

## Goal

NPM 包缺少 CSC 要求的 `.claude-plugin/plugin.json`，导致无法被 CSC 插件系统识别。添加此结构并发布 0.1.2。

## Requirements

* 创建 `.claude-plugin/plugin.json`
* 创建 `.claude-plugin/marketplace.json`
* `package.json` files 中添加 `.claude-plugin/`
* 版本升至 0.1.2，commit + push + npm publish
