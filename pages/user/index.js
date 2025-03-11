// pages/user/index.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    isLogin: false,
    loading: true,
    pointsInfo: {
      total: 0,
      thisMonth: 0,
      expiring: 0
    },
    functionItems: [
      {
        id: 'exchange_history',
        icon: 'swap',
        text: '兑换记录',
        url: '/pages/exchange/history'
      },
      {
        id: 'settings',
        icon: 'setting',
        text: '设置',
        url: '/pages/user/settings'
      },
      {
        id: 'help',
        icon: 'help-circle',
        text: '帮助中心',
        url: '/pages/user/help'
      }
    ]
  },

  onLoad: function() {
    this.checkLoginStatus();
  },

  onShow: function() {
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus: function() {
    // 从本地存储获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      // 更新全局数据
      app.globalData.userInfo = userInfo;
      app.globalData.isLogin = true;
      
      this.setData({
        userInfo: userInfo,
        isLogin: true,
        loading: false
      });
      
      this.fetchPointsInfo();
    } else {
      this.setData({
        isLogin: false,
        loading: false
      });
    }
  },

  // 获取碎片信息
  fetchPointsInfo: function() {
    if (!this.data.userInfo) return;
    
    // 计算本月获得的碎片和即将过期的碎片
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // 假设碎片有效期为一年
    const expiryDate = new Date(currentYear, currentMonth + 1, 0); // 本月最后一天
    expiryDate.setFullYear(expiryDate.getFullYear() - 1); // 一年前的今天
    
    // 模拟计算本月获得的碎片和即将过期的碎片
    const thisMonth = 0; // 本月获得的碎片
    const expiring = 0;   // 即将过期的碎片
    
    this.setData({
      pointsInfo: {
        total: this.data.userInfo.points || 0,
        thisMonth: thisMonth,
        expiring: expiring
      }
    });
  },

  // 去登录
  goToLogin: function() {
    wx.navigateTo({
      url: '/pages/user/login'
    });
  },

  // 退出登录
  handleLogout: function() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的用户信息
          wx.removeStorageSync('userInfo');
          
          // 清除全局数据
          app.globalData.userInfo = null;
          app.globalData.isLogin = false;
          
          this.setData({
            userInfo: null,
            isLogin: false,
            pointsInfo: {
              total: 0,
              thisMonth: 0,
              expiring: 0
            }
          });
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 编辑个人资料
  editProfile: function() {
    if (!this.data.isLogin) {
      this.goToLogin();
      return;
    }
    
    wx.navigateTo({
      url: '/pages/user/profile'
    });
  },

  // 处理功能项点击
  handleFunctionItemClick: function(e) {
    const { id } = e.currentTarget.dataset;
    
    if (!this.data.isLogin) {
      this.goToLogin();
      return;
    }
    
    const item = this.data.functionItems.find(item => item.id === id);
    if (item && item.url) {
      wx.navigateTo({
        url: item.url
      });
    }
  },

  // 联系客服
  contactService: function() {
    // 实际场景中应该使用button的open-type="contact"
    wx.showToast({
      title: '请添加客服微信：catplan001',
      icon: 'none',
      duration: 2000
    });
  }
});