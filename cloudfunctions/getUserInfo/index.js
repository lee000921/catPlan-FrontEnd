// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const userCollection = db.collection('users')

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

  console.log('获取到的openid：', openid)

  try {
    // 查询用户是否已经存在
    const userResult = await userCollection.where({
      openId: openid
    }).get()

    console.log('userResult', userResult)
    
    // 如果用户不存在，返回空数据
    if (userResult.data.length === 0) {
      return {
        success: false,
        message: '用户不存在',
        data: null
      }
    } 
    // 用户已存在，返回用户信息
    else {
      const user = userResult.data[0]
      
      return {
        success: true,
        message: '获取用户信息成功',
        data: user
      }
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
    return {
      success: false,
      message: '获取用户信息失败: ' + error.message,
      error
    }
  }
}