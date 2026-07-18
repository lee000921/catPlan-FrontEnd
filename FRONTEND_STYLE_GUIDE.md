---
title: CatPlan 前端统一样式规范（微信小程序）
description: 规范 CatPlan 小程序所有页面的视觉与交互风格，保证「可爱猫系+轻量效率」的一致体验。
---

## 1. 整体设计理念

- **氛围**：温柔、治愈、轻量的「小黑猫 + 碎片」任务氛围，避免过于商务、冷硬的设计。
- **关键词**：卡片、圆角、柔和渐变、大按钮、轻阴影、适量表情/Emoji。
- **布局原则**：
  - 页面顶部：**标题区 / 小黑猫 Hero / 简短说明**。
  - 中间：**卡片化内容区**（表单、列表、预览等）。
  - 底部：**主操作按钮**（占满宽度，有明显主色渐变）。

## 2. 颜色与阴影

- **主色**（任务与积极感）：
  - 渐变主色：`linear-gradient(135deg, #95de64 0%, #5cdbd3 100%)`
  - 纯色主按钮背景可用：`#5cdbd3` / `#95de64`
- **强调色**：
  - 积分 / 碎片：`#faad14`
  - 提示条左边线等：`#faad14`
- **中性色**：
  - 标题文字：`#262626`
  - 次级文字：`#8c8c8c`
  - 边框：`#e8e8e8` / `#f0f0f0`
- **背景色**：
  - 页面背景（通用）：`linear-gradient(180deg, #fffaf5 0%, #fefcff 40%, #f5fbff 100%)`
  - 登录页背景可用 **径向渐变 + 淡色块**（参考 `login.wxss`）。
- **阴影**：
  - 主卡片：`0 18rpx 50rpx rgba(0, 0, 0, 0.08)`
  - 普通卡片：`0 8rpx 30rpx rgba(0, 0, 0, 0.04)`
  - 主按钮：`0 8rpx 28rpx rgba(92, 219, 211, 0.40)`

## 3. 圆角、间距与排版

- **圆角**：
  - 页面/大卡片：`border-radius: 32rpx` 或 `16rpx`
  - 输入框/小卡片/按钮：`border-radius: 12rpx` ~ `20rpx`
  - 主操作按钮（登录等）：`border-radius: 48rpx`
- **页面 padding**：
  - 外层容器：`padding: 32rpx; padding-bottom: 200rpx;`
  - 登录页卡片：`padding: 52rpx 40rpx 56rpx;`
- **元素间距**：
  - 区块间：`margin-bottom: 24rpx` ~ `32rpx`
  - 表单项间：`margin-bottom: 24rpx` ~ `32rpx`
  - 标签与控件：`margin-bottom: 12rpx` ~ `16rpx`
- **字体**：
  - 页标题：`40rpx` ~ `44rpx`，加粗。
  - 卡片标题 / Section 标题：`28rpx` ~ `32rpx`，加粗。
  - 正文：`26rpx` ~ `28rpx`。
  - 辅助说明：`24rpx`。

## 4. 页面骨架与命名约定

- **外层容器**：所有页面使用统一容器。

```wxml
<view class="container">
  <view class="page-header">
    <text class="page-title">📋 页面主标题</text>
    <text class="page-subtitle">一句话说明当前页面用途</text>
  </view>

  <!-- 内容卡片区 -->
  <view class="form-section">
    <!-- 表单 / 列表 / 信息 -->
  </view>

  <!-- 其他区块（可选） -->
  <view class="section">
    <!-- 其他内容 -->
  </view>

  <button class="submit-btn">主操作按钮</button>
</view>
```

- **基础容器样式**：沿用创建任务单、周期任务等页面的写法。

