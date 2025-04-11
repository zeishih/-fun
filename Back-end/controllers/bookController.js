const Book = require('../models/Book');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * 创建新书
 * @route   POST /api/books
 * @access  Private/Admin
 */
exports.createBook = asyncHandler(async (req, res, next) => {
  // 将当前用户ID设置为书籍的添加者
  req.body.addedBy = req.user._id;

  // 字段同步处理
  const bookData = { ...req.body };
  
  // 确保前端传来的数据能正确映射到后端字段
  if (bookData.tags && !bookData.genre) {
    bookData.genre = bookData.tags;
  }
  
  if (bookData.introduction && !bookData.description) {
    bookData.description = bookData.introduction;
  }
  
  if (bookData.pages && !bookData.pageCount) {
    bookData.pageCount = bookData.pages;
  }

  // 创建新书籍
  const book = await Book.create(bookData);

  res.status(201).json({
    success: true,
    data: book
  });
});

/**
 * 获取所有书籍
 * @route   GET /api/books
 * @access  Public
 */
exports.getAllBooks = asyncHandler(async (req, res, next) => {
  // 分页
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  // 查询条件
  const query = {};
  
  // 搜索功能增强：支持搜索关键词
  if (req.query.search) {
    // 使用$or进行模糊匹配
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { author: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  
  // 按难度级别筛选
  if (req.query.difficulty) {
    query.difficultyLevel = req.query.difficulty;
  }
  
  // 按类型筛选（支持多类型）
  if (req.query.genre) {
    if (Array.isArray(req.query.genre)) {
      query.genre = { $in: req.query.genre };
    } else if (req.query.genre.includes(',')) {
      // 支持逗号分隔的多个类型
      const genres = req.query.genre.split(',');
      query.genre = { $in: genres };
    } else {
      query.genre = { $in: [req.query.genre] };
    }
  }
  
  // 按标签筛选
  if (req.query.tags) {
    if (Array.isArray(req.query.tags)) {
      query.tags = { $in: req.query.tags };
    } else if (req.query.tags.includes(',')) {
      const tags = req.query.tags.split(',');
      query.tags = { $in: tags };
    } else {
      query.tags = { $in: [req.query.tags] };
    }
  }
  
  // 按语言筛选
  if (req.query.language) {
    query.language = req.query.language;
  }
  
  // 按评分筛选
  if (req.query.minRating) {
    query.rating = { $gte: parseFloat(req.query.minRating) };
  }

  // 执行查询
  const total = await Book.countDocuments(query);
  const books = await Book.find(query)
    .skip(startIndex)
    .limit(limit)
    .sort({ createdAt: -1 });

  // 分页结果
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

  res.status(200).json({
    success: true,
    count: books.length,
    pagination,
    total,
    data: books
  });
});

/**
 * 获取单个书籍详情
 * @route   GET /api/books/:id
 * @access  Public
 */
exports.getBookById = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return next(new ErrorResponse(`未找到ID为${req.params.id}的书籍`, 404));
  }

  // 尝试查找相关活动（如果Activity模型存在）
  let relatedActivities = [];
  try {
    const Activity = require('../models/Activity');
    relatedActivities = await Activity.find({ book: book._id })
      .select('title startDate endDate status participantCount creator')
      .populate('creator', 'nickname avatarUrl')
      .sort({ createdAt: -1 })
      .limit(5);
  } catch (err) {
    // 如果Activity模型不存在或查询出错，忽略错误，返回空数组
    console.log('获取相关活动失败，可能Activity模型不存在:', err.message);
  }

  res.status(200).json({
    success: true,
    data: {
      book,
      relatedActivities
    }
  });
});

/**
 * 更新书籍信息
 * @route   PUT /api/books/:id
 * @access  Private/Admin
 */
exports.updateBook = asyncHandler(async (req, res, next) => {
  let book = await Book.findById(req.params.id);

  if (!book) {
    return next(new ErrorResponse(`未找到ID为${req.params.id}的书籍`, 404));
  }

  // 字段同步处理
  const updateData = { ...req.body };
  
  // 确保前端传来的数据能正确映射到后端字段
  if (updateData.tags && !updateData.genre) {
    updateData.genre = updateData.tags;
  }
  
  if (updateData.introduction && !updateData.description) {
    updateData.description = updateData.introduction;
  }
  
  if (updateData.pages && !updateData.pageCount) {
    updateData.pageCount = updateData.pages;
  }

  // 更新书籍
  book = await Book.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: book
  });
});

/**
 * 删除书籍
 * @route   DELETE /api/books/:id
 * @access  Private/Admin
 */
exports.deleteBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return next(new ErrorResponse(`未找到ID为${req.params.id}的书籍`, 404));
  }

  await book.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
}); 