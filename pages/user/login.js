// pages/user/login.js - 本地模拟登录版本
const app = getApp();

Page({
  data: {
    isLoading: false,
    agreePrivacy: false
  },

  onLoad: function() {
    console.log('登录页面加载');
    // 检查是否已经登录
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      console.log('用户已登录，返回上一页');
      this.navigateBack();
    }
  },

  // 处理用户信息授权
  handleUserProfile: function() {
    console.log('点击获取用户信息按钮');
    if (!this.data.agreePrivacy) {
      wx.showToast({
        title: '请先同意隐私协议',
        icon: 'none'
      });
      return;
    }

    this.setData({ isLoading: true });

    // 获取用户信息
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('获取用户信息成功', res);
        // 创建模拟用户数据
        const userInfo = {
          ...res.userInfo,
          userId: 'local_' + Math.floor(Math.random() * 10000),
          points: 100,
          level: 1,
          checkinDays: 0,
          consecutiveCheckinDays: 0,
          lastCheckinDate: null,
          registerTime: new Date(),
          tasks: {
            daily: [],
            newbie: [],
            growth: []
          },
          exchanges: []
        };
        
        // 保存到本地存储
        wx.setStorageSync('userInfo', userInfo);
        
        // 更新全局数据
        app.globalData.userInfo = userInfo;
        app.globalData.isLogin = true;
        
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          success: () => {
            setTimeout(() => {
              this.navigateBack();
            }, 1500);
          }
        });
      },
      fail: (err) => {
        console.error('获取用户信息失败', err);
        this.loginWithTempUserInfo(); // 失败时使用临时用户信息
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 微信一键登录
  handleWechatLogin: function() {
    console.log('点击微信一键登录按钮');
    if (!this.data.agreePrivacy) {
      wx.showToast({
        title: '请先同意隐私协议',
        icon: 'none'
      });
      return;
    }

    this.setData({ isLoading: true });

    // 使用临时用户信息直接登录
    this.loginWithTempUserInfo();
  },

  // 使用临时用户信息登录
  loginWithTempUserInfo: function() {
    console.log('使用临时用户信息登录');
    
    // 创建临时用户数据
    const userInfo = {
      nickName: '微信用户',
      avatarUrl: '/assets/icons/default-avatar.png',
      gender: 0,
      userId: 'local_' + Math.floor(Math.random() * 10000),
      points: 100,
      level: 1,
      checkinDays: 0,
      consecutiveCheckinDays: 0,
      lastCheckinDate: null,
      registerTime: new Date(),
      tasks: {
        daily: [],
        newbie: [],
        growth: []
      },
      exchanges: []
    };
    
    // 保存到本地存储
    wx.setStorageSync('userInfo', userInfo);
    
    // 更新全局数据
    app.globalData.userInfo = userInfo;
    app.globalData.isLogin = true;
    
    wx.showToast({
      title: '登录成功',
      icon: 'success',
      success: () => {
        setTimeout(() => {
          this.navigateBack();
        }, 1500);
      }
    });
    
    this.setData({ isLoading: false });
  },

  // 手机号登录
  handlePhoneLogin: function() {
    console.log('点击手机号登录按钮');
    if (!this.data.agreePrivacy) {
      wx.showToast({
        title: '请先同意隐私协议',
        icon: 'none'
      });
      return;
    }

    // 由于手机号登录需要企业认证小程序，这里直接使用临时用户信息登录
    this.loginWithTempUserInfo();
  },

  // 切换隐私协议同意状态
  togglePrivacyAgreement: function() {
    this.setData({
      agreePrivacy: !this.data.agreePrivacy
    });
    console.log('隐私协议同意状态:', this.data.agreePrivacy);
  },

  // 查看隐私协议
  viewPrivacyPolicy: function() {
    console.log('查看隐私协议');
    wx.showModal({
      title: '隐私政策',
      content: '猫咪计划尊重并保护用户的隐私权。我们会收集必要的用户信息以提供服务，但不会将信息分享给任何第三方。',
      showCancel: false
    });
  },

  // 查看用户协议
  viewUserAgreement: function() {
    console.log('查看用户协议');
    wx.showModal({
      title: '用户协议',
      content: '欢迎使用猫咪计划。使用本服务即表示您同意遵守我们的服务条款，包括但不限于积分规则、兑换政策等。',
      showCancel: false
    });
  },

  // 返回上一页
  navigateBack: function() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({
        url: '/pages/user/index'
      });
    }
  }
});