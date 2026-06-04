# 技术设计 — oh-my-costrict

## 1. 目录结构

```
oh-my-costrict/
├── plugin.json              # 插件清单（CSC 入口）
├── claude.md                # 编排大脑 system prompt 模板
├── skills/                  # 技能定义（markdown + YAML frontmatter）
│   ├── autopilot.md         # 自动审查流水线
│   └── team.md              # 多智能体团队编排
├── agents/                  # 子代理 prompt 文件
│   ├── planner.md
│   ├── architect.md
│   ├── executor.md
│   ├── reviewer.md
│   ├── verifier.md
│   └── tdd-guide.md
├── hooks/                   # Hook 脚本（Node.js .mjs）
│   ├── session-start.mjs    # SessionStart：注入编排器 system prompt
│   ├── keyword-detector.mjs # UserPromptSubmit：关键词检测与路由
│   └── lib/                 # 抽离的纯函数库（可测试）
│       └── keyword-detector.js
├── tests/                   # 测试文件
│   ├── keyword-detector.test.js
│   ├── session-start.test.js
│   └── plugin-schema.test.js
└── marketplace.json         # 本地 marketplace 注册
```

## 2. plugin.json 设计

```json
{
  "name": "oh-my-costrict",
  "version": "0.1.0",
  "description": "CSC 多智能体编排插件",
  "skills": ["./skills/"],
  "agents": ["./agents/"],
  "hooks": {
    "SessionStart": [
      { "hooks": [{ "type": "command", "command": "node \"${CLAUDE_PLUGIN_ROOT}/hooks/session-start.mjs\"", "timeout": 10000 }] }
    ],
    "UserPromptSubmit": [
      { "hooks": [{ "type": "command", "command": "node \"${CLAUDE_PLUGIN_ROOT}/hooks/keyword-detector.mjs\"", "timeout": 5000 }] }
    ]
  }
}
```

- 使用 `${CLAUDE_PLUGIN_ROOT}` 环境变量定位文件（CSC 加载插件时自动注入）
- Hook 类型统一使用 `command`（确定性强，无额外模型调用）
- `skills`/`agents` 用数组以保持与 CSC 扩展性一致

## 3. Skills 格式

统一使用 markdown + YAML frontmatter：

```yaml
---
name: <skill-name>
description: <简短描述>
argument-hint: "<参数提示>"
---
```

CSC 自动将 skills 目录下的 `.md` 文件注册为 `type: 'prompt'` 的斜杠命令。

### autopilot.md 流程
Phase 1: PRD 生成 (planner) → Phase 2: 设计审查 (architect) → Phase 3: 工程审查 (reviewer) → Phase 4: DX 审查 (reviewer) → Phase 5: 汇总报告

### team.md 流程
Step 1: 规划 (planner) → Step 2: 并行执行 (executor × N) → Step 3: 审查 (reviewer) → Step 4: 修复循环（最多 3 轮）→ Step 5: 验证 (verifier)

## 4. Agents 格式

统一使用 markdown + YAML frontmatter：

```yaml
---
name: <agent-name>
description: <简短描述>
tools:
  - ToolA
  - ToolB
---
```

6 个 agents 不区分模型（统一用 CSC 默认模型），通过 `tools` 字段声明最小必要工具集：

| Agent | 工具集 | 职责 |
|-------|--------|------|
| planner | Read, Glob, Grep, Bash | 任务规划、PRD 编写 |
| architect | Read, Glob, Grep | 系统设计、架构审查 |
| executor | Read, Write, Edit, Bash, Glob, Grep | 代码实现 |
| reviewer | Read, Glob, Grep | 代码/设计/安全审查 |
| verifier | Read, Bash, Glob, Grep | 测试运行、覆盖率检查 |
| tdd-guide | Read, Write, Edit, Bash, Glob, Grep | TDD 红绿重构循环 |

## 5. claude.md 编排大脑

SessionStart hook 注入到 AI system prompt 的编排指令，包含章节：

