const {
  approveTask,
  completeTask,
  getTask,
} = require('../../services/tasks');
const { getSession, hasRole } = require('../../utils/session');
const { getErrorMessage } = require('../../utils/request');

Page({
  data: {
    userInfo: null,
    userType: 'A',
    taskId: null,
    task: null,
    approvals: [],
    loading: true,
    approvalForm: {
      status: 'approved',
      comment: '',
    },
    submitting: false,
    showApprovalForm: false,
    showCompleteButton: false,
  },

  onLoad(options) {
    const session = getSession();
    if (!session || !options.id) {
      wx.showToast({ title: '页面参数或登录状态无效', icon: 'none' });
      wx.navigateBack();
      return;
    }
    this.setData({
      userInfo: session.userInfo,
      userType: session.userType,
      taskId: options.id,
    });
  },

  onShow() {
    if (this.data.taskId) this.loadTaskDetail(this.data.taskId);
  },

  async loadTaskDetail(taskId) {
    this.setData({ loading: true });
    try {
      const response = await getTask(taskId);
      const session = getSession();
      if (!session) return;

      const task = {
        ...response.task,
        createdDate: response.task.created_at
          ? String(response.task.created_at).slice(0, 10)
          : '-',
      };
      this.setData({
        task,
        approvals: (response.approvals || []).map(approval => ({
          ...approval,
          createdDate: approval.created_at
            ? String(approval.created_at).slice(0, 16)
            : '-',
        })),
        showApprovalForm:
          hasRole(session, 'B') &&
          task.status === 'pending' &&
          task.applicant_openid !== session.openid,
        showCompleteButton:
          hasRole(session, 'A') &&
          task.status === 'approved' &&
          Number(task.is_periodic) !== 1 &&
          task.applicant_openid === session.openid,
      });
    } catch (error) {
      wx.showToast({
        title: getErrorMessage(error, '任务加载失败'),
        icon: 'none',
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  selectApprovalStatus(event) {
    this.setData({ 'approvalForm.status': event.currentTarget.dataset.status });
  },

  onCommentInput(event) {
    this.setData({ 'approvalForm.comment': event.detail.value });
  },

  onCancelApproval() {
    wx.navigateBack();
  },

  goBack() {
    wx.navigateBack();
  },

  async onSubmitApproval() {
    if (this.data.submitting || !this.data.task) return;
    const session = getSession();
    if (!hasRole(session, 'B')) {
      wx.showToast({ title: '当前账号没有审批权限', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    try {
      await approveTask(
        this.data.task.id,
        this.data.approvalForm.status,
        this.data.approvalForm.comment
      );
      wx.showToast({ title: '审批成功', icon: 'success' });
      await this.loadTaskDetail(this.data.task.id);
    } catch (error) {
      wx.showToast({
        title: getErrorMessage(error, '审批失败'),
        icon: 'none',
      });
    } finally {
      this.setData({ submitting: false });
    }
  },

  onCompleteTask() {
    if (this.data.submitting || !this.data.task) return;
    wx.showModal({
      title: '确认完成',
      content: `完成任务后将获得 ${this.data.task.points} 碎片，确定已完成吗？`,
      success: result => {
        if (result.confirm) this.submitComplete();
      },
    });
  },

  async submitComplete() {
    if (!this.data.task) return;
    this.setData({ submitting: true });
    try {
      const response = await completeTask(this.data.task.id);
      wx.showToast({
        title: `完成！获得${response.points_earned}碎片`,
        icon: 'success',
      });
      await this.loadTaskDetail(this.data.task.id);
    } catch (error) {
      wx.showToast({
        title: getErrorMessage(error, '完成失败'),
        icon: 'none',
      });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
