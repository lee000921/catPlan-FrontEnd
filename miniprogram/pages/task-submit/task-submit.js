const { createTask } = require('../../services/tasks');
const { createPeriodicTask } = require('../../services/periodicTasks');
const { getSession, hasRole } = require('../../utils/session');
const { getErrorMessage } = require('../../utils/request');

function localDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

Page({
  data: {
    taskType: 'single',
    formData: {
      title: '',
      description: '',
      points: '',
      periodic_type: 'daily',
      every_days: '1',
      weekdays: [0],
      day_of_month: '1',
      start_date: '',
      end_date: '',
    },
    weekDayList: [
      { value: 0, label: '日', selected: true },
      { value: 1, label: '一', selected: false },
      { value: 2, label: '二', selected: false },
      { value: 3, label: '三', selected: false },
      { value: 4, label: '四', selected: false },
      { value: 5, label: '五', selected: false },
      { value: 6, label: '六', selected: false },
    ],
    submitting: false,
  },

  onLoad() {
    const session = getSession();
    if (!session || !hasRole(session, 'A')) {
      wx.showToast({ title: '当前账号没有创建任务权限', icon: 'none' });
      wx.navigateBack();
      return;
    }
    this.setData({ 'formData.start_date': localDate() });
  },

  selectTaskType(event) {
    this.setData({ taskType: event.currentTarget.dataset.type });
  },

  onTitleInput(event) {
    this.setData({ 'formData.title': event.detail.value });
  },

  onDescriptionInput(event) {
    this.setData({ 'formData.description': event.detail.value });
  },

  onPointsInput(event) {
    this.setData({ 'formData.points': event.detail.value });
  },

  selectPeriodicType(event) {
    this.setData({ 'formData.periodic_type': event.currentTarget.dataset.type });
  },

  onEveryDaysInput(event) {
    this.setData({ 'formData.every_days': event.detail.value || '1' });
  },

  toggleWeekday(event) {
    const day = Number(event.currentTarget.dataset.day);
    if (!Number.isInteger(day) || day < 0 || day > 6) return;

    const weekdays = [...(this.data.formData.weekdays || [])];
    const index = weekdays.indexOf(day);
    if (index >= 0) weekdays.splice(index, 1);
    else weekdays.push(day);
    weekdays.sort((left, right) => left - right);

    this.setData({
      'formData.weekdays': weekdays,
      weekDayList: this.data.weekDayList.map(option => ({
        ...option,
        selected: weekdays.includes(option.value),
      })),
    });
  },

  onDayOfMonthInput(event) {
    this.setData({ 'formData.day_of_month': event.detail.value || '1' });
  },

  onStartDateChange(event) {
    this.setData({ 'formData.start_date': event.detail.value });
  },

  onEndDateChange(event) {
    this.setData({ 'formData.end_date': event.detail.value });
  },

  async onSubmit() {
    if (this.data.submitting) return;
    const { taskType, formData } = this.data;
    const points = Number(formData.points);

    if (!formData.title.trim() || !Number.isInteger(points) || points <= 0) {
      wx.showToast({ title: '请填写有效的标题和积分', icon: 'none' });
      return;
    }
    if (
      taskType === 'periodic' &&
      formData.periodic_type === 'weekly' &&
      formData.weekdays.length === 0
    ) {
      wx.showToast({ title: '请至少选择一个星期', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    try {
      if (taskType === 'single') {
        await createTask({
          title: formData.title.trim(),
          description: formData.description.trim(),
          points,
        });
        wx.showToast({ title: '任务已提交审核', icon: 'success' });
      } else {
        let periodicConfig;
        if (formData.periodic_type === 'weekly') {
          periodicConfig = { weekdays: formData.weekdays };
        } else if (formData.periodic_type === 'monthly') {
          periodicConfig = { day_of_month: Number(formData.day_of_month) || 1 };
        } else {
          periodicConfig = { every_days: Number(formData.every_days) || 1 };
        }

        await createPeriodicTask({
          title: formData.title.trim(),
          description: formData.description.trim(),
          points,
          periodic_type: formData.periodic_type,
          periodic_config: periodicConfig,
          start_date: formData.start_date,
          end_date: formData.end_date || undefined,
        });
        wx.showToast({ title: '周期任务已提交审核', icon: 'success' });
      }
      setTimeout(() => wx.navigateBack(), 800);
    } catch (error) {
      wx.showToast({
        title: getErrorMessage(error, '提交失败'),
        icon: 'none',
      });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
