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

  // 获取要更新的数据
  const updateData = event.data || {}
  
  // 防止更新敏感字段
  delete updateData._id
  delete updateData._openid
  delete updateData.registerTime
  
  try {
    // 查询用户是否已经存在
    const userResult = await userCollection.where({
      _openid: openid
    }).get()
    
    // 如果用户不存在，返回错误
    if (userResult.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    } 
    // 用户已存在，更新用户信息
    else {
      const user = userResult.data[0]
      
      // 更新用户
      await userCollection.doc(user._id).update({
        data: updateData
      })
      
      // 获取更新后的用户信息
      const updatedUser = await userCollection.doc(user._id).get()
      
      return {
        success: true,
        message: '用户信息更新成功',
        data: updatedUser.data
      }
    }
  } catch (error) {
    console.error('更新用户信息失败', error)
    return {
      success: false,
      message: '更新用户信息失败: ' + error.message,
      error
    }
  }
}