```css
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #fffaf5 0%, #fefcff 40%, #f5fbff 100%);
  padding: 32rpx;
  padding-bottom: 200rpx;
}

.page-header {
  text-align: center;
  padding: 40rpx 0;
}

.page-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #262626;
  margin-bottom: 12rpx;
}

.page-subtitle {
  display: block;
  font-size: 26rpx;
  color: #8c8c8c;
}
```

- **卡片区块命名**：
  - 表单整体：`.form-section`
  - 普通内容块：`.section`
  - 区块标题：`.section-header` + `.section-title`

## 5. 表单与控件规范

### 5.1 表单结构

- 每个字段一组 `.form-group`，内部统一结构：

```wxml
<view class="form-group">
  <text class="label">字段名称 *</text>
  <!-- input / textarea / picker / 自定义选择器 -->
</view>
```

- **标签**：使用 `.label`，必要字段加 `*`。
- **输入控件**：统一使用 `.input` / `.textarea` / `.picker`。

```css
.form-group {
  margin-bottom: 24rpx; /* 或 32rpx，视页面密度 */
}

.label {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #262626;
  margin-bottom: 12rpx;
}

.input,
.textarea,
.picker {
  width: 100%;
  padding: 24rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #000000 !important;
  -webkit-text-fill-color: #000000 !important;
  background: #ffffff;
  box-sizing: border-box;
}

.textarea {
  min-height: 200rpx;
}
```

### 5.2 选择器与单选 / 多选

- **日期选择**：使用 `picker`，外层使用 `.picker` 样式。
- **单选按钮组**（例如周期类型）：
  - 容器类名：`.radio-group`
  - 单项类名：`.radio-item`，当前选中加 `.active`
- **多选按钮组**（例如星期选择）：
  - 容器类名：`.weekday-selector`
  - 单项类名：`.weekday-item`，选中加 `.selected`

命名风格：**语义化 + group/item + active/selected**，不要使用无意义缩写。

### 5.3 主操作按钮

- 所有「提交 / 确认 / 创建」类按钮统一使用 `.submit-btn`，并放在页面底部（容器内）。

```wxml
<button class="submit-btn"
        disabled="{{submitting || !canSubmit}}">
  {{submitting ? '提交中...' : '提交'}}
</button>
```

```css
.submit-btn {
  width: 100%;
  padding: 28rpx;
  background: linear-gradient(135deg, #95de64 0%, #5cdbd3 100%);
  color: #fff;
  border: none;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 28rpx rgba(92, 219, 211, 0.40);
}

.submit-btn[disabled] {
  background: #e0e0e0;
  box-shadow: none;
  color: #999;
}
```

- 登录/退出等特殊按钮可以在 `.login-btn` / `.logout-btn` 基础上保持相同的**渐变主色与圆角风格**。

## 6. 列表 / 预览 / 空状态

### 6.1 列表卡片

- 列表容器：`.task-list` / `.preview-list`，注意限定高度时用 `max-height + overflow-y: auto;`。
- 列表项：`.task-item` / `.preview-item`，选中态或新建态增加语义 class。

示例（任务单创建页面）：

```css
.task-item {
  display: flex;
  align-items: center;
  padding: 16rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
  transition: all 0.3s;
}

.task-item.selected {
  border-color: #5cdbd3;
  background: #f0fffb;
}
```

### 6.2 空状态

- 使用 `.empty-tasks` 或 `.empty-state`，居中展示文字 + 一个轻量按钮。

```wxml
<view class="empty-tasks">
  <text>当天暂无任务</text>
  <button class="create-task-btn" bindtap="goToCreateTask">去创建任务</button>
</view>
```

```css
.empty-tasks {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

.empty-tasks text {
  font-size: 26rpx;
  color: #8c8c8c;
  margin-bottom: 24rpx;
}

.create-task-btn {
  background: linear-gradient(135deg, #95de64, #5cdbd3);
  color: #fff;
  border: none;
  border-radius: 32rpx;
  padding: 16rpx 48rpx;
  font-size: 28rpx;
}
```

