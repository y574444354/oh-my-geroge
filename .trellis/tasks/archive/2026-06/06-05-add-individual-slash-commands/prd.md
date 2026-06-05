# 重设计流水线 + 全节点独立命令

## Goal

拆掉当前割裂的 `costrict-autopilot`（只审查不写码）+ `costrict-team`（写码但不接 PRD），重组成一条完整的 `idea → PRD → 设计 → 审查 → TDD 编码 → 代码审查 → 验证 → DX 审查 → 完成` 流水线。同时每个节点都支持作为独立 `/oh-my-costrict:xxx` 斜杠命令单独调用。

## What I already know

### 现状
- **已有 Skill（= 斜杠命令）**：`costrict-autopilot`、`costrict-team`、`grill-with-docs`、`ui-ux-pro-max`
- **已有 Agent（= 内部执行器）**：`planner`、`architect`、`executor`、`reviewer`、`verifier`、`tdd-guide`
- 两条流水线互不相连：autopilot 产出 PRD 和审查报告但 team 不消费，team 从零开始重新规划
- 多个 agent（tdd-guide、reviewer、verifier、planner）没有对应的独立斜杠命令
- `grill-with-docs` 已有完整的 SKILL.md，但未注册关键词检测

### 参考源（mattpocock skills）
- **位置**：`D:\source_codespace\geroge\costrict-repo\skills\mattpocock\skills\`
- **结构规范**：每个 skill 一个目录，内含 `SKILL.md`（YAML frontmatter: `name`、`description`、`argument-hint`）
- **grill-me**：极简 4 行指令，纯质询对话
- **tdd**：红-绿-重构循环

## Decisions

| 决策点 | 结论 |
|--------|------|
| 命令前缀 | `/oh-my-costrict:`（不改 `plugin.json` 的 `name`） |
| 流水线结构 | 新命令 `/oh-my-costrict:workflow` 替代 autopilot + team，一条串到底 |
| PRD vs Design | 分开两个阶段：PRD = What & Why（内置 grill-with-docs），Design = How（内置 grill-with-docs） |
| grill 关键词路由 | "grill" → `/oh-my-costrict:grill-with-docs`；grill-me 仅手动调用 |
| 旧流水线 | `costrict-autopilot` + `costrict-team` 标记为 deprecated |
| CLAUDE.md | 同步更新 |

---

## 新流水线设计

```
/oh-my-costrict:workflow <idea>
      │
      ▼
┌──────────────────────────────────────────────────────────────┐
│ Phase 1: 需求探索 + PRD 生成     独立命令: /oh-my-costrict:prd         │
│   委托 planner agent，内置 grill-with-docs 术语挑战                    │
│   产出：PRD 文档 + CONTEXT.md 术语更新                                  │
│   🚦 Gate: PRD 审查通过？→ 继续 / 修改 / 终止                           │
└──────────────────────────────────────────────────────────────┘
      ↓
┌──────────────────────────────────────────────────────────────┐
│ Phase 2: UI 设计 + 审查 [条件触发]                               │
│   委托 ui-ux-pro-max skill（检测到前端/UI 关键词时触发）                 │
│   产出：UI 设计系统推荐 + 审查报告                                       │
│   🚦 Gate: 设计审查通过？→ 继续 / 修改 / 跳过                           │
└──────────────────────────────────────────────────────────────┘
      ↓
┌──────────────────────────────────────────────────────────────┐
│ Phase 3: 架构设计 + 审查        独立命令: /oh-my-costrict:design       │
│   委托 architect agent，内置 grill-with-docs 挑战技术选型               │
│   产出：技术方案文档 + ADR                                              │
│   🚦 Gate: 架构审查通过？→ 继续 / 修改 / 终止                           │
└──────────────────────────────────────────────────────────────┘
      ↓
┌──────────────────────────────────────────────────────────────┐
│ Phase 4: 拆解编码子任务         独立命令: /oh-my-costrict:plan          │
│   委托 planner agent，从 PRD + 设计 + 架构 产出独立子任务                │
│   按垂直切片拆分，每个子任务可独立编码和测试                                │
│   产出：子任务列表（优先级排序 + 依赖关系）                                │
└──────────────────────────────────────────────────────────────┘
      ↓
┌──────────────────────────────────────────────────────────────┐
│ Phase 5: TDD 编码               独立命令: /oh-my-costrict:tdd          │
│   executor × N 并行执行，tdd-guide 引导红-绿-重构循环                   │
│   子任务可并行编码（无依赖关系的可同时进行）                                │
│   产出：代码 + 测试（覆盖率 >= 80%）                                     │
└──────────────────────────────────────────────────────────────┘
      ↓
