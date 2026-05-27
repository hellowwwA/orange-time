# Tasks: AI Background Generation (AI 背景生成)

**Input**: 设计文档自 `/specs/002-ai-background-generation/`

**Prerequisites**: [plan.md](file:///Users/lxn/Documents/orange-time/orange-time-fronent/specs/002-ai-background-generation/plan.md), [spec.md](file:///Users/lxn/Documents/orange-time/orange-time-fronent/specs/002-ai-background-generation/spec.md)

---

## Phase 1: Setup & Data Type Extension (数据类型扩展)

**Purpose**: 确立任务封面图及垂直偏移的 TypeScript 接口属性。

- [x] T001 扩展 `types.ts` 中 `Task` 接口，增加 `cover?: string` 与 `coverPosition?: number` 定义。

---

## Phase 2: Foundational Integration (底座准备)

**Purpose**: 在 `components/TaskEditor.tsx` 中声明界面加载、报错的局部状态，并打通 API 请求链路。

- [x] T002 在 `TaskEditor.tsx` 中引入 `isGeneratingCover` 和 `coverError` 状态钩子。
- [x] T003 引入并确保 `apiClient` 支持发送 POST 请求和携带认证凭证。

---

## Phase 3: User Story 1 - AI 封面生成 (AI Cover Generation) 🎯 MVP

**Goal**: 用户点击 "AI Generate" 后，根据标题生成 AI 封面并呈现在页面上。

- [x] T004 在 `TaskEditor.tsx` 中实现 `handleGenerateCover` 方法，异步提交请求到 `/api/images/generate-background`。
- [x] T005 实现封面占位视图 (No Cover) 与实际封面图渲染逻辑。
- [x] T006 渲染带有闪烁特效的 "AI Generate" 按钮，绑定生成请求并处理 Loading 动画展示。
- [x] T007 添加异常捕获逻辑，请求失败时赋值给 `coverError`，在页面底部以友好组件报错形式呈现。

---

## Phase 4: User Story 2 - 垂直对齐调整 (Cover Position Adjustment)

**Goal**: 在已有封面的任务中展现 Range 进度条，支持用户垂直滚动对齐图层位置。

- [x] T008 在封面图渲染上绑定 `style={{ objectPosition: `center ${formData.coverPosition ?? 50}%` }}` 属性。
- [x] T009 仅在 `formData.cover` 存在时，在预览图下方展示垂直位置的 Slider 调节组件，并实时触发 `onUpdate` 保持位置同步。

---

## Phase 5: User Story 3 - 背景清除 (Cover Removal)

**Goal**: 支持用户清除封面图，将数据状态还原为最初的无背景样式。

- [x] T010 实现 `handleRemoveCover` 方法，清除 `cover` 与 `coverPosition` 属性。
- [x] T011 在操作栏中添加 "Remove" 按钮，点击调用移除方法并同步上报 `onUpdate` 状态。

---

## Phase 6: Polish & Cross-Cutting Concerns (优化与收尾)

**Purpose**: UI 细节完善与端到端手动调试校验。

- [x] T012 适配移动端布局，保证封面区域在手机等窄屏设备下高度与按钮不会产生溢出冲突。
- [x] T013 针对标题变化后再次生成的情况，确保 `coverPosition` 重置或合理继承，无交互死角。
