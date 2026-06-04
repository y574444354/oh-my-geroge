# Quality Guidelines

> Code quality standards for frontend development.

---

## Overview

<!--
Document your project's quality standards here.

Questions to answer:
- What patterns are forbidden?
- What linting rules do you enforce?
- What are your testing requirements?
- What code review standards apply?
-->

(To be filled by the team)

---

## Forbidden Patterns

<!-- Patterns that should never be used and why -->

(To be filled by the team)

---

## Required Patterns

<!-- Patterns that must always be used -->

(To be filled by the team)

---

## Testing Requirements

所有前端代码必须遵循 TDD（测试驱动开发）规范，详见 [TDD Workflow Guide](../guides/tdd-workflow.md)。

核心要求：
- **红-绿-重构循环**：先写失败测试 → 最小实现 → 重构优化
- **覆盖率目标**：>= 80%（单元测试 + 组件测试 + 集成测试）
- **测试框架**：vitest / React Testing Library
- **组件测试**：覆盖渲染、交互、状态变化
- **Hook 测试**：覆盖所有自定义 Hook 的状态转换和副作用
- **E2E 测试**：关键用户流程（登录、核心业务操作）

---

## Code Review Checklist

<!-- What reviewers should check -->

(To be filled by the team)
