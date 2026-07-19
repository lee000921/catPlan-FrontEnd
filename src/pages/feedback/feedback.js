const {
  createFeedback,
  getMyFeedback,
} = require('../../services/feedback');
const { getErrorMessage } = require('../../utils/request');
const { getSession } = require('../../utils/session');

const STATUS_LABELS = {
  new: '已收到',
  triaged: '已受理',
  fixing: '修复中',
  resolved: '已解决',
  closed: '已关闭',
  rejected: '暂不处理',
};

const CATEGORY_LABELS = {
  bug: '功能故障',
  experience: '体验问题',
  feature: '功能建议',
  other: '其他',
};

function runtimeContext() {
  let miniProgram = {};
  try {
    miniProgram = wx.getAccountInfoSync().miniProgram || {};
  } catch (_error) {
    miniProgram = {};
  }

  return {
    appVersion: miniProgram.version || miniProgram.envVersion || 'unknown',
  };
}

function formatReports(reports) {
  return reports.map(report => ({
    ...report,
    statusLabel: STATUS_LABELS[report.status] || report.status,
    categoryLabel: CATEGORY_LABELS[report.category] || report.category,
    createdDate: report.created_at
      ? String(report.created_at).replace('T', ' ').slice(0, 16)
      : '',
  }));
}

Page({
  data: {
    categories: [
      { value: 'bug', label: '功能故障' },
      { value: 'experience', label: '体验问题' },
      { value: 'feature', label: '功能建议' },
      { value: 'other', label: '其他' },
    ],
    categoryIndex: 0,
    form: {
      title: '',
      description: '',
      reproduction_steps: '',
      expected_result: '',
      actual_result: '',
    },
    sourcePage: '',
    submitting: false,
    loading: false,
    reports: [],
  },

  onLoad(options) {
    if (!getSession()) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    const sourcePage = options.source
      ? decodeURIComponent(options.source)
      : '';
    this.setData({ sourcePage });
    this.loadReports();
  },

  onCategoryChange(event) {
    this.setData({ categoryIndex: Number(event.detail.value) || 0 });
  },

  onFieldInput(event) {
    const field = event.currentTarget.dataset.field;
    if (!field) return;
    this.setData({ [`form.${field}`]: event.detail.value });
  },

  async loadReports() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    try {
      const response = await getMyFeedback(20, 0);
      this.setData({ reports: formatReports(response.feedback || []) });
    } catch (error) {
      wx.showToast({
        title: getErrorMessage(error, '反馈记录加载失败'),
        icon: 'none',
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async submitFeedback() {
    if (this.data.submitting) return;
    const { form, categories, categoryIndex, sourcePage } = this.data;
    const title = form.title.trim();
    const description = form.description.trim();
    if (!title || !description) {
      wx.showToast({ title: '请填写标题和详细描述', icon: 'none' });
      return;
    }

    const runtime = runtimeContext();
    this.setData({ submitting: true });
    try {
      const response = await createFeedback({
        category: categories[categoryIndex].value,
        title,
        description,
        reproduction_steps: form.reproduction_steps.trim(),
        expected_result: form.expected_result.trim(),
        actual_result: form.actual_result.trim(),
        page_path: sourcePage || 'pages/feedback/feedback',
        app_version: runtime.appVersion,
      });
      wx.showToast({
        title: `已提交 #${response.feedback.id}`,
        icon: 'success',
      });
      this.setData({
        categoryIndex: 0,
        form: {
          title: '',
          description: '',
          reproduction_steps: '',
          expected_result: '',
          actual_result: '',
        },
      });
      await this.loadReports();
    } catch (error) {
      wx.showToast({
        title: getErrorMessage(error, '提交失败，请稍后重试'),
        icon: 'none',
      });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
