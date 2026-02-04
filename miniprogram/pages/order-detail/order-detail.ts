// pages/order-detail/order-detail.ts
import { callCloud } from '../../utils/cloud';
import { Order, OrderStatusText, OrderStatus } from '../../utils/types';

Page({
  data: {
    order: null as any | null,
    loading: true
  },

  onLoad(options: any) {
    if (options.id) {
      this.fetchOrderDetail(options.id);
    }
  },

  async fetchOrderDetail(id: string) {
    try {
      // 简单起见，从我的订单列表中过滤或重新请求
      const res: any = await callCloud('manage-orders', 'CUSTOMER_GET_ALL');
      const orderData = res.data.find((o: Order) => o._id === id);
      if (orderData) {
        const order = {
          ...orderData,
          statusText: OrderStatusText[orderData.status as OrderStatus] || orderData.status
        };
        this.setData({ order, loading: false });
      } else {
        wx.showToast({ title: '订单不存在', icon: 'none' });
      }
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  async confirmPrice() {
    const { order } = this.data;
    if (!order) return;

    wx.showLoading({ title: '正在确认' });
    try {
      await callCloud('manage-orders', 'UPDATE_STATUS', {
        orderId: order._id,
        status: OrderStatus.CONFIRMED
      });
      wx.hideLoading();
      wx.showToast({ title: '确认成功' });
      this.fetchOrderDetail(order._id!);
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '确认失败', icon: 'none' });
    }
  }
});
