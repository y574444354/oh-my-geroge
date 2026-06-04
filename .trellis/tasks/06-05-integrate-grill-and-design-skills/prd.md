# 集成 grill-me / grill-with-docs / ui-ux-pro-max 到需求分析与设计阶段

## Goal

将 Matt Pocock 的 grill-me + grill-with-docs 和 nextlevelbuilder 的 ui-ux-pro-max 三套技能内置到 oh-my-costrict 的自动化流水线中，实现需求分析→UI设计→架构设计的全自动深度审查，无需用户手动触发。

## 背景分析

### 三技能的定位与现状

| 技能 | 来源 | 用途 | 在现有流程中的状态 |
|------|------|------|-------------------|
| **grill-me** | mattpocock/skills | 无情面试官：逐个问问题，走完决策树每个分支，偏好代码库探索多于询问用户 | ✅ 已内置在 `trellis-brainstorm` 核心规则中 |
| **grill-with-docs** | mattpocock/skills | 领域模型挑战：用 CONTEXT.md 术语表挑战方案、精确化术语、内联更新文档和 ADR | ❌ 未集成 |
| **ui-ux-pro-max** | nextlevelbuilder/ui-ux-pro-max-skill | UI/UX 设计智能：50+风格、161调色板、57字体配对、99条UX准则、25种图表类型 | ❌ 未集成 |

### 设计阶段拆分

设计阶段应分为两个独立维度：
- **UI 设计**：当任务涉及前端/UI 时自动触发 ui-ux-pro-max
- **架构设计**：所有任务自动触发 grill-with-docs 进行领域模型+技术方案挑战

## Requirements

### R1: grill-me 强化（已有基础，显式化）

- [x] grill-me 的 relentless interview 模式已在 `trellis-brainstorm` 中
- [ ] 在 brainstorm skill 中显式标注 grill-me 模式已激活
- [ ] 增加决策树可视化（在 PRD 中记录已遍历的分支）

### R2: grill-with-docs 技能创建

- [ ] 创建 `skills/grill-with-docs/SKILL.md`
- [ ] 适配 oh-my-costrict 的 spec 体系（.trellis/spec/ 替代 CONTEXT.md）
- [ ] 支持 ADR 生成（记录到 .trellis/spec/ 或 docs/adr/）
- [ ] 自动触发规则：PRD 确认后 → 进入设计阶段时自动执行

### R3: ui-ux-pro-max 技能集成

- [ ] 创建 `skills/ui-ux-pro-max/SKILL.md`（CSC 包装器）
- [ ] 保留原技能的搜索脚本和设计系统生成能力
- [ ] 自动触发规则：任务涉及前端/frontend/UI 时自动执行
- [ ] 产出设计系统文档到任务目录

### R4: costrict-autopilot 流水线升级

- [ ] Phase 1: PRD 生成（grill-me 内置其中）
- [ ] Phase 2a: UI 设计审查（ui-ux-pro-max）— 条件触发
- [ ] Phase 2b: 架构设计审查（grill-with-docs）— 始终触发
- [ ] Phase 3: 工程审查（不变）
- [ ] Phase 4: DX 审查（不变）
- [ ] Phase 5: 汇总报告（不变）

### R5: 全自动化

- [ ] 用户只需发起 `/costrict-autopilot <任务描述>`
- [ ] 无需手动调用 grill-me、grill-with-docs、ui-ux-pro-max
- [ ] 各阶段按顺序自动执行，前序输出自动作为后续输入
- [ ] 非 UI 任务自动跳过 UI 设计阶段

## Acceptance Criteria

- [ ] `/costrict-autopilot` 执行时自动包含所有设计审查阶段
- [ ] grill-with-docs 对 PRD 进行术语/领域模型/架构决策挑战
- [ ] UI 相关任务自动生成设计系统（风格、调色板、字体、间距）
- [ ] 非 UI 任务（纯后端/CLI）自动跳过 UI 设计阶段
- [ ] 每个阶段产出独立审查报告
- [ ] 汇总报告涵盖所有阶段的通过/失败状态

## Technical Approach

### grill-with-docs 实现方案

**Approach A: 纯 CSC Skill（推荐）**
- 不依赖外部 Python 脚本，完全用 Skill 指令实现
- 适配 oh-my-costrict 的 .trellis/spec/ 体系作为"领域模型"
- ADR 写入 docs/adr/ 目录
- 优点：零外部依赖，与 CSC 深度集成
- 缺点：无独立脚本可复用

选择 Approach A，因为 oh-my-costrict 已有完善的 spec 体系，grill-with-docs 的领域模型挑战可以直接映射到 spec 文件。

### ui-ux-pro-max 实现方案

**方案：CSC Skill 包装器 + 外部脚本引用**
- 创建 CSC skill 定义触发规则和流程
- 引用原技能的 search.py 脚本（如果用户已安装）
- 降级方案：纯指令模式（不依赖外部脚本）
- 优点：保留原技能完整能力，同时支持无脚本环境

### 自动化触发逻辑

```
用户输入 → /costrict-autopilot
  │
  ├─ Phase 1: PRD 生成 (planner + grill-me 已内置在 brainstorm)
  │
  ├─ Phase 2a: UI 设计审查 ← 检测任务是否涉及 frontend/UI/界面
  │   └─ ui-ux-pro-max skill
  │
  ├─ Phase 2b: 架构设计审查 ← 始终执行
  │   └─ grill-with-docs skill
  │
  ├─ Phase 3: 工程审查 (reviewer)
  │
  ├─ Phase 4: DX 审查 (reviewer)
  │
  └─ Phase 5: 汇总报告
```

## Out of Scope

- 不修改 trellis-brainstorm 的核心逻辑（grill-me 已内置）
- 不安装 ui-ux-pro-max 的外部 Python 依赖（用户按需安装）
- 不修改 costrict-team 技能（本次只改造 autopilot）

## Technical Notes

- grill-me 的 relentless interview 模式已存在于 `.claude/skills/trellis-brainstorm/SKILL.md` 的 CoreRule
- .trellis/spec/ 体系包含 backend/ 和 frontend/ 两个 spec layer，可作为领域模型基础
- 现有的 costrict-autopilot 已有 5 阶段流水线结构，扩展只需插入新阶段
- ui-ux-pro-max 原始技能使用 Python 脚本 + CSV 数据文件，完整安装需要 clone 仓库
