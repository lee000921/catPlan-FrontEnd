const { getProduct } = require('../../../services/shop');
const { getProfile } = require('../../../services/user');
const { getErrorMessage } = require('../../../utils/request');
const { getSession, hasRole } = require('../../../utils/session');

function productViewModel(product) {
  return {
    ...product,
    imageUrl: product.image_url,
    points: Number(product.price || 0),
    stock: Number(product.stock || 0),
  };
}

Page({
  data: {
    productId: null,
    product: null,
    loading: true,
    isTypeA: false,
    points: 0,
  },

  onLoad(options) {
    const productId = Number(options.id);
    if (!Number.isInteger(productId) || productId <= 0) {
      wx.showToast({ title: '商品编号无效', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 800);
      return;
    }
    this.setData({
      productId,
      isTypeA: hasRole(getSession(), 'A'),
    });
    this.loadPage();
  },

  onShow() {
    if (this.data.productId && !this.data.loading) this.loadProfile();
  },

  async loadPage() {
    this.setData({ loading: true });
    try {
      await Promise.all([this.loadProductDetail(), this.loadProfile()]);
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadProductDetail() {
    try {
      const response = await getProduct(this.data.productId);
      const product = productViewModel(response.item);
      this.setData({ product });
      wx.setNavigationBarTitle({ title: product.name || '商品详情' });
    } catch (error) {
      wx.showToast({ title: getErrorMessage(error), icon: 'none' });
    }
  },

  async loadProfile() {
    try {
      const response = await getProfile();
      this.setData({
        points: Number(response.points || 0),
        isTypeA: hasRole(getSession(), 'A'),
      });
    } catch (error) {
      console.error('Unable to load product profile', error);
    }
  },

  exchangeNow() {
    const { product, points, isTypeA } = this.data;
    if (!isTypeA) {
      wx.showModal({
        title: '权限不足',
        content: '当前账号不能兑换商品',
        showCancel: false,
      });
      return;
    }
    if (!product || product.stock <= 0) {
      wx.showToast({ title: '商品库存不足', icon: 'none' });
      return;
    }
    if (points < product.points) {
      wx.showModal({
        title: '积分不足',
        content: `当前 ${points} 积分，需要 ${product.points} 积分`,
        showCancel: false,
      });
      return;
    }
    wx.navigateTo({
      url: `/pages/shop/exchange/exchange?id=${product.id}`,
    });
  },

  goToHistory() {
    wx.navigateTo({ url: '/pages/shop/history/history' });
  },
});
