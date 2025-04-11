/**
 * 初始化管理员账号脚本
 * 使用方法: node createAdmin.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AdminUser = require('../models/AdminUser');

// 加载环境变量
dotenv.config({ path: '../.env' });

// 连接数据库
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB 连接成功'))
  .catch(err => {
    console.error('MongoDB 连接失败', err);
    process.exit(1);
  });

// 创建超级管理员
const createSuperAdmin = async () => {
  try {
    // 检查是否已存在超级管理员
    const adminExists = await AdminUser.findOne({ role: 'superadmin' });
    
    if (adminExists) {
      console.log('超级管理员已存在，无需重复创建');
      return process.exit(0);
    }
    
    // 创建超级管理员
    const admin = await AdminUser.create({
      username: 'admin',
      password: 'password123', // 初始密码，应该在创建后立即更改
      name: '系统管理员',
      email: 'admin@example.com',
      role: 'superadmin',
      permissions: ['all']
    });
    
    console.log('超级管理员创建成功:');
    console.log(`用户名: ${admin.username}`);
    console.log('密码: password123');
    console.log('请登录后立即修改密码！');
    
    process.exit(0);
  } catch (error) {
    console.error('创建超级管理员失败:', error);
    process.exit(1);
  }
};

// 执行创建超级管理员
createSuperAdmin(); 