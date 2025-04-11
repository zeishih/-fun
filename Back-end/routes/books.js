const express = require('express');
const router = express.Router();

// 引入控制器方法
const {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook
} = require('../controllers/bookController');

// 引入中间件
const { protect } = require('../middleware/auth');
const adminProtect = require('../middleware/adminProtect');

// 引入数据验证中间件
const { validateBook } = require('../middleware/validator');

// 设置路由
router.route('/')
  .get(getAllBooks)
  .post(protect, adminProtect, validateBook, createBook);

router.route('/:id')
  .get(getBookById)
  .put(protect, adminProtect, validateBook, updateBook)
  .delete(protect, adminProtect, deleteBook);

module.exports = router; 