# 将 TDD 红-绿-重构循环集成到 Trellis 工作流

## Goal

在不修改 Trellis 核心工作流文件（workflow.md）的前提下，通过新建 TDD 规范文件 + implement.jsonl 注入机制 + dispatch 提示词增强，让 TDD（测试驱动开发）的"红-绿-重构"循环成为每个任务的默认行为。

## What I already know

* 用户选择方案 1+2 组合：
  * **方案 2（主）**：创建 TDD 规范文件放入 `.trellis/spec/`，通过 `implement.jsonl` 注入到 `trellis-implement` 子代理
  * **方案 1（辅）**：在 Phase 2.1 dispatch `trellis-implement` 时在 dispatch prompt 中明确要求遵循 TDD
* 项目 spec 层级：`backend/`、`frontend/`、`guides/`
* `guides/` 已有 `code-reuse-thinking-guide.md` 和 `cross-layer-thinking-guide.md` 两个跨切面思考指南
* `backend/quality-guidelines.md` 中的 "Testing Requirements" 节目前为空模板
* `implement.jsonl` 和 `check.jsonl` 目前只有 seed `_example` 行
* 项目 CLAUDE.md 中已注册 `oh-my-costrict:tdd-guide` 代理（红-绿-重构循环，目标 80%+ 覆盖率）
* 可用技能中有 `tdd` 技能（test-driven development with red-green-refactor loop）

## 技术要求

* TDD 规范文件内容应包含：红-绿-重构三步循环的完整描述、覆盖率目标（≥80%）、各层测试编写规范
* 此文件应放入 `implement.jsonl` 中，确保每个 `trellis-implement` 子代理在编码前必读
* 在 Phase 2.1 dispatch prompt 模板中增加 TDD 要求（最小改动）
* 如果项目后续采用 inline dispatch 模式，需要确保 `trellis-before-dev` 技能也能加载 TDD 规范

## Decision (ADR-lite)

**Context**: TDD 规范文件是跨切面实践，不限于单一技术层。内容深度选完整版（方案 B）。dispatch 增强选用直接在 prompt 中写入 TDD 指令。
**Decision**:
  1. 新建 `.trellis/spec/guides/tdd-workflow.md`（完整版，含红-绿-重构循环、各层测试策略、常见错误、快速参考）
  2. 在 `backend/quality-guidelines.md` 和 `frontend/quality-guidelines.md` 的 Testing Requirements 节中引用它
  3. 主 session 派发 `trellis-implement` 时，在 dispatch prompt 中明确写入 TDD 指令
**Consequences**: 核心 TDD 循环描述集中维护，backend/frontend 只做语言特定的测试补充引用。子代理无需额外加载技能，通过 spec 注入（implement.jsonl）+ dispatch prompt 双重保障 TDD 执行。

## Requirements

* 新建 `.trellis/spec/guides/tdd-workflow.md`（完整版，~100行）
  * 含 Why TDD、Red-Green-Refactor 循环详解、覆盖率目标 ≥80%
  * 含各层测试策略（backend: pytest/vitest + mock + 数据库测试；frontend: 组件/ Hook /状态管理测试）
  * 含常见 TDD 错误和反模式
  * 含快速参考触发条件
* 将 TDD 规范文件路径加入 `implement.jsonl` 的注入列表
* 更新 `guides/index.md` 加入 TDD 指南条目
* 更新 `backend/quality-guidelines.md` 和 `frontend/quality-guidelines.md` 的 Testing Requirements 节，引用 TDD 规范

## Acceptance Criteria

* [ ] `.trellis/spec/guides/tdd-workflow.md` 存在，内容覆盖红-绿-重构三阶段
* [ ] TDD 规范文件被引用到 `guides/index.md` 中
* [ ] TDD 规范文件路径被添加到 `implement.jsonl`
* [ ] `backend/quality-guidelines.md` 的 Testing Requirements 节不再为空（引用 TDD 规范）
* [ ] `frontend/quality-guidelines.md` 的 Testing Requirements 节不再为空（引用 TDD 规范）

## Open Questions

* （无 — 全部决策已确认）

## Definition of Done

* TDD 规范文件内容完整（红-绿-重构循环 + 覆盖率目标 + 各层测试策略）
* 通过 `implement.jsonl` 注入链路验证（`task.py validate` 通过）
* index.md 引用完整

## Out of Scope

* 不修改 `workflow.md` 核心工作流结构
* 不创建新的子代理类型
* 不编写具体测试用例代码

## Technical Notes

* `guides/index.md` — 当前只有 code-reuse 和 cross-layer 两个思考指南，TDD 适合作为第三个
* `backend/quality-guidelines.md` — Testing Requirements 节目前为空，可作为 TDD 规范的落地引用点
* `backend/index.md` — 已有 Quality Guidelines 条目，可保持现状或扩展
* `frontend/index.md` — 同理
* 参考格式：现有 spec 文件采用 `## Overview` + 填充区 + `## Forbidden Patterns` 等结构
