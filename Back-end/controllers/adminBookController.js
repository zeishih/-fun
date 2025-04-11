/**
 * 管理员书籍控制器
 * @module controllers/adminBookController
 */
const Book = require('../models/Book');
const ErrorResponse = require('../utils/errorResponse');

/**
 * 获取所有书籍
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回书籍列表
 */
exports.getBooks = async (req, res, next) => {
  try {
    // 处理查询参数
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const keyword = req.query.keyword || '';
    const category = req.query.category || '';

    // 创建查询条件
    let query = {};
    
    // 如果有关键词搜索
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { author: { $regex: keyword, $options: 'i' } },
        { isbn: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 如果有分类筛选
    if (category) {
      query.genre = { $in: [category] };
    }

    // 执行查询
    const total = await Book.countDocuments(query);
    
    const books = await Book.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // 构建分页信息
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    // 返回响应
    return res.status(200).json({
      success: true,
      count: books.length,
      pagination,
      total,
      data: books
    });
  } catch (error) {
    console.error('获取书籍列表错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

/**
 * 获取单个书籍详情
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回书籍详情
 */
exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).select('-__v');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: '找不到该书籍'
      });
    }

    return res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('获取书籍详情错误:', error);
    
    // 处理无效ID格式
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '无效的书籍ID'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

/**
 * 创建新书籍
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回创建的书籍
 */
exports.createBook = async (req, res, next) => {
  try {
    // 必填字段验证
    const { title, author } = req.body;
    
    if (!title || !author) {
      return res.status(400).json({
        success: false,
        message: '书名和作者不能为空'
      });
    }
    
    // 添加当前管理员为添加者
    req.body.addedBy = req.admin.id;
    
    // 创建书籍
    const book = await Book.create(req.body);
    
    return res.status(201).json({
      success: true,
      message: '书籍创建成功',
      data: book
    });
  } catch (error) {
    console.error('创建书籍错误:', error);
    
    // 处理验证错误
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

/**
 * 更新书籍
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回更新后的书籍
 */
exports.updateBook = async (req, res, next) => {
  try {
    // 查找并更新书籍
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: '找不到该书籍'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: '书籍更新成功',
      data: book
    });
  } catch (error) {
    console.error('更新书籍错误:', error);
    
    // 处理无效ID格式
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '无效的书籍ID'
      });
    }
    
    // 处理验证错误
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

/**
 * 删除书籍
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回删除结果
 */
exports.deleteBook = async (req, res, next) => {
  try {
    // 查找并删除书籍
    const book = await Book.findByIdAndDelete(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: '找不到该书籍'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: '书籍删除成功',
      data: {}
    });
  } catch (error) {
    console.error('删除书籍错误:', error);
    
    // 处理无效ID格式
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '无效的书籍ID'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

/**
 * 获取书籍统计信息
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回书籍统计信息
 */
exports.getBookStats = async (req, res, next) => {
  try {
    // 获取总书籍数
    const totalBooks = await Book.countDocuments();
    
    // 获取平均评分
    const ratingStats = await Book.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: '$ratingCount' }
        }
      }
    ]);
    
    // 获取各类别的书籍数量
    const genreStats = await Book.aggregate([
      { $unwind: '$genre' },
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // 获取最近添加的书籍
    const recentBooks = await Book.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title author coverUrl rating createdAt');
    
    return res.status(200).json({
      success: true,
      data: {
        totalBooks,
        averageRating: ratingStats.length > 0 ? ratingStats[0].averageRating : 0,
        totalRatings: ratingStats.length > 0 ? ratingStats[0].totalRatings : 0,
        genreStats,
        recentBooks
      }
    });
  } catch (error) {
    console.error('获取书籍统计信息错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
}; 