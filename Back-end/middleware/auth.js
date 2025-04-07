/**
 * 身份验证中间件
 * @module middleware/auth
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 保护路由，验证用户是否已认证
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.protect = async (req, res, next) => {
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
        message: '未授权访问，请先登录',
      });
    }

    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 检查用户是否存在
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '令牌无效，未找到该用户',
      });
    }

    // 将用户信息添加到请求对象中
    req.user = {
      id: user._id,
      openid: user.openid,
    };

    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    return res.status(401).json({
      success: false,
      message: '未授权访问，令牌无效',
    });
  }
}; 