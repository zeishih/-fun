/**
 * 用户控制器
 * @module controllers/userController
 */
const User = require('../models/User');

/**
 * 获取当前用户信息
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回用户信息
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试',
    });
  }
};

/**
 * 更新用户学习目标
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回更新后的用户信息
 */
exports.updateUserGoals = async (req, res) => {
  try {
    const { goals } = req.body;
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { goals },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('更新用户目标错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试',
    });
  }
};

/**
 * 更新用户阅读偏好
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回更新后的用户信息
 */
exports.updateUserPreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { preferences },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('更新用户偏好错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试',
    });
  }
};

/**
 * 更新用户学习计划
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回更新后的用户信息
 */
exports.updateUserStudyPlan = async (req, res) => {
  try {
    const { studyPlan } = req.body;
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { studyPlan },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('更新用户学习计划错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试',
    });
  }
};

/**
 * 更新用户设置
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回更新后的用户信息
 */
exports.updateUserSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { settings },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('更新用户设置错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试',
    });
  }
};

/**
 * 更新用户统计信息
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回更新后的用户信息
 */
exports.updateUserStatistics = async (req, res) => {
  try {
    const { statistics } = req.body;
    const userId = req.user.id;

    // 更新统计信息
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { statistics },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('更新用户统计信息错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试',
    });
  }
}; 