/**
 * 全局错误处理中间件
 * @module middleware/error
 */

/**
 * 处理错误并返回标准格式的响应
 * @param {Object} err - 错误对象
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
const errorHandler = (err, req, res, next) => {
  console.error('错误详情:', err);
  
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || '服务器内部错误';

  // 处理Mongoose重复键错误
  if (err.code === 11000) {
    statusCode = 400;
    message = '数据已存在，请勿重复提交';
  }

  // 处理Mongoose验证错误
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // 处理Mongoose无效ID错误
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = '未找到资源，请检查ID是否正确';
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

  // 发送响应
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler; 