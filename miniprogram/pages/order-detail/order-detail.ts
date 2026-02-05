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
      // 兼容逻辑：通过 getMyOrders 获取所有订单并在本地查找
      // 理想情况下后端应提供 /orders/:id 接口
      const res: any = await callCloud('manage-orders', 'CUSTOMER_GET_ALL');
      // callCloud 返回的是 { result: { data: [...] } }
      const orders = res.result.data; 
      const orderData = orders.find((o: Order) => o._id === id);
      
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
      console.error(err);
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
