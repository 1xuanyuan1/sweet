// app.ts
import { request } from './utils/request';

App<IAppOption>({
  globalData: {
    userInfo: null
  },
  onLaunch() {
    // 移除云开发初始化
    this.checkLogin();
  },

  async checkLogin() {
    const token = wx.getStorageSync('token');
    if (!token) {
        // 无 token，不做处理，由页面逻辑决定跳转登录
        return;
    }

    try {
      const user: any = await request({ url: '/auth/me' });
      if (user) {
        this.globalData.userInfo = user;
      }
    } catch (err) {
      console.error('Check login failed', err);
      // Token expired or invalid
      wx.removeStorageSync('token');
    }
  }
});
