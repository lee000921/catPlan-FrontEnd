const { listProducts } = require('../../../services/shop');
const { getProfile } = require('../../../services/user');
const { getErrorMessage } = require('../../../utils/request');
const { getSession, hasRole, updateSession } = require('../../../utils/session');
const { promptGuestLogin } = require('../../../utils/guest');

function productViewModel(product) {
  return {
    ...product,
    imageUrl: product.image_url,
    points: Number(product.price || 0),
    stock: Number(product.stock || 0),
  };
}

function demoProducts() {
  return [
    {
      id: 'demo-1',
      name: '小黑零食包',
      description: '完成任务攒积分后，可以兑换一份小奖励。',
      image_url: '',
      price: 20,
      stock: 8,
    },
    {
      id: 'demo-2',
      name: '周末电影券',
      description: '给坚持完成计划的自己一点鼓励。',
      image_url: '',
      price: 50,
      stock: 3,
    },
  ].map(productViewModel);
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
    guestMode: false,
  },

  onLoad() {
    const session = getSession();
    if (!session) {
      this.setGuestExperience();
      return;
    }
    this.setData({
      userInfo: session?.userInfo || null,
      userInitial: session?.userInfo?.nickName?.slice(0, 1) || 'U',
      isTypeA: hasRole(session, 'A'),
      guestMode: false,
    });
  },

  onShow() {
    if (!getSession()) {
      this.setGuestExperience();
      return;
    }
    this.setData({ guestMode: false });
    this.refreshPage();
  },

  setGuestExperience() {
    this.setData({
      productList: demoProducts(),
      loading: false,
      hasMore: false,
      userInfo: null,
      userInitial: '访',
      points: 24,
      isTypeA: false,
      guestMode: true,
    });
    wx.stopPullDownRefresh();
  },

  async refreshPage() {
    if (!getSession()) {
      this.setGuestExperience();
      return;
    }
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
    if (this.data.guestMode) {
      promptGuestLogin('这是商城体验商品。登录后可以查看真实库存并使用积分兑换。');
      return;
    }
    const id = Number(event.currentTarget.dataset.id);
    if (Number.isInteger(id)) {
      wx.navigateTo({ url: `/pages/shop/detail/detail?id=${id}` });
    }
  },

  exchangeNow(event) {
    if (this.data.guestMode) {
      promptGuestLogin('登录后即可使用任务积分兑换商品。');
      return;
    }
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

  onLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },
});
