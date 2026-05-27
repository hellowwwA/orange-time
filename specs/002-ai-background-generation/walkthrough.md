# Walkthrough: AI Background Generation (AI 背景生成)

**Feature Branch**: `002-ai-background-generation` | **Date**: 2026-04-20

---

## 🍊 变更概述 (Changes Accomplished)

我们为任务详情编辑页面成功引入了 **AI 背景生成** 功能。这让任务管理在实用的基础上具备了更高颜值的毛玻璃卡片自定义样式支持。

### 主要改动：

1. **类型扩展 ([types.ts](file:///Users/lxn/Documents/orange-time/orange-time-fronent/types.ts))**：
   * 在 `Task` 数据结构中增加了 `cover?: string` (用于保存 AI 图片的 Base64 数据 URI 或外部 URL)。
   * 增加了 `coverPosition?: number` (用于记录背景图在容器中的垂直定位偏移，默认值为 50%)。

2. **视图与逻辑集成 ([components/TaskEditor.tsx](file:///Users/lxn/Documents/orange-time/orange-time-fronent/components/TaskEditor.tsx))**：
   * **AI 生成按钮与请求**：实现了一键发起异步请求。请求时提取当前任务标题参数，向后台 `/api/images/generate-background` 发起 POST，等待 Base64 编码的图片数据响应。
   * **位置滑块控制**：实现了一个漂亮的原生 Range 拖动条，允许用户在 `0 - 100%` 之间调整背景图垂直轴 objectPosition 展现，提升卡片颜值。
   * **图片移除与默认占位视图**：在没有背景时展现 "No Background" 的淡雅占位符，且提供了一键 "Remove" 清理功能。
   * **错误降级防错**：提供完善的 `try/catch` 和 `coverError` 友好提示，避免网络波动引起加载卡死。

---

## 🧪 验证结果 (Testing & Verification)

本功能已通过在 React 本地开发环境中进行了端到端的手动交互验证，确认所有业务场景工作良好。

### 1. AI 封面生成验证 (P1)
* **动作**：输入任务标题 "发布 Orange Time 生产包"，点击 "AI Generate" 按钮。
* **结果**：按钮流畅转变为旋转加载态 "Generating..."。完成后成功收到底部返回的 Base64 字符串图片并在头部展示，无任何渲染死角。

### 2. 垂直偏移动态调整验证 (P2)
* **动作**：拖动 "Background Position" 的滚动滑块。
* **结果**：滑块滑行流畅。封面图片的 `objectPosition: center X%` 实时更新，且触发了 `onUpdate` 向主状态做实时保存。

### 3. 清理移除验证 (P3)
* **动作**：点击右上角红色的 "Remove" 按钮。
* **结果**：封面迅速消失，恢复为初始默认占位状态，并成功清空持久化数据。

### 4. 边界处理与容错
* **动作**：故意在断开 API 服务器后测试点击生成。
* **结果**：按钮在几秒请求失败后安全重置，在预览框左下角展现清晰的红字提示："AI background generation failed. Please try again."。
