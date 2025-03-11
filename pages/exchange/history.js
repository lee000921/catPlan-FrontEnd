// pages/exchange/history.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    isLogin: false,
    loading: true,
    currentTab: 0,
    tabs: ['全部', '待发货', '已发货', '已完成'],
    exchangeRecords: [],
    // 模拟兑换记录数据
    mockRecords: [
      {
        id: 'record_1',
        itemId: 'item_1',
        itemTitle: '精美猫咪钥匙扣',
        itemImage: '/assets/images/exchange/keychain.png',
        points: 200,
        status: '待发货',
        exchangeTime: '2025-03-08 14:30:22',
        deliveryInfo: {
          name: '张三',
          phone: '138****1234',
          address: '北京市朝阳区xxx街道xxx小区'
        },
        trackingInfo: null
      },
      {
        id: 'record_2',
        itemId: 'item_3',
        itemTitle: '1个月会员卡',
        itemImage: '/assets/images/exchange/membership.png',
        points: 300,
        status: '已完成',
        exchangeTime: '2025-03-05 10:15:36',
        deliveryInfo: null,
        trackingInfo: null,
        virtualCode: 'MEMBER202503051015'
      },
      {
        id: 'record_3',
        itemId: 'item_4',
        itemTitle: '¥5元优惠券',
        itemImage: '/assets/images/exchange/coupon.png',
        points: 50,
        status: '已完成',
        exchangeTime: '2025-03-03 18:45:12',
        deliveryInfo: null,
        trackingInfo: null,
        virtualCode: 'COUPON202503031845'
      },
      {
        id: 'record_4',
        itemId: 'item_6',
        itemTitle: '猫咪抱枕',
        itemImage: '/assets/images/exchange/pillow.png',
        points: 800,
        status: '已发货',
        exchangeTime: '2025-02-28 09:20:45',
        deliveryInfo: {
          name: '张三',
          phone: '138****1234',
          address: '北京市朝阳区xxx街道xxx小区'
        },
        trackingInfo: {
          company: '顺丰速运',
          trackingNumber: 'SF1234567890',
          shippedTime: '2025-03-01 10:30:22'
        }
      },
      {
        id: 'record_5',
        itemId: 'item_2',
        itemTitle: '猫咪主题保温杯',
        itemImage: '/assets/images/exchange/cup.png',
        points: 500,
        status: '已完成',
        exchangeTime: '2025-02-20 15:10:33',
        deliveryInfo: {
          name: '张三',
          phone: '138****1234',
          address: '北京市朝阳区xxx街道xxx小区'
        },
        trackingInfo: {
          company: '中通快递',
          trackingNumber: 'ZT9876543210',
          shippedTime: '2025-02-22 09:15:40'
        },
        receivedTime: '2025-02-25 18:30:00'
      }
    ]
  },

  onLoad: function() {
    this.checkLoginStatus();
  },

  onShow: function() {
    if (this.data.isLogin) {
      this.fetchExchangeRecords();
    }
  },

  // 检查登录状态
  checkLoginStatus: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        isLogin: true
      });
      this.fetchExchangeRecords();
    } else {
      this.setData({
        isLogin: false,
        loading: false
      });
    }
  },

  // 获取兑换记录
  fetchExchangeRecords: function() {
    this.setData({ loading: true });
    
    // 模拟获取兑换记录
    setTimeout(() => {
      this.setData({
        exchangeRecords: this.data.mockRecords,
        loading: false
      });
      
      this.filterRecords(this.data.currentTab);
    }, 500);
  },

  // 切换标签
  handleTabChange: function(e) {
    const index = e.detail.value;
    this.setData({
      currentTab: index
    });
    this.filterRecords(index);
  },

  // 根据标签筛选记录
  filterRecords: function(tabIndex) {
    let filteredRecords = [];
    
    if (tabIndex === 0) {
      // 全部记录
      filteredRecords = this.data.mockRecords;
    } else {
      // 根据状态筛选
      const statusMap = {
        1: '待发货',
        2: '已发货',
        3: '已完成'
      };
      const status = statusMap[tabIndex];
      filteredRecords = this.data.mockRecords.filter(record => record.status === status);
    }
    
    this.setData({
      exchangeRecords: filteredRecords
    });
  },

  // 查看物流信息
  viewTracking: function(e) {
    const { id } = e.currentTarget.dataset;
    const record = this.data.mockRecords.find(record => record.id === id);
    
    if (!record || !record.trackingInfo) return;
    
    wx.showModal({
      title: '物流信息',
      content: `快递公司：${record.trackingInfo.company}\n运单号：${record.trackingInfo.trackingNumber}\n发货时间：${record.trackingInfo.shippedTime}`,
      showCancel: false
    });
  },

  // 复制物流单号
  copyTrackingNumber: function(e) {
    const { id } = e.currentTarget.dataset;
    const record = this.data.mockRecords.find(record => record.id === id);
    
    if (!record || !record.trackingInfo) return;
    
    wx.setClipboardData({
      data: record.trackingInfo.trackingNumber,
      success: function() {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        });
      }
    });
  },

  // 复制虚拟码
  copyVirtualCode: function(e) {
    const { id } = e.currentTarget.dataset;
    const record = this.data.mockRecords.find(record => record.id === id);
    
    if (!record || !record.virtualCode) return;
    
    wx.setClipboardData({
      data: record.virtualCode,
      success: function() {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        });
      }
    });
  },

  // 确认收货
  confirmReceived: function(e) {
    const { id } = e.currentTarget.dataset;
    const recordIndex = this.data.mockRecords.findIndex(record => record.id === id);
    
    if (recordIndex === -1) return;
    
    wx.showModal({
      title: '确认收货',
      content: '确认已收到商品吗？',
      success: (res) => {
        if (res.confirm) {
          // 更新记录状态
          const mockRecords = this.data.mockRecords;
          mockRecords[recordIndex].status = '已完成';
          mockRecords[recordIndex].receivedTime = new Date().toLocaleString();
          
          this.setData({
            mockRecords: mockRecords
          });
          
          // 重新筛选显示
          this.filterRecords(this.data.currentTab);
          
          wx.showToast({
            title: '确认收货成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 去登录
  goToLogin: function() {
    wx.navigateTo({
      url: '/pages/user/login'
    });
  }
});