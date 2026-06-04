# oh-my-costrict — 项目术语表 (CONTEXT.md)

> **纯术语表** — 不包含实现细节、技术规格或 TODO 列表。
> 此文件由 grill-with-docs 在架构设计审查阶段自动维护。

---

## 核心概念

### CSC (CoStrict CLI)
- **定义**：CoStrict CLI 平台，AI 编码助手的命令行运行时环境
- **区别于**：Claude Code（是 CSC 的上游平台）
- **首次使用于**：项目初始化

### OMC (oh-my-costrict)
- **定义**：运行在 CSC 之上的多智能体编排层，协调专业化代理、技能和工具
- **区别于**：oh-my-claudecode（是 Claude Code 原生版本的 OMC）
- **首次使用于**：项目初始化

### Skill（技能）
- **定义**：CSC 插件系统中的可复用功能模块，以 SKILL.md 定义
- **区别于**：Agent（代理是运行时实体，Skill 是功能定义）
- **首次使用于**：项目初始化

### Agent（代理）
- **定义**：执行特定任务的 AI 子进程，如 planner、executor、reviewer、verifier
- **区别于**：Skill（Skill 是定义，Agent 是执行者）
- **首次使用于**：项目初始化

### Spec（规范）
- **定义**：.trellis/spec/ 目录下的编码规范文件，按 package 和 layer 组织
- **区别于**：CONTEXT.md（Spec 是技术规范，CONTEXT.md 是领域术语）
- **首次使用于**：项目初始化

### Trellis
- **定义**：任务管理和工作流编排系统，管理 task 生命周期（create → start → archive）
- **区别于**：OMC（Trellis 管理任务流程，OMC 编排代理执行）
- **首次使用于**：项目初始化

### ADR（架构决策记录）
- **定义**：记录重要架构决策及其上下文、备选方案、后果的文档
- **区别于**：PRD（PRD 描述要做什么，ADR 记录为什么这样做）
- **首次使用于**：grill-with-docs 集成

---

## 工作流阶段

### Brainstorm（需求探索）
- **定义**：Phase 1.1，通过 relentless interview 模式与用户互动，明确需求、编写 PRD
- **区别于**：Research（Brainstorm 是需求对话，Research 是技术调研）
- **首次使用于**：项目初始化

### Design Review（设计审查）
- **定义**：Phase 2a/2b，分 UI 设计审查（ui-ux-pro-max）和架构设计审查（grill-with-docs）
- **区别于**：Engineering Review（设计审查关注方案，工程审查关注代码）
- **首次使用于**：grill-with-docs 集成

### Engineering Review（工程审查）
- **定义**：Phase 3，对代码实现进行质量、安全、性能审查
- **区别于**：Design Review（工程审查在代码写完后，设计审查在代码写之前）
- **首次使用于**：项目初始化

---

## 设计审查术语

### Grill（无情面试）
- **定义**：一种审查模式，逐个问题追问方案的每个决策分支，直到所有问题被解决
- **区别于**：普通 Review（Grill 是深度追问，Review 是全面检查）
- **首次使用于**：grill-me / grill-with-docs 集成

### Design System（设计系统）
- **定义**：UI 设计的一组标准化决策，包含风格、调色板、字体、间距、圆角、阴影
- **区别于**：Style Guide（设计系统更全面，包含交互规范和 UX 准则）
- **首次使用于**：ui-ux-pro-max 集成

### Domain Model（领域模型）
- **定义**：项目的核心业务概念及其关系，由 CONTEXT.md 术语表和 .trellis/spec/ 规范构成
- **区别于**：Data Model（领域模型是业务概念，数据模型是技术存储结构）
- **首次使用于**：grill-with-docs 集成
