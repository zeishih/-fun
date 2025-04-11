/**
 * 管理员书籍管理路由
 * @module routes/admin/books
 */
const express = require('express');
const router = express.Router();
const adminBookController = require('../../controllers/adminBookController');
const { protectAdmin, authorize } = require('../../middleware/adminAuth');

// 所有路由都需要管理员身份验证
router.use(protectAdmin);

// 获取书籍统计信息
router.get('/stats', adminBookController.getBookStats);

// 获取所有书籍
router.get('/', adminBookController.getBooks);

// 获取单个书籍详情
router.get('/:id', adminBookController.getBook);

// 创建新书籍
router.post('/', authorize('superadmin', 'admin', 'editor'), adminBookController.createBook);

// 更新书籍
router.put('/:id', authorize('superadmin', 'admin', 'editor'), adminBookController.updateBook);

// 删除书籍
router.delete('/:id', authorize('superadmin', 'admin'), adminBookController.deleteBook);

module.exports = router; 