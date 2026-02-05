// pages/index/index.ts
import { request } from "../../utils/request";
import { Recipe, Style } from "../../utils/types";

const app = getApp<IAppOption>();

Page({
  data: {
    recipes: [] as Recipe[],
    styles: [] as Style[],
    loading: true,
    showModal: false,

    // 选中的款式
    currentStyle: null as Style | null,

    // 弹窗表单数据
    selectedRecipeIndex: -1,
    quantity: 1,
    totalPrice: 0,
  },

  async onLoad() {
    await this.fetchProducts();
  },

  onShow() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0,
      });
    }
  },

  async fetchProducts() {
    try {
      const res: any = await request({ url: "/products/all" });
      this.setData({
        recipes: res.recipes,
        styles: res.styles,
        loading: false,
      });
    } catch (err) {
      wx.showToast({ title: "加载失败", icon: "none" });
    }
  },

  // 点击款式，打开弹窗
  onStyleTap(e: any) {
    const style = e.currentTarget.dataset.item;
    this.setData({
      currentStyle: style,
      showModal: true,
      selectedRecipeIndex: -1,
      quantity: 1,
      totalPrice: 0,
    });
  },

  closeModal() {
    this.setData({ showModal: false });
  },

  onRecipeChange(e: any) {
    this.setData({ selectedRecipeIndex: e.detail.value }, this.calculatePrice);
  },

  onQuantityChange(e: any) {
    let val = parseInt(e.detail.value);
    if (isNaN(val) || val < 1) val = 1;
    this.setData({ quantity: val }, this.calculatePrice);
  },

  calculatePrice() {
    const { recipes, currentStyle, selectedRecipeIndex, quantity } = this.data;
    if (selectedRecipeIndex === -1 || !currentStyle) {
      this.setData({ totalPrice: 0 });
      return;
    }

    const recipe = recipes[selectedRecipeIndex];
    // 公式: (方子单价 * 款式耗材量 + 款式工费) * 数量
    // 注意: 服务端模型可能没有 ingredients 字段，但有 pricePerKg 等
    const price =
      (recipe.pricePerKg * currentStyle.materialWeight +
        currentStyle.laborCost) *
      quantity;
    this.setData({ totalPrice: Math.round(price * 100) / 100 });
  },

  async submitOrder() {
    const { recipes, currentStyle, selectedRecipeIndex, quantity, totalPrice } =
      this.data;

    if (selectedRecipeIndex === -1) {
      wx.showToast({ title: "请选择方子", icon: "none" });
      return;
    }

    // 二次检查登录状态（虽然 app.ts 拦截了，但以防万一）
    const userInfo = app.globalData.userInfo;
    if (!userInfo) {
      wx.showToast({ title: "请先登录", icon: "none" });
      return;
    }

    wx.showLoading({ title: "正在提交" });
    try {
      await request({
        url: "/orders",
        method: "POST",
        data: {
          recipe: recipes[selectedRecipeIndex],
          style: currentStyle,
          quantity,
          originalPrice: totalPrice,
          finalPrice: totalPrice,
          // userInfo is handled by backend via token, but we can send if needed for snapshot
          // Backend createOrder uses req.user.openid
        },
      });

      wx.hideLoading();
      this.closeModal();

      wx.showModal({
        title: "提交成功",
        content: "主理人将审核订单并与您确认价格",
        showCancel: false,
        success: () => {
          wx.switchTab({ url: "/pages/order-list/order-list" });
        },
      });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: "提交失败", icon: "none" });
    }
  },

  onShareAppMessage() {
    return {
      title: "和熹香堂 - 非遗手工合香",
      path: "/pages/index/index",
      imageUrl: "/images/logo.png",
    };
  },

  onShareTimeline() {
    return {
      title: "和熹香堂 - 非遗手工合香",
      imageUrl: "/images/logo.png",
    };
  },
});
