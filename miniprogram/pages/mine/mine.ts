// pages/mine/mine.ts
const app = getApp<IAppOption>();

Page({
  data: {
    userInfo: null as any
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo
    });
  },

  goToAdmin() {
    wx.navigateTo({ url: '/pages/admin/admin' });
  },

  contactSupport() {
    wx.showModal({
      title: '联系客服',
      content: '请截图后扫码联系主理人微信',
      showCancel: false
    });
  }
});