- 运营原则（委托规则、证据优先、轻量路径）
- 委托规则（何时委托 vs 直接执行）
- 6 个可用代理目录（名称、用途、使用时机）
- 2 个技能说明（/autopilot、/team）
- 并行执行指导
- 验证要求

## 6. Hook 设计

### 6.1 SessionStart Hook
- 触发时机：CSC 会话启动
- 输入：stdin JSON（hook_event_name, session_id, cwd）
- 逻辑：读取 `${CLAUDE_PLUGIN_ROOT}/claude.md` → 包装为 systemMessage
- 输出：`{ "continue": true, "systemMessage": "<claude.md 内容>" }`

### 6.2 UserPromptSubmit Hook
- 触发时机：用户每次提交 prompt
- 输入：stdin JSON（hook_event_name, prompt, session_id）
- 逻辑：提取 prompt → 调 `detectKeywords(prompt)` → 命中则构造路由 systemMessage
- 输出：`{ "continue": true, "systemMessage": "<路由提示或空>" }`
- 非侵入式：`continue: true`，hook 失败不阻塞 CSC

### 6.3 关键词映射表

| 关键词 | 技能 | 优先级 |
|--------|------|--------|
| autopilot | autopilot | 10 |
| auto | autopilot | 5 |
| team | team | 10 |
| tdd | tdd-guide | 10 |

优先级相同时取先匹配的。

## 7. Hook IO 契约

### 输入 Schema（来自 CSC hook 引擎）
```json
{
  "hook_event_name": "SessionStart | UserPromptSubmit",
  "session_id": "string",
  "cwd": "string",
  "prompt": "string (仅 UserPromptSubmit)"
}
```

### 输出 Schema（CSC hook 响应）
```json
{
  "continue": true,
  "systemMessage": "string",
  "stopReason": null
}
```

## 8. 安装方式

MVP：本地目录手动放置

```
用户将插件目录放到 ~/.claude/plugins/cache/local/oh-my-costrict/
在 settings.json 中启用: { "enabledPlugins": ["oh-my-costrict@local"] }

配套 marketplace.json:
{ "name": "omc-local", "plugins": [{ "name": "oh-my-costrict", "version": "0.1.0", "source": "./", "category": "productivity" }] }
```

后续迭代加入 `omc setup` 自动安装命令。

## 9. 测试策略

| 层级 | 对象 | 方式 | 工具 |
|------|------|------|------|
| 单元测试 | keyword-detector 纯函数 | 直接调 `detectKeywords(prompt)` | node:test |
| 集成测试 | hook 脚本完整 IO | 子进程 + stdin JSON → 断言 stdout | node:test |
| Schema 验证 | plugin.json 结构 | 读文件 → 断言必需字段 | node:test |

关键设计：将 keyword-detector 匹配逻辑抽离为 `lib/keyword-detector.js` 纯函数，hook 脚本只做 IO 胶水。覆盖率目标 ≥ 80%。

## 10. 决策汇总

| # | 决策 | 选择 |
|---|------|------|
| 1 | 目录结构 | 标准 CSC 插件布局（skills/ + agents/ + hooks/ + claude.md） |
| 2 | plugin.json | skills/agents 数组，hook 用 command 类型，${CLAUDE_PLUGIN_ROOT} 路径 |
| 3 | Skills 格式 | markdown + YAML frontmatter (name, description, argument-hint) |
| 4 | Agents 格式 | markdown + YAML frontmatter (name, description, tools)，不区分模型 |
| 5 | claude.md | 6 章（运营原则、委托规则、代理目录、技能说明、并行执行、验证） |
| 6 | 关键词检测 | 仅注入路由提示（不注入 skill 正文），优先级相同取先匹配 |
| 7 | Hook IO | continue:true 非侵入式，stdin/stdout JSON |
| 8 | 安装 | MVP 手动放置，无 setup CLI |
| 9 | 测试 | node:test 三层（单元/集成/schema），抽离纯函数 |
