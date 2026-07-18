const { getPointsHistory, getProfile } = require('../../services/user');
const { getSession, updateSession } = require('../../utils/session');
const { getErrorMessage } = require('../../utils/request');

function getRoleLabel(userType) {
  if (userType === 'AB') return '申请者 / 审批者';
  if (userType === 'B') return '审批者';
  return '申请者';
}

Page({
  data: {
    userInfo: null,
    userTypeLabel: '申请者',
    points: 0,
    records: [],
    loading: false,
    limit: 20,
    offset: 0,
    hasMore: true,
  },

  onLoad() {
    const session = getSession();
    if (!session) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    this.setData({
      userInfo: session.userInfo,
      userTypeLabel: getRoleLabel(session.userType),
    });
    this.refresh();
  },

  async refresh() {
    await Promise.all([this.loadProfile(), this.loadPointsHistory(true)]);
  },

  async onPullDownRefresh() {
    await this.refresh();
    wx.stopPullDownRefresh();
  },

  async loadProfile() {
    try {
      const response = await getProfile();
      const session = getSession();
      const userInfo = response.user || session?.userInfo || null;
      const userType = response.user_type || session?.userType || 'A';
      if (session) updateSession({ userInfo, userType });
      this.setData({
        userInfo,
        userTypeLabel: getRoleLabel(userType),
        points: Number(response.points || 0),
      });
    } catch (error) {
      wx.showToast({
        title: getErrorMessage(error, '个人资料加载失败'),
        icon: 'none',
      });
    }
  },

  async loadPointsHistory(reset = false) {
    if (this.data.loading) return;
    const offset = reset ? 0 : this.data.offset;
    this.setData({ loading: true });

    try {
      const response = await getPointsHistory(this.data.limit, offset);
      const newRecords = (response.records || []).map(record => ({
        ...record,
        createdDate: record.created_at
          ? String(record.created_at).replace('T', ' ').slice(0, 16)
          : '',
      }));
      this.setData({
        records: reset ? newRecords : [...this.data.records, ...newRecords],
        hasMore: Boolean(response.has_more),
        offset: offset + newRecords.length,
      });
    } catch (error) {
      wx.showToast({
        title: getErrorMessage(error, '积分明细加载失败'),
        icon: 'none',
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  loadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadPointsHistory();
    }
  },
});