## 7. 小黑猫与品牌元素

- 登录页使用 `cat-hero` 模块（小黑猫形象 + 标题/副标题）；其他页面如有需要可简化引用，但要保持同一风格：
  - 标题略大（32rpx+）、字重 600。
  - 副标题 24rpx 左右，颜色 `#8c8c8c`。
- 品牌元素（如碎片/积分）建议使用 Emoji 或图标作为前缀：
  - 任务单标题前：`📋`
  - 周期任务：`🔄`
  - 单次任务：`📝`
  - 积分 / 碎片：`💎`或其他统一图标。

## 8. 文案与交互细节

- **文案风格**：
  - 尽量使用「你 / 我 / 小黑」这种轻松口吻，例如：「小黑在帮你记任务」。
  - 表单 placeholder 简洁且直接说明用途，例如：「请输入任务标题」「任务详细说明」。
- **按钮文案**：
  - 主操作：以动词开头：「创建任务单」「创建周期任务」「提交任务单审核」。
  - 登录：如「微信一键登录」。
- **加载与禁用**：
  - 有网络请求时按钮文案加「…」，并置灰禁用（见 `.submit-btn[disabled]`）。

## 9. 新页面 / 旧页面改造 Checklist

在创建或重构任何页面前端时，请对照以下清单：

- [ ] 使用统一的 `.container` 背景与页面 padding。
- [ ] 顶部有 `.page-header`，包含 `page-title` 和 `page-subtitle`。
- [ ] 表单/内容区域使用 `.form-section` / `.section` 卡片容器，并带统一阴影与圆角。
- [ ] 所有输入控件统一使用 `.form-group + .label + .input/.textarea/.picker` 结构。
- [ ] 主操作按钮使用 `.submit-btn`，文案为动词开头，包含 `submitting` 状态。
- [ ] 列表/预览采用统一的 `.task-item` / `.preview-item` 风格，必要时有选中态。
- [ ] 空列表时使用统一的空状态样式与文案。
- [ ] 合理使用 Emoji / 品牌元素，但不过度堆砌。

---

## 10. 如何让 AI 遵循本规范（建议 Skill 结构）

如果需要在 Cursor 中为本项目创建前端页面生成/优化 Skill，建议在项目根目录的 `.cursor/skills/catplan-frontend-style/SKILL.md` 中写入类似内容（示意）：

```markdown
---
name: catplan-frontend-style
description: Generate and refactor CatPlan WeChat miniprogram pages to follow the unified cute cat-style UI, using shared container, form, button, and card patterns defined in FRONTEND_STYLE_GUIDE.md.
---

# CatPlan 前端页面生成与优化

## 使用时机

- 当需要新增小程序页面（任务相关页面、店铺页面等）时。
- 当需要重构旧页面，让样式与交互统一到 CatPlan 风格时。

## 指导原则

1. 始终参考项目根目录的 `catPlan-FrontEnd/FRONTEND_STYLE_GUIDE.md`，严格复用其中约定的：
   - `.container` / `.page-header` / `.page-title` / `.page-subtitle`
   - `.form-section` / `.section` / `.form-group` / `.label`
   - `.input` / `.textarea` / `.picker` / `.submit-btn`
   - 列表、空状态、品牌色与渐变等。
2. 新页面优先对齐「创建任务单」「创建周期任务」「登录」等已存在页面的结构与命名。
3. 修改旧页面时，保留业务逻辑不变，只调整 WXML 结构与 WXSS 类名，使之匹配本规范。

## 输出要求

- 优先直接给出可替换的 `.wxml` + `.wxss` 代码段。
- 对于复杂页面，先给简短结构草图，再给完整实现。
- 不在代码中加入解释性注释，只保留必要的语义命名和结构。
```

> 实际创建 Skill 时，可以将以上示例复制到 `.cursor/skills/catplan-frontend-style/SKILL.md`，并根据后续演进微调。

