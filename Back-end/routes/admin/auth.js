/**
 * 管理员身份验证路由
 * @module routes/admin/auth
 */
const express = require('express');
const router = express.Router();
const adminAuthController = require('../../controllers/adminAuthController');
const { protectAdmin } = require('../../middleware/adminAuth');

// 管理员登录
router.post('/login', adminAuthController.login);

// 获取当前管理员信息
router.get('/profile', protectAdmin, adminAuthController.getProfile);

// 更新管理员密码
router.put('/password', protectAdmin, adminAuthController.updatePassword);

// 管理员登出
router.post('/logout', protectAdmin, adminAuthController.logout);

module.exports = router; 