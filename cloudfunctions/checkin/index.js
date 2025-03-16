// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const userCollection = db.collection('users')
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  if (!openid) {
    return {
      success: false,
      message: '获取用户openid失败'
    }
  }

  try {
    // 查询用户是否存在
    const userResult = await userCollection.where({
      openId: openid
    }).get()
    
    if (userResult.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }
    
    const user = userResult.data[0]
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    
    // 检查用户今天是否已经签到
    if (user.lastCheckinDate && new Date(user.lastCheckinDate).getTime() === today) {
      return {
        success: false,
        message: '今日已签到',
        data: {
          checkinDays: user.checkinDays,
          points: user.points
        }
      }
    }
    
    // 计算基础碎片
    const basePoints = 5 // 基础签到碎片
    
    // 更新用户签到信息和碎片
    const totalPoints = user.points + basePoints
    const checkinDays = (user.checkinDays || 0) + 1
    
    // 记录签到历史
    const checkinHistory = user.checkinHistory || []
    checkinHistory.push({
      date: now,
      points: basePoints
    })
    
    // 限制历史记录数量，只保留最近100条
    while (checkinHistory.length > 100) {
      checkinHistory.shift()
    }
    
    // 更新用户数据 - 移除了连续签到天数字段
    await userCollection.doc(user._id).update({
      data: {
        checkinDays: checkinDays,
        lastCheckinDate: now,
        points: totalPoints,
        checkinHistory: checkinHistory
      }
    })
    
    // 获取更新后的用户信息
    const updatedUser = await userCollection.doc(user._id).get()
    
    return {
      success: true,
      message: '签到成功',
      data: {
        checkinDays: checkinDays,
        points: totalPoints,
        basePoints: basePoints,
        userInfo: updatedUser.data
      }
    }
  } catch (error) {
    console.error('签到失败', error)
    return {
      success: false,
      message: '签到失败: ' + error.message,
      error
    }
  }
}