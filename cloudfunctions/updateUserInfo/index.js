// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const userCollection = db.collection('users')

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('event:', event)
  const wxContext = cloud.getWXContext()
  const { taskId, userInfo, point } = event
  
  // 确保有openid
  const openid = userInfo.openid || wxContext.OPENID
  
  try {
    // 检查用户是否已存在
    const userResult = await userCollection.where({
      openId: openid
    }).get()
    
    if (userResult.data.length === 0) {
      // 创建新用户
      const newUser = {
        ...userInfo,
        openid,
        points: 0, // 初始碎片
        level: 1,
        checkinDays: 0,
        consecutiveCheckinDays: 0,
        lastCheckinDate: null,
        registerTime: db.serverDate(),
        updateTime: db.serverDate(),
        tasks: [], // 只记录已完成的任务ID和完成时间
        exchanges: []
      }
      // 向tasks中添加{taskId, finishTime}对象
      if (taskId) {
        newUser.tasks.push({
          taskId,
          finishTime: db.serverDate().getTime()
        })
      }
      if (point) {
        newUser.points += point
      }
      
      const result = await userCollection.add({
        data: newUser
      })
      return {
        success: true,
        isNew: true,
        userId: result._id,
        openid
      }
    } else {
      // 更新现有用户
      const userId = userResult.data[0]._id
      
      // 只更新提供的字段，避免覆盖现有数据
      const updateData = {
        ...userInfo,
        updateTime: db.serverDate()
      }
      // 如果taskId存在，则添加到tasks数组中
      if (taskId) {
        updateData.tasks = userResult.data[0].tasks || []
        updateData.tasks.push({
          taskId,
          finishTime: db.serverDate()
        })
      }
      if (point) {
        updateData.points = userResult.data[0].points + point
      }
      
      // 删除openid避免重复
      if (updateData.openid) {
        delete updateData.openid
      }
      
      await userCollection.doc(userId).update({
        data: updateData
      })
      return {
        success: true,
        isNew: false,
        userId,
        openid
      }
    }
  } catch (err) {
    console.error('更新用户信息失败', err)
    return {
      success: false,
      error: err
}
  }
}