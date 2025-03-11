import updateManager from './common/updateManager';

// 初始化云开发环境
try {
  wx.cloud.init({
    env: 'cloudbase-2gtgglf5dbf036d9', // 您的云环境ID
    traceUser: true // 是否将访问用户记录到云控制台
  });
  console.log('云开发环境初始化成功');
} catch (error) {
  console.error('云开发环境初始化失败', error);
}

App({
  globalData: {
    userInfo: null,
    isLogin: false
  },
  
  onLaunch: function() {
    console.log('App onLaunch');
    // 检查登录状态
    this.checkLoginStatus();
    
    // 测试云函数是否可用
    this.testCloudFunction();
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
    }
  },
  
  // 测试云函数是否可用
  testCloudFunction: function() {
    console.log('开始测试云函数...');
    
    // 检查wx.cloud是否存在
    if (!wx.cloud) {
      console.error('wx.cloud 不存在，请检查是否在app.json中启用了云开发');
      return;
    }
    
    // 列出所有可用的云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {
        userInfo: {
          nickName: '测试用户',
          avatarUrl: '/assets/icons/default-avatar.png'
        }
      },
      success: res => {
        console.log('云函数调用成功', res);
      },
      fail: err => {
        console.error('云函数调用失败', err);
        
        // 尝试获取更详细的错误信息
        if (err.errMsg) {
          console.error('错误信息:', err.errMsg);
        }
        
        // 检查云环境状态
        console.log('检查云环境配置...');
        console.log('当前云环境ID:', 'cloudbase-2gtgglf5dbf036d9');
        
        // 检查云函数是否已部署
        console.log('请确认以下事项:');
        console.log('1. 云函数login是否已上传并部署');
        console.log('2. 云函数目录结构是否正确');
        console.log('3. project.config.json中是否正确配置了cloudfunctionRoot');
        console.log('4. 是否在开发者工具中启用了云开发');
      }
    });
  }
});