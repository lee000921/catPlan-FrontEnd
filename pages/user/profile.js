// pages/user/profile.js
Page({
  data: {
    userInfo: null,
    isLogin: false,
    loading: false,
    formData: {
      nickName: '',
      gender: '保密',
      birthDate: '请选择',
      phone: '',
      email: '',
      address: ''
    },
    genderOptions: ['男', '女', '保密']
  },

  onLoad: function(options) {
    this.checkLoginStatus();
    
    // 如果有tab参数，跳转到对应的表单项
    if (options.tab && options.tab === 'phone') {
      // 这里可以添加滚动到手机号输入框的逻辑
    }
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
        isLogin: true,
        formData: {
          nickName: userInfo.nickName || '',
          gender: userInfo.gender === 1 ? '男' : (userInfo.gender === 2 ? '女' : '保密'),
          birthDate: userInfo.birthDate || '请选择',
          phone: userInfo.phone || '',
          email: userInfo.email || '',
          address: userInfo.address || ''
        }
      });
    } else {
      wx.navigateTo({
        url: '/pages/user/login'
      });
    }
  },

  // 修改头像
  changeAvatar: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        
        // 显示加载中
        this.setData({ loading: true });
        
        // 模拟上传头像
        setTimeout(() => {
          // 更新用户信息
          const userInfo = this.data.userInfo;
          userInfo.avatarUrl = tempFilePath;
          
          // 更新本地存储
          wx.setStorageSync('userInfo', userInfo);
          
          this.setData({
            userInfo: userInfo,
            loading: false
          });
          
          wx.showToast({
            title: '头像更新成功',
            icon: 'success'
          });
        }, 1000);
      }
    });
  },

  // 输入框变更
  handleInputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value
    });
  },

  // 性别选择器变更
  handleGenderChange: function(e) {
    const index = e.detail.value;
    const gender = this.data.genderOptions[index];
    
    this.setData({
      'formData.gender': gender
    });
  },

  // 日期选择器变更
  handleDateChange: function(e) {
    const birthDate = e.detail.value;
    
    this.setData({
      'formData.birthDate': birthDate
    });
  },

  // 保存个人资料
  saveProfile: function() {
    // 显示加载中
    this.setData({ loading: true });
    
    // 模拟保存请求
    setTimeout(() => {
      // 更新用户信息
      const userInfo = this.data.userInfo;
      const formData = this.data.formData;
      
      userInfo.nickName = formData.nickName;
      userInfo.gender = formData.gender === '男' ? 1 : (formData.gender === '女' ? 2 : 0);
      userInfo.birthDate = formData.birthDate;
      userInfo.phone = formData.phone;
      userInfo.email = formData.email;
      userInfo.address = formData.address;
      
      // 更新本地存储
      wx.setStorageSync('userInfo', userInfo);
      
      this.setData({
        userInfo: userInfo,
        loading: false
      });
      
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      });
    }, 1000);
  }
});