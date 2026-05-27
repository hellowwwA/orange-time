# Feature Specification: Homepage Overview (主页概览与分类管理)

**Feature Branch**: `002-homepage-overview`

**Created**: 2026-04-15

**Status**: Completed (已完成)

**Input**: 用户需求: "设计并开发一个美观、高效的个人任务主页，其中包含动态欢迎横幅、最近观看的卡片式横向轮播、待完成任务列表，以及已完成任务的结构化概览表格。"

---

## User Scenarios & Testing (用户场景与测试)

### User Story 1 - 欢迎横幅与统计 (Greeting Banner & Stats) (Priority: P1)

作为一名用户，我希望在进入主页时，能够看到符合当前时间段的问候语（早/中/晚安）、当前日期，以及我当前仍需处理的待办任务和进行中任务的数量统计。

**Why this priority**: 核心的看板功能，给用户以友好的第一印象，并能够迅速了解当天的待办概况。

**Independent Test**:
1. 修改本地计算机系统时间为上午 9 点、下午 3 点和晚上 8 点。
2. 刷新主页，校验欢迎语是否分别对应为 "Good Morning"、"Good Afternoon" 和 "Good Evening"。
3. 增加或减少 ToDo / In Progress 状态的任务数量，校验横幅中的统计数字是否实时正确改变。

**Acceptance Scenarios**:
1. **Given** 当前系统时间为 10:00，**When** 用户访问主页，**Then** 横幅显示 "Good Morning 👋" 且展示当前系统周几和日期。
2. **Given** 任务列表中有 3 个 ToDo 和 2 个 In Progress 任务，**When** 加载主页，**Then** 横幅副标题显示 "You have 3 tasks to complete and 2 in progress."。

---

### User Story 2 - 最近观看任务轮播 (Recently Viewed Carousel) (Priority: P2)

作为一名用户，我希望主页能够自动展示我最近点击查看过的任务列表，以横向卡片轮播的形式呈现，方便我快速回访最近正在关注的内容。

**Why this priority**: 提效功能，减少用户寻找常用任务的操作深度。

**Independent Test**:
1. 在任务列表或时间线中点击查看某个任务详情。
2. 返回主页，校验该任务是否已出现在 "Recently Viewed" 轮播栏的第一位。
3. 当最近观看数超出屏幕宽度时，校验左右切换悬浮按钮是否正常出现，点击是否可以横向平滑滚动。

**Acceptance Scenarios**:
1. **Given** 用户未点击查看过任何任务，**When** 访问主页，**Then** "Recently Viewed" 模块在主页中隐式不渲染。
2. **Given** 用户依次点击了任务 A、B、C，**When** 返回主页，**Then** 轮播中展示任务卡片，顺序为最近访问优先（C -> B -> A）。
3. **Given** 轮播项较多产生横向溢出，**When** 鼠标悬浮在轮播区域，**Then** 动态显示左/右翻页箭头按钮，点击可按步长 `300px` 进行平滑滚动。

---

### User Story 3 - 待完成任务列表 (My Tasks Active List) (Priority: P2)

作为一名用户，我希望在主页上能够清晰看到按截至日期升序排列的活动任务（未完成），以便于我合理规划时间优先处理临近的任务。

**Why this priority**: 核心任务管理功能，帮助用户把控任务时效。

**Independent Test**:
1. 在主页 "My Tasks" 区域查看任务列表。
2. 检查是否有已完成（Done）的任务出现在此，若有则测试失败。
3. 校验展示的任务数量是否上限为 8 个，且是否截至日期越早的排在越前面。

**Acceptance Scenarios**:
1. **Given** 数据库中存在 15 个未完成任务，**When** 加载主页，**Then** "My Tasks" 仅显示日期最靠前的 8 个任务，右上角显示 "8 active"。
2. **Given** 没有未完成的任务，**When** 访问主页，**Then** 提示 "No active tasks."。

---

### User Story 4 - 已完成任务表格 (Completed Tasks Table) (Priority: P3)

作为一名用户，我希望在主页底端能以列表/表格形式直观看到最近已完成的任务，方便我复盘已达成的工作成果。

**Why this priority**: 辅助功能，提供成就感反馈与归档浏览。

**Independent Test**:
1. 将几个任务的状态改为 Done，并设置不同的完成日期。
2. 校验这些已完成的任务是否出现在主页底部的 "Completed" 模块。
3. 校验列表是否包含标题、分类、截至日期和优先级四个列，并且排序以完成时间降序（最新完成的在最前）排列，上限展示 10 条。

**Acceptance Scenarios**:
1. **Given** 数据库中有多个已完成任务，**When** 访问主页底部，**Then** 表格展示这些任务的标题、分类色块、日期范围及优先级，上限 10 条。
2. **Given** 没有任何已完成任务，**When** 访问主页，**Then** 表格区域显示 "No completed tasks yet."。

---

## Edge Cases (边缘情况)

- **Local Storage 数据损坏**：当存储的 `recent_tasks` 被外界修改为非 JSON 格式时，系统需有 try-catch 容错以防止崩溃，并默认返回空数组。
- **跨标签页/组件同步**：当用户在详情页查看了某个任务时，必须触发全局 storage 监听，确保回到主页或在主页并行打开时，最近观看列表能够无缝同步刷新。

---

## Requirements (功能与数据要求)

### Functional Requirements

- **FR-001**: 页面必须具备从本地 `localStorage` 读取 `recent_tasks` 键下存储的 ID 数组的能力。
- **FR-002**: 页面必须使用 window 的 `storage` 事件监听器，确保多组件/标签页数据修改时的响应式同步。
- **FR-003**: 待完成任务 (My Tasks) 必须排除 `status === 'Done'` 的任务，按日期升序排列，并利用 `slice(0, 8)` 进行显示截断。
- **FR-004**: 已完成任务 (Completed Tasks) 必须筛选 `status === 'Done'` 的任务，按日期降序排序，并使用 `slice(0, 10)` 显示。
- **FR-005**: 任何列表中点击任务条目，必须统一调用由父组件传入的 `onTaskClick` 回调。

### Key Entities

- **Task (任务)**：
  - `status`: 'ToDo' | 'In Progress' | 'Done'
  - `dateStr`: 任务计划/开始日期
  - `endDateStr`: 任务完成/结束日期

---

## Success Criteria (成功标准)

### Measurable Outcomes

- **SC-001**: 主页渲染时的初始加载时间（含数据流计算与本地存储读取）应控制在 `100ms` 以内。
- **SC-002**: 横向轮播平滑移动过渡动画时间应控制在 `300ms` 左右，无掉帧抖动。
- **SC-003**: 本地 `localStorage` 写入与读取正常，刷新页面后最近观看顺序和内容保持一致。
