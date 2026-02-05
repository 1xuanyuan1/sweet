# “和熹香堂”微信小程序产品需求文档 (PRD)

## 1. 项目背景

“和熹香堂”是一个专注于合香非遗手工的品牌。为了提升客户选购体验及简化管理员（主理人）的订单管理流程，需开发一款基于微信小程序原生语法及云开发的移动应用。

## 2. 用户角色

- **管理员 (Admin)**: 品牌主理人，负责产品数据维护、订单审核、价格调整、状态更新及财务汇总。只有被授权的管理员才能进入后台管理界面。
- **客户 (Customer)**: 通过微信授权登录，进行产品选购、订单确认及状态查看。

## 3. 核心功能模块

### 3.1 登录流程 (User Flow)

- **初始入口**: 用户首次打开小程序，强制进入“登录页”。
- **身份验证**:
  - 未注册/未登录: 需点击“微信授权登录”创建/更新用户信息。
  - 已登录: 自动跳转至主页面（Tab Bar 页）。
- **主页面架构**: 底部 Tab Bar 导航，包含：
  1. **款式 (Styles)**: 首页，相册式展示所有款式。
  2. **订单 (Orders)**: 历史订单列表。
  3. **我的 (Mine)**: 个人中心及管理员入口。

### 3.2 选购流程 (款式页)

- **相册展示**: 以网格/瀑布流形式展示所有“款式”图片及名称。
- **弹窗下单**:
  - 点击任一款式，弹出“定制详情”弹窗。
  - **弹窗内容**:
    - 选择“方子” (Recipes)。
    - 输入“数量”。
    - 实时显示“预估价格”。
    - “提交订单”按钮。
- **提交后**: 跳转至“订单”页查看状态。

### 3.3 订单管理 (订单页)

- **列表展示**:
  - 客户仅见自己的订单。
  - 状态流转与原有逻辑一致。
- **功能**: 点击订单可进入详情页查看进度。

### 3.4 个人中心 (我的页)

- **基础信息**: 展示头像、昵称。
- **管理员入口**: 若当前用户 `isAdmin: true`，显示“后台管理”按钮，点击跳转至独立的 Admin 页面。

### 3.5 后台管理 (Admin)

- **入口**: 仅管理员可见（从“我的”页面进入）。
- **功能模块**:
  - **订单管理**: 审核、改价、更新状态。
  - **财务统计**: 月度报表。
  - **方子管理**: 增删改查。
  - **款式管理**: 增删改查 (含图片上传)。

## 4. 数据结构设计 (云数据库)

(保持原有结构，重点确保 `imageUrl` 字段存储云文件 ID)

### 4.1 Recipes (方子)

- `_id`: string
- `name`: string (如：安神方)
- `description`: string (功效)
- `ingredients`: string[] (材料)
- `pricePerKg`: number (元/kg)

### 4.2 Styles (款式)

- `_id`: string
- `name`: string (如：中元宝)
- `laborCost`: number (工费/个)
- `materialWeight`: number (耗材量 kg/个)
- `imageUrl`: string (照片路径)

### 4.3 Users (用户 - 新增)

- `_id`: string (openid)
- `nickName`: string
- `avatarUrl`: string
- `isAdmin`: boolean (是否为管理员)
- `createdAt`: Date
- `updatedAt`: Date

### 4.4 Orders (订单)

- `_id`: string
- `_openid`: string (核心字段：微信云开发自动注入的用户唯一标识，用于关联 Users 集合的 `_id`)
- `userInfo`: Object (下单时的用户快照: { nickName, avatarUrl }) - _注意：仅作为快照，最新信息需通过 \_openid 联表查询获取_
- `recipeId`: string
- `styleId`: string
- `quantity`: number
- `originalPrice`: number (原始计算总价)
- `finalPrice`: number (管理员修改后的最终价)
- `status`: string (pending/wait_confirm/confirmed/paid/producing/shipped/received)
  - 对应中文: 待确认 / 待客户确认 / 已确认 / 已付款 / 制作中 / 已发货 / 已收货
- `expressCompany`: string
- `expressNumber`: string
- `createdAt`: Date
- `updatedAt`: Date

## 5. UI/UX 风格定义

- **风格**: 新中式、禅意、简约、高雅。
- **主色调**:
  - 品牌红: `#8B0000` (深红)
  - 点缀金: `#D4AF37` (古铜金)
  - 背景色: `#F9F6F2` (宣纸色)
- **交互**: 简洁的卡片式布局，平滑的过渡动画。

## 6. 开发计划 (第一期)

- 不接入微信支付，仅进行价格确认与状态管理。
- 重点在于方子与款式的灵活组合逻辑。
- 实现基本的模板消息通知（或订阅消息）。
