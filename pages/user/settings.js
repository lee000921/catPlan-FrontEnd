// pages/user/settings.js
Page({
  data: {
    userInfo: null,
    isLogin: false,
    settings: [
      {
        id: 'notification',
        title: '消息通知',
        type: 'switch',
        value: true
      },
      {
        id: 'darkMode',
        title: '深色模式',
        type: 'switch',
        value: false
      },
      {
        id: 'fontsize',
        title: '字体大小',
        type: 'selector',
        value: '中',
        options: ['小', '中', '大']
      },
      {
        id: 'cache',
        title: '清除缓存',
        type: 'button'
      },
      {
        id: 'about',
        title: '关于我们',
        type: 'navigator',
        url: '/pages/user/about'
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
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        isLogin: true
      });
    } else {
      this.setData({
        isLogin: false
      });
    }
  },

  // 切换开关设置
  handleSwitchChange: function(e) {
    const { id } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    const settings = this.data.settings.map(item => {
      if (item.id === id) {
        return { ...item, value };
      }
      return item;
    });
    
    this.setData({ settings });
    
    // 保存设置到本地
    wx.setStorageSync(`setting_${id}`, value);
    
    // 特殊处理
    if (id === 'darkMode') {
      // 应用深色模式
      wx.setNavigationBarColor({
        frontColor: value ? '#ffffff' : '#000000',
        backgroundColor: value ? '#333333' : '#ffffff'
      });
    }
  },

  // 选择器变更
  handleSelectorChange: function(e) {
    const { id } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    const settings = this.data.settings.map(item => {
      if (item.id === id) {
        return { ...item, value };
      }
      return item;
    });
    
    this.setData({ settings });
    
    // 保存设置到本地
    wx.setStorageSync(`setting_${id}`, value);
  },

  // 按钮点击
  handleButtonClick: function(e) {
    const { id } = e.currentTarget.dataset;
    
    if (id === 'cache') {
      wx.showModal({
        title: '清除缓存',
        content: '确定要清除缓存数据吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除缓存
            wx.clearStorage({
              success: () => {
                wx.showToast({
                  title: '缓存已清除',
                  icon: 'success'
                });
                
                // 保留用户登录状态
                const userInfo = this.data.userInfo;
                if (userInfo) {
                  wx.setStorageSync('userInfo', userInfo);
                }
                
                // 重新加载页面
                this.onLoad();
              }
            });
          }
        }
      });
    }
  },

  // 导航
  handleNavigate: function(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.settings.find(item => item.id === id);
    
    if (item && item.url) {
      wx.navigateTo({
        url: item.url
      });
    }
  }
});