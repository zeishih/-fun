/**
 * 管理员认证中间件
 * @module middleware/adminAuth
 */
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

/**
 * 保护管理员路由，验证管理员是否已认证
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.protectAdmin = async (req, res, next) => {
  try {
    let token;

    // 从请求头中获取Authorization令牌
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // 提取令牌
      token = req.headers.authorization.split(' ')[1];
    }

    // 检查是否存在令牌
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未授权，没有提供Token'
      });
    }

    // 验证令牌
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET);

    // 检查管理员用户是否存在
    const admin = await AdminUser.findById(decoded.id).select('-password -__v');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: '未授权，管理员用户不存在'
      });
    }

    // 检查账号状态
    if (!admin.status) {
      return res.status(403).json({
        success: false,
        message: '您的账号已被禁用，请联系超级管理员'
      });
    }

    // 将管理员信息添加到请求对象中
    req.admin = admin;
    next();
  } catch (error) {
    console.error('管理员认证中间件错误:', error);
    return res.status(401).json({
      success: false,
      message: '未授权，Token无效'
    });
  }
};

/**
 * 角色授权中间件
 * @param {...String} roles - 允许访问的角色列表
 * @returns {Function} - Express中间件函数
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: '未经授权，需要先进行身份验证'
      });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: `角色 ${req.admin.role} 无权执行此操作`
      });
    }
    
    next();
  };
};

/**
 * 权限检查中间件
 * @param {...String} requiredPermissions - 所需权限列表
 * @returns {Function} - Express中间件函数
 */
exports.checkPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: '未经授权，需要先进行身份验证'
      });
    }

    // 超级管理员拥有所有权限
    if (req.admin.role === 'superadmin') {
      return next();
    }

    // 检查用户是否拥有所需的全部权限
    const hasAllPermissions = requiredPermissions.every(permission => 
      req.admin.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        message: '权限不足，无法执行此操作'
      });
    }
    
    next();
  };
}; 