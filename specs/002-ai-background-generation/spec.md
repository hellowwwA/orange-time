# Feature Specification: AI Background Generation (AI 背景生成)

**Feature Branch**: `002-ai-background-generation`

**Created**: 2026-04-20

**Status**: Completed (已完成)

**Input**: 用户需求: "在任务详情页中，支持使用 AI 根据任务标题自动生成精美的背景封面图片，并能调整其垂直位置或将其移除。"

---

## User Scenarios & Testing (用户场景与测试)

### User Story 1 - AI 封面生成 (AI Cover Generation) (Priority: P1)

作为一名用户，我希望在编辑/查看任务详情时，能够一键通过 AI 根据当前任务的标题生成一张契合主题的背景封面图，让任务展示更具表现力。

**Why this priority**: 核心功能，这是用户获取 AI 生成背景的主要入口。

**Independent Test**:
1. 打开任务编辑器，输入任务标题（例如 "设计橘子时间的 Logo"）。
2. 点击 "AI Generate" 按钮。
3. 校验是否发起网络请求，并在完成后成功将生成的图片渲染在任务顶部的封面区域。

**Acceptance Scenarios**:
1. **Given** 任务标题已填写且无背景图，**When** 点击 "AI Generate" 按钮，**Then** 按钮状态显示为 "Generating..."，完成请求后展示生成的背景图。
2. **Given** 任务标题为空，**When** 点击 "AI Generate"，**Then** 默认使用 "Untitled Task" 标题生成背景。
3. **Given** 接口生成失败，**When** 发生网络错误，**Then** 清除加载状态并显示错误提示 "AI background generation failed. Please try again."。

---

### User Story 2 - 背景垂直位置调整 (Cover Position Adjustment) (Priority: P2)

作为一名用户，我希望能够调整生成的背景图片在头部区域的垂直对齐位置，以便将图片最精彩的部分展示出来。

**Why this priority**: 次要功能，增强 UI 自定义体验，避免背景关键区域被裁剪。

**Independent Test**:
1. 在已拥有封面背景的任务中，拖动 "Background Position" 进度条。
2. 观察封面图片垂直显示位置是否实时随之滚动。

**Acceptance Scenarios**:
1. **Given** 任务已设置封面图，**When** 渲染时，**Then** 显示 "Background Position" 滑块，默认值为 50%。
2. **Given** 拖动滑块至 20%，**When** 改变滑块值，**Then** 图片样式应用 `object-position: center 20%` 实时更新，并触发任务状态更新进行持久化。

---

### User Story 3 - 背景图移除 (Cover Removal) (Priority: P3)

作为一名用户，我希望能够随时清除已设置的背景图，使任务卡片恢复到初始的默认简洁状态。

**Why this priority**: 辅助功能，支持用户撤销操作或还原样式。

**Independent Test**:
1. 在有封面图的任务中，点击 "Remove" 按钮。
2. 校验封面区域是否恢复为 "No Background" 默认占位图，且保存状态。

**Acceptance Scenarios**:
1. **Given** 任务已设置封面图，**When** 点击 "Remove" 按钮，**Then** 清除 `cover` 与 `coverPosition` 字段，背景恢复为默认的渐变占位符。

---

## Edge Cases (边缘情况)

- **接口响应超时或网络异常**：前端必须具备异常捕获机制，阻止无限加载，并通过 `coverError` 显示用户友好的提示。
- **标题含有特殊字符**：发送给 AI 背景生成接口的标题应先进行去除多余空格等预处理，避免接口解析错误。

---

## Requirements (功能与数据要求)

### Functional Requirements

- **FR-001**: 系统 **必须** 提供与后台 `/api/images/generate-background` 接口交互的能力，并采用 POST 请求传送 `{ title: string }`。
- **FR-002**: 接收到的响应 **必须** 支持 base64 编码的图片格式渲染（`data:image/...`）。
- **FR-003**: 任务实体数据结构 **必须** 新增 `cover` (字符串，存储 base64 或图片链接) 和 `coverPosition` (数值，垂直对齐百分比) 两个可选字段。
- **FR-004**: 在背景图生成、调整位置或移除时，**必须** 实时调用 `onUpdate` 触发数据持久化。

### Key Entities

- **Task (任务)**：
  - `cover?: string` (封面图 Base64 编码或资源 URL)
  - `coverPosition?: number` (垂直定位偏移量，范围 0-100)

---

## Success Criteria (成功标准)

### Measurable Outcomes

- **SC-001**: 正常网络环境下，AI 背景图片一键生成并加载完毕的时间应在 5 秒以内。
- **SC-002**: 调整背景位置进度条时，图片的渲染帧率应保持在 60 fps，无卡顿现象。
- **SC-003**: 生成的背景图片能够成功随任务一同保存，并在页面刷新后正常重现。
