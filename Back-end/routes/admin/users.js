/**
 * 管理员用户管理路由
 * @module routes/admin/users
 */
const express = require('express');
const router = express.Router();
const adminUserController = require('../../controllers/adminUserController');
const { protectAdmin, authorize } = require('../../middleware/adminAuth');

// 所有路由都需要管理员身份验证
router.use(protectAdmin);

// 获取用户统计信息
router.get('/stats', adminUserController.getUserStats);

// 获取所有用户
router.get('/', adminUserController.getUsers);

// 获取单个用户详情
router.get('/:id', adminUserController.getUser);

// 更新用户状态
router.put('/:id/status', authorize('superadmin', 'admin'), adminUserController.updateUserStatus);

module.exports = router; 