// pages/user/help.js
Page({
  data: {
    faqList: [
      {
        question: '如何获取碎片？',
        answer: '您可以通过每日签到、完成任务、参与活动等方式获取碎片。每日签到可获得5碎片，连续签到还有额外奖励。',
        expanded: false
      },
      {
        question: '碎片有效期是多久？',
        answer: '普通碎片有效期为一年，特殊活动获得的碎片有效期将在活动规则中说明。您可以在"我的-碎片"中查看碎片的有效期。',
        expanded: false
      },
      {
        question: '如何兑换礼品？',
        answer: '在"兑换"页面选择您喜欢的礼品，点击"立即兑换"按钮，确认兑换信息后即可完成兑换。实物礼品需要填写收货地址，虚拟礼品将自动发放到您的账户。',
        expanded: false
      },
      {
        question: '兑换的实物礼品多久能收到？',
        answer: '实物礼品将在您兑换成功后的7-15个工作日内发出，具体配送时间以物流信息为准。您可以在"兑换记录"中查看物流信息。',
        expanded: false
      },
      {
        question: '任务完成了但没有获得碎片怎么办？',
        answer: '请尝试刷新页面或重新登录。如果问题仍然存在，请联系客服处理。',
        expanded: false
      },
      {
        question: '如何修改个人资料？',
        answer: '在"我的"页面点击头像或昵称，进入个人资料页面进行修改。',
        expanded: false
      }
    ],
    contactInfo: {
      email: 'support@catplan.com',
      phone: '400-123-4567',
      wechat: 'catplan001'
    }
  },

  // 展开/收起FAQ
  toggleFAQ: function(e) {
    const { index } = e.currentTarget.dataset;
    const { faqList } = this.data;
    
    faqList[index].expanded = !faqList[index].expanded;
    
    this.setData({
      faqList
    });
  },

  // 复制联系方式
  copyContact: function(e) {
    const { type } = e.currentTarget.dataset;
    const content = this.data.contactInfo[type];
    
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  // 联系客服
  contactService: function() {
    // 实际场景中应该使用button的open-type="contact"
    wx.showToast({
      title: '请添加客服微信：' + this.data.contactInfo.wechat,
      icon: 'none',
      duration: 2000
    });
  }
});