# oh-my-costrict — CSC 多智能体编排插件

## 目标

为 CSC（CoStrict）创建 `oh-my-costrict` 插件，对标 OMC 和 OMX，赋予 CSC 多智能体编排、技能路由、生命周期 Hook 注入能力。

## MVP 范围决策

**选定方案：Skills + Agents + Hooks**（逐步完善，MCP Server 后续迭代加入）

## 已知信息

* CSC 已有完整的三层插件架构（marketplace / built-in / session），通过 `plugin.json` 声明式注册
* CSC 插件可提供：commands, skills, agents, hooks, mcpServers, lspServers, outputStyles, settings
* CSC 的 Hook 系统支持 27 个生命周期事件 + 4 种 hook type（command / prompt / agent / http）
* OMC 和 OMX 的 8 个共性模式：Plugin Manifest → Hook Interception → Orchestration Brain → Skills + Agents → Installer → MCP Servers → State Persistence → Keyword Routing
* CSC 相较 Claud Code/Codex 的优势：原生插件发现/加载、原生 hook 引擎、原生 MCP 管理、marketplace 分发
* 详见 `research/csc-architecture.md`、`research/omc-architecture.md`、`research/omx-architecture.md`、`research/comparison-analysis.md`

## MVP 包含

### Skills（声明式工作流，SKILL.md 格式）
* **autopilot** — 自动审查流水线（PRD → 设计审查 → 工程审查 → DX审查），全自动质量门
* **team** — 多智能体团队编排，将任务拆解分发给多个子代理并行执行

### Agents（子代理能力定义）
* **planner** — 任务规划、PRD 编写、实现计划
* **architect** — 系统设计、架构审查、技术选型
* **executor** — 代码实现（分配最强模型）
* **reviewer** — 代码/设计审查（合并 code-reviewer + security-reviewer）
* **verifier** — 测试运行、结果验证、覆盖率检查
* **tdd-guide** — TDD 工作流指导（写测试 → 红灯 → 绿灯 → 重构），确保 80%+ 覆盖率

### Hooks
* **SessionStart**: 注入编排器 system prompt
* **UserPromptSubmit**: 关键词检测与技能路由
* **PreToolUse / PostToolUse**: 委派规则执行、验证提醒
* **Stop**: 任务延续检查（可选，MVP 可能延后）

### 插件清单
* `plugin.json` — 声明 skills + agents + hooks

### 编排大脑
* CLAUDE.md 系统提示注入（编排指令、委派规则、模型路由）

## MVP 排除（后续迭代）

* MCP Server（状态管理、项目记忆）
* tmux-based 团队系统
* 跨 CLI 互操作（ask-claude / ask-gemini）
* 通知系统（Discord / Telegram）
* Rust 原生二进制
* 管道编排器（pipeline orchestrator）
* Extensibility hooks（用户自定义 .mjs 插件）

## 技术要求

* 第一版：简单、可用、可扩展
* 插件以 CSC 标准 `plugin.json` 格式组织
* Skills 和 Agents 使用 markdown 格式（与 CSC 原生格式一致）
* Hooks 使用 CSC 的 command type hook（shell 脚本）

## 验收标准（待定）

* [ ] 插件可被 CSC 加载和识别（`plugin.json` 有效）
* [ ] SessionStart hook 成功注入编排器 system prompt
* [ ] UserPromptSubmit hook 实现关键词检测和技能路由
* [ ] 至少 N 个核心 skills 可正常工作
* [ ] 至少 M 个 agents 可被 CSC 的子代理系统使用
* [ ] 测试覆盖率达到 80%+

## 完成定义

* 测试通过（单元/集成测试）
* Lint / 类型检查通过
* 文档/注释完善（中文）

## 决策记录 (ADR-lite)

**Context**: 确定 MVP 功能范围
**Decision**: 选择 Skills + Agents + Hooks 方案（不含 MCP Server）
**Consequences**: 缺少 MCP server 意味着状态管理和项目记忆需要依赖文件系统直接读写（而非通过 MCP 工具抽象），后续迭代需补齐

## 技术笔记

* 详见 `research/` 目录下的四个分析文件
