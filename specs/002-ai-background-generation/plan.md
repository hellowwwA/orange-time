# Implementation Plan: AI Background Generation (AI 背景生成)

**Branch**: `002-ai-background-generation` | **Date**: 2026-04-20 | **Spec**: [spec.md](file:///Users/lxn/Documents/orange-time/orange-time-fronent/specs/002-ai-background-generation/spec.md)

**Input**: 来自 `specs/002-ai-background-generation/spec.md` 的规范描述

---

## Summary (概述)

本方案旨在实现任务详情页头部区域 of AI 背景生成功能。
技术方案包括：
1. 更新 `Task` 数据类型，添加 `cover` 与 `coverPosition` 字段。
2. 在 `TaskEditor.tsx` 中集成封面展示与操作控制栏。
3. 调用 apiClient 模块向后端 `/api/images/generate-background` 发送异步生成请求。
4. 提供垂直定位的滑块交互以更新 `coverPosition` 样式偏移。

---

## Technical Context (技术底座)

- **Language/Version**: TypeScript / React 19 / ES6
- **Primary Dependencies**: Vite, Tailwind CSS, Material Symbols Icon font
- **Storage**: 前端通过 apiClient 发送持久化数据，后端 mock 机制持久化保存
- **Testing**: 手动验证交互流与 UI 响应性
- **Constraints**: 接口返回的 base64 格式必须以 `data:image/` 开头，滑块范围限定在 0 到 100 之间。

---

## Project Structure (变更结构)

### Documentation (本功能文档)

```text
specs/002-ai-background-generation/
├── spec.md              # 需求规范
├── plan.md              # 实现方案 (本文件)
├── tasks.md             # 任务清单
└── walkthrough.md       # 变更记录与结果验证
```

### Source Code Files Affected (受影响的源码)

```text
types.ts                 # 增加 Task 属性定义
components/
└── TaskEditor.tsx       # 页面核心交互、逻辑请求及 UI 渲染
```

---

## Technical Design (技术设计)

### 1. 数据模型扩展

在 `types.ts` 中的 `Task` 接口添加两个属性：
```typescript
export interface Task {
  // ... 其他属性
  cover?: string;         // 存储生成的 Base64 字符串
  coverPosition?: number; // 存储 0-100% 垂直偏移量
}
```

### 2. UI 组件改造 (`components/TaskEditor.tsx`)

#### A. 引入状态
```typescript
const [isGeneratingCover, setIsGeneratingCover] = useState(false);
const [coverError, setCoverError] = useState<string | null>(null);
```

#### B. 新增 API 交互函数
- `handleGenerateCover()`：
  - 设置 `isGeneratingCover` 为 `true`
  - 获取并净化标题 `(formData.title || 'Untitled Task').trim()`
  - 发送 POST 请求到 `/api/images/generate-background`，发送 `{ title }`
  - 处理返回的 Base64 数据，更新到 `formData.cover`
  - 触发 `onUpdate(updated)` 更新上层应用状态。
  - 处理异常，将错误写入 `coverError`，恢复加载状态。

- `handleRemoveCover()`：
  - 清空 `cover` 与 `coverPosition` 状态
  - 触发 `onUpdate` 同步更改。

#### C. HTML/Tailwind 结构
在任务标题输入框下方，新增封面预览区：
- 如果没有封面，显示一个灰色的 gradient 占位框，带 "No Background" 字样。
- 如果有封面，以 `<img>` 标签展示封面图，通过 `style={{ objectPosition: `center ${formData.coverPosition ?? 50}%` }}` 绑定垂直对齐。
- 在顶部放置三个操作按钮：
  - **AI Generate**：带 `auto_awesome` 闪烁动效图标，点击触发生成。
  - **Upload Cover**：手动上传的备用选项。
  - **Remove**：有封面时显示，用于删除。
- 底部的滑块控件控制背景位置，仅在有封面时渲染，通过滑块的 `onChange` 动态调用 `handleChange('coverPosition', Number(e.target.value))` 实现实时拖动渲染。

---

## Verification Plan (验证计划)

### Manual Verification

- [ ] **生成验证**：输入特定标题点击 AI Generate，校验是否向后台发送请求，并在 5 秒内返回 base64 图片完成封面渲染。
- [ ] **默认值校验**：当标题为空点击生成时，验证是否能使用 "Untitled Task" 作为默认标题调用接口。
- [ ] **异常校验**：断开后台网络，点击生成，验证是否能够合理提示 "AI background generation failed. Please try again." 并退出 loading。
- [ ] **定位调整验证**：有封面后，上下拖拽 position 进度条，确认图片位置随之垂直发生移动。
- [ ] **数据落库与恢复**：生成封面并调整好位置后，重新打开任务，核对封面以及位置百分比是否被正确还原。
