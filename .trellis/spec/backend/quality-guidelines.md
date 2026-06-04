# Quality Guidelines

> Code quality standards for backend development.

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

所有后端代码必须遵循 TDD（测试驱动开发）规范，详见 [TDD Workflow Guide](../guides/tdd-workflow.md)。

核心要求：
- **红-绿-重构循环**：先写失败测试 → 最小实现 → 重构优化
- **覆盖率目标**：>= 80%（单元测试 + 集成测试）
- **测试框架**：pytest / vitest
- **Mock 策略**：对外部依赖（数据库、API、文件系统）使用 Mock，对内部逻辑使用真实调用
- **集成测试**：API 端点、数据库操作必须覆盖

---

## Code Review Checklist

<!-- What reviewers should check -->

(To be filled by the team)
