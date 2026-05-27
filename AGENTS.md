# AGENTS.md

> [!NOTE]
> 本文件是为 AI 编码助手（如 Antigravity, Claude Code, GitHub Copilot 等）准备的快速指南，提供当前项目的开发流程、规范和核心技术约束。

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->

---

## 🍊 项目概览 (Project Overview)
**Orange Time** 是一个使用 React 19 + Vite + Tailwind CSS 构建的高颜值个人任务管理系统前端应用。
* **主要特性**：玻璃摩登 UI (Glassmorphism)、互动仪表盘、时间线视图、智能分类及动效。
* **架构特点**：纯前端组件化开发，支持通过 Docker 容器化运行，并使用本地 mock 或简单 API 接口与后端交互。

---

## 🛠 常用命令 (Setup & Commands)
* **安装依赖**：`npm install`
* **启动本地开发服务**：`npm run dev` (访问 http://localhost:5173)
* **构建生产包**：`npm run build`
* **通过 Docker Compose 运行**：`docker-compose up --build`

---

## 📐 代码风格与设计规范 (Code Style & Design System)
1. **视觉规范**：
   * **玻璃拟态 (Glassmorphism)**：使用半透明背景（如 `bg-white/10` 或 `bg-slate-900/40`）、高斯模糊（`backdrop-blur-md`）、细边框（`border-white/20`）和柔和阴影。
   * **色彩搭配**：拒绝低级的单色，采用柔和、精心设计的 HSL 或渐变色（如橙色/蜜桃色渐变系）。
   * **微交互**：所有按钮和可交互卡片必须有平滑的 hover 悬停效果和过渡动画。
2. **架构规范**：
   * **React 19 + TypeScript**：严格定义 Props 和数据模型的 TypeScript 类型。
   * **模块化组件**：UI 组件必须划分在 `components/` 目录下，保持高内聚低耦合。
   * **状态隔离**：展现层组件应尽量保持无状态，业务状态与 mock 请求应当统一封装在 hooks 或单独的 utils 工具中。

---

## 🔄 SDD (规范驱动开发) 工作流
本项目集成了 **GitHub Spec Kit**，请遵循以下标准的五步开发流程：

1. **确立规范 (Specify)**：
   运行 `$speckit-specify` 技能，根据需求生成或更新规范文件（如 `spec.md`）。
2. **制定计划 (Plan)**：
   运行 `$speckit-plan` 技能，为改动生成详细的实现计划 `implementation_plan.md`。
3. **分解任务 (Tasks)**：
   运行 `$speckit-tasks` 技能，将计划拆解为有序、易跟踪的任务列表 `task.md`。
4. **代码实现 (Implement)**：
   运行 `$speckit-implement` 技能，按任务清单执行开发，并在开发完毕后通过 `walkthrough.md` 记录变更。
5. **项目宪章 (Constitution)**：
   如有重大架构或技术栈变更，需更新 [`.specify/memory/constitution.md`](file:///.specify/memory/constitution.md) 并提升版本。

---

## ⚠️ 安全与注意事项
* **不要在 `.agents/` 或 `.specify/` 之外存储敏感的 Token 或密钥**。如有临时敏感文件，需确保被 `.gitignore` 包含。
* **Git 提交钩子**：本库配置了 spec-kit 的自动 Git 提交钩子。在重要阶段开始或结束时，会提示或自动生成以规范为导向的 Git 提交信息。
