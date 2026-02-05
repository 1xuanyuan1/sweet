// pages/login/login.ts
import { request, uploadFile } from '../../utils/request';

const app = getApp<IAppOption>();

Page({
  data: {
    tempAvatarUrl: '',
    tempNickName: '',
    loading: false
  },

  onLoad() {
    // 如果已经有用户信息，直接跳转到首页
    if (app.globalData.userInfo) {
      wx.switchTab({ url: '/pages/index/index' });
    }
  },

  onChooseAvatar(e: any) {
    const { avatarUrl } = e.detail;
    this.setData({ tempAvatarUrl: avatarUrl });
  },

  onNickNameInput(e: any) {
    this.setData({ tempNickName: e.detail.value });
  },

  async login() {
    const { tempNickName, tempAvatarUrl } = this.data;
    if (!tempNickName || !tempAvatarUrl) {
      wx.showToast({ title: '请完善头像和昵称', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    wx.showLoading({ title: '登录中' });

    try {
      // 1. 上传头像到服务器
      const realAvatarUrl = await uploadFile(tempAvatarUrl);

      // 2. 获取 Login Code
      const { code } = await wx.login();

      // 3. 调用后端登录接口
      const res: any = await request({
        url: '/auth/login',
        method: 'POST',
        data: {
            code,
            userInfo: {
                nickName: tempNickName,
                avatarUrl: realAvatarUrl
            }
        }
      });
      
      const { token, user } = res;
      wx.setStorageSync('token', token);
      app.globalData.userInfo = user;
      
      wx.hideLoading();
      wx.showToast({ title: '登录成功' });
      
      // 跳转到首页 (Tab Bar)
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 1500);

    } catch (err) {
      console.error(err);
      wx.hideLoading();
      this.setData({ loading: false });
      wx.showToast({ title: '登录失败', icon: 'none' });
    }
  }
});
