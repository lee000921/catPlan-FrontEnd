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
          consecutiveCheckinDays: user.consecutiveCheckinDays,
          points: user.points
        }
      }
    }
    
    // 计算连续签到天数
    let consecutiveCheckinDays = user.consecutiveCheckinDays || 0
    const lastCheckinDate = user.lastCheckinDate ? new Date(user.lastCheckinDate) : null
    
    // 如果上次签到是昨天，连续签到天数+1，否则重置为1
    if (lastCheckinDate) {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).getTime()
      
      if (new Date(lastCheckinDate).getTime() === yesterdayDate) {
        consecutiveCheckinDays += 1
      } else {
        consecutiveCheckinDays = 1
      }
    } else {
      consecutiveCheckinDays = 1
    }
    
    // 计算基础碎片和额外奖励
    let basePoints = 5 // 基础签到碎片
    let bonusPoints = 0 // 连续签到奖励碎片
    
    // 连续签到奖励规则
    const milestones = [
      { day: 10, points: 2 },
      { day: 15, points: 3 },
      { day: 30, points: 5 },
      { day: 7, points: 2 },
      { day: 5, points: 1 },
      { day: 3, points: 1 },
      { day: 1, points: 1 }
    ]
    
    // 检查是否达到里程碑
    const milestone = milestones.find(m => m.day === consecutiveCheckinDays)
    if (milestone) {
      bonusPoints = milestone.points
    }
    
    // 更新用户签到信息和碎片
    const totalPoints = user.points + basePoints + bonusPoints
    const checkinDays = (user.checkinDays || 0) + 1
    
    // 记录签到历史
    const checkinHistory = user.checkinHistory || []
    checkinHistory.push({
      date: now,
      points: basePoints + bonusPoints,
      consecutiveCheckinDays: consecutiveCheckinDays
    })
    
    // 限制历史记录数量，只保留最近100条
    while (checkinHistory.length > 100) {
      checkinHistory.shift()
    }
    
    // 更新用户数据
    await userCollection.doc(user._id).update({
      data: {
        checkinDays: checkinDays,
        consecutiveCheckinDays: consecutiveCheckinDays,
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
        consecutiveCheckinDays: consecutiveCheckinDays,
        points: totalPoints,
        basePoints: basePoints,
        bonusPoints: bonusPoints,
        milestone: milestone ? milestone.day : null,
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