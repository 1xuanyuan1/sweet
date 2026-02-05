# “和熹香堂”微信小程序产品需求文档 (PRD)

## 1. 项目背景

“和熹香堂”是一个专注于合香非遗手工的品牌。为了提升客户选购体验及简化管理员（主理人）的订单管理流程，开发了一款基于微信小程序原生语法及自建后端服务的移动应用。

## 2. 技术架构 (Technical Architecture)

- **前端**: 微信小程序原生开发 (TypeScript + WXML + WXSS)
- **后端**: Node.js + Express + TypeScript
- **数据库**: MongoDB (v6.0+)
- **部署环境**: 腾讯云 CVM (CentOS)
- **域名**: `api.dduke.cn` (HTTPS enabled via Let's Encrypt)
- **进程管理**: PM2
- **反向代理**: Nginx
- **可视化管理**: Mongo Express (https://api.dduke.cn/mongo/)

## 3. 核心功能模块

### 3.1 登录流程 (User Flow)

- **初始入口**: 用户首次打开小程序，需进行登录。
- **身份验证**:
  - **微信授权登录**: 调用 `wx.login` 获取 code，发送至后端 `/api/auth/login`。
  - **Token机制**: 后端验证微信 Session，生成 JWT Token 返回前端。
  - **本地存储**: Token 存储在 `wx.getStorageSync('token')`。
  - **自动拦截**:
    - 前端封装 `request` 工具类。
    - **逻辑**: 当接口返回 `401 Unauthorized` 时，自动清除本地 Token，并弹窗提示“请先登录”，点击确定后跳转至登录页 (`/pages/login/login`)。

### 3.2 选购流程 (款式页)

- **接口**: `/api/products/all` 获取所有方子和款式。
- **展示**: 网格/瀑布流展示款式。
- **下单**: 选择方子、数量，计算预估价格，提交订单。

### 3.3 订单管理 (订单页)

- **接口**: `/api/orders/my` 获取当前用户订单。
- **页面权限**: 进入页面时（`onShow`），优先检查本地 Token。若无 Token，不发起请求，直接跳转至登录页或展示空状态并引导登录。
- **接口权限**: 需携带 Token。若未登录（接口返回 401），触发自动拦截逻辑跳转登录页。
- **状态**: 待确认 -> 制作中 -> 已发货 -> 已完成。

### 3.4 个人中心 (我的页)

- **展示**: 用户昵称、头像。
- **管理员**: 通过 `isAdmin` 字段判断，显示后台管理入口。

### 3.5 后台管理 (Admin)

- **订单列表**:
  - 支持按状态筛选（如：待确认、制作中、已完成）。
  - 支持按月筛选。
  - 点击订单可查看详情并修改状态/价格。

- **财务统计**:
  - **接口**: `/api/orders/admin/stats`
  - **展示内容**:
    - **总销售额**: 本月所有订单总金额 (`monthlyStats[0].totalSales`)。
    - **已收款**: 本月已付款/已完成订单金额 (`monthlyStats[0].paidAmount`)。
    - **代收款**: 本月待付款/待确认订单金额 (`monthlyStats[0].pendingAmount`)。
  - **交互**: 点击“代收款”卡片，跳转至订单列表页，并自动筛选出所有待处理状态（`pending`, `wait_confirm`, `confirmed`）的订单。

- **数据管理**: 通过 Mongo Express 可视化工具直接管理数据库。

## 4. 数据结构设计 (MongoDB Models)

### 4.1 Recipe (方子)

- `name`: string (如：安神方)
- `description`: string
- `ingredients`: string[]
- `pricePerKg`: number

### 4.2 Style (款式)

- `name`: string (如：中元宝)
- `laborCost`: number
- `materialWeight`: number
- `image`: string (可选，图片 URL)

### 4.3 User (用户)

- `openid`: string (微信 OpenID)
- `nickName`: string
- `avatarUrl`: string
- `isAdmin`: boolean
- `createdAt`: Date
- `updatedAt`: Date

### 4.4 Order (订单)

- `user`: ObjectId (关联 User)
- `recipe`: ObjectId (关联 Recipe)
- `style`: ObjectId (关联 Style)
- `quantity`: number
- `status`: string (pending/confirmed/producing/shipped/completed)
- `totalPrice`: number
- `createdAt`: Date

## 5. API 接口文档

- **Base URL**: `https://api.dduke.cn/api`

### Auth

- `POST /auth/login`: `{ code, userInfo }` -> `{ token, user }`

### Products

- `GET /products/all`: `{ recipes: [], styles: [] }`

### Orders

- `GET /orders/my`: 获取我的订单 (需 Header: `Authorization: Bearer <token>`)
- `POST /orders`: 创建订单

### Upload

- `POST /upload`: 上传文件 (无权限限制) -> `{ url: "..." }`

## 6. 运维与部署

- **服务器**: root@dduke.cn
- **项目路径**: `/root/sweet-server`
- **环境变量**: `.env` (包含 JWT_SECRET, WX_APP_ID, WX_APP_SECRET 等)
- **数据初始化**: `npx ts-node src/scripts/seed.ts` (用于重置基础数据)
- **日志查看**: `pm2 logs sweet-server`
