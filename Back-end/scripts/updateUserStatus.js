/**
 * 更新用户status字段的脚本
 * 为所有没有status字段的用户记录添加status=true
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });
const User = require('../models/User');

// 加载环境变量
dotenv.config();

// 连接数据库
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB连接成功');
  updateUserStatus();
}).catch(err => {
  console.error('MongoDB连接失败:', err);
  process.exit(1);
});

async function updateUserStatus() {
  try {
    // 更新所有没有status字段或status=undefined的用户
    const result = await User.updateMany(
      { status: { $exists: false } }, 
      { $set: { status: true } }
    );
    
    console.log(`已更新 ${result.nModified} 个用户记录的status字段为true`);
    
    // 输出更新后的用户总数
    const totalUsers = await User.countDocuments();
    const enabledUsers = await User.countDocuments({ status: true });
    const disabledUsers = await User.countDocuments({ status: false });
    
    console.log(`用户总数: ${totalUsers}`);
    console.log(`启用状态用户数: ${enabledUsers}`);
    console.log(`禁用状态用户数: ${disabledUsers}`);
    
    // 关闭数据库连接
    mongoose.connection.close();
    console.log('数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('更新用户status时出错:', error);
    mongoose.connection.close();
    process.exit(1);
  }
} 