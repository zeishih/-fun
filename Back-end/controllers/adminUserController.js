/**
 * 管理员用户控制器
 * @module controllers/adminUserController
 */
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

/**
 * 获取所有用户
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回用户列表
 */
exports.getUsers = async (req, res, next) => {
  try {
    // 处理查询参数
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const keyword = req.query.keyword || '';
    const status = req.query.status !== undefined ? 
      (req.query.status === 'true' || req.query.status === '1') : undefined;

    // 创建查询条件
    let query = {};
    
    // 如果有关键词搜索
    if (keyword) {
      query.$or = [
        { nickname: { $regex: keyword, $options: 'i' } },
        { openid: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 如果有状态筛选（这里假设用户模型有status字段，如果没有，需要调整）
    if (status !== undefined) {
      query.status = status;
    }

    // 执行查询
    const total = await User.countDocuments(query);
    
    const users = await User.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // 构建分页信息
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    // 返回响应
    return res.status(200).json({
      success: true,
      count: users.length,
      pagination,
      total,
      data: users
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

/**
 * 获取单个用户详情
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回用户详情
 */
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到该用户'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    
    // 处理无效ID格式
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '无效的用户ID'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

/**
 * 更新用户状态
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回更新结果
 */
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (status === undefined) {
      return res.status(400).json({
        success: false,
        message: '请提供状态信息'
      });
    }
    
    // 查找并更新用户
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到该用户'
      });
    }
    
    // 更新状态（这里假设用户模型有status字段，如果没有，需要调整）
    user.status = status;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: `用户状态已${status ? '启用' : '禁用'}`,
      data: user
    });
  } catch (error) {
    console.error('更新用户状态错误:', error);
    
    // 处理无效ID格式
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '无效的用户ID'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

/**
 * 获取用户统计信息
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回用户统计信息
 */
exports.getUserStats = async (req, res, next) => {
  try {
    // 获取总用户数
    const totalUsers = await User.countDocuments();
    
    // 获取今日新增用户数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today }
    });
    
    // 获取本周新增用户数
    const startOfWeek = new Date();
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: startOfWeek }
    });
    
    // 获取本月新增用户数
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    // 获取活跃用户数（假设有lastActiveTime字段，如果没有，需要调整）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({
      lastActiveTime: { $gte: thirtyDaysAgo }
    });
    
    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        activeUsers
      }
    });
  } catch (error) {
    console.error('获取用户统计信息错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
}; 