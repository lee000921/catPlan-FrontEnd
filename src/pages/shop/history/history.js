const { getExchangeHistory } = require('../../../services/shop');
const { getErrorMessage } = require('../../../utils/request');

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const pad = number => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function historyViewModel(exchange) {
  return {
    ...exchange,
    productId: exchange.item_id,
    productName: exchange.item_name || '已下架商品',
    points: Number(exchange.points_spent || 0),
    count: Number(exchange.quantity || 1),
    createTime: formatTime(exchange.created_at),
    orderNo: exchange.id,
    statusText: exchange.status === 'completed' ? '兑换成功' : '已取消',
    statusClass: exchange.status === 'completed' ? 'success' : 'failed',
  };
}

Page({
  data: {
    exchangeList: [],
    loading: false,
    hasMore: true,
    page: 0,
    pageSize: 10,
    total: 0,
  },

  onLoad() {
    this.loadExchangeHistory(false);
  },

  async loadExchangeHistory(loadMore = false) {
    if (this.data.loading) return;
    this.setData({ loading: true });

    const page = loadMore ? this.data.page + 1 : 0;
    try {
      const response = await getExchangeHistory(
        this.data.pageSize,
        page * this.data.pageSize
      );
      const incoming = (response.exchanges || []).map(historyViewModel);
      const exchangeList = loadMore
        ? [...this.data.exchangeList, ...incoming]
        : incoming;
      this.setData({
        exchangeList,
        page,
        total: Number(response.total || 0),
        hasMore: exchangeList.length < Number(response.total || 0),
      });
    } catch (error) {
      wx.showToast({ title: getErrorMessage(error), icon: 'none' });
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  onPullDownRefresh() {
    this.loadExchangeHistory(false);
  },

  onReachBottom() {
    if (this.data.hasMore) this.loadExchangeHistory(true);
  },

  viewDetail(event) {
    const id = Number(event.currentTarget.dataset.id);
    if (Number.isInteger(id)) {
      wx.navigateTo({ url: `/pages/shop/detail/detail?id=${id}` });
    }
  },

  contactSeller() {
    wx.showModal({
      title: '领取提示',
      content: '请联系管理员领取已兑换物品。',
      showCancel: false,
    });
  },

  goBack() {
    wx.navigateBack();
  },
});
