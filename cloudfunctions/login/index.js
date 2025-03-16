// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const userCollection = db.collection('users')

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('login云函数被调用，参数：', event);
  
  const wxContext = cloud.getWXContext()
  const openid = event.userInfo.openId ? event.userInfo.openId : wxContext.OPENID
  
  console.log('获取到的openid：', openid);
  
  if (!openid) {
    console.error('获取用户openid失败');
    return {
      success: false,
      message: '获取用户openid失败'
    }
  }

  try {
    // 查询用户是否已经存在
    console.log('查询用户是否存在');
    const userResult = await userCollection.where({
      openId: openid
    }).get()
    
    console.log('查询结果：', userResult);
    
    const now = new Date()
    
    // 用户信息，合并传入的数据和openid
    const userData = {
      ...event.userInfo,
      lastLoginTime: now
    }
    
    console.log('准备处理用户数据：', userData);
    
    // 如果用户不存在，创建新用户
    if (userResult.data.length === 0) {
      console.log('用户不存在，创建新用户');
      // 设置新用户的初始数据
      const newUser = {
        ...userData,
        points: 0, // 初始碎片为0
        level: 1,
        checkinDays: 0,
        consecutiveCheckinDays: 0,
        lastCheckinDate: null,
        registerTime: now,
        tasks: [],
        exchanges: [], // 兑换记录
        isNewUser: true // 标记为新用户，前端会根据这个标记显示欢迎奖励
      }
      
      console.log('新用户数据：', newUser);
      
      // 创建用户
      const result = await userCollection.add({
        data: newUser
      })
      
      console.log('创建用户结果：', result);
      
      // 给新用户增加52碎片作为欢迎奖励
      await userCollection.doc(result._id).update({
        data: {
          points: 52
        }
      });
      
      // 创建首次登录奖励记录
      await db.collection('pointsRecords').add({
        data: {
          openId: openid,
          points: 52,
          type: 'welcome',
          description: '新用户首次登录奖励',
          createTime: now
        }
      });
      
      // 更新返回的用户数据，包含奖励后的碎片数
      newUser.points = 52;
      
      return {
        success: true,
        message: '用户创建成功',
        data: newUser,
        isNewUser: true // 标记为新用户，前端会显示欢迎奖励提示
      }
    } 
    // 用户已存在，更新用户信息
    else {
      console.log('用户已存在，更新用户信息');
      const user = userResult.data[0]
      
      // 更新用户数据，保留原有数据
      const updateData = {
        ...userData,
        points: user.points || 0,
        level: user.level || 1,
        checkinDays: user.checkinDays || 0,
        consecutiveCheckinDays: user.consecutiveCheckinDays || 0,
        lastCheckinDate: user.lastCheckinDate,
        registerTime: user.registerTime || now,
        tasks: user.tasks || {
          daily: [],
          newbie: [],
          growth: []
        },
        exchanges: user.exchanges || []
      }
      
      console.log('更新用户数据：', updateData);
      
      // 更新用户
      await userCollection.doc(user._id).update({
        data: updateData
      })
      
      console.log('更新用户成功');
      
      return {
        success: true,
        message: '用户登录成功',
        data: updateData,
        isNewUser: false // 不是新用户
      }
    }
  } catch (error) {
    console.error('登录失败', error);
    return {
      success: false,
      message: '登录失败: ' + error.message,
      error: error.toString()
    }
  }
}