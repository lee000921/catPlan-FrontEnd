const { listTasks } = require('../../services/tasks');
const { getProfile } = require('../../services/user');
const {
  clearSession,
  getSession,
  hasRole,
  updateSession,
} = require('../../utils/session');
const { getErrorMessage } = require('../../utils/request');
const { promptGuestLogin } = require('../../utils/guest');

function getRoleLabel(userType) {
  if (userType === 'AB') return '申请者 / 审批者';
  if (userType === 'B') return '审批者';
  return '申请者';
}

function demoTasks() {
  const today = new Date().toISOString();
  return [
    {
      id: 'demo-1',
      title: '阅读 30 分钟',
      description: '完成一个专注小目标，提交后等待审批。',
      status: 'pending',
      points: 10,
      created_at: today,
    },
    {
      id: 'demo-2',
      title: '整理今天的任务',
      description: '审批通过后即可执行并领取积分。',
      status: 'approved',
      points: 8,
      created_at: today,
    },
    {
      id: 'demo-3',
      title: '陪小黑玩一会儿',
      description: '完成任务后，积分会进入商城余额。',
      status: 'completed',
      points: 6,
      created_at: today,
    },
  ];
}

Page({
  data: {
    tasks: [],
    stats: { total: 0, pending: 0, approved: 0, completed: 0 },
    loading: false,
    userInfo: null,
    userType: 'A',
    roleLabel: '申请者',
    points: 0,
    canCreate: true,
    canApprove: false,
    activeView: 'mine',
    showMyApprovals: false,
    guestMode: false,
  },

  onLoad() {
    const session = getSession();
    if (!session) {
      this.setGuestExperience();
      return;
    }
    this.setData({
      userInfo: session.userInfo,
      userType: session.userType,
      roleLabel: getRoleLabel(session.userType),
      canCreate: hasRole(session, 'A'),
      canApprove: hasRole(session, 'B'),
      activeView: session.userType === 'B' ? 'pending' : 'mine',
      guestMode: false,
    });
  },

  onShow() {
    const session = getSession();
    if (!session) {
      this.setGuestExperience();
      return;
    }
    this.setData({ guestMode: false });
    this.loadTasks();
    this.loadUserProfile();
  },

  setGuestExperience() {
    const tasks = demoTasks().map(task => ({
      ...task,
      createdDate: String(task.created_at).slice(5, 10),
      approvalDate: '',
    }));
    this.setData({
      tasks,
      stats: {
        total: tasks.length,
        pending: tasks.filter(task => task.status === 'pending').length,
        approved: tasks.filter(task => task.status === 'approved').length,
        completed: tasks.filter(task => task.status === 'completed').length,
      },
      loading: false,
      userInfo: null,
      userType: 'A',
      roleLabel: '体验访客',
      points: 24,
      canCreate: true,
      canApprove: false,
      activeView: 'mine',
      showMyApprovals: false,
      guestMode: true,
    });
  },

  async loadUserProfile() {
    try {
      const response = await getProfile();
      const session = getSession();
      const userInfo = response.user || session?.userInfo || null;
      const userType = response.user_type || session?.userType || 'A';
      if (session) updateSession({ userInfo, userType });
      this.setData({
        userInfo,
        userType,
        roleLabel: getRoleLabel(userType),
        points: Number(response.points || 0),
        canCreate: hasRole(getSession(), 'A'),
        canApprove: hasRole(getSession(), 'B'),
      });
    } catch (_error) {
      // 任务页仍可继续使用；统一请求层会处理登录过期。
    }
  },

  async loadTasks() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    const userTypeView = this.data.activeView === 'mine' ? 'A' : 'B';
    const params = { user_type: userTypeView };
    if (this.data.activeView === 'my') params.my_approvals = 'true';

    try {
      const response = await listTasks(params);
      const tasks = (response.tasks || []).map(task => ({
        ...task,
        createdDate: task.created_at ? String(task.created_at).slice(5, 10) : '-',
        approvalDate: task.approval_date
          ? String(task.approval_date).slice(5, 16)
          : '',
      }));
      this.setData({
        tasks,
        stats: {
          total: tasks.length,
          pending: tasks.filter(task => task.status === 'pending').length,
          approved: tasks.filter(task => task.status === 'approved').length,
          completed: tasks.filter(task => task.status === 'completed').length,
        },
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

  async onPullDownRefresh() {
    await Promise.all([this.loadTasks(), this.loadUserProfile()]);
    wx.stopPullDownRefresh();
  },

  onTaskTap(event) {
    if (this.data.guestMode) {
      promptGuestLogin('这是任务体验数据。登录后可以查看详情、审批和领取积分。');
      return;
    }
    const taskId = event.currentTarget.dataset.taskId;
    wx.navigateTo({ url: `/pages/task-detail/task-detail?id=${taskId}` });
  },

  onSubmitTask() {
    if (this.data.guestMode) {
      promptGuestLogin('登录后即可创建并提交自己的任务。');
      return;
    }
    wx.navigateTo({ url: '/pages/task-submit/task-submit' });
  },

  onSwitchView(event) {
    const activeView = event.currentTarget.dataset.view;
    const session = getSession();
    if (!session) return;

    if (activeView === 'mine' && !hasRole(session, 'A')) return;
    if (activeView !== 'mine' && !hasRole(session, 'B')) return;

    this.setData(
      {
        activeView,
        showMyApprovals: activeView === 'my',
      },
      () => this.loadTasks()
    );
  },

  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: result => {
        if (!result.confirm) return;
        clearSession();
        wx.reLaunch({ url: '/pages/login/login' });
      },
    });
  },

  onOpenProfile() {
    if (this.data.guestMode) {
      promptGuestLogin('登录后可以查看个人资料和积分明细。');
      return;
    }
    wx.navigateTo({ url: '/pages/profile/profile' });
  },

  onCreateTaskSheet() {
    if (this.data.guestMode) {
      promptGuestLogin('登录后即可创建自己的任务清单。');
      return;
    }
    wx.navigateTo({ url: '/pages/task-sheet-create/task-sheet-create' });
  },

  onLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },
});
