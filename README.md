# oh-my-costrict (OMC)

[![npm version](https://img.shields.io/npm/v/@yan-geroge/omg?color=cb3837)](https://www.npmjs.com/package/@yan-geroge/omg)
[![GitHub](https://img.shields.io/badge/GitHub-y574444354%2Foh--my--geroge-blue?logo=github)](https://github.com/y574444354/oh-my-geroge)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> CSC 多智能体编排插件 — 为 CoStrict CLI (CSC) 提供多智能体编排、技能路由和生命周期 Hook 注入能力。

## 快速开始

**推荐安装方式（GitHub）：**

```bash
/plugin marketplace add https://github.com/y574444354/oh-my-geroge
/plugin install oh-my-costrict
/reload-plugins
```

**NPM 包（供其他项目依赖）：**

```bash
npm install @yan-geroge/omg
```

## 特性

- **6 个专用子代理** — planner, architect, executor, reviewer, verifier, tdd-guide，覆盖完整开发流程
- **2 个编排技能** — autopilot 自动审查流水线 + team 多智能体并行团队
- **生命周期 Hook** — SessionStart 注入工作流状态，UserPromptSubmit 关键词检测触发代理路由
- **中文优先** — 所有文档、注释、代理提示均使用中文

## 可用代理

| 代理 | 用途 | 使用时机 |
|------|------|----------|
| `oh-my-costrict:planner` | 任务规划、PRD 编写 | 复杂功能、重构前 |
| `oh-my-costrict:architect` | 系统设计、架构审查 | 架构决策时 |
| `oh-my-costrict:executor` | 代码实现 | 编写或修改代码时 |
| `oh-my-costrict:reviewer` | 代码/设计/安全审查 | 代码刚写完时 |
| `oh-my-costrict:verifier` | 测试运行、覆盖率检查 | 实现完成后 |
| `oh-my-costrict:tdd-guide` | TDD 红-绿-重构循环 | 新功能、Bug 修复 |

## 可用技能

| 技能 | 用途 | 触发方式 |
|------|------|----------|
| `/oh-my-costrict:costrict-autopilot` | 自动审查流水线（PRD → 设计审查 → 工程审查 → DX 审查 → 汇总报告） | `/costrict-autopilot <任务>` |
| `/oh-my-costrict:costrict-team` | 多智能体团队编排（规划 → 并行执行 → 审查 → 修复循环 → 验证） | `/costrict-team <任务>` |

## 开发流程

```
规划 → 设计 → TDD → 实现 → 审查 → 验证
```

1. **规划** — 使用 `oh-my-costrict:planner` 分析需求、编写 PRD
2. **设计** — 使用 `oh-my-costrict:architect` 审查架构方案
3. **TDD** — 使用 `oh-my-costrict:tdd-guide` 引导测试驱动开发
4. **实现** — 使用 `oh-my-costrict:executor` 编写代码
5. **审查** — 使用 `oh-my-costrict:reviewer` 进行代码审查
6. **验证** — 使用 `oh-my-costrict:verifier` 运行测试、检查覆盖率

## 运营原则

- **委托优先** — 将专业化工作委托给最合适的代理
- **证据优先** — 验证结果后再做最终声明
- **最轻量路径** — 保持质量的前提下选择最简单的实现方式
- **不重复造轮子** — 优先搜索和复用现有实现

## 项目结构

```
oh-my-costrict/
├── .claude-plugin/      # CSC 插件入口（必需）
│   ├── plugin.json      # 插件清单
│   └── marketplace.json # 插件市场注册信息
├── agents/              # 子代理定义 (markdown)
│   ├── architect.md
│   ├── executor.md
│   ├── planner.md
│   ├── reviewer.md
│   ├── tdd-guide.md
│   └── verifier.md
├── skills/              # 编排技能
│   ├── costrict-autopilot/
│   └── costrict-team/
├── hooks/               # 生命周期 Hook
│   ├── session-start.mjs
│   ├── keyword-detector.mjs
│   └── lib/
├── scripts/             # 诊断与验证工具
├── tests/               # Hook 和关键词检测测试
├── plugin.json          # 根级插件配置（向后兼容）
├── package.json         # NPM 包配置 (@yan-geroge/omg)
└── CLAUDE.md            # 项目指令文件
```

## 插件系统说明

oh-my-costrict 通过 CSC 的插件系统分发：

- **`.claude-plugin/plugin.json`** — CSC 识别的插件入口，定义技能、Hook 和元数据
- **`.claude-plugin/marketplace.json`** — 插件市场注册信息，CSC 通过 GitHub 地址克隆并读取
- **`plugin.json`** — 根级插件配置，与 `.claude-plugin/plugin.json` 内容一致，用于向后兼容

## 验证要求

- 所有测试通过
- 覆盖率 ≥ 80%
- 代码审查通过（无 CRITICAL/HIGH 问题）
- Lint/类型检查通过

## License

MIT
