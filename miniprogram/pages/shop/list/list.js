const { listProducts } = require('../../../services/shop');
const { getProfile } = require('../../../services/user');
const { getErrorMessage } = require('../../../utils/request');
const { getSession, hasRole, updateSession } = require('../../../utils/session');

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
    productList: [],
    loading: true,
    hasMore: false,
    userInfo: null,
    userInitial: 'U',
    points: 0,
    isTypeA: false,
  },

  onLoad() {
    const session = getSession();
    this.setData({
      userInfo: session?.userInfo || null,
      userInitial: session?.userInfo?.nickName?.slice(0, 1) || 'U',
      isTypeA: hasRole(session, 'A'),
    });
  },

  onShow() {
    this.refreshPage();
  },

  async refreshPage() {
    await Promise.all([this.loadProductList(), this.loadProfile()]);
  },

  async loadProductList() {
    this.setData({ loading: true });
    try {
      const response = await listProducts();
      this.setData({
        productList: (response.items || []).map(productViewModel),
        hasMore: false,
      });
    } catch (error) {
      wx.showToast({ title: getErrorMessage(error), icon: 'none' });
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  async loadProfile() {
    try {
      const response = await getProfile();
      const session = getSession();
      this.setData({
        userInfo: response.user || session?.userInfo || null,
        userInitial:
          response.user?.nickName?.slice(0, 1) ||
          session?.userInfo?.nickName?.slice(0, 1) ||
          'U',
        points: Number(response.points || 0),
        isTypeA: hasRole(session, 'A'),
      });
      updateSession({ userInfo: response.user || null });
    } catch (error) {
      console.error('Unable to load shop profile', error);
    }
  },

  onPullDownRefresh() {
    this.refreshPage();
  },

  goToDetail(event) {
    const id = Number(event.currentTarget.dataset.id);
    if (Number.isInteger(id)) {
      wx.navigateTo({ url: `/pages/shop/detail/detail?id=${id}` });
    }
  },

  exchangeNow(event) {
    if (!this.data.isTypeA) {
      wx.showModal({
        title: '权限不足',
        content: '当前账号不能兑换商品',
        showCancel: false,
      });
      return;
    }
    const id = Number(event.currentTarget.dataset.id);
    if (Number.isInteger(id)) {
      wx.navigateTo({ url: `/pages/shop/exchange/exchange?id=${id}` });
    }
  },
});
