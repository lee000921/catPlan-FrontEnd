const { login, updateProfile } = require('../../services/user');
const {
  clearSession,
  getSession,
  saveSession,
} = require('../../utils/session');
const { getErrorMessage } = require('../../utils/request');

function getLoginCode() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(result) {
        if (result.code) resolve(result.code);
        else reject(new Error('未获取到微信登录凭证'));
      },
      fail: reject,
    });
  });
}

function roleLabel(role) {
  if (role === 'AB') return '申请者 / 审批者';
  if (role === 'B') return '审批者';
  return '申请者';
}

Page({
  data: {
    userInfo: null,
    logged: false,
    message: '',
    submitting: false,
  },

  onLoad() {
    const session = getSession();
    if (!session) return;

    this.setData({
      userInfo: session.userInfo,
      logged: true,
    });
    wx.reLaunch({ url: '/pages/tasks/tasks' });
  },

  onLoginTap() {
    if (this.data.submitting) return;
    this.setData({ message: '正在获取授权...', submitting: true });

    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: async result => {
        try {
          this.setData({ message: '正在登录...' });
          const code = await getLoginCode();
          const auth = await login(code);

          saveSession({
            token: auth.token,
            openid: auth.openid,
            userType: auth.user_type,
            userInfo: result.userInfo,
          });

          await updateProfile(result.userInfo);
          this.setData({
            userInfo: result.userInfo,
            logged: true,
            message: '',
          });

          wx.showToast({
            title: `登录成功（${roleLabel(auth.user_type)}）`,
            icon: 'success',
          });
          wx.reLaunch({ url: '/pages/tasks/tasks' });
        } catch (error) {
          clearSession();
          this.setData({
            message: getErrorMessage(error, '登录失败，请稍后重试'),
          });
        } finally {
          this.setData({ submitting: false });
        }
      },
      fail: error => {
        this.setData({
          message: getErrorMessage(error, '需要授权用户信息'),
          submitting: false,
        });
      },
    });
  },

  onLogout() {
    clearSession();
    this.setData({ userInfo: null, logged: false, message: '已退出登录' });
  },
});
