const { createTaskSheet } = require('../../services/taskSheets');
const { listTasks } = require('../../services/tasks');
const { getErrorMessage } = require('../../utils/request');
const { getSession, hasRole } = require('../../utils/session');

function localDate() {
  const now = new Date();
  const pad = value => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

Page({
  data: {
    formData: {
      title: '',
      date: localDate(),
    },
    todayTasks: [],
    selectedTasks: [],
    selectedTaskPreviews: [],
    newTasks: [],
    newTask: {
      title: '',
      description: '',
      points: '',
    },
    loadingTasks: false,
    submitting: false,
  },

  onLoad() {
    const session = getSession();
    if (!session) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    if (!hasRole(session, 'A')) {
      wx.showToast({ title: '当前账号不能创建任务单', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1200);
      return;
    }
    this.loadTodayTasks();
  },

  async loadTodayTasks() {
    this.setData({ loadingTasks: true });
    try {
      const response = await listTasks({
        user_type: 'A',
        date: this.data.formData.date,
      });
      const selected = new Set(this.data.selectedTasks.map(Number));
      this.setData({
        todayTasks: (response.tasks || []).map(task => ({
          ...task,
          selected: selected.has(Number(task.id)),
        })),
      });
      this.updateSelectedTaskPreviews();
    } catch (error) {
      wx.showToast({ title: getErrorMessage(error), icon: 'none' });
    } finally {
      this.setData({ loadingTasks: false });
    }
  },

  onTitleInput(event) {
    this.setData({ 'formData.title': event.detail.value });
  },

  onDateChange(event) {
    const date = event.detail.value;
    this.setData({
      'formData.date': date,
      'formData.title': `${date} 任务单`,
      selectedTasks: [],
      selectedTaskPreviews: [],
    });
    this.loadTodayTasks();
  },

  toggleTask(event) {
    const taskId = Number(event.currentTarget.dataset.id);
    if (!Number.isInteger(taskId)) return;

    const selected = new Set(this.data.selectedTasks.map(Number));
    if (selected.has(taskId)) selected.delete(taskId);
    else selected.add(taskId);

    this.setData({
      selectedTasks: [...selected],
      todayTasks: this.data.todayTasks.map(task => ({
        ...task,
        selected: selected.has(Number(task.id)),
      })),
    });
    this.updateSelectedTaskPreviews();
  },

  updateSelectedTaskPreviews() {
    const selected = new Set(this.data.selectedTasks.map(Number));
    this.setData({
      selectedTaskPreviews: this.data.todayTasks.filter(task =>
        selected.has(Number(task.id))
      ),
    });
  },

  onNewTaskTitleInput(event) {
    this.setData({ 'newTask.title': event.detail.value });
  },

  onNewTaskDescInput(event) {
    this.setData({ 'newTask.description': event.detail.value });
  },

  onNewTaskPointsInput(event) {
    this.setData({ 'newTask.points': event.detail.value });
  },

  addNewTask() {
    const title = this.data.newTask.title.trim();
    const description = this.data.newTask.description.trim();
    const points = Number(this.data.newTask.points);

    if (!title) {
      wx.showToast({ title: '请输入任务标题', icon: 'none' });
      return;
    }
    if (!Number.isInteger(points) || points <= 0) {
      wx.showToast({ title: '积分必须是正整数', icon: 'none' });
      return;
    }

    this.setData({
      newTasks: [
        ...this.data.newTasks,
        { clientId: `new_${Date.now()}`, title, description, points },
      ],
      newTask: { title: '', description: '', points: '' },
    });
  },

  removeNewTask(event) {
    const clientId = event.currentTarget.dataset.id;
    this.setData({
      newTasks: this.data.newTasks.filter(task => task.clientId !== clientId),
    });
  },

  goToCreateTask() {
    wx.navigateTo({ url: '/pages/task-submit/task-submit' });
  },

  async onSubmit() {
    if (this.data.submitting) return;

    const { formData, selectedTasks, newTasks } = this.data;
    const title = formData.title.trim() || `${formData.date} 任务单`;
    if (selectedTasks.length === 0 && newTasks.length === 0) {
      wx.showToast({ title: '请至少添加一个任务', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    try {
      await createTaskSheet({
        title,
        date: formData.date,
        task_ids: selectedTasks.map(Number),
        new_tasks: newTasks.map(task => ({
          title: task.title,
          description: task.description,
          points: Number(task.points),
        })),
      });
      wx.showToast({ title: '任务单已创建', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 900);
    } catch (error) {
      wx.showToast({ title: getErrorMessage(error), icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
