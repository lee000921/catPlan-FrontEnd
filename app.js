import updateManager from './common/updateManager';

// // 初始化云开发环境
// try {
//   wx.cloud.init({
//     env: 'cloudbase-2gtgglf5dbf036d9', // 您的云环境ID
//     traceUser: true // 是否将访问用户记录到云控制台
//   });
//   console.log('云开发环境初始化成功');
// } catch (error) {
//   console.error('云开发环境初始化失败', error);
// }

App({
  globalData: {
    userInfo: null,
    isLogin: false
  },
  
  onLaunch: function() {
     // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloudbase-2gtgglf5dbf036d9', // 请替换为你的云环境ID
        traceUser: true,
      });
    }

    // 检查登录状态
    const isLogin = this.checkLoginStatus();
    if (!isLogin) {
      // 如果未登录，跳转到登录页面
      wx.navigateTo({
        url: '/pages/user/login',
      });
    }
  },
  
  onShow: function() {
    updateManager();
  },
  
  // 检查登录状态
  checkLoginStatus: function() {
    // 获取本地存储的用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.isLogin = true;
      console.log('本地存储有用户信息', userInfo);
      return true;
    }
    console.log('本地存储没有用户信息');
    return false;
  },
});