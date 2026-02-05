// pages/admin/admin.ts
import { request, uploadFile } from '../../utils/request';
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
      const [orders, stats, products] = await Promise.all([
        request({ url: '/orders/admin/all' }),
        request({ url: '/orders/admin/stats' }),
        request({ url: '/products/all' })
      ]) as any[];
      
      // 格式化订单数据
      const formattedOrders = orders.map((order: any) => ({
        ...order,
        statusText: OrderStatusText[order.status as OrderStatus] || order.status
      }));

      this.setData({
        orders: formattedOrders,
        stats: stats.list || [], // Backend implementation pending for stats list
        recipes: products.recipes,
        styles: products.styles
      });
    } catch (err) {
      console.error(err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  switchTab(e: any) {
    this.setData({ currentTab: e.currentTarget.dataset.tab });
  },

  // --- 订单逻辑 ---
  async updatePrice(e: any) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '修改价格',
      editable: true,
      placeholderText: '请输入最终价格',
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            await request({
                url: `/orders/admin/${id}/price`,
                method: 'PUT',
                data: { finalPrice: parseFloat(res.content) }
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
          await request({
            url: `/orders/admin/${id}/status`,
            method: 'PUT',
            data: { status, ...expressData }
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

    const ingredients = ingredientsStr.split(/[,，]/).map((s: string) => s.trim()).filter((s: string) => s);
    const data = {
      name,
      description,
      ingredients,
      pricePerKg: parseFloat(pricePerKg)
    };

    wx.showLoading({ title: '保存中' });
    try {
      if (_id) {
        await request({
            url: `/products/recipes/${_id}`,
            method: 'PUT',
            data
        });
      } else {
        await request({
            url: '/products/recipes',
            method: 'POST',
            data
        });
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
            await request({
                url: `/products/recipes/${id}`,
                method: 'DELETE'
            });
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
          imageUrl: style.image || style.imageUrl // Backend uses image, frontend uses imageUrl
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
      
      const fileUrl = await uploadFile(tempFilePath);
      
      this.setData({
        'editingStyle.imageUrl': fileUrl
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
      image: imageUrl // Backend expects 'image'
    };

    wx.showLoading({ title: '保存中' });
    try {
      if (_id) {
        await request({
            url: `/products/styles/${_id}`,
            method: 'PUT',
            data
        });
      } else {
        await request({
            url: '/products/styles',
            method: 'POST',
            data
        });
      }
      this.closeStyleModal();
      this.fetchData();
    } catch (err) {
      console.error(err);
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
            await request({
                url: `/products/styles/${id}`,
                method: 'DELETE'
            });
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
