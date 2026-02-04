// pages/order-list/order-list.ts
import { callCloud } from '../../utils/cloud';
import { Order, OrderStatusText, OrderStatus } from '../../utils/types';

Page({
  data: {
    orders: [] as any[],
    loading: true
  },

  onShow() {
    this.fetchOrders();
  },

  async fetchOrders() {
    try {
      const res: any = await callCloud('manage-orders', 'CUSTOMER_GET_ALL');
      const orders = res.data.map((order: Order) => ({
        ...order,
        statusText: OrderStatusText[order.status] || order.status
      }));
      this.setData({
        orders,
        loading: false
      });
    } catch (err) {
      wx.showToast({ title: '获取订单失败', icon: 'none' });
    }
  },

  viewDetail(e: any) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${id}` });
  }
});