┌──────────────────────────────────────────────────────────────┐
│ Phase 6: 代码审查 + DX 审查     独立命令: /oh-my-costrict:review       │
│   委托 reviewer agent（代码质量 + 开发者体验 双视角）                     │
│   产出：审查报告（CRITICAL/HIGH/MEDIUM/LOW 分级）                       │
└──────────────────────────────────────────────────────────────┘
      ↓
┌──────────────────────────────────────────────────────────────┐
│ Phase 7: 修复循环                                           │
│   根据审查报告，executor 修复 → reviewer 再审                     │
│   最多 3 轮，任一轮通过即跳出                                          │
└──────────────────────────────────────────────────────────────┘
      ↓
┌──────────────────────────────────────────────────────────────┐
│ Phase 8: 验证 + 汇总报告        独立命令: /oh-my-costrict:verify       │
│   委托 verifier agent（测试 + 覆盖率 + lint + typecheck）              │
│   汇总全流程产出：PRD + 设计 + 代码 + 测试 + 审查 + 验证报告               │
│   最终质量评分（A/B/C/D/F）                                            │
└──────────────────────────────────────────────────────────────┘
      ↓
   🎉 完成
```

## 完整命令矩阵

### 流水线命令
| 命令 | 状态 | 说明 |
|------|------|------|
| `/oh-my-costrict:workflow` | **新建** | 完整 8 Phase 流水线，idea → code → verified |

### 阶段独立命令（对应流水线各 Phase）
| 命令 | 对应 Phase | 委托 | 说明 |
|------|-----------|------|------|
| `/oh-my-costrict:prd` | Phase 1 | planner + grill-with-docs | 需求探索 + PRD 生成 |
| `/oh-my-costrict:design` | Phase 3 | architect + grill-with-docs | 架构设计 + 审查 |
| `/oh-my-costrict:plan` | Phase 4 | planner agent | 拆解编码子任务 |
| `/oh-my-costrict:tdd` | Phase 5 | tdd-guide × executor × N | TDD 并行编码 |
| `/oh-my-costrict:review` | Phase 6 | reviewer agent | 代码审查 + DX 审查 |
| `/oh-my-costrict:verify` | Phase 8 | verifier agent | 验证 + 汇总报告 |

### 独立工具命令（不绑定流水线 Phase）
| 命令 | 状态 | 说明 |
|------|------|------|
| `/oh-my-costrict:grill-me` | **新建** | 纯质询对话，不限于流水线上下文 |
| `/oh-my-costrict:grill-with-docs` | 已有 | 领域模型驱动的设计审查（Phase 1/3 中内置） |
| `/oh-my-costrict:ui-ux-pro-max` | 已有 | UI/UX 设计智能（Phase 2 条件触发） |

### 废弃命令
| 命令 | 状态 | 替代 |
|------|------|------|
| `/oh-my-costrict:costrict-autopilot` | 标记 deprecated | → `/oh-my-costrict:workflow` |
| `/oh-my-costrict:costrict-team` | 标记 deprecated | → `/oh-my-costrict:workflow` |

---

## Requirements

### R1: 新建 10 个 SKILL.md
1. `skills/grill-me/SKILL.md` — 极简质询，参考 mattpocock
2. `skills/prd/SKILL.md` — PRD 生成，委托 planner + 内置 grill-with-docs
3. `skills/design/SKILL.md` — 技术方案，委托 architect + 内置 grill-with-docs
4. `skills/design-review/SKILL.md` — 并行 orchestrator：ui-ux-pro-max + arch-review
5. `skills/arch-review/SKILL.md` — 架构审查，委托 grill-with-docs（架构聚焦）
6. `skills/tdd/SKILL.md` — TDD，委托 tdd-guide agent
7. `skills/review/SKILL.md` — 代码审查，委托 reviewer agent
8. `skills/verify/SKILL.md` — 验证修复：verifier + executor 修复循环，直到测试/覆盖率/lint 全部通过
9. `skills/dx-review/SKILL.md` — DX 审查，委托 reviewer agent（DX 聚焦）
10. `skills/workflow/SKILL.md` — 完整流水线 orchestrator

### R2: 废弃旧流水线
- `skills/costrict-autopilot/` → 保留文件但 SKILL.md 中标注 deprecated + 指向 workflow
- `skills/costrict-team/` → 保留文件但 SKILL.md 中标注 deprecated + 指向 workflow

### R3: 更新关键词检测器
- 新增规则（`hooks/lib/keyword-detector.js`）：
  - `grill` → `oh-my-costrict:grill-with-docs`（子串匹配，priority 10）
  - `tdd` → `oh-my-costrict:tdd`（精确匹配，priority 10）
  - `review` / `审查` → `oh-my-costrict:review`（精确匹配，priority 10）
  - `verify` / `验证` → `oh-my-costrict:verify`（精确匹配，priority 10）
  - `workflow` / `构建` → `oh-my-costrict:workflow`（精确匹配，priority 10）
- 移除或降级：`autopilot` / `auto` → workflow（或保留兼容）
- 原有 `team` 规则调整

### R4: 更新 CLAUDE.md
- 完整重写技能表和 agent 表
- 列出新流水线和所有独立命令
- 标记 deprecated 命令

## Acceptance Criteria

- [ ] `/oh-my-costrict:workflow <任务>` 启动完整流水线，按顺序执行 7 个阶段
- [ ] 流水线 Stage 3 中 UI 审查和架构审查**并行**执行
- [ ] 每个阶段的输出作为下一阶段的输入
- [ ] 10 个新 `/oh-my-costrict:xxx` 命令均可独立调用
- [ ] grill-with-docs 在 PRD 和 Design 两个阶段中内置生效
- [ ] 关键词检测覆盖：grill、tdd、review/审查、verify/验证、workflow/构建
- [ ] 旧 autopilot/team 命令仍可用但标记为 deprecated
- [ ] CLAUDE.md 反映完整命令清单
- [ ] 关键词检测器单元测试通过

## Definition of Done

- [ ] 10 个新 SKILL.md 创建完毕
- [ ] 2 个旧 SKILL.md 标记 deprecated
- [ ] `hooks/lib/keyword-detector.js` 更新 + 测试通过
- [ ] `CLAUDE.md` 更新
- [ ] Lint 检查通过

## Out of Scope

- 不改 `plugin.json` 的 `name` 字段
- 不引入 mattpocock 的其他 skill（diagnose、to-prd、to-issues、caveman 等）
- 不修改已有 agent 文件（planner/architect/executor/reviewer/verifier/tdd-guide）
- 不做 CI/CD 流程（deploy 阶段）

## Technical Approach

### 文件变更清单

| 操作 | 文件 | 说明 |
|------|------|------|
| 新建 | `skills/grill-me/SKILL.md` | 极简质询 |
| 新建 | `skills/prd/SKILL.md` | PRD + planner + grill-with-docs |
| 新建 | `skills/design/SKILL.md` | 技术方案 + architect + grill-with-docs |
| 新建 | `skills/design-review/SKILL.md` | 并行 UI + 架构审查 |
| 新建 | `skills/arch-review/SKILL.md` | 架构审查 standalone |
| 新建 | `skills/tdd/SKILL.md` | TDD 包装 tdd-guide |
| 新建 | `skills/review/SKILL.md` | 代码审查包装 reviewer |
| 新建 | `skills/verify/SKILL.md` | 验证包装 verifier |
| 新建 | `skills/dx-review/SKILL.md` | DX 审查 |
| 新建 | `skills/workflow/SKILL.md` | 主流水线 orchestrator |
| 编辑 | `skills/costrict-autopilot/SKILL.md` | 标注 deprecated |
| 编辑 | `skills/costrict-team/SKILL.md` | 标注 deprecated |
| 编辑 | `hooks/lib/keyword-detector.js` | 新增/调整关键词规则 |
| 编辑 | `CLAUDE.md` | 重写技能清单 |

### 委托关系

```
skill                     →  委托的 agent/skill
─────────────────────────────────────────────
prd                       →  planner agent (<grill-with-docs 内置在指令中>)
design                    →  architect agent (<grill-with-docs 内置在指令中>)
design-review             →  ui-ux-pro-max skill ∥ arch-review skill (并行)
arch-review               →  grill-with-docs skill (架构聚焦模式)
tdd                       →  tdd-guide agent
review                    →  reviewer agent
verify                    →  verifier agent
dx-review                 →  reviewer agent (DX 指令)
grill-me                  →  直接对话（无委托）
workflow                     →  串联 Stage 1-7 (orchestrator)
```

## Technical Notes

- 参考源：`D:\source_codespace\geroge\costrict-repo\skills\mattpocock\skills\`
- 现有 grill-with-docs：`skills/grill-with-docs/SKILL.md`
- 现有 agent：`agents/planner.md`、`agents/architect.md`、`agents/reviewer.md`、`agents/verifier.md`、`agents/tdd-guide.md`
- 关键词检测器：`hooks/lib/keyword-detector.js`
- 测试文件：`tests/keyword-detector.test.js`
