# “和熹香堂” UI 视觉规范与样式约束

## 1. 核心视觉风格

**关键词**: 禅意 (Zen)、非遗 (Heritage)、简约 (Minimalist)、温暖 (Warm)。
整体界面应像一幅留白得当的水墨画，突出产品本身的质感。

## 2. 色彩系统 (Color Palette)

| 用途         | 颜色名称             | 十六进制  | 示例               |
| :----------- | :------------------- | :-------- | :----------------- |
| **主品牌色** | 漆朱红 (Cinnabar)    | `#8B0000` | 导航栏、主要按钮   |
| **辅助金**   | 古铜金 (Bronze Gold) | `#B89650` | 图标点缀、边框装饰 |
| **背景色**   | 宣纸白 (Rice Paper)  | `#FBF9F2` | 页面全局背景       |
| **文字主色** | 墨黑 (Ink Black)     | `#2C2C2C` | 标题、正文         |
| **文字次色** | 灰墨 (Ink Gray)      | `#757575` | 辅助说明、占位符   |
| **分割线**   | 极浅墨 (Light Mist)  | `#E0DCD5` | 列表分割           |

## 3. 图标设计 (SVG Icons)

图标采用细线条感 (Line Art) 设计，略带书法笔触感。

### 3.1 首页 (Home)

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 9.5L12 3L21 9.5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V9.5Z" stroke="#8B0000" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M9 21V12H15V21" stroke="#8B0000" stroke-width="1.5" stroke-linejoin="round"/>
</svg>
```

### 3.2 方子 (Recipe)

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#8B0000" stroke-width="1.5"/>
  <path d="M12 8V12L15 15" stroke="#8B0000" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M7 12H17" stroke="#8B0000" stroke-width="0.5" stroke-dasharray="2 2"/>
</svg>
```

### 3.3 款式 (Style)

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 3L4 7V17L12 21L20 17V7L12 3Z" stroke="#8B0000" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M4 7L12 11L20 7" stroke="#8B0000" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M12 11V21" stroke="#8B0000" stroke-width="1.5" stroke-linejoin="round"/>
</svg>
```

### 3.4 订单 (Orders)

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="#8B0000" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5H9Z" stroke="#8B0000" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M9 12H15" stroke="#8B0000" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M9 16H15" stroke="#8B0000" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

### 3.5 物流 (Logistics)

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 10H19V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V10Z" stroke="#8B0000" stroke-width="1.5"/>
  <path d="M19 10L17 5H7L5 10" stroke="#8B0000" stroke-width="1.5" stroke-linejoin="round"/>
  <circle cx="9" cy="15" r="1" fill="#8B0000"/>
  <circle cx="15" cy="15" r="1" fill="#8B0000"/>
</svg>
```

## 4. 布局与间距

- **安全边距**: 页面左右间距固定为 `32rpx`。
- **圆角约束**: 容器圆角统一为 `12rpx`，按钮圆角可设为全圆角或 `40rpx` 以显柔和。
- **字体**:
  - 标题: `36rpx` / Bold
  - 正文: `28rpx` / Regular
  - 辅助: `24rpx` / Regular

## 5. 组件约束

- **按钮**:
  - 主要按钮: 漆朱红背景，白色文字。
  - 次要按钮: 描边漆朱红，宣纸白背景。
- **卡片**: 浅灰墨阴影或极浅墨细边框，背景为白色或宣纸色。
