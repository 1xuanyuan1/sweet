// pages/admin/admin.ts
import { callCloud } from '../../utils/cloud';
import { OrderStatusText, OrderStatus } from '../../utils/types';

const app = getApp<IAppOption>();

Page({
  data: {
    orders: [],
    stats: [],
    currentTab: 'orders', // orders | stats
    OrderStatusText
  },

  onShow() {
    this.checkAdmin();
  },

  checkAdmin() {
    const userInfo = app.globalData.userInfo;
    if (!userInfo || !userInfo.isAdmin) {
      wx.showToast({ title: '无权限访问', icon: 'none' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 1500);
      return;
    }
    this.fetchData();
  },

  async fetchData() {
    wx.showLoading({ title: '加载中' });
    try {
      const ordersRes: any = await callCloud('manage-orders', 'ADMIN_GET_ALL');
      const statsRes: any = await callCloud('manage-orders', 'GET_STATS');
      
      // 格式化订单数据，添加中文状态
      const orders = ordersRes.data.map((order: any) => ({
        ...order,
        statusText: OrderStatusText[order.status as OrderStatus] || order.status
      }));

      this.setData({
        orders,
        stats: statsRes.list
      });
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  switchTab(e: any) {
    this.setData({ currentTab: e.currentTarget.dataset.tab });
  },

  async updatePrice(e: any) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '修改价格',
      editable: true,
      placeholderText: '请输入最终价格',
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            await callCloud('manage-orders', 'UPDATE_PRICE', {
              orderId: id,
              finalPrice: parseFloat(res.content)
            });
            this.fetchData();
          } catch (err) {
            wx.showToast({ title: '修改失败', icon: 'none' });
          }
        }
      }
    });
  },

  async updateStatus(e: any) {
    const { id } = e.currentTarget.dataset;
    const statuses = [
      { key: OrderStatus.PAID, text: '已付款' },
      { key: OrderStatus.PRODUCING, text: '制作中' },
      { key: OrderStatus.SHIPPED, text: '已发货' },
      { key: OrderStatus.RECEIVED, text: '已收货' }
    ];
    
    wx.showActionSheet({
      itemList: statuses.map(s => s.text),
      success: async (res) => {
        const status = statuses[res.tapIndex].key;
        let expressData = {};
        if (status === OrderStatus.SHIPPED) {
          // 这里简化处理，实际应弹窗输入物流信息
          expressData = { expressCompany: '圆通', expressNumber: 'YT123456789' };
        }
        try {
          await callCloud('manage-orders', 'UPDATE_STATUS', {
            orderId: id,
            status,
            ...expressData
          });
          this.fetchData();
        } catch (err) {
          wx.showToast({ title: '更新失败', icon: 'none' });
        }
      }
    });
  }
});
