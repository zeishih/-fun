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
const { protectAdmin } = require('../middleware/adminAuth');

// 引入数据验证中间件
const { validateBook } = require('../middleware/validator');

// 调试中间件，记录路由处理信息
const debugMiddleware = (req, res, next) => {
  console.log(`请求路径: ${req.method} ${req.originalUrl}`);
  console.log('请求头 Authorization:', req.headers.authorization);
  next();
};

// 设置路由
router.route('/')
  .get(getAllBooks)
  .post(
    debugMiddleware, 
    protectAdmin,
    (req, res, next) => {
      console.log('protectAdmin 中间件后，req.admin:', req.admin ? JSON.stringify(req.admin) : '未定义');
      next();
    },
    validateBook, 
    (req, res, next) => {
      console.log('validateBook 通过后，即将调用 createBook 控制器');
      next();
    },
    createBook
  );

router.route('/:id')
  .get(getBookById)
  .put(protectAdmin, validateBook, updateBook)
  .delete(protectAdmin, deleteBook);

module.exports = router; 