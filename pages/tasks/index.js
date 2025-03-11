// pages/tasks/index.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    isLogin: false,
    loading: true,
    taskGroups: [
      {
        title: '日常任务',
        desc: '每日可完成',
        tasks: [
          {
            id: 'daily_1',
            title: '浏览商品',
            desc: '浏览3个商品详情页',
            points: 5,
            progress: 0,
            maxProgress: 3,
            completed: false,
            buttonText: '去完成'
          },
          {
            id: 'daily_2',
            title: '分享小程序',
            desc: '分享小程序给好友',
            points: 10,
            progress: 0,
            maxProgress: 1,
            completed: false,
            buttonText: '去完成'
          },
          {
            id: 'daily_3',
            title: '观看视频',
            desc: '观看一个推广视频',
            points: 8,
            progress: 0,
            maxProgress: 1,
            completed: false,
            buttonText: '去完成'
          }
        ]
      },
      {
        title: '新手任务',
        desc: '新用户专享，仅可完成一次',
        tasks: [
          {
            id: 'newbie_1',
            title: '完善个人资料',
            desc: '补充个人信息',
            points: 20,
            progress: 0,
            maxProgress: 1,
            completed: false,
            buttonText: '去完成'
          },
          {
            id: 'newbie_2',
            title: '绑定手机号',
            desc: '绑定手机号获得安全保障',
            points: 15,
            progress: 0,
            maxProgress: 1,
            completed: false,
            buttonText: '去完成'
          },
          {
            id: 'newbie_3',
            title: '关注公众号',
            desc: '关注我们的公众号',
            points: 10,
            progress: 0,
            maxProgress: 1,
            completed: false,
            buttonText: '去完成'
          }
        ]
      },
      {
        title: '成长任务',
        desc: '持续累计，长期有效',
        tasks: [
          {
            id: 'growth_1',
            title: '累计签到7天',
            desc: '累计签到满7天',
            points: 30,
            progress: 0,
            maxProgress: 7,
            completed: false,
            buttonText: '去签到'
          },
          {
            id: 'growth_2',
            title: '累计签到30天',
            desc: '累计签到满30天',
            points: 100,
            progress: 0,
            maxProgress: 30,
            completed: false,
            buttonText: '去签到'
          },
          {
            id: 'growth_3',
            title: '累计兑换3次',
            desc: '累计兑换商品3次',
            points: 50,
            progress: 0,
            maxProgress: 3,
            completed: false,
            buttonText: '去兑换'
          }
        ]
      }
    ],
    completedTasks: 0,
    totalTasks: 0,
    todayEarnedPoints: 0
  },

  onLoad: function() {
    this.checkLoginStatus();
  },

  onShow: function() {
    if (this.data.isLogin) {
      this.fetchTaskData();
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
      this.fetchTaskData();
    } else {
      this.setData({
        isLogin: false,
        loading: false
      });
    }
  },

  // 获取任务数据
  fetchTaskData: function() {
    this.setData({ loading: true });
    
    // 模拟获取任务数据
    setTimeout(() => {
      // 随机生成一些任务进度
      const taskGroups = this.data.taskGroups.map(group => {
        group.tasks = group.tasks.map(task => {
          if (task.id === 'daily_1') {
            task.progress = 2;
          } else if (task.id === 'growth_1') {
            task.progress = 5;
          } else if (task.id === 'newbie_1') {
            task.progress = 1;
            task.completed = true;
            task.buttonText = '已完成';
          }
          return task;
        });
        return group;
      });
      
      // 计算已完成任务数和总任务数
      let completedTasks = 0;
      let totalTasks = 0;
      let todayEarnedPoints = 20; // 模拟今日已获得的碎片
      
      taskGroups.forEach(group => {
        group.tasks.forEach(task => {
          totalTasks++;
          if (task.completed) {
            completedTasks++;
          }
        });
      });
      
      this.setData({
        taskGroups,
        completedTasks,
        totalTasks,
        todayEarnedPoints,
        loading: false
      });
    }, 500);
  },

  // 处理任务点击
  handleTaskClick: function(e) {
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/user/login'
      });
      return;
    }

    const { groupIndex, taskIndex } = e.currentTarget.dataset;
    const task = this.data.taskGroups[groupIndex].tasks[taskIndex];
    
    if (task.completed) {
      wx.showToast({
        title: '任务已完成',
        icon: 'none'
      });
      return;
    }

    // 根据不同任务ID进行不同处理
    switch(task.id) {
      case 'daily_1':
        // 浏览商品任务
        wx.showModal({
          title: '任务模拟',
          content: '这里模拟浏览商品任务，实际应跳转到商品列表',
          showCancel: false,
          success: () => {
            this.updateTaskProgress(groupIndex, taskIndex, task.progress + 1);
          }
        });
        break;
      case 'daily_2':
        // 分享小程序任务
        wx.showShareMenu({
          withShareTicket: true,
          menus: ['shareAppMessage', 'shareTimeline'],
          success: () => {
            // 实际应在用户分享成功后才更新进度
            setTimeout(() => {
              this.updateTaskProgress(groupIndex, taskIndex, 1);
            }, 1000);
          }
        });
        break;
      case 'daily_3':
        // 观看视频任务
        wx.showModal({
          title: '任务模拟',
          content: '这里模拟观看视频任务，实际应播放广告或视频',
          showCancel: false,
          success: () => {
            this.updateTaskProgress(groupIndex, taskIndex, 1);
          }
        });
        break;
      case 'newbie_1':
        // 完善个人资料
        wx.navigateTo({
          url: '/pages/user/profile'
        });
        break;
      case 'newbie_2':
        // 绑定手机号
        wx.navigateTo({
          url: '/pages/user/profile?tab=phone'
        });
        break;
      case 'newbie_3':
        // 关注公众号
        wx.showModal({
          title: '关注公众号',
          content: '请长按识别下方二维码关注公众号',
          showCancel: false,
          success: () => {
            // 实际应在用户确认关注后才更新进度
            this.updateTaskProgress(groupIndex, taskIndex, 1);
          }
        });
        break;
      case 'growth_1':
      case 'growth_2':
        // 累计签到任务
        wx.switchTab({
          url: '/pages/checkin/index'
        });
        break;
      case 'growth_3':
        // 累计兑换任务
        wx.switchTab({
          url: '/pages/exchange/index'
        });
        break;
      default:
        wx.showToast({
          title: '任务开发中',
          icon: 'none'
        });
    }
  },

  // 更新任务进度
  updateTaskProgress: function(groupIndex, taskIndex, newProgress) {
    const taskGroups = this.data.taskGroups;
    const task = taskGroups[groupIndex].tasks[taskIndex];
    
    // 更新进度，不超过最大值
    task.progress = Math.min(newProgress, task.maxProgress);
    
    // 检查是否完成
    if (task.progress >= task.maxProgress && !task.completed) {
      task.completed = true;
      task.buttonText = '已完成';
      
      // 更新完成任务数和今日获得碎片
      this.setData({
        completedTasks: this.data.completedTasks + 1,
        todayEarnedPoints: this.data.todayEarnedPoints + task.points
      });
      
      // 显示获得碎片提示
      wx.showToast({
        title: `任务完成 +${task.points}碎片`,
        icon: 'success'
      });
    }
    
    this.setData({
      taskGroups: taskGroups
    });
  },

  // 去登录
  goToLogin: function() {
    wx.navigateTo({
      url: '/pages/user/login'
    });
  }
});