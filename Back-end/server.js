/**
 * 阅读越有fun 后端服务入口文件
 * @module server
 */
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const requestLogger = require('./middleware/logger');

// 加载环境变量
dotenv.config();

// 连接数据库
connectDB();

// 创建Express应用实例
const app = express();



// 请求日志中间件
app.use(requestLogger);

// 中间件
app.use(express.json()); // 解析JSON请求体

// 处理CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// 定义根路由
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '欢迎使用阅读越有fun后端API',
    version: '1.0.0',
  });
});

// 使用路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/books', require('./routes/books')); // 添加书籍路由
app.use('/api/activities', require('./routes/activities')); // 添加活动路由

// 添加管理员路由
app.use('/api/admin', require('./routes/admin/index'));

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '找不到请求的资源',
  });
});

// 全局错误处理中间件
app.use(errorHandler);

// 获取端口号
const PORT = process.env.PORT || 3000;

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`服务器已启动，运行在 http://localhost:${PORT}`);
});

// 处理未捕获的异常
process.on('unhandledRejection', (err) => {
  console.error('未处理的Promise拒绝:', err);
  server.close(() => {
    process.exit(1);
  });
}); 