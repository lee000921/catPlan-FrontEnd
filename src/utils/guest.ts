export function promptGuestLogin(
  content = '登录后即可保存和管理你的真实数据。'
): void {
  wx.showModal({
    title: '体验模式',
    content,
    confirmText: '去登录',
    cancelText: '继续浏览',
    success(result) {
      if (!result.confirm) return;
      wx.navigateTo({ url: '/pages/login/login' });
    },
  });
}
