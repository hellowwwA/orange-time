# Implementation Plan: Homepage Overview (主页概览与分类管理)

**Branch**: `001-homepage-overview` | **Date**: 2026-04-15 | **Spec**: [spec.md](file:///Users/lxn/Documents/orange-time/orange-time-fronent/specs/001-homepage-overview/spec.md)

**Input**: 来自 `specs/001-homepage-overview/spec.md` 的规范描述

---

## Summary (概述)

本方案旨在实现一个功能完备、高颜值的系统主页（Home）。
技术方案包括：
1. **问候语与统计栏**：在页面顶部显示当前时间段问候、系统周几和日期，并聚合计算当前待办及进行中任务的数量统计。
2. **最近查看任务轮播**：利用 `localStorage` 记录用户最新回访的 10 个任务 ID，并通过横向滑动轮播组件（带动态左右浮动翻页箭头）在主页进行展示。
3. **未完成任务列表**：筛选活跃状态的未完成任务，按照截至日期升序（临近到期优先）排序，最多展示 8 个任务。
4. **已完成任务表格**：筛选 Done 状态的任务，按完成日期降序排序，以整洁的表格视图呈现最近完成的 10 个任务。

---

## Technical Context (技术底座)

- **Language/Version**: TypeScript / React 19 / ES6
- **Primary Dependencies**: Tailwind CSS, Material Symbols Icon font
- **Storage**: 本地 `localStorage`，键名 `'recent_tasks'` 存储 `string[]` 类型 ID
- **Constraints**: 主页初次载入应无数据卡顿，横向轮播在移动端隐藏翻页按钮并允许原生手势滑动。

---

## Project Structure (变更结构)

### Documentation (本功能文档)

```text
specs/001-homepage-overview/
├── spec.md              # 需求规范
├── plan.md              # 实现方案 (本文件)
├── tasks.md             # 任务清单
└── walkthrough.md       # 变更记录与结果验证
```

### Source Code Files Affected (受影响的源码)

```text
components/
└── Home.tsx             # 页面展示核心组件
```

---

## Technical Design (技术设计)

### 1. 最近查看状态持久化与事件监听 (`components/Home.tsx`)

- 在组件挂载时，从 `localStorage` 读取键名 `'recent_tasks'` 初始化状态。
- 使用 `window.addEventListener('storage', handleStorageChange)` 监听跨页面/组件本地存储变更，实时更新状态。
- 利用 `useMemo` 计算匹配得到的最近访问任务列表 `recentTasks`，提高渲染性能：
  ```typescript
  const recentTasks = useMemo(() => {
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    return recentTaskIds.map(id => taskMap.get(id)).filter(Boolean) as Task[];
  }, [recentTaskIds, tasks]);
  ```

### 2. 轮播图横向平滑滚动控制

- 绑定 `scrollRef` 至横向滚动容器。
- 实现 `checkScroll()` 函数：
  ```typescript
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
  };
  ```
- 绑定监听 `scrollRef` 的滚动事件及窗口的 `resize` 事件，自适应控制左右箭头的显隐状态。

### 3. 数据过滤与排序

- **未完成任务**：
  ```typescript
  const myTasks = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'Done')
      .sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime())
      .slice(0, 8);
  }, [tasks]);
  ```
- **已完成任务**：
  ```typescript
  const completedTasks = useMemo(() => {
    return tasks
      .filter(t => t.status === 'Done')
      .sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime())
      .slice(0, 10);
  }, [tasks]);
  ```

---

## Verification Plan (验证计划)

### Manual Verification

- [ ] **欢迎语与统计检查**：验证早上、中午、晚上的问候横幅文字是否随时间自动切换，任务统计总量是否与当前卡片栏状态一致。
- [ ] **最近观看验证**：点击打开多个不同的任务卡片，返回主页，校验 Recently Viewed 的新增任务排序，且按最先被浏览的排在最前面。
- [ ] **翻页箭头交互**：增加最近查看项目个数使容器溢出，悬浮并点击左右翻页按钮，核对每次的平滑滚动步长。
- [ ] **任务排序与分页**：核对待办任务列表中是否包含了 Done 的任务，核对待办列表是否按照最早到期的排在前面。
- [ ] **表格呈现**：核对已完成列表是否采用表格对齐，优先级指示的标签颜色是否按 High/Medium/Low 准确映射。
