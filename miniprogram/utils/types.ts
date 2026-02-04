// miniprogram/utils/types.ts

export enum OrderStatus {
  PENDING = 'pending',       // 待确认
  WAIT_CONFIRM = 'wait_confirm', // 待客户确认
  CONFIRMED = 'confirmed',   // 已确认
  PAID = 'paid',             // 已付款
  PRODUCING = 'producing',   // 制作中
  SHIPPED = 'shipped',       // 已发货
  RECEIVED = 'received'      // 已收货
}

export const OrderStatusText: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '待确认',
  [OrderStatus.WAIT_CONFIRM]: '待客户确认',
  [OrderStatus.CONFIRMED]: '已确认',
  [OrderStatus.PAID]: '已付款',
  [OrderStatus.PRODUCING]: '制作中',
  [OrderStatus.SHIPPED]: '已发货',
  [OrderStatus.RECEIVED]: '已收货'
};

export interface User {
  _id?: string; // openid
  nickName: string;
  avatarUrl: string;
  isAdmin: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Recipe {
  _id?: string;
  name: string;
  description: string;
  ingredients: string[];
  pricePerKg: number;
}

export interface Style {
  _id?: string;
  name: string;
  laborCost: number;
  materialWeight: number; // kg/个
  imageUrl?: string;
}

export interface Order {
  _id?: string;
  _openid?: string;
  userInfo?: {
    nickName: string;
    avatarUrl: string;
  };
  recipe: Recipe;
  style: Style;
  quantity: number;
  originalPrice: number;
  finalPrice: number;
  status: OrderStatus;
  expressCompany?: string;
  expressNumber?: string;
  customerNote?: string;
  createdAt: number;
  updatedAt: number;
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  totalOrders: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}
