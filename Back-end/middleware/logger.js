/**
 * 请求日志中间件
 * @module middleware/logger
 */
const fs = require('fs');
const path = require('path');

/**
 * 记录请求日志到文件
 * @param {Object} req - Express请求对象
 * @param {string} responseTime - 响应时间(ms)
 * @param {number} statusCode - HTTP状态码
 */
const logRequestToFile = (req, responseTime, statusCode) => {
  try {
    const logDir = path.join(__dirname, '../logs');
    
    // 确保日志目录存在
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, 'access.log');
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl || req.url;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || '-';
    
    // 格式化日志条目
    const logEntry = `[${timestamp}] ${method} ${url} ${statusCode} ${responseTime}ms - ${ip} "${userAgent}"\n`;
    
    // 追加日志到文件
    fs.appendFileSync(logFile, logEntry);
  } catch (logErr) {
    console.error('记录请求日志失败:', logErr);
  }
};

/**
 * 请求日志中间件
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
const requestLogger = (req, res, next) => {
  // 请求开始时间
  const startTime = Date.now();
  
  // 输出请求信息到控制台
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl || req.url}`);
  
  // 捕获响应结束事件
  res.on('finish', () => {
    // 计算响应时间
    const responseTime = Date.now() - startTime;
    // 获取状态码
    const statusCode = res.statusCode;
    
    // 记录请求日志
    logRequestToFile(req, responseTime, statusCode);
    
    // 根据状态码的不同，使用不同的日志级别
    if (statusCode >= 500) {
      console.error(`${req.method} ${req.originalUrl} ${statusCode} ${responseTime}ms`);
    } else if (statusCode >= 400) {
      console.warn(`${req.method} ${req.originalUrl} ${statusCode} ${responseTime}ms`);
    } else {
      console.log(`${req.method} ${req.originalUrl} ${statusCode} ${responseTime}ms`);
    }
  });
  
  next();
};

module.exports = requestLogger; 