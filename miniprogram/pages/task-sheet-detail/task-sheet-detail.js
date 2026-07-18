const {
  deleteTaskSheet,
  getTaskSheet,
  syncTaskSheet,
} = require('../../services/taskSheets');
const { getErrorMessage } = require('../../utils/request');
const { getSession } = require('../../utils/session');

Page({
  data: {
    sheetId: null,
    taskSheet: null,
    loading: true,
    syncing: false,
    canEdit: false,
    statusMap: {
      pending: '待开始',
      in_progress: '进行中',
      completed: '已完成',
    },
  },

  onLoad(options) {
    const sheetId = Number(options.id);
    if (!Number.isInteger(sheetId) || sheetId <= 0) {
      this.setData({ loading: false });
      wx.showToast({ title: '任务单编号无效', icon: 'none' });
      return;
    }
    this.setData({ sheetId });
    this.loadSheetDetail();
  },

  onShow() {
    if (this.data.sheetId && !this.data.loading) {
      this.loadSheetDetail();
    }
  },

  async loadSheetDetail() {
    this.setData({ loading: true });
    try {
      const response = await getTaskSheet(this.data.sheetId);
      const session = getSession();
      const taskSheet = {
        ...response.sheet,
        tasks: response.tasks || [],
        progress: Number(response.sheet.progress || 0),
        total_tasks: Number(response.sheet.total_tasks || 0),
        completed_tasks: Number(response.sheet.completed_tasks || 0),
      };
      this.setData({
        taskSheet,
        canEdit: Boolean(
          session && response.sheet.applicant_openid === session.openid
        ),
      });
      wx.setNavigationBarTitle({ title: taskSheet.title || '任务单详情' });
    } catch (error) {
      wx.showToast({ title: getErrorMessage(error), icon: 'none' });
      this.setData({ taskSheet: null });
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  async syncProgress() {
    if (this.data.syncing || !this.data.canEdit) return;
    this.setData({ syncing: true });
    try {
      await syncTaskSheet(this.data.sheetId);
      await this.loadSheetDetail();
      wx.showToast({ title: '进度已同步', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: getErrorMessage(error), icon: 'none' });
    } finally {
      this.setData({ syncing: false });
    }
  },

  onTaskTap(event) {
    const taskId = Number(event.currentTarget.dataset.id);
    if (Number.isInteger(taskId)) {
      wx.navigateTo({ url: `/pages/task-detail/task-detail?id=${taskId}` });
    }
  },

  addTask() {
    wx.navigateTo({ url: '/pages/task-submit/task-submit' });
  },

  goToAddTask() {
    this.addTask();
  },

  onDeleteSheet() {
    if (!this.data.canEdit) return;
    wx.showModal({
      title: '删除任务单',
      content: '任务本身不会被删除，但任务单无法恢复。确定继续吗？',
      confirmColor: '#d94b4b',
      success: async result => {
        if (!result.confirm) return;
        try {
          await deleteTaskSheet(this.data.sheetId);
          wx.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 700);
        } catch (error) {
          wx.showToast({ title: getErrorMessage(error), icon: 'none' });
        }
      },
    });
  },

  goBack() {
    wx.navigateBack();
  },

  onPullDownRefresh() {
    this.loadSheetDetail();
  },
});
