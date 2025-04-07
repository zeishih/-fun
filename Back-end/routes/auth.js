/**
 * 身份验证路由
 * @module routes/auth
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// 微信小程序登录
router.post('/login', authController.login);

// 更新用户信息（需要认证中间件）
router.put('/user-info', protect, authController.updateUserInfo);

module.exports = router; 