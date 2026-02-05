// pages/order-list/order-list.ts
import { request } from '../../utils/request';
import { Order, OrderStatusText } from '../../utils/types';

Page({
  data: {
    orders: [] as any[],
    loading: true
  },

  onShow() {
    this.fetchOrders();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      });
    }
  },

  async fetchOrders() {
    try {
      const orders = await request<Order[]>({ url: '/orders/my' });
      const formattedOrders = orders.map((order: Order) => ({
        ...order,
        statusText: OrderStatusText[order.status] || order.status
      }));
      this.setData({
        orders: formattedOrders,
        loading: false
      });
    } catch (err) {
      wx.showToast({ title: '获取订单失败', icon: 'none' });
    }
  },

  viewDetail(e: any) {
    const { id } = e.currentTarget.dataset;
    // We haven't implemented detail page fetch yet, but order-detail usually takes ID
    // and fetches or we can pass data. 
    // Wait, standard is navigate by ID.
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${id}` });
  }
});
