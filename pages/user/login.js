// pages/user/login.js
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
    if (userInfo && app.globalData.isLogin) {
      console.log('用户已登录，返回上一页');
      this.navigateBack();
    }
  },

  onunload: function() {
    console.log('登录页面卸载');
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

    // 调用微信登录
    wx.login({
      success: (res) => {
        if (res.code) {
          // 获取到登录code，调用云函数登录
          wx.cloud.callFunction({
            name: 'login',
            data: { code: res.code },
            success: (result) => {
              console.log('云函数登录成功', result);
              if (result.result && result.result.data.openId) {
                // 获取用户信息
                console.log('获取用户信息', result.result.data.openId);
                this.getUserInfoFromCloud(result.result.data.openId);
              } else {
                wx.showToast({
                  title: '登录失败，请重试',
                  icon: 'none'
                });
                this.setData({ isLoading: false });
              }
            },
            fail: (err) => {
              console.error('云函数调用失败', err);
              wx.showToast({
                title: '登录失败，请重试',
                icon: 'none'
              });
              this.setData({ isLoading: false });
            }
          });
        } else {
          console.error('wx.login 失败', res);
          wx.showToast({
            title: '登录失败，请重试',
            icon: 'none'
          });
          this.setData({ isLoading: false });
        }
      },
      fail: (err) => {
        console.error('wx.login 调用失败', err);
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
        this.setData({ isLoading: false });
      }
    });
  },

  // 从云端获取用户信息
  getUserInfoFromCloud: function(openId) {
    console.log('从云端获取用户信息', openId);
    wx.cloud.callFunction({
      name: 'getUserInfo',
      data: { openId },
      success: (res) => {
        console.log('获取云端用户信息成功', res);
        console.log('用户信息', res.result.data);
        if (res.result && res.result.data) {
          // 用户已存在，直接登录
          const userInfo = res.result.data;
          
          // 检查是否是新用户
          if (userInfo.isNewUser) {
            // 更新用户标记，避免下次登录再次显示新用户奖励
            wx.cloud.callFunction({
              name: 'updateUserInfo',
              data: {
                isNewUser: false
              }
            });
            
            // 显示新用户欢迎奖励
            this.showNewUserReward(userInfo);
          } else {
            this.saveUserInfoAndNavigate(userInfo);
          }
        } else {
          // 用户不存在
          console.log('获取用户信息失败', openId);
          return;
      }},
      fail: (err) => {
        console.error('获取云端用户信息失败', err);
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
        this.setData({ isLoading: false });
      }
    });
  },

  // 显示新用户欢迎奖励
  showNewUserReward: function(userInfo) {
    wx.showModal({
      title: '欢迎加入猫咪计划！',
      content: '恭喜您获得新用户奖励：520碎片！',
      showCancel: false,
      success: () => {
        this.saveUserInfoAndNavigate(userInfo);
      }
    });
  },

  // 在云端创建用户
  createUserInCloud: function(userInfo) {
    wx.cloud.callFunction({
      name: 'updateUserInfo',
      data: {
        userInfo,
        isNew: true
      },
      success: (res) => {
        console.log('创建用户成功', res);
        this.saveUserInfoAndNavigate(userInfo);
      },
      fail: (err) => {
        console.error('创建用户失败', err);
        wx.showToast({
          title: '创建用户失败，请重试',
          icon: 'none'
        });
        this.setData({ isLoading: false });
      }
    });
  },

  // 保存用户信息并导航
  saveUserInfoAndNavigate: function(userInfo) {
    // 保存到本地存储
    wx.setStorageSync('userInfo', userInfo);
    
    // 更新全局数据
    app.globalData.userInfo = userInfo;
    app.globalData.isLogin = true;
    
    wx.showToast({
      title: '欢迎猫咪大王！',
      icon: 'success',
      success: () => {
        setTimeout(() => {
          this.navigateBack();
        }, 1500);
      }
    });
    
    this.setData({ isLoading: false });
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
      content: '欢迎使用猫咪计划。使用本服务即表示您同意遵守我们的服务条款，包括但不限于碎片规则、兑换政策等。',
      showCancel: false
    });
  },
  // 返回上一页
  navigateBack: function() {
    const pages = getCurrentPages();
    console.log('当前页面栈:', pages);
    if (pages.length > 1) {
      app.globalData.isLogin = true;
      wx.navigateBack();
      const curPage = pages[pages.length - 2];
      curPage.setData({ isLogin: app.globalData.isLogin });
    } else {
      wx.switchTab({
        url: '/pages/checkin/index'
      });
    }
  }
});