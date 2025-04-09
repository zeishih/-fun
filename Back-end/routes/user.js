/**
 * 用户路由
 * @module routes/user
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const validator = require('../middleware/validator');

// 获取当前用户信息
router.get('/me', protect, userController.getCurrentUser);

// 更新用户学习目标
router.put('/goals', protect, validator.validateUserGoals, userController.updateUserGoals);

// 更新用户阅读偏好
router.put('/preferences', protect, validator.validateUserPreferences, userController.updateUserPreferences);

// 更新用户学习计划
router.put('/study-plan', protect, validator.validateUserStudyPlan, userController.updateUserStudyPlan);

// 更新用户设置
router.put('/settings', protect, validator.validateUserSettings, userController.updateUserSettings);

// 更新用户统计信息
router.put('/statistics', protect, validator.validateUserStatistics, userController.updateUserStatistics);

module.exports = router; 