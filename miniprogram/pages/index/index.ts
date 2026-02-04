// pages/index/index.ts
import { callCloud } from '../../utils/cloud';
import { Recipe, Style, User } from '../../utils/types';

const app = getApp<IAppOption>();

Page({
  data: {
    recipes: [] as Recipe[],
    styles: [] as Style[],
    selectedRecipeIndex: -1,
    selectedStyleIndex: -1,
    quantity: 1,
    totalPrice: 0,
    loading: true,
    userInfo: null as User | null,
    showLogin: false,
    tempNickName: '',
    tempAvatarUrl: ''
  },

  async onLoad() {
    await this.checkLogin();
    await this.fetchProducts();
  },

  async checkLogin() {
    try {
      const user = await callCloud('manage-users', 'GET_USER');
      if (user) {
        app.globalData.userInfo = user;
        this.setData({ userInfo: user });
      } else {
        // 未登录或未注册
        this.setData({ showLogin: true });
      }
    } catch (err) {
      console.error('Check login failed', err);
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
      wx.showToast({ title: '请填写头像和昵称', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '登录中' });
    try {
      // 1. 上传头像到云存储
      // 使用时间戳+随机数生成文件名，避免重名
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
      this.setData({ 
        userInfo: user, 
        showLogin: false 
      });
      wx.hideLoading();
    } catch (err) {
      console.error(err);
      wx.hideLoading();
      wx.showToast({ title: '登录失败', icon: 'none' });
    }
  },

  async fetchProducts() {
    try {
      const res: any = await callCloud('manage-products', 'GET_ALL');
      this.setData({
        recipes: res.recipes,
        styles: res.styles,
        loading: false
      });
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onRecipeChange(e: any) {
    this.setData({ selectedRecipeIndex: e.detail.value }, this.calculatePrice);
  },

  onStyleChange(e: any) {
    this.setData({ selectedStyleIndex: e.detail.value }, this.calculatePrice);
  },

  onQuantityChange(e: any) {
    this.setData({ quantity: parseInt(e.detail.value) || 1 }, this.calculatePrice);
  },

  calculatePrice() {
    const { recipes, styles, selectedRecipeIndex, selectedStyleIndex, quantity } = this.data;
    if (selectedRecipeIndex === -1 || selectedStyleIndex === -1) {
      this.setData({ totalPrice: 0 });
      return;
    }

    const recipe = recipes[selectedRecipeIndex];
    const style = styles[selectedStyleIndex];
    
    // 公式: (方子单价 * 款式耗材量 + 款式工费) * 数量
    const price = (recipe.pricePerKg * style.materialWeight + style.laborCost) * quantity;
    this.setData({ totalPrice: Math.round(price * 100) / 100 });
  },

  async submitOrder() {
    if (!this.data.userInfo) {
      this.setData({ showLogin: true });
      return;
    }

    const { recipes, styles, selectedRecipeIndex, selectedStyleIndex, quantity, totalPrice, userInfo } = this.data;
    if (selectedRecipeIndex === -1 || selectedStyleIndex === -1) {
      wx.showToast({ title: '请选择方子和款式', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '正在提交' });
    try {
      await callCloud('manage-orders', 'CREATE', {
        recipe: recipes[selectedRecipeIndex],
        style: styles[selectedStyleIndex],
        quantity,
        originalPrice: totalPrice,
        finalPrice: totalPrice,
        userInfo: { // 关联用户信息
          nickName: userInfo!.nickName,
          avatarUrl: userInfo!.avatarUrl
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      wx.hideLoading();
      wx.showModal({
        title: '提交成功',
        content: '主理人将审核订单并与您确认价格',
        showCancel: false,
        success: () => {
          wx.navigateTo({ url: '/pages/order-list/order-list' });
        }
      });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '提交失败', icon: 'none' });
    }
  },

  goToAdmin() {
    if (this.data.userInfo?.isAdmin) {
      wx.navigateTo({ url: '/pages/admin/admin' });
    } else {
      wx.showToast({ title: '无权限访问', icon: 'none' });
    }
  }
});
