// pages/admin/admin.ts
import { callCloud } from '../../utils/cloud';
import { OrderStatusText, OrderStatus, Recipe, Style } from '../../utils/types';

const app = getApp<IAppOption>();

Page({
  data: {
    orders: [],
    stats: [],
    recipes: [] as Recipe[],
    styles: [] as Style[],
    currentTab: 'orders', // orders | stats | recipes | styles
    OrderStatusText,
    
    // 方子编辑相关
    showRecipeModal: false,
    editingRecipe: {
      _id: '',
      name: '',
      description: '',
      ingredientsStr: '', // 临时字段，用于输入框，逗号分隔
      pricePerKg: ''
    },

    // 款式编辑相关
    showStyleModal: false,
    editingStyle: {
      _id: '',
      name: '',
      laborCost: '',
      materialWeight: '',
      imageUrl: ''
    }
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
      // 并行请求所有数据
      const [ordersRes, statsRes, productsRes] = await Promise.all([
        callCloud('manage-orders', 'ADMIN_GET_ALL'),
        callCloud('manage-orders', 'GET_STATS'),
        callCloud('manage-products', 'GET_ALL')
      ]) as any[];
      
      // 格式化订单数据
      const orders = ordersRes.data.map((order: any) => ({
        ...order,
        statusText: OrderStatusText[order.status as OrderStatus] || order.status
      }));

      this.setData({
        orders,
        stats: statsRes.list,
        recipes: productsRes.recipes,
        styles: productsRes.styles
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

  // --- 订单逻辑 (保持不变) ---
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
  },

  // --- 方子管理逻辑 ---
  openRecipeModal(e: any) {
    const recipe = e.currentTarget.dataset.item;
    if (recipe) {
      // 编辑模式
      this.setData({
        showRecipeModal: true,
        editingRecipe: {
          _id: recipe._id,
          name: recipe.name,
          description: recipe.description,
          ingredientsStr: (recipe.ingredients || []).join('，'), // 逗号分隔
          pricePerKg: recipe.pricePerKg.toString()
        }
      });
    } else {
      // 新增模式
      this.setData({
        showRecipeModal: true,
        editingRecipe: { _id: '', name: '', description: '', ingredientsStr: '', pricePerKg: '' }
      });
    }
  },

  closeRecipeModal() {
    this.setData({ showRecipeModal: false });
  },

  onRecipeInput(e: any) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`editingRecipe.${field}`]: e.detail.value
    });
  },

  async saveRecipe() {
    const { _id, name, description, ingredientsStr, pricePerKg } = this.data.editingRecipe;
    if (!name || !pricePerKg) {
      wx.showToast({ title: '名称和单价必填', icon: 'none' });
      return;
    }

    const ingredients = ingredientsStr.split(/[,，]/).map(s => s.trim()).filter(s => s);
    const data = {
      name,
      description,
      ingredients,
      pricePerKg: parseFloat(pricePerKg)
    };

    wx.showLoading({ title: '保存中' });
    try {
      if (_id) {
        await callCloud('manage-products', 'UPDATE_RECIPE', { _id, ...data });
      } else {
        await callCloud('manage-products', 'ADD_RECIPE', data);
      }
      this.closeRecipeModal();
      this.fetchData();
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  async deleteRecipe(e: any) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，是否继续？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中' });
          try {
            await callCloud('manage-products', 'DELETE_RECIPE', { _id: id });
            this.fetchData();
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  // --- 款式管理逻辑 ---
  openStyleModal(e: any) {
    const style = e.currentTarget.dataset.item;
    if (style) {
      this.setData({
        showStyleModal: true,
        editingStyle: {
          _id: style._id,
          name: style.name,
          laborCost: style.laborCost.toString(),
          materialWeight: style.materialWeight.toString(),
          imageUrl: style.imageUrl
        }
      });
    } else {
      this.setData({
        showStyleModal: true,
        editingStyle: { _id: '', name: '', laborCost: '', materialWeight: '', imageUrl: '' }
      });
    }
  },

  closeStyleModal() {
    this.setData({ showStyleModal: false });
  },

  onStyleInput(e: any) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`editingStyle.${field}`]: e.detail.value
    });
  },

  async uploadStyleImage() {
    try {
      const res = await wx.chooseMedia({ count: 1, mediaType: ['image'] });
      const tempFilePath = res.tempFiles[0].tempFilePath;
      
      wx.showLoading({ title: '上传中' });
      const cloudPath = `styles/${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath: tempFilePath
      });
      
      this.setData({
        'editingStyle.imageUrl': uploadRes.fileID
      });
      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
    }
  },

  async saveStyle() {
    const { _id, name, laborCost, materialWeight, imageUrl } = this.data.editingStyle;
    if (!name || !laborCost || !materialWeight) {
      wx.showToast({ title: '名称、工费、耗材必填', icon: 'none' });
      return;
    }

    const data = {
      name,
      laborCost: parseFloat(laborCost),
      materialWeight: parseFloat(materialWeight),
      imageUrl
    };

    wx.showLoading({ title: '保存中' });
    try {
      if (_id) {
        await callCloud('manage-products', 'UPDATE_STYLE', { _id, ...data });
      } else {
        await callCloud('manage-products', 'ADD_STYLE', data);
      }
      this.closeStyleModal();
      this.fetchData();
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  async deleteStyle(e: any) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，是否继续？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中' });
          try {
            await callCloud('manage-products', 'DELETE_STYLE', { _id: id });
            this.fetchData();
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  }
});
