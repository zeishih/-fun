/**
 * 全局错误处理中间件
 * @module middleware/error
 */
const fs = require('fs');
const path = require('path');

/**
 * 记录错误日志到文件
 * @param {Object} err - 错误对象
 * @param {string} reqInfo - 请求信息
 */
const logErrorToFile = (err, reqInfo) => {
  try {
    const logDir = path.join(__dirname, '../logs');
    
    // 确保日志目录存在
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, 'error.log');
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${reqInfo} - ${err.stack || err.message || err}\n`;
    
    // 追加错误日志到文件
    fs.appendFileSync(logFile, logEntry);
  } catch (logErr) {
    console.error('记录错误日志失败:', logErr);
  }
};

/**
 * 处理错误并返回标准格式的响应
 * @param {Object} err - 错误对象
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
const errorHandler = (err, req, res, next) => {
  // 构建请求信息用于日志记录
  const reqInfo = `${req.method} ${req.originalUrl} - IP: ${req.ip}`;
  console.error(`错误发生于 ${reqInfo}:`, err);
  
  // 记录错误到日志文件
  logErrorToFile(err, reqInfo);
  
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || '服务器内部错误';

  // 处理Mongoose重复键错误
  if (err.code === 11000) {
    statusCode = 400;
    message = '数据已存在，请勿重复提交';
    
    // 尝试提取重复的字段名
    if (err.keyPattern) {
      const duplicateKey = Object.keys(err.keyPattern)[0];
      message = `${duplicateKey} 已存在，请使用其他值`;
    }
  }

  // 处理Mongoose验证错误
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // 处理Mongoose无效ID错误
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = `未找到${err.path || '资源'}，请检查ID是否正确`;
  }

  // 处理JWT错误
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = '令牌无效，请重新登录';
  }

  // 处理JWT过期错误
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = '令牌已过期，请重新登录';
  }

  // 处理SyntaxError（通常是JSON解析错误）
  if (err instanceof SyntaxError && err.status === 400) {
    statusCode = 400;
    message = '请求体格式无效，请检查JSON格式';
  }

  // 处理请求体过大错误
  if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = '请求体过大，请减小请求数据量';
  }

  // 处理文件上传错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = '文件大小超过限制';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = '未预期的文件字段';
  }

  // 处理网络请求错误
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    statusCode = 503;
    message = '无法连接到外部服务，请稍后再试';
  }

  // 发送响应
  res.status(statusCode).json({
    success: false,
    message,
    // 只在开发环境中返回错误堆栈
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler; 