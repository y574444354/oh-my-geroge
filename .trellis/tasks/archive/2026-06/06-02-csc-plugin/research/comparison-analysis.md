# OMC / OMX / CSC 三架构对比 & CSC 插件设计启示

## 架构层对比

| 架构层 | OMC (Claude Code) | OMX (Codex CLI) | CSC (CoStrict) → oh-my-costrict |
|--------|-------------------|-----------------|----------------------------------|
| **插件清单** | `.claude-plugin/plugin.json` (skills + mcpServers) | `templates/catalog-manifest.json` | `plugin.json` (commands, skills, agents, hooks, mcpServers, lspServers, outputStyles, settings) |
| **宿主配置注入** | `~/.claude/settings.json` hooks | `~/.codex/config.toml` | `~/.claude/settings.json` enabledPlugins |
| **编排大脑** | CLAUDE.md 系统提示注入 | AGENTS.md 工作区契约 | CLAUDE.md 或 plugin hooks |
| **Hook 拦截** | Shell command hooks (.mjs) + UserPromptSubmit/PreToolUse/PostToolUse/Stop | notify hook + extensibility .mjs plugins | 27 个生命周期事件 + 4 种 hook type (command/prompt/agent/http) |
| **技能** | 32 SKILL.md (YAML frontmatter) | 36 SKILL.md (YAML frontmatter) | plugin skills/ 目录 (markdown) |
| **代理** | 19 AgentConfig (TypeScript + .md) | 33 AgentDefinition + native TOML | plugin agents/ 目录 (markdown) |
| **MCP Server** | 1 个 (t) - 18+ 工具 | 5 个 (state/memory/code-intel/trace/team) | plugin mcpServers 配置 |
| **安装器** | `omc setup` → 复制文件 + 合并 CLAUDE.md + 注册 hooks | `omx setup` → 注入 config.toml + 安装 AGENTS.md + 注册 native agents | 无独立安装器（CSC 通过 marketplace 自动加载） |
| **状态存储** | `.omc/state/` 文件系统 | `.omx/state/` 文件系统 | 需自建 |
| **关键词检测** | UserPromptSubmit hook | AGENTS.md keyword table + notify hook | 可通过 UserPromptSubmit hook 实现 |
| **团队系统** | tmux-based (TeamCreate/SendMessage MCP) | tmux-based (omx team) | 可后续加入 |
| **扩展性 Hook** | 无独立用户插件系统 | `.omx/hooks/*.mjs` (child process) | CSC 原生 hooks system 已覆盖 |

## 共性模式（CSC 插件必须遵循的 8 个模式）

1. **Plugin Manifest** — 声明式定义插件提供的所有组件
2. **Hook Interception** — 在宿主生命周期关键点注入行为
3. **Orchestration Brain** — 注入编排指令到 AI 的 system prompt
4. **Skills + Agents** — 声明式工作流和代理能力定义
5. **Installer** — idempotent setup 命令
6. **MCP Servers** — 超出宿主能力的扩展工具
7. **State Persistence** — 文件系统状态支持跨会话
8. **Keyword Routing** — 用户意图识别 → 技能/工作流路由

## CSC 特有优势

相比 OMC/OMX 需要自己建立大量基础设施：
- CSC 原生支持 **三层插件架构**（marketplace/built-in/session），插件发现和加载已内置
- CSC 原生支持 **27 个生命周期事件** + 4 种 hook 类型，不需要自己实现 hook 引擎
- CSC 原生支持 **MCP/LSP server** 注册和管理
- CSC 原生支持 **plugin settings** 级联合并
- CSC 插件可以通过 marketplace 分发，有 **企业策略管控**（allowlist/blocklist）

## MVP 设计推断

oh-my-costrict 最小可行版本应聚焦：
1. **plugin.json** — 声明 skills + agents + hooks + mcpServers
2. **少量核心 Skills** — 如 `/team`、`/autopilot`、`/ralph`
3. **少量核心 Agents** — executor, reviewer, architect
4. **SessionStart Hook** — 注入编排器 system prompt
5. **UserPromptSubmit Hook** — 关键词检测与路由
6. **CLAUDE.md 注入** — 编排指令
7. **MCP Server** — 状态管理 + 项目记忆

不需要 MVP 做的（后续迭代）：
- tmux-based team 系统
- tmux HUD
- 跨 CLI 互操作（ask-claude/ask-gemini）
- Discord/Telegram 通知
- Rust 原生二进制
- 管道编排器
