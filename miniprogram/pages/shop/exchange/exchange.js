const { exchangeProduct, getProduct } = require('../../../services/shop');
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
    points: 0,
    isTypeA: false,
    exchangeCount: 1,
    submitting: false,
    canExchange: false,
  },

  onLoad(options) {
    const productId = Number(options.id);
    const isTypeA = hasRole(getSession(), 'A');
    if (!Number.isInteger(productId) || productId <= 0) {
      wx.showToast({ title: '商品编号无效', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 800);
      return;
    }
    this.setData({ productId, isTypeA });
    if (!isTypeA) {
      wx.showModal({
        title: '权限不足',
        content: '当前账号不能兑换商品',
        showCancel: false,
        success: () => wx.navigateBack(),
      });
      return;
    }
    this.loadPage();
  },

  async loadPage() {
    this.setData({ loading: true });
    try {
      const [productResponse, profileResponse] = await Promise.all([
        getProduct(this.data.productId),
        getProfile(),
      ]);
      this.setData({
        product: productViewModel(productResponse.item),
        points: Number(profileResponse.points || 0),
      });
      this.checkCanExchange();
    } catch (error) {
      wx.showToast({ title: getErrorMessage(error), icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  checkCanExchange() {
    const { product, points, exchangeCount, isTypeA } = this.data;
    this.setData({
      canExchange: Boolean(
        product &&
        isTypeA &&
        Number.isInteger(exchangeCount) &&
        exchangeCount > 0 &&
        product.stock >= exchangeCount &&
        points >= product.points * exchangeCount
      ),
    });
  },

  changeCount(event) {
    const direction = event.currentTarget.dataset.type;
    const maximum = Math.min(this.data.product.stock, 100);
    const next =
      direction === 'add'
        ? Math.min(this.data.exchangeCount + 1, maximum)
        : Math.max(this.data.exchangeCount - 1, 1);
    this.setData({ exchangeCount: next });
    this.checkCanExchange();
  },

  inputCount(event) {
    const maximum = Math.min(this.data.product.stock, 100);
    const parsed = Number.parseInt(event.detail.value, 10);
    const exchangeCount = Math.min(
      Math.max(Number.isInteger(parsed) ? parsed : 1, 1),
      maximum
    );
    this.setData({ exchangeCount });
    this.checkCanExchange();
  },

  confirmExchange() {
    if (this.data.submitting) return;
    this.checkCanExchange();
    if (!this.data.canExchange) {
      wx.showToast({ title: '积分或库存不足', icon: 'none' });
      return;
    }

    const { product, exchangeCount } = this.data;
    const pointsSpent = product.points * exchangeCount;
    wx.showModal({
      title: '确认兑换',
      content: `兑换“${product.name}” × ${exchangeCount}，将扣除 ${pointsSpent} 积分。`,
      confirmText: '确认兑换',
      success: result => {
        if (result.confirm) this.submitExchange();
      },
    });
  },

  async submitExchange() {
    this.setData({ submitting: true });
    try {
      const response = await exchangeProduct(
        this.data.product.id,
        this.data.exchangeCount
      );
      this.setData({ points: Number(response.remaining_points || 0) });
      wx.showModal({
        title: '兑换成功',
        content: `已扣除 ${response.points_spent} 积分`,
        showCancel: false,
        confirmText: '查看记录',
        success: () => {
          wx.redirectTo({ url: '/pages/shop/history/history' });
        },
      });
    } catch (error) {
      wx.showModal({
        title: '兑换失败',
        content: getErrorMessage(error),
        showCancel: false,
      });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
