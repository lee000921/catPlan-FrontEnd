// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const taskCollection = db.collection('tasks')
const userCollection = db.collection('users')
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  // 取出taskCollection中的所有任务
  // step1 取出所有日常任务
  const dailyTasks = await taskCollection.where({
    category: 'daily'
  }).get()
  // step2 取出所有成长任务
  const growthTasks = await taskCollection.where({
    category: 'growth'
  }).get()

  return {
    success: true,
    message: '获取任务列表成功',
    data: {
      dailyTasks: dailyTasks.data,
      growthTasks: growthTasks.data
    }
  }
}