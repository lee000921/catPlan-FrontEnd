const { checkin, getSigninHistory } = require('../../services/signin');
const { getProfile } = require('../../services/user');
const { ApiError, getErrorMessage } = require('../../utils/request');
const { getSession, updateSession } = require('../../utils/session');
const { promptGuestLogin } = require('../../utils/guest');

const pad = value => String(value).padStart(2, '0');

function dateParts(date = new Date()) {
  return {
    day: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    month: `${date.getFullYear()}-${pad(date.getMonth() + 1)}`,
  };
}

Page({
  data: {
    year: 0,
    month: 0,
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    cells: [],
    signedDaysSet: {},
    signedCount: 0,
    consecutiveCount: 0,
    signedToday: false,
    checking: false,
    userInfo: null,
    userLevel: 1,
    stats: {
      totalPoints: 0,
    },
    showPointsAnimation: false,
    animationPoints: 0,
    guestMode: false,
  },

  onLoad() {
    const now = new Date();
    const session = getSession();
    this.setData({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      userInfo: session?.userInfo || null,
      guestMode: !session,
    });
    if (session) this.buildCalendar();
    else this.setGuestExperience();
  },

  onShow() {
    if (!getSession()) {
      this.setGuestExperience();
      return;
    }
    this.setData({ guestMode: false });
    this.refreshPage();
  },

  setGuestExperience() {
    const { year, month } = this.data;
    const totalDays = new Date(year, month, 0).getDate();
    const sampleDays = [2, 5, 8].filter(day => day <= totalDays);
    const signedDaysSet = {};
    sampleDays.forEach(day => {
      signedDaysSet[`${year}-${pad(month)}-${pad(day)}`] = true;
    });
    this.setData({
      guestMode: true,
      userInfo: null,
      signedDaysSet,
      signedCount: sampleDays.length,
      consecutiveCount: 3,
      signedToday: false,
      userLevel: 1,
      'stats.totalPoints': 24,
    });
    this.buildCalendar();
  },

  async refreshPage() {
    await Promise.all([this.fetchHistory(), this.fetchUserProfile()]);
  },

  buildCalendar() {
    const { year, month } = this.data;
    const firstWeekday = new Date(year, month - 1, 1).getDay();
    const totalDays = new Date(year, month, 0).getDate();
    const today = dateParts().day;
    const signed = this.data.signedDaysSet || {};
    const cells = [];

    for (let index = 0; index < firstWeekday; index += 1) {
      cells.push({ display: '', date: '', signed: false, isToday: false });
    }
    for (let day = 1; day <= totalDays; day += 1) {
      const date = `${year}-${pad(month)}-${pad(day)}`;
      cells.push({
        display: day,
        date,
        signed: Boolean(signed[date]),
        isToday: date === today,
      });
    }
    this.setData({ cells });
  },

  async fetchHistory() {
    const displayMonth = `${this.data.year}-${pad(this.data.month)}`;
    const current = dateParts();

    try {
      const displayHistory = await getSigninHistory(displayMonth);
      const days = displayHistory.days || [];
      const signedDaysSet = {};
      days.forEach(day => {
        signedDaysSet[day] = true;
      });

      let signedToday = Boolean(signedDaysSet[current.day]);
      if (displayMonth !== current.month) {
        const currentHistory = await getSigninHistory(current.month);
        signedToday = (currentHistory.days || []).includes(current.day);
      }

      this.setData({
        signedDaysSet,
        signedCount: days.length,
        userLevel: Math.floor(days.length / 7) + 1,
        consecutiveCount: Number(displayHistory.consecutive_days || 0),
        signedToday,
      });
      this.buildCalendar();
    } catch (error) {
      wx.showToast({ title: getErrorMessage(error), icon: 'none' });
    }
  },

  async fetchUserProfile() {
    try {
      const response = await getProfile();
      this.setData({
        userInfo: response.user || null,
        'stats.totalPoints': Number(response.points || 0),
      });
      updateSession({ userInfo: response.user || null });
    } catch (error) {
      console.error('Unable to load profile', error);
    }
  },

  async onCheckin() {
    if (this.data.signedToday || this.data.checking) return;
    if (this.data.guestMode) {
      promptGuestLogin('签到体验无需授权。登录后才能记录真实签到并领取积分。');
      return;
    }

    this.setData({ checking: true });
    try {
      const response = await checkin();
      this.setData({
        signedToday: true,
        consecutiveCount: Number(response.consecutive_days || 0),
        'stats.totalPoints': Number(response.total_points || 0),
      });
      this.showPointsAnimation(Number(response.points_earned || 0));
      await this.fetchHistory();
      wx.showToast({ title: '签到成功', icon: 'success' });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'ALREADY_CHECKED_IN') {
        this.setData({ signedToday: true });
        await this.fetchHistory();
        wx.showToast({ title: '今天已经签过到了', icon: 'none' });
      } else {
        wx.showToast({ title: getErrorMessage(error), icon: 'none' });
      }
    } finally {
      this.setData({ checking: false });
    }
  },

  onPrevMonth() {
    let { year, month } = this.data;
    month -= 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    this.setData({ year, month, signedDaysSet: {} });
    if (this.data.guestMode) this.setGuestExperience();
    else {
      this.buildCalendar();
      this.fetchHistory();
    }
  },

  onNextMonth() {
    let { year, month } = this.data;
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    this.setData({ year, month, signedDaysSet: {} });
    if (this.data.guestMode) this.setGuestExperience();
    else {
      this.buildCalendar();
      this.fetchHistory();
    }
  },

  onDayTap(event) {
    const day = event.currentTarget.dataset.day;
    if (!day) return;
    wx.showToast({
      title: this.data.signedDaysSet[day] ? '已签到' : '未签到',
      icon: 'none',
    });
  },

  showPointsAnimation(pointsEarned) {
    if (pointsEarned <= 0) return;
    this.setData({
      showPointsAnimation: true,
      animationPoints: pointsEarned,
    });
    setTimeout(() => this.setData({ showPointsAnimation: false }), 2000);
  },

  onLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },
});
