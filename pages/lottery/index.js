// pages/lottery/index.js
const app = getApp();

Page({
  data: {
    isLoading: false,
    isRotating: false,
    // 固定6个扇形的转盘，与WXML中的顺序和角度完全一致
    prizes: [
      { id: 1, name: '1碎片', value: 1, angle: 0 },
      { id: 2, name: '2碎片', value: 2, angle: 60 },
      { id: 3, name: '5碎片', value: 5, angle: 120 },
      { id: 4, name: '10碎片', value: 10, angle: 180 },
      { id: 5, name: '20碎片', value: 20, angle: 240 },
      { id: 6, name: '50碎片', value: 50, angle: 300 }
    ],
    rotateAngle: 0,
    result: null,
    fromCheckin: false
  },

  onLoad: function(options) {
    // 检查是否从签到页面跳转而来
    if (options && options.fromCheckin) {
      this.setData({
        fromCheckin: true
      });
      // 如果是从签到页面来的，自动开始抽奖
      this.startLottery();
    }
  },

  // 开始抽奖
  startLottery: function() {
    if (this.data.isRotating) {
      return;
    }

    this.setData({ isLoading: true, isRotating: true });

    wx.cloud.callFunction({
      name: 'lottery',
      success: (res) => {
        const result = res.result;
        console.log('抽奖结果:', result);
        
        if (result.success) {
          // 找到匹配中奖值的扇形
          const targetPrize = this.data.prizes.find(p => p.value === result.points);
          
          if (!targetPrize) {
            console.error('未找到匹配的奖品:', result.points);
            this.setData({ isLoading: false, isRotating: false });
            return;
          }
          
          console.log('中奖扇形:', targetPrize);
          
          const baseAngle = 360 * 5; // 基础转动5圈
          
          // 计算最终角度 - 关键修复：转盘旋转到指针指向中奖扇形的中心
          // 由于指针固定在顶部，我们需要旋转到中奖扇形的角度 + 30度(扇形中心)
          const finalAngle = baseAngle + (360 - targetPrize.angle - 30);
          
          console.log('最终旋转角度:', finalAngle);
          
          this.setData({
            rotateAngle: finalAngle,
            result: {
              points: result.points,
              message: `恭喜获得 ${result.points} 碎片！`
            }
          });

          // 动画结束后显示结果
          setTimeout(() => {
            wx.showModal({
              title: '抽奖成功',
              content: `恭喜获得 ${result.points} 碎片！`,
              showCancel: false,
              success: () => {
                this.setData({
                  isRotating: false
                });
                
                // 如果是从签到页面来的，返回签到页面
                if (this.data.fromCheckin) {
                  wx.navigateBack();
                }
              }
            });
          }, 4000); // 等待动画完成
        } else {
          wx.showToast({
            title: result.message || '今日已抽奖',
            icon: 'none'
          });
          
          // 如果已经抽过奖且是从签到页面来的，返回签到页面
          if (this.data.fromCheckin) {
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          }
          
          this.setData({ isRotating: false });
        }
      },
      fail: (err) => {
        console.error('抽奖失败', err);
        wx.showToast({
          title: '抽奖失败，请重试',
          icon: 'none'
        });
        this.setData({ isRotating: false });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },
  
  // 返回签到页面
  goBack: function() {
    wx.navigateBack();
  }
});