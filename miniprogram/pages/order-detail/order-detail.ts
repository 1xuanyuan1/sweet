// pages/order-detail/order-detail.ts
import { request } from "../../utils/request";
import { Order, OrderStatusText, OrderStatus } from "../../utils/types";

Page({
  data: {
    order: null as any | null,
    loading: true,
  },

  onLoad(options: any) {
    if (options.id) {
      this.fetchOrderDetail(options.id);
    }
  },

  async fetchOrderDetail(id: string) {
    try {
      const orderData = await request<Order>({ url: `/orders/${id}` });
      const order = {
        ...orderData,
        statusText:
          OrderStatusText[orderData.status as OrderStatus] || orderData.status,
      };
      this.setData({ order, loading: false });
    } catch (err) {
      console.error(err);
      wx.showToast({ title: "加载失败", icon: "none" });
    }
  },

  async confirmPrice() {
    const { order } = this.data;
    if (!order) return;

    wx.showLoading({ title: "正在确认" });
    try {
      await request({
        url: `/orders/${order._id}/confirm`,
        method: "PUT",
      });
      wx.hideLoading();
      wx.showToast({ title: "确认成功" });
      this.fetchOrderDetail(order._id!);
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: "确认失败", icon: "none" });
    }
  },
});
