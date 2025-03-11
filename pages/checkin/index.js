// pages/checkin/index.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    isLogin: false,
    todayChecked: false,
    checkInDays: 0,
    consecutiveDays: 0,
    currentMonth: new Date().getMonth() + 1,
    currentYear: new Date().getFullYear(),
    calendarDays: [],
    rewards: [
      { day: 1, points: 1, status: 'waiting' },
      { day: 3, points: 1, status: 'waiting' },
      { day: 5, points: 1, status: 'waiting' },
      { day: 7, points: 2, status: 'waiting' },
      { day: 10, points: 2, status: 'waiting' },
      { day: 15, points: 3, status: 'waiting' },
      { day: 30, points: 5, status: 'waiting' }
    ],
    loading: true,
    checkInAnimation: false
  },

  onLoad: function() {
    this.checkLoginStatus();
    this.initCalendar();
  },

  onShow: function() {
    if (app.globalData.isLogin !== this.data.isLogin) {
      this.setData({
        isLogin: app.globalData.isLogin
      });
    }
    if (this.data.isLogin) {
      this.fetchCheckInData();
    }
  },

  // 检查登录状态
  checkLoginStatus: function() {
    // 从全局数据获取用户信息
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        isLogin: true
      });
      this.fetchCheckInData();
    } else {
      // 从本地存储获取用户信息
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({
          userInfo: userInfo,
          isLogin: true
        });
        this.fetchCheckInData();
      } else {
        this.setData({
          isLogin: false,
          loading: false
        });
      }
    }
  },

  // 获取签到数据
  fetchCheckInData: function() {
    this.setData({ loading: true });
    
    // 调用云函数获取用户信息，包括签到数据
    wx.cloud.callFunction({
      name: 'getUserInfo',
      success: res => {
        if (res.result && res.result.success && res.result.data) {
          const userData = res.result.data;
          
          // 更新用户信息
          app.globalData.userInfo = userData;
          wx.setStorageSync('userInfo', userData);
          
          // 检查今日是否已签到，并更新签到状态
          const today = new Date();
          // 将时间转换为当天0点
          today.setHours(0, 0, 0, 0);
          const beginTime = today.getTime();
          // 将时间转换为当天23:59:59
          today.setHours(23, 59, 59, 999);
          const endTime = today.getTime();
          const lastCheckinTime = userData.lastCheckinDate ? new Date(userData.lastCheckinDate).getTime() : 0;
          const todayChecked = lastCheckinTime >= beginTime && lastCheckinTime <= endTime;
          console.log('todayChecked', todayChecked);
          
          // 获取签到历史记录
          const checkinHistory = userData.checkinHistory || [];
          
          // 更新日历数据
          const calendarDays = this.data.calendarDays.map(day => {
            // 检查当前日期是否在签到历史中
            if (day.day && !day.disabled) {
              const date = new Date(this.data.currentYear, this.data.currentMonth - 1, day.day);
              const dateStr = date.toISOString().split('T')[0];
              
              // 检查是否有签到记录
              const hasCheckin = checkinHistory.some(record => {
                const recordDate = new Date(record.date);
                return recordDate.getFullYear() === date.getFullYear() &&
                       recordDate.getMonth() === date.getMonth() &&
                       recordDate.getDate() === date.getDate();
              });
              
              day.checked = hasCheckin;
            }
            return day;
          });
          
          // 更新奖励状态
          const consecutiveDays = userData.consecutiveCheckinDays || 0;
          const rewards = this.data.rewards.map(reward => {
            if (consecutiveDays >= reward.day) {
              reward.status = 'completed';
            } else if (consecutiveDays + 1 === reward.day) {
              reward.status = 'current';
            } else {
              reward.status = 'waiting';
            }
            return reward;
          });
          
          this.setData({
            userInfo: userData,
            checkInDays: userData.checkinDays || 0,
            consecutiveDays: consecutiveDays,
            todayChecked: todayChecked,
            calendarDays,
            rewards,
            loading: false
          });
        } else {
          this.setData({ loading: false });
          wx.showToast({
            title: '获取签到数据失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        console.error('获取用户信息失败', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '获取签到数据失败',
          icon: 'none'
        });
      }
    });
  },

  // 初始化日历
  initCalendar: function() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // 获取当月天数
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // 获取当月第一天是星期几
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const calendarDays = [];
    
    // 添加上个月的占位日期
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push({
        day: null,
        disabled: true
      });
    }
    
    // 添加当月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        day: i,
        disabled: false,
        checked: false,
        isToday: i === now.getDate()
      });
    }
    
    this.setData({
      calendarDays
    });
  },

  // 执行签到
  handleCheckIn: function() {
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/user/login'
      });
      return;
    }

    if (this.data.todayChecked) {
      wx.showToast({
        title: '今日已签到',
        icon: 'none'
      });
      return;
    }

    this.setData({
      checkInAnimation: true
    });

    // 调用签到云函数
    wx.cloud.callFunction({
      name: 'checkin',
      success: res => {
        if (res.result && res.result.success) {
          const result = res.result;
          
          // 更新日历
          const calendarDays = this.data.calendarDays.map(day => {
            if (day.isToday) {
              day.checked = true;
            }
            return day;
          });
          
          // 更新奖励状态
          const consecutiveDays = result.data.consecutiveCheckinDays;
          const rewards = this.data.rewards.map(reward => {
            if (consecutiveDays >= reward.day) {
              reward.status = 'completed';
            } else if (consecutiveDays + 1 === reward.day) {
              reward.status = 'current';
            } else {
              reward.status = 'waiting';
            }
            return reward;
          });
          
          // 更新用户信息
          if (result.data.userInfo) {
            app.globalData.userInfo = result.data.userInfo;
            wx.setStorageSync('userInfo', result.data.userInfo);
          }
          
          this.setData({
            todayChecked: true,
            consecutiveDays: result.data.consecutiveCheckinDays,
            checkInDays: result.data.checkinDays,
            calendarDays,
            rewards,
            checkInAnimation: false,
            userInfo: result.data.userInfo || this.data.userInfo
          });
          
          // 显示签到成功
          wx.showToast({
            title: `签到成功 +${result.data.basePoints}碎片`,
            icon: 'success'
          });
          
          // 检查是否达到里程碑
          if (result.data.milestone && result.data.bonusPoints > 0) {
            setTimeout(() => {
              wx.showModal({
                title: '恭喜你',
                content: `连续签到${result.data.milestone}天，获得额外${result.data.bonusPoints}碎片奖励！`,
                showCancel: false
              });
            }, 1500);
          }
        } else {
          this.setData({ checkInAnimation: false });
          wx.showToast({
            title: res.result.message || '签到失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: err => {
        console.error('签到失败', err);
        this.setData({ checkInAnimation: false });
        wx.showToast({
          title: '签到失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 去登录
  goToLogin: function() {
    wx.navigateTo({
      url: '/pages/user/login'
    });
  },

  // 动画结束处理
  onAnimationEnd: function() {
    if (this.data.checkInAnimation) {
      this.setData({
        checkInAnimation: false
      });
    }
  }
});