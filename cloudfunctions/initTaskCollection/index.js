// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const taskCollection = db.collection('tasks')

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 先清空集合（如果需要重新初始化）

    // 获取所有任务
    const allTasks = await taskCollection.get()
      
    // 批量删除任务
    const deletePromises = allTasks.data.map(task => {
      return taskCollection.doc(task._id).remove()
    })
      
    await Promise.all(deletePromises)

    // 预定义的任务数据
    const tasks = [
      {
        title: '拍摄公园风景照',
        desc: '需要拍摄5张公园的风景照片，要求画面清晰，构图美观，能够展现公园的自然美景和人文特色。最好在阳光明媚的天气拍摄，避免阴雨天气。',
        points: 50,
        category: 'daily',
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        title: '记录早餐制作过程',
        desc: '拍摄制作健康早餐的全过程，包括食材准备、烹饪和成品展示。要求记录至少3个步骤，最终成品图片要求清晰美观，能够展现食物的色香味。',
        points: 30,
        category: 'growth',
        progress: 0,
        maxProgress: 3,
        completed: false
      } 
    ]

    // 批量添加任务到数据库
    for (let task of tasks) {
      await taskCollection.add({
        data: task
      })
    }

    return {
      success: true,
      message: `成功初始化 ${tasks.length} 个任务`,
      count: tasks.length
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      message: '初始化任务失败',
      error: err
    }
  }
}