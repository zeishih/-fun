/**
 * 管理员主路由
 * @module routes/admin/index
 */
const express = require('express');
const router = express.Router();

// 认证相关路由
router.use('/auth', require('./auth'));

// 用户管理路由
router.use('/users', require('./users'));

// 书籍管理路由
router.use('/books', require('./books'));

// 后续可以添加更多管理功能路由，例如活动管理、数据统计等

module.exports = router; 