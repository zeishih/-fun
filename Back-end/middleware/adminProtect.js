const ErrorResponse = require('../utils/errorResponse');

/**
 * 管理员权限验证中间件
 * 确保用户具有管理员角色
 * 注意：该中间件应该在 protect 中间件之后使用
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
const adminProtect = (req, res, next) => {
  // 检查用户是否存在
  if (!req.user) {
    return next(new ErrorResponse('未找到用户信息，请确保在此中间件前使用认证中间件', 500));
  }

  // 检查用户是否具有管理员角色
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('权限不足，需要管理员权限', 403));
  }

  // 如果用户是管理员，继续执行下一个中间件或路由处理器
  next();
};

module.exports = adminProtect; 