# OMX (oh-my-codex) 插件架构分析

## 项目概况

- **包名**: `oh-my-codex` v0.11.12
- **定位**: Codex CLI 的多智能体编排协调层
- **运行时**: TypeScript (tsc) + Rust workspace (omx-explore, omx-mux, omx-runtime, omx-sparkshell)
- **入口**: `dist/cli/omx.js`

## 架构模型

OMX 不是传统插件，而是一个**协调层**，位于 Codex CLI 之前：

### 1. Install-time Injection（`omx setup`）
注入 Codex CLI 的 `~/.codex/config.toml`：
- `notify` hook → `scripts/notify-hook.js`（每轮后调用）
- `[features]` multi_agent + child_agents_md
- `[env]` USE_OMX_EXPLORE_CMD
- `[agents]` max_threads, max_depth
- 5 个 MCP server 注册
- model_reasoning_effort, developer_instructions
- TUI status line

### 2. AGENTS.md 作为编排大脑
安装到工作区根目录，包含：
- `<keyword_detection>` 关键词路由表
- `<delegation_rules>` 委托规则
- `<team_pipeline>` 团队流水线
- `<verification>` 验证要求
- Marker 包裹的 overlay 区域（`<!-- OMX:RUNTIME:START -->`）

### 3. Notify Hook（每轮后执行）
`notify-hook.js` 做：
- 去重、日志记录
- 更新 mode state（迭代计数）
- 子代理指标跟踪
- HUD 状态写入
- 团队 worker 心跳
- 技能激活记录
- 通知分发（Discord/Telegram/Slack）

### 4. Extensibility Hook System
用户插件在 `.omx/hooks/*.mjs`，export `onHookEvent(event, sdk)`：
- `sdk.tmux.sendKeys()`
- `sdk.log.*`
- `sdk.state.*`（命名空间隔离）
- Team-safety：worker session 中跳过副作用

## CLI 命令

`omx` / `omx exec` / `omx setup` / `omx team` / `omx ralph` / `omx autoresearch` / `omx ask` / `omx explore` / `omx sparkshell` / `omx hooks` / `omx hud` / `omx agents-init` / `omx status` / `omx cancel`

## 技能系统（36 个 SKILL.md）

分类：
- **执行**: autopilot, ralph, ultrawork, team, ultraqa, swarm
- **规划**: plan, ralplan, deep-interview
- **快捷**: analyze, deepsearch, tdd, build-fix, ai-slop-cleaner, code-review, security-review, visual-verdict, web-clone, frontend-ui-ux, git-master, review, ask-claude, ask-gemini
- **工具**: cancel, doctor, help, note, trace, skill, hud, omx-setup

## 代理系统（33 个 Agent）

属性：
- `reasoningEffort`: low/medium/high
- `posture`: frontier-orchestrator/deep-worker/fast-lane
- `modelClass`: frontier/standard/fast
- `routingRole`: leader/specialist/executor
- `tools`: read-only/analysis/execution/data
- `category`: build/review/domain/product/coordination

双轨注册：
1. Programmatic: `AGENT_DEFINITIONS` TypeScript record
2. Native TOML: 写入 `~/.codex/agents/<name>.toml`

## 团队系统（Team）

生命周期：team-plan → team-prd → team-exec → team-verify → team-fix

通信通道：
- **控制面**: tmux panes/processes
- **数据面**: `.omx/state/team/<team>/` 文件系统
- **Dispatch queue**: `dispatch/requests.json`
- **Mailbox**: per-worker JSON files

Runtime bridge: TypeScript → Rust `omx-runtime` binary

## 关键设计模式（适用于 CSC 插件参考）

| 模式 | 说明 |
|------|------|
| **Config Injection** | setup 命令幂等地注入宿主 CLI 配置 |
| **Orchestration Brain** | AGENTS.md 作为模型的运行契约 |
| **Notify/Lifecycle Hooks** | 注册到宿主原生通知/Hook 机制 |
| **SKILL.md 格式** | YAML frontmatter + markdown body |
| **Agent 双轨** | Programmatic definitions + native TOML files |
| **MCP Servers** | 5 个 stdio-based MCP server |
| **Extensibility Hooks** | 用户 .mjs 插件 + child process 沙箱 |
| **State Persistence** | 文件系统状态 + mode lifecycle |
| **Keyword Routing** | 关键词→技能映射表 |
| **Pipeline Orchestrator** | 可组合的 staged pipeline |
