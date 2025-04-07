/**
 * 数据库连接配置
 * @module config/db
 */
const mongoose = require('mongoose');

/**
 * 连接MongoDB数据库
 * @returns {Promise} 返回连接Promise
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 6.0以上版本这些选项已经默认开启，不需要显式指定
    });
    
    console.log(`MongoDB 连接成功: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB 连接失败: ${error.message}`);
    process.exit(1); // 连接失败时退出进程
  }
};

module.exports = connectDB; 