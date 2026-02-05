// pages/login/login.ts
import { callCloud } from '../../utils/cloud';

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
      // 1. 上传头像到云存储
      const cloudPath = `avatars/${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath: tempAvatarUrl,
      });
      const realAvatarUrl = uploadRes.fileID;

      // 2. 调用云函数存储用户信息
      const user = await callCloud('manage-users', 'LOGIN', {
        nickName: tempNickName,
        avatarUrl: realAvatarUrl
      });
      
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
