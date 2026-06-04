# CSC 插件架构分析

## 项目概况

- **包名**: `@costrict/csc` v4.1.9
- **定位**: CoStrict AI 编码助手 —— Claude Code 的 fork/重命名版本
- **运行时**: Bun (>=1.2.0)，含 Node.js 兼容层
- **语言**: TypeScript + React (Ink 终端 UI)

## 插件系统架构（三层）

CSC 已有成熟的三层插件加载架构：

### 优先级（从高到低）

1. **Session-only 插件** — `--plugin-dir` CLI 参数或 SDK 注入
2. **Marketplace 插件** — 从 `known_marketplaces.json` 安装
3. **Built-in 插件** — 通过 `registerBuiltinPlugin()` 注册

### 插件加载流程

```
loadAllPlugins()
  → loadPluginsFromMarketplaces()     // 读取 settings.enabledPlugins
  → getInlinePlugins()                // Session-only 覆盖
  → initBuiltinPlugins()              // 内置插件（如 weixin@builtin）
  → assemblePluginLoadResult()        // 按名称合并，session 覆盖 marketplace
```

## 插件可提供的组件

一个 CSC 插件（通过 `plugin.json` 声明 + 目录结构）可以提供：

| 组件 | 目录/配置 | 说明 |
|------|----------|------|
| **Commands** | `commands/` | Markdown 文件 = 斜杠命令 |
| **Skills** | `skills/` | Markdown 文件 = 模型可调用的技能 |
| **Agents** | `agents/` | 自定义子代理定义 |
| **Hooks** | `hooks` 配置字段 | 生命周期钩子 |
| **MCP Servers** | `mcpServers` 配置 | MCP 服务器（含 MCPB 包） |
| **LSP Servers** | `lspServers` 配置 | 语言服务器 |
| **Output Styles** | `output-styles/` | 输出格式化器 |
| **Settings** | `settings` 配置 | 合并到全局设置级联 |

## Hook 系统（27 个生命周期事件）

### 支持的 Hook 事件

`PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `Notification`, `UserPromptSubmit`, `SessionStart`, `SessionEnd`, `Stop`, `StopFailure`, `SubagentStart`, `SubagentStop`, `PreCompact`, `PostCompact`, `PermissionRequest`, `PermissionDenied`, `Setup`, `TeammateIdle`, `TaskCreated`, `TaskCompleted`, `Elicitation`, `ElicitationResult`, `ConfigChange`, `WorktreeCreate`, `WorktreeRemove`, `InstructionsLoaded`, `CwdChanged`, `FileChanged`

### Hook 实现类型（4 种）

1. **`command`** — Shell 命令执行
2. **`prompt`** — LLM prompt 评估
3. **`agent`** — Agent 验证器
4. **`http`** — HTTP POST 回调

## 命令注册与执行流程

```
main.tsx
  → getCommands()
    → bundledSkills         (内置技能)
    → builtinPluginSkills   (启用的内置插件)
    → skillDirCommands      (~/.claude/skills/ + 项目 .claude/skills/)
    → workflowCommands      (.claude/workflows/)
    → pluginCommands        (marketplace 插件)
    → pluginSkills          (插件技能目录)
    → COMMANDS()            (硬编码斜杠命令 ~100 个)
```

### 命令类型
- `prompt` — 展开为发送给模型的文本
- `local` — 同步本地操作
- `local-jsx` — Ink React UI（交互式终端 UI）

## 插件目录结构

```
~/.claude/plugins/cache/{marketplace}/{plugin-name}/{version}/
  ├── plugin.json          # 插件清单
  ├── commands/            # 斜杠命令（markdown）
  ├── skills/              # 技能（markdown）
  ├── agents/              # 子代理
  ├── output-styles/       # 输出样式
  └── hooks/               # Hook 配置
```

## 关键发现

1. **CSC 不需要"实现插件系统"** —— 它已经有完整的三层插件架构
2. **要做的**：创建一个 `oh-my-costrict` 插件，利用 CSC 现有插件机制，提供：
   - 技能（Skills）—— 多智能体编排命令
   - 代理（Agents）—— 专门的子代理定义
   - Hooks —— 生命周期注入（如 SessionStart 上下文注入）
   - 命令（Commands）—— 类似 `/team`、`/autopilot` 等编排命令
3. **对标**：OMC 对 Claude Code 做的事 = oh-my-costrict 对 CSC 做的事
4. **OMC 和 OMX 的参考价值**：理解它们的技能/代理/编排模式，然后映射到 CSC 的插件清单格式
