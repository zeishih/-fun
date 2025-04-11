/**
 * 管理员身份验证控制器
 * @module controllers/adminAuthController
 */
const AdminUser = require('../models/AdminUser');
const ErrorResponse = require('../utils/errorResponse');

/**
 * 处理管理员登录
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回包含token的响应
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '请提供用户名和密码'
      });
    }

    // 查找用户并包含密码
    const admin = await AdminUser.findOne({ username }).select('+password');

    // 验证用户存在
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 检查账号状态
    if (!admin.status) {
      return res.status(403).json({
        success: false,
        message: '您的账号已被禁用，请联系超级管理员'
      });
    }

    // 验证密码
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 更新最后登录时间
    admin.lastLogin = new Date();
    await admin.save();

    // 生成JWT令牌
    const token = admin.getSignedJwtToken();

    // 返回响应
    return res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        avatar: admin.avatar,
        role: admin.role,
        email: admin.email,
        phone: admin.phone,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    console.error('登录处理错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

/**
 * 获取当前管理员信息
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回当前管理员的信息
 */
exports.getProfile = async (req, res, next) => {
  try {
    // 从请求对象中获取管理员信息
    const admin = req.admin;

    return res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('获取管理员信息错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

/**
 * 更新管理员密码
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回更新结果
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // 验证输入
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '请提供当前密码和新密码'
      });
    }

    // 查找管理员并包含密码
    const admin = await AdminUser.findById(req.admin.id).select('+password');

    // 验证当前密码
    const isMatch = await admin.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '当前密码错误'
      });
    }

    // 更新密码
    admin.password = newPassword;
    await admin.save();

    // 返回新token
    const token = admin.getSignedJwtToken();

    return res.status(200).json({
      success: true,
      message: '密码更新成功',
      token
    });
  } catch (error) {
    console.error('更新密码错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

/**
 * 管理员登出（仅记录日志，实际登出在前端处理）
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回登出结果
 */
exports.logout = async (req, res, next) => {
  try {
    // 这里可以添加登出日志记录等操作
    console.log(`管理员 ${req.admin.username} 登出系统`);

    return res.status(200).json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    console.error('登出处理错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
}; 