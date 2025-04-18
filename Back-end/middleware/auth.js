/**
 * 认证中间件
 * @module middleware/auth
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

/**
 * 保护路由，验证用户是否已认证
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.protect = async (req, res, next) => {
  console.log('=== protect 中间件被调用 ===');
  console.log('请求路径:', req.originalUrl);
  console.log('请求方法:', req.method);
  
  try {
    let token;

    // 从请求头中获取Authorization令牌
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // 提取令牌
      token = req.headers.authorization.split(' ')[1];
      console.log('从请求头中提取的令牌:', token ? `${token.substring(0, 10)}...` : '无令牌');
    }

    // 检查是否存在令牌
    if (!token) {
      console.log('错误: 没有提供Token');
      return res.status(401).json({
        success: false,
        message: '未授权，没有提供Token',
      });
    }

    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT解码结果:', decoded);

    // 检查用户是否存在
    const user = await User.findById(decoded.id).select('-__v');
    console.log('查询到的用户:', user ? JSON.stringify(user) : '未找到用户');
    
    if (!user) {
      console.log('错误: 用户不存在');
      return res.status(401).json({
        success: false,
        message: '未授权，用户不存在',
      });
    }

    // 检查用户是否被禁用 (处理status可能未定义的情况)
    if (user.status === false) {
      console.log('错误: 用户账号已被禁用');
      return res.status(403).json({
        success: false,
        message: '账号已被禁用，请联系管理员',
      });
    }

    // 将用户信息添加到请求对象中
    req.user = user;
    console.log('已将用户信息添加到req.user, 角色:', user.role);
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    return res.status(401).json({
      success: false,
      message: '未授权，Token无效',
    });
  }
}; 

/**
 * 基于角色的授权中间件
 * @param {...String} roles - 允许访问的角色列表
 * @returns {Function} 中间件函数
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('=== authorize 中间件被调用 ===');
    console.log('允许的角色:', roles);
    console.log('用户角色:', req.user.role);
    
    if (!req.user) {
      console.log('错误: 未经身份验证，无法授权');
      return res.status(401).json({
        success: false,
        message: '请先登录',
      });
    }
    
    // 检查用户角色是否在允许的角色列表中
    if (!roles.includes(req.user.role)) {
      console.log('错误: 用户角色不在允许的角色列表中');
      return res.status(403).json({
        success: false,
        message: '无权访问此资源',
      });
    }
    
    console.log('授权成功');
    next();
  };
}; 