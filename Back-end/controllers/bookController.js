const Book = require('../models/Book');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * 创建新书
 * @route   POST /api/books
 * @access  Private/Admin
 */
exports.createBook = asyncHandler(async (req, res, next) => {
  console.log('=== createBook 控制器被调用 ===');
  console.log('请求路径:', req.originalUrl);
  console.log('请求方法:', req.method);
  console.log('req.admin:', req.admin ? JSON.stringify(req.admin) : '未定义');
  console.log('管理员角色:', req.admin ? req.admin.role : '未定义');
  
  // 将当前管理员ID设置为书籍的添加者
  req.body.addedBy = req.admin._id;

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
  console.log('书籍创建成功:', book._id);

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
  console.log('收到查询参数:', req.query); // 调试日志，查看传入的查询参数
  
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
  if (req.query.difficultyLevel) {
    query.difficultyLevel = req.query.difficultyLevel;
  }
  // 支持旧参数名 difficulty
  else if (req.query.difficulty) {
    query.difficultyLevel = req.query.difficulty;
  }
  
  // 按书籍语言筛选
  if (req.query.bookLanguage) {
    query.bookLanguage = req.query.bookLanguage;
  }
  // 支持旧参数名 language
  else if (req.query.language) {
    query.bookLanguage = req.query.language;
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
  
  // 按评分筛选
  if (req.query.minRating) {
    query.rating = { $gte: parseFloat(req.query.minRating) };
  }
  
  // 按出版商筛选
  if (req.query.publisher) {
    query.publisher = { $regex: req.query.publisher, $options: 'i' };
  }
  
  // 按目标读者筛选
  if (req.query.targetReader) {
    query.targetReader = { $regex: req.query.targetReader, $options: 'i' };
  }

  console.log('构建的MongoDB查询:', JSON.stringify(query)); // 调试日志，查看构建的查询

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
  console.log(`尝试获取ID为 ${req.params.id} 的书籍`);
  
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      console.log(`未找到ID为 ${req.params.id} 的书籍，返回404状态码`);
      // 使用ErrorResponse类创建错误对象，并明确设置状态码为404
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
      console.log(`找到 ${relatedActivities.length} 个相关活动`);
    } catch (err) {
      // 如果Activity模型不存在或查询出错，忽略错误，返回空数组
      console.log('获取相关活动失败，可能Activity模型不存在:', err.message);
    }

    // 成功返回书籍详情
    res.status(200).json({
      success: true,
      data: {
        book,
        relatedActivities
      }
    });
  } catch (err) {
    console.error(`获取书籍时发生错误:`, err);
    
    // 处理MongoDB的CastError（无效ID格式）
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
      return next(new ErrorResponse(`无效的书籍ID格式: ${req.params.id}`, 400));
    }
    
    // 其他错误交给全局错误处理器
    return next(err);
  }
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

  // 添加审计字段：最后更新者
  if (req.admin && req.admin._id) {
    updateData.lastUpdatedBy = req.admin._id;
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

  // 可以记录谁删除了书籍（可选）
  console.log(`书籍 ${book._id} 被管理员 ${req.admin.username || req.admin._id} 删除`);

  await book.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
}); 