# 支持打 NPM 包 — @yan-geroge/omg

## Goal

为 oh-my-costrict 项目添加 NPM 包发布支持，发布为 `@yan-geroge/omg`，使 CSC 插件可通过 NPM 安装。

## What I already know

* 项目是 CSC 插件 (oh-my-costrict)，含 plugin.json、agents/、skills/、hooks/、scripts/
* 组织名 `yan-geroge`，包名 `omg`，完整名称 `@yan-geroge/omg`
* 当前版本 0.1.0 (来自 plugin.json)
* 项目无 package.json、.gitignore、.npmignore

## Requirements

* 创建 `package.json`，配置为 NPM 发布
  * name: `@yan-geroge/omg`
  * version: 0.1.0 (与 plugin.json 一致)
  * 入口指向 plugin.json
  * files 字段白名单控制发布内容：plugin.json, marketplace.json, agents/, skills/, hooks/(含lib/), scripts/, CLAUDE.md, .claude/
* 创建 `.npmignore` 兜底排除 .trellis/、tests/、node_modules/

## Acceptance Criteria

* [x] `package.json` 存在，name 为 `@yan-geroge/omg`
* [x] `npm pack --dry-run` 输出显示正确的文件列表
* [x] 发布包包含 plugin.json、agents/、skills/、hooks/、scripts/、CLAUDE.md
* [x] 发布包不包含 .trellis/、tests/、node_modules/

## Definition of Done

* package.json 配置正确
* .npmignore 配置正确
* npm pack --dry-run 验证通过

## Out of Scope

* 实际 npm publish（需要 NPM token/auth）
* CI/CD 自动发布流水线
* 版本号自动管理
* 构建/编译步骤（当前无需编译）

## Technical Notes

* CSC 插件通过 NPM 分发时，需要 plugin.json 和所有运行时文件
* 入口点可设为 plugin.json 或 agents/ 目录
* 参考：CSC 插件 marketplace 注册机制 (marketplace.json)
