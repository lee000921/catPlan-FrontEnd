// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  
  try {
    // 检查用户是否存在
    const userRes = await db.collection('users').where({
      openId: openId
    }).get()
    
    if (userRes.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }
    
    const user = userRes.data[0]
    
    // 检查今日是否已经抽奖
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (user.lastLotteryDate && new Date(user.lastLotteryDate) >= today) {
      return {
        success: false,
        message: '今日已抽奖'
      }
    }
    
    // 抽奖逻辑
    const prizes = [
      { value: 1, probability: 30 },
      { value: 2, probability: 25 },
      { value: 5, probability: 20 },
      { value: 10, probability: 15 },
      { value: 20, probability: 8 },
      { value: 50, probability: 2 }
    ]
    
    // 计算总概率
    const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0)
    
    // 随机数
    const random = Math.random() * totalProbability
    
    // 确定中奖结果
    let cumulativeProbability = 0
    let winPrize = prizes[0]
    
    for (const prize of prizes) {
      cumulativeProbability += prize.probability
      if (random <= cumulativeProbability) {
        winPrize = prize
        break
      }
    }
    
    // 更新用户数据
    const points = winPrize.value
    const now = new Date()
    
    // 准备抽奖历史记录
    const lotteryRecord = {
      date: now,
      points: points,
      type: 'daily' // 标记为每日抽奖
    }
    
    // 获取或初始化抽奖历史
    const lotteryHistory = user.lotteryHistory || []
    lotteryHistory.push(lotteryRecord)
    
    // 限制历史记录数量，只保留最近100条
    while (lotteryHistory.length > 100) {
      lotteryHistory.shift()
    }
    
    // 计算总碎片数
    const totalpoints = (user.points || 0) + points
    
    // 1. 更新用户数据
    await db.collection('users').doc(user._id).update({
      data: {
        points: totalpoints, // 更新总碎片数
        lastLotteryDate: now,      // 更新最后抽奖时间
        lotteryHistory: lotteryHistory // 更新抽奖历史
      }
    })
    
    // 2. 创建积分记录
    await db.collection('pointsRecords').add({
      data: {
        openId: openId,
        points: points,
        type: 'lottery',
        description: '每日抽奖奖励',
        createTime: now
      }
    });
    
    // 返回抽奖结果
    return {
      success: true,
      points: points,
      totalpoints: totalpoints,
      message: '抽奖成功'
    }
    
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: '抽奖失败',
      error: error
    }
  }
}