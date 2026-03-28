const app = getApp();

Page({
  data: {
    backendBase: '',
    userInfo: null,
    openid: '',
    userTypeLabel: '申请者',
    points: 0,
    records: [],
    loading: false,
    limit: 20,
    offset: 0,
    hasMore: true
  },

  onLoad() {
    if (app && app.globalData && app.globalData.backendBase) {
      this.setData({ backendBase: app.globalData.backendBase });
    }

    const userInfo = wx.getStorageSync('catplan_user');
    const openid = wx.getStorageSync('catplan_user_openid');
    const userType = wx.getStorageSync('catplan_user_type') || 'A';
    const userTypeMap = { 'A': '申请者', 'B': '审批者', 'AB': '双重角色' };

    this.setData({
      userInfo,
      openid,
      userTypeLabel: userTypeMap[userType] || '申请者'
    });

    this.loadProfile();
    this.loadPointsHistory();
  },

  onShow() {
    this.loadProfile();
  },

  onPullDownRefresh() {
    this.setData({ offset: 0, hasMore: true, records: [] });
    this.loadProfile();
    this.loadPointsHistory();
  },

  loadProfile() {
    if (!this.data.backendBase || !this.data.openid) return;

    wx.request({
      url: `${this.data.backendBase}/api/user/profile`,
      method: 'GET',
      data: { openid: this.data.openid },
      success: (res) => {
        if (res.data) {
          this.setData({ points: res.data.points || 0 });
        }
      },
      fail: (err) => {
        console.error('加载用户信息失败', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        wx.stopPullDownRefresh();
      }
    });
  },

  loadPointsHistory() {
    if (!this.data.backendBase || !this.data.openid || this.data.loading) return;

    this.setData({ loading: true });

    wx.request({
      url: `${this.data.backendBase}/api/user/points-history`,
      method: 'GET',
      data: {
        openid: this.data.openid,
        limit: this.data.limit,
        offset: this.data.offset
      },
      success: (res) => {
        if (res.data && res.data.ok) {
          const newRecords = res.data.records || [];
          this.setData({
            records: this.data.offset === 0 ? newRecords : [...this.data.records, ...newRecords],
            hasMore: res.data.has_more,
            offset: this.data.offset + newRecords.length
          });
        }
      },
      fail: (err) => {
        console.error('加载积分明细失败', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ loading: false });
        wx.stopPullDownRefresh();
      }
    });
  },

  loadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadPointsHistory();
    }
  }
});