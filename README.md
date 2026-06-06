# oh-my-costrict (OMG)

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
- **10 个编排技能** — 完整 8-Phase 开发流水线 (workflow) + 各阶段独立命令 (prd/design/plan/tdd/review/verify) + 质询审查 (grill-me/grill-with-docs) + UI 设计 (ui-ux-pro-max)
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

### 流水线命令

| 技能 | 用途 | 触发方式 |
|------|------|----------|
| `/oh-my-costrict:omg:workflow` | 完整开发流水线（idea → PRD → UI设计 → 架构设计 → 拆解子任务 → TDD编码 → 代码审查+DX审查 → 修复循环 → 验证+汇总报告） | `/oh-my-costrict:omg:workflow <任务>` 或说 "workflow" / "构建" |

### 阶段独立命令

| 技能 | 对应 Phase | 用途 | 触发方式 |
|------|-----------|------|----------|
| `/oh-my-costrict:omg:prd` | Phase 1 | 需求探索 + PRD 生成 | `/oh-my-costrict:omg:prd <任务>` |
| `/oh-my-costrict:omg:design` | Phase 3 | 架构设计 + 审查 | `/oh-my-costrict:omg:design <需求>` |
| `/oh-my-costrict:omg:plan` | Phase 4 | 拆解编码子任务 | `/oh-my-costrict:omg:plan <文档>` |
| `/oh-my-costrict:omg:tdd` | Phase 5 | TDD 并行编码 | `/oh-my-costrict:omg:tdd <功能>` 或说 "tdd" |
| `/oh-my-costrict:omg:review` | Phase 6 | 代码审查 + DX 审查 | `/oh-my-costrict:omg:review <路径>` 或说 "review" / "审查" |
| `/oh-my-costrict:omg:verify` | Phase 8 | 验证 + 汇总报告 | `/oh-my-costrict:omg:verify <路径>` 或说 "verify" / "验证" |

### 独立工具命令

| 技能 | 用途 | 触发方式 |
|------|------|----------|
| `/oh-my-costrict:omg:grill-me` | 质询式设计审查 | `/oh-my-costrict:omg:grill-me` |
| `/oh-my-costrict:omg:grill-with-docs` | 领域模型驱动的设计审查 | `/oh-my-costrict:omg:grill-with-docs <路径>` 或说 "grill" |
| `/oh-my-costrict:omg:ui-ux-pro-max` | UI/UX 设计智能 | `/oh-my-costrict:omg:ui-ux-pro-max <需求>` |

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
├── skills/              # 编排技能（10 个 SKILL.md）
│   ├── workflow/        # 8-Phase 完整流水线
│   ├── prd/             # Phase 1: 需求 + PRD
│   ├── design/          # Phase 3: 架构设计
│   ├── plan/            # Phase 4: 拆解子任务
│   ├── tdd/             # Phase 5: TDD 编码
│   ├── review/          # Phase 6: 代码 + DX 审查
│   ├── verify/          # Phase 8: 验证 + 汇总
│   ├── grill-me/        # 质询式审查
│   ├── grill-with-docs/ # 领域模型审查
│   └── ui-ux-pro-max/   # UI/UX 设计智能
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
