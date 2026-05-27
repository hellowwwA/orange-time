# Tasks: Homepage Overview (主页概览与分类管理)

**Input**: 设计文档自 `/specs/001-homepage-overview/`

**Prerequisites**: [plan.md](file:///Users/lxn/Documents/orange-time/orange-time-fronent/specs/001-homepage-overview/plan.md), [spec.md](file:///Users/lxn/Documents/orange-time/orange-time-fronent/specs/001-homepage-overview/spec.md)

---

## Phase 1: Setup & Environment Prep (底座准备)

**Purpose**: 创建主页组件文件，引入基础数据类型定义。

- [x] T001 确保主页接收 `tasks`, `categories` 以及 `onTaskClick` 回调 Props。
- [x] T002 在 `App.tsx` 中注册渲染主页路由与标签导航链接。

---

## Phase 2: Foundational (逻辑与状态底座)

**Purpose**: 从 `localStorage` 获取数据，并绑定数据实时侦听，做数据流的聚合。

- [x] T003 封装 `getRecentTaskIds` 方法用于提取和解析本地浏览历史。
- [x] T004 在 `Home.tsx` 中编写 Hook 订阅 window 的 `storage` 广播，确保跨视窗最近观看实时同步。
- [x] T005 使用 `useMemo` 计算生成状态分布统计数据 (Stats: done, inProgress, todo)。

---

## Phase 3: User Story 1 - 欢迎横幅模块 (Greeting Banner)🎯 MVP

**Goal**: 实现顶部时间段智能问候与任务状态量化摘要。

- [x] T006 编写问候语计算函数，判定上午、下午、晚上的时间切片输出。
- [x] T007 设计并输出美观的毛玻璃渐变卡片结构，作为顶部欢迎模块。

---

## Phase 4: User Story 2 - 最近观看轮播卡片 (Recently Viewed)

**Goal**: 横滑式轮播卡片，并自动计算滚动宽度显示切换箭头。

- [x] T008 通过 `scrollRef` 绑定滚动容器，并在容器的 `onScroll` 事件中防抖触发 `checkScroll` 方法。
- [x] T009 编写 resize 触发器，根据屏幕和容器实际边界决定显示/隐藏左右翻页控制箭头。
- [x] T010 丰富 Recently Viewed 卡片渲染细节，渲染任务背景封面图、分类 icon 与结束日期标签。

---

## Phase 5: User Story 3 - 活跃任务列表 (My Tasks)

**Goal**: 展示截至日期排序的活跃未完成任务。

- [x] T011 对传入的 `tasks` 过滤掉状态为 Done 的项目，并且用 `new Date().getTime()` 做升序排列。
- [x] T012 使用 `.slice(0, 8)` 限制在 8 个任务，并在 UI 中将每个任务卡片以网格形式展现。

---

## Phase 6: User Story 4 - 已完成任务表格 (Completed)

**Goal**: 以表格排版对齐展示已完成历史。

- [x] T013 过滤得到 Done 状态的任务并按照日期降序排序，取最新的前 10 条。
- [x] T014 编写表格头部（Title, Category, Date, Priority）及数据行的双排对齐网格结构。
- [x] T015 匹配渲染优先级色值（高优先级红字，中优先级黄字，低优先级灰字）。

---

## Phase 7: Polish & Validation (细节调优)

- [x] T016 在 `Home.tsx` 组件底端集成隐藏滚动条的 CSS 样式声明，处理窄屏移动端的原生滚动表现。
- [x] T017 检查整体动画效果，保证主页入口处采用 `animate-slide-up` 和 staggered 分步渐显。
