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
  console.log('=== adminProtect中间件被调用 ===');
  console.log('请求路径:', req.originalUrl);
  console.log('请求方法:', req.method);
  console.log('req.user:', req.user ? JSON.stringify(req.user) : '未定义');
  console.log('req.user?.role:', req.user ? req.user.role : '未定义');
  
  // 检查用户是否存在
  if (!req.user) {
    console.log('错误: 用户信息不存在，可能protect中间件没有正确设置req.user');
    return res.status(500).json({
      success: false,
      message: '未找到用户信息，请确保在此中间件前使用认证中间件'
    });
  }

  // 检查用户是否具有管理员角色 (admin 或 superadmin)
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    console.log('权限不足: 用户角色为', req.user.role, '，需要admin或superadmin角色');
    return res.status(403).json({
      success: false,
      message: '权限不足，需要管理员权限'
    });
  }

  console.log('权限检查通过: 用户具有管理员权限');
  // 如果用户是管理员，继续执行下一个中间件或路由处理器
  next();
};

module.exports = adminProtect; 