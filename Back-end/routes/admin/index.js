/**
 * 管理员主路由
 * @module routes/admin/index
 */
const express = require('express');
const router = express.Router();
const { protectAdmin, authorize } = require('../../middleware/adminAuth');
const activityController = require('../../controllers/activityController');

// 认证相关路由
router.use('/auth', require('./auth'));

// 用户管理路由
router.use('/users', require('./users'));

// 书籍管理路由
router.use('/books', require('./books'));

// 活动相关管理员路由
router.route('/activities').get(protectAdmin, activityController.getAllActivities);
router.route('/activities/statistics').get(protectAdmin, activityController.getActivityStatistics);
router.route('/activities/:id/approve').put(protectAdmin, activityController.approveActivity);

// 后续可以添加更多管理功能路由，例如活动管理、数据统计等

module.exports = router; 