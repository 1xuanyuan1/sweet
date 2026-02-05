// app.ts
import { callCloud } from './utils/cloud';

App<IAppOption>({
  globalData: {
    userInfo: null
  },
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: undefined, 
        traceUser: true,
      });
    }

    this.checkLogin();
  },

  async checkLogin() {
    try {
      const user = await callCloud('manage-users', 'GET_USER');
      if (user) {
        this.globalData.userInfo = user;
      } else {
        // 未登录，重定向到登录页
        // 注意：onLaunch 中无法直接跳转 TabBar 页面，需等待页面栈初始化
        // 但如果是未登录，我们需要跳转到非 TabBar 的 login 页面
        // 由于 app.json 中第一个页面是 index (TabBar)，所以系统会先加载 index
        // 我们在 index 的 onLoad 中也会做校验，或者在这里做一次全局拦截
      }
    } catch (err) {
      console.error('Check login failed', err);
    }
  }
});
