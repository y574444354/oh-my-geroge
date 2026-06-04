# OMC (Oh-My-ClaudeCode) 插件架构分析

## 项目概况

- **包名**: `oh-my-claude-sisyphus` v4.11.4
- **定位**: Claude Code 的多智能体编排插件
- **运行时**: Node.js + TypeScript ESM → esbuild CJS bundle
- **入口**: `bridge/cli.cjs` (CLI) + `src/index.ts` (SDK API)

## 四层架构模型

OMC 通过四个不同的接口层与 Claude Code 集成：

### 1. Plugin Manifest（`.claude-plugin/plugin.json`）
```json
{
  "name": "oh-my-claudecode",
  "version": "4.11.4",
  "description": "Multi-agent orchestration system for Claude Code",
  "skills": "./skills/",
  "mcpServers": "./.mcp.json"
}
```
- 声明 skills 路径 + MCP 服务器
- Claude Code 的插件系统自动读取并注册

### 2. Hook 注入（`settings.json` hooks）
核心拦截层，通过 Claude Code 的原生 Hook 系统注册 shell 命令：
- **SessionStart**: 注入代码库地图、agents overlay、CLAUDE.md 上下文
- **UserPromptSubmit**: 检测魔法关键词（ralph, ultrawork, autopilot...）
- **PreToolUse**: 编排器强制执行、后台任务跟踪、规则注入、权限处理
- **PostToolUse**: 验证提醒、项目记忆学习
- **PostToolUseFailure**: 错误恢复
- **Stop**: 持久模式强制执行、todo 延续检查

### 3. System Prompt 注入（`CLAUDE.md`）
将编排器系统提示注入 `~/.claude/CLAUDE.md`，用 `<!-- OMC:START/END -->` 标记包裹：
- `<operating_principles>` — 委托规则
- `<delegation_rules>` — 何时委托 vs 直接工作
- `<model_routing>` — haiku/sonnet/opus 模型分级
- `<agent_catalog>` — 19 个代理定义
- `<skills>` — 32 个技能及触发模式
- `<team_pipeline>` — 团队编排流程

### 4. SDK Programmatic API（`src/index.ts`）
导出 `createOmcSession()` / `getOmcSystemPrompt()` / `enhancePrompt()` 等

## 代理系统（19 个专业子代理）

```
AgentConfig {
  name, description, prompt (from .md), tools, disallowedTools,
  model (haiku/sonnet/opus), defaultModel,
  metadata: { costTier, delegationTriggers, useWhen, avoidWhen }
}
```

代理类别：exploration, specialist, advisor, utility, orchestration, planner, reviewer

## 技能系统（32 个内置技能）

定义在 `skills/<name>/SKILL.md`，带 YAML frontmatter：
```yaml
---
name: ultrawork
description: Parallel execution engine
argument-hint: "<task description>"
level: 4
---
```

## 安装器模式（`omc setup`）

1. 复制 agent .md 文件到 `~/.claude/agents/`
2. 复制 hook .mjs 脚本到 `~/.claude/hooks/`
3. 注册 hooks 到 `~/.claude/settings.json`
4. 合并 CLAUDE.md 内容（带版本标记 + 清理旧版）
5. 注册 MCP 服务器
6. 版本跟踪 + 过时清理

## MCP 服务器

- `bridge/mcp-server.cjs` (880KB CJS bundle)
- 注册为 MCP server `t`
- 提供 18+ 自定义工具（LSP, AST, Python REPL, state, notepad, memory, wiki...）

## 状态驱动的编排

文件系统状态 (`$TEMP/` or `.omc/state/`)：
- `subagent-tracking.json` — 跟踪所有生成的子代理
- `hud-state.json` — 编排器 HUD 状态
- `mission-state.json` — 任务跟踪
- `project-memory.json` — 持久项目知识
- `notepad.md` — 压缩恢复记忆

## 关键设计模式（适用于 CSC 插件参考）

| 模式 | 说明 |
|------|------|
| **Plugin Manifest** | 声明式插件注册，skills/mcpServers 路径 |
| **Hook Interception** | 利用宿主原生 Hook 系统在生命周期关键点注入 |
| **System Prompt Injection** | CLAUDE.md 标记包裹注入编排指令 |
| **Installer Pattern** | setup 命令同步文件到宿主配置目录 |
| **State-Driven** | 文件系统状态支持会话间持久化 |
| **MCP Server** | 提供超出宿主范围的扩展工具 |
| **Agent + Skill 双系统** | Agent = 子代理能力定义，Skill = 用户触发的工作流 |
