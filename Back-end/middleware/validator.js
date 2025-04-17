/**
 * 数据验证中间件
 * @module middleware/validator
 */

/**
 * 验证用户目标数据
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.validateUserGoals = (req, res, next) => {
  const { goals } = req.body;

  if (!goals) {
    return res.status(400).json({
      success: false,
      message: '缺少必要的目标数据',
    });
  }

  const { dailyReadingTime, dailyWords, weeklyBooks } = goals;

  // 验证每日阅读时间
  if (dailyReadingTime !== undefined) {
    if (typeof dailyReadingTime !== 'number' || dailyReadingTime < 0) {
      return res.status(400).json({
        success: false,
        message: '每日阅读时间必须是一个非负数',
      });
    }
  }

  // 验证每日单词数
  if (dailyWords !== undefined) {
    if (typeof dailyWords !== 'number' || dailyWords < 0 || !Number.isInteger(dailyWords)) {
      return res.status(400).json({
        success: false,
        message: '每日单词数必须是一个非负整数',
      });
    }
  }

  // 验证每周书籍数
  if (weeklyBooks !== undefined) {
    if (typeof weeklyBooks !== 'number' || weeklyBooks < 0 || !Number.isInteger(weeklyBooks)) {
      return res.status(400).json({
        success: false,
        message: '每周书籍数必须是一个非负整数',
      });
    }
  }

  next();
};

/**
 * 验证用户偏好数据
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.validateUserPreferences = (req, res, next) => {
  const { preferences } = req.body;

  if (!preferences) {
    return res.status(400).json({
      success: false,
      message: '缺少必要的偏好数据',
    });
  }

  const { difficultyLevel, favoriteGenres, readingSpeed } = preferences;

  // 验证难度级别
  if (difficultyLevel !== undefined) {
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    if (!validLevels.includes(difficultyLevel)) {
      return res.status(400).json({
        success: false,
        message: `难度级别必须是以下之一：${validLevels.join(', ')}`,
      });
    }
  }

  // 验证喜欢的阅读类型
  if (favoriteGenres !== undefined) {
    if (!Array.isArray(favoriteGenres)) {
      return res.status(400).json({
        success: false,
        message: '喜欢的阅读类型必须是一个数组',
      });
    }
  }

  // 验证阅读速度
  if (readingSpeed !== undefined) {
    const validSpeeds = ['slow', 'medium', 'fast'];
    if (!validSpeeds.includes(readingSpeed)) {
      return res.status(400).json({
        success: false,
        message: `阅读速度必须是以下之一：${validSpeeds.join(', ')}`,
      });
    }
  }

  next();
};

/**
 * 验证用户学习计划数据
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.validateUserStudyPlan = (req, res, next) => {
  const { studyPlan } = req.body;

  if (!studyPlan) {
    return res.status(400).json({
      success: false,
      message: '缺少必要的学习计划数据',
    });
  }

  // 验证日程安排
  if (studyPlan.dailySchedule !== undefined) {
    if (!Array.isArray(studyPlan.dailySchedule)) {
      return res.status(400).json({
        success: false,
        message: '日程安排必须是一个数组',
      });
    }

    // 验证每个日程项
    for (const schedule of studyPlan.dailySchedule) {
      // 验证星期几
      if (schedule.day === undefined || typeof schedule.day !== 'number' || 
          schedule.day < 0 || schedule.day > 6 || !Number.isInteger(schedule.day)) {
        return res.status(400).json({
          success: false,
          message: '日程中的星期几必须是0-6之间的整数',
        });
      }

      // 验证时间段
      if (!Array.isArray(schedule.timeSlots)) {
        return res.status(400).json({
          success: false,
          message: '时间段必须是一个数组',
        });
      }

      // 验证每个时间段
      for (const slot of schedule.timeSlots) {
        if (!slot.startTime || !slot.endTime) {
          return res.status(400).json({
            success: false,
            message: '每个时间段必须包含开始时间和结束时间',
          });
        }
      }
    }
  }

  // 验证阅读进度
  if (studyPlan.readingProgress !== undefined) {
    if (typeof studyPlan.readingProgress !== 'number' || 
        studyPlan.readingProgress < 0 || studyPlan.readingProgress > 100) {
      return res.status(400).json({
        success: false,
        message: '阅读进度必须是0-100之间的数字',
      });
    }
  }

  next();
};

/**
 * 验证用户设置数据
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.validateUserSettings = (req, res, next) => {
  const { settings } = req.body;

  if (!settings) {
    return res.status(400).json({
      success: false,
      message: '缺少必要的设置数据',
    });
  }

  // 验证主题
  if (settings.theme !== undefined) {
    const validThemes = ['light', 'dark'];
    if (!validThemes.includes(settings.theme)) {
      return res.status(400).json({
        success: false,
        message: `主题必须是以下之一：${validThemes.join(', ')}`,
      });
    }
  }

  // 验证语言
  if (settings.language !== undefined) {
    const validLanguages = ['zh-CN', 'en-US'];
    if (!validLanguages.includes(settings.language)) {
      return res.status(400).json({
        success: false,
        message: `语言必须是以下之一：${validLanguages.join(', ')}`,
      });
    }
  }

  // 验证通知设置
  if (settings.notifications !== undefined) {
    const { dailyReminder, achievementUnlocked, readingProgress } = settings.notifications;
    
    if (dailyReminder !== undefined && typeof dailyReminder !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: '每日提醒设置必须是布尔值',
      });
    }
    
    if (achievementUnlocked !== undefined && typeof achievementUnlocked !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: '成就解锁通知设置必须是布尔值',
      });
    }
    
    if (readingProgress !== undefined && typeof readingProgress !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: '阅读进度通知设置必须是布尔值',
      });
    }
  }

  next();
};

/**
 * 验证用户统计数据
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.validateUserStatistics = (req, res, next) => {
  const { statistics } = req.body;

  if (!statistics) {
    return res.status(400).json({
      success: false,
      message: '缺少必要的统计数据',
    });
  }

  const { totalReadingTime, totalBooks, totalWords, currentStreak, longestStreak } = statistics;

  // 验证总阅读时间
  if (totalReadingTime !== undefined) {
    if (typeof totalReadingTime !== 'number' || totalReadingTime < 0) {
      return res.status(400).json({
        success: false,
        message: '总阅读时间必须是一个非负数',
      });
    }
  }

  // 验证总书籍数
  if (totalBooks !== undefined) {
    if (typeof totalBooks !== 'number' || totalBooks < 0 || !Number.isInteger(totalBooks)) {
      return res.status(400).json({
        success: false,
        message: '总书籍数必须是一个非负整数',
      });
    }
  }

  // 验证总单词数
  if (totalWords !== undefined) {
    if (typeof totalWords !== 'number' || totalWords < 0 || !Number.isInteger(totalWords)) {
      return res.status(400).json({
        success: false,
        message: '总单词数必须是一个非负整数',
      });
    }
  }

  // 验证当前连续阅读天数
  if (currentStreak !== undefined) {
    if (typeof currentStreak !== 'number' || currentStreak < 0 || !Number.isInteger(currentStreak)) {
      return res.status(400).json({
        success: false,
        message: '当前连续阅读天数必须是一个非负整数',
      });
    }
  }

  // 验证最长连续阅读天数
  if (longestStreak !== undefined) {
    if (typeof longestStreak !== 'number' || longestStreak < 0 || !Number.isInteger(longestStreak)) {
      return res.status(400).json({
        success: false,
        message: '最长连续阅读天数必须是一个非负整数',
      });
    }
  }

  next();
};

/**
 * 验证书籍数据
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.validateBook = (req, res, next) => {
  console.log('=== validateBook 中间件被调用 ===');
  console.log('请求路径:', req.originalUrl);
  console.log('请求方法:', req.method);
  console.log('req.admin:', req.admin ? `管理员存在，ID: ${req.admin._id}, 角色: ${req.admin.role}` : '管理员不存在');
  console.log('请求体数据:', JSON.stringify(req.body));
  
  const bookData = req.body;
  const isUpdate = req.method === 'PUT'; // 判断是否为更新操作
  
  if (isUpdate) {
    console.log('检测到更新操作，将跳过必填字段验证');
  } else {
    console.log('检测到创建操作，将验证所有必填字段');
  }

  // 只在创建操作时验证必填字段
  if (!isUpdate) {
    // 验证标题
    if (!bookData.title || typeof bookData.title !== 'string' || bookData.title.trim() === '') {
      console.log('验证失败: 书籍标题不能为空');
      return res.status(400).json({
        success: false,
        message: '书籍标题不能为空',
      });
    }

    // 验证作者
    if (!bookData.author || typeof bookData.author !== 'string' || bookData.author.trim() === '') {
      console.log('验证失败: 作者不能为空');
      return res.status(400).json({
        success: false,
        message: '作者不能为空',
      });
    }
  }

  // 验证标题（如果提供）
  if (bookData.title !== undefined && (typeof bookData.title !== 'string' || bookData.title.trim() === '')) {
    console.log('验证失败: 提供的书籍标题无效');
    return res.status(400).json({
      success: false,
      message: '书籍标题必须是非空字符串',
    });
  }

  // 验证作者（如果提供）
  if (bookData.author !== undefined && (typeof bookData.author !== 'string' || bookData.author.trim() === '')) {
    console.log('验证失败: 提供的作者无效');
    return res.status(400).json({
      success: false,
      message: '作者必须是非空字符串',
    });
  }

  // 验证封面图片URL（如果提供）
  if ((bookData.coverUrl !== undefined && typeof bookData.coverUrl !== 'string') ||
      (bookData.coverImageUrl !== undefined && typeof bookData.coverImageUrl !== 'string')) {
    return res.status(400).json({
      success: false,
      message: '封面图片URL必须是字符串',
    });
  }

  // 验证描述（如果提供）
  if ((bookData.description !== undefined && typeof bookData.description !== 'string') ||
      (bookData.introduction !== undefined && typeof bookData.introduction !== 'string')) {
    return res.status(400).json({
      success: false,
      message: '描述必须是字符串',
    });
  }

  // 验证类型（如果提供）
  if (bookData.genre !== undefined || bookData.tags !== undefined) {
    const genreArray = bookData.genre || bookData.tags;
    
    if (!Array.isArray(genreArray)) {
      return res.status(400).json({
        success: false,
        message: '类型必须是一个数组',
      });
    }

    // 验证数组中的每个元素是否为字符串
    for (const genre of genreArray) {
      if (typeof genre !== 'string' || genre.trim() === '') {
        return res.status(400).json({
          success: false,
          message: '类型数组中的每个元素都必须是非空字符串',
        });
      }
    }
  }

  // 验证难度级别（如果提供）
  if (bookData.difficultyLevel !== undefined) {
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    if (!validLevels.includes(bookData.difficultyLevel)) {
      return res.status(400).json({
        success: false,
        message: `难度级别必须是以下之一：${validLevels.join(', ')}`,
      });
    }
  }
  
  // 验证语言（如果提供）
  if (bookData.bookLanguage !== undefined) {
    const validLanguages = ['zh', 'en', 'bilingual', 'other'];
    if (!validLanguages.includes(bookData.bookLanguage)) {
      return res.status(400).json({
        success: false,
        message: `语言必须是以下之一：${validLanguages.join(', ')}`,
      });
    }
  } else if (bookData.language !== undefined) {
    const validLanguages = ['zh', 'en', 'bilingual', 'other'];
    if (!validLanguages.includes(bookData.language)) {
      return res.status(400).json({
        success: false,
        message: `语言必须是以下之一：${validLanguages.join(', ')}`,
      });
    }
  }

  // 验证单词数（如果提供）
  if (bookData.wordCount !== undefined) {
    if (typeof bookData.wordCount !== 'number' || bookData.wordCount < 0 || !Number.isInteger(bookData.wordCount)) {
      return res.status(400).json({
        success: false,
        message: '单词数必须是一个非负整数',
      });
    }
  }

  // 验证页数（如果提供）- 支持pageCount和pages
  if (bookData.pageCount !== undefined || bookData.pages !== undefined) {
    const pageValue = bookData.pageCount !== undefined ? bookData.pageCount : bookData.pages;
    
    if (typeof pageValue !== 'number' || pageValue < 0 || !Number.isInteger(pageValue)) {
      return res.status(400).json({
        success: false,
        message: '页数必须是一个非负整数',
      });
    }
  }

  // 验证ISBN（如果提供）
  if (bookData.isbn !== undefined && typeof bookData.isbn !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'ISBN必须是字符串',
    });
  }

  // 验证出版商（如果提供）
  if (bookData.publisher !== undefined && typeof bookData.publisher !== 'string') {
    return res.status(400).json({
      success: false,
      message: '出版商必须是字符串',
    });
  }

  // 验证出版日期（如果提供）
  if (bookData.publishDate !== undefined) {
    const date = new Date(bookData.publishDate);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: '出版日期格式不正确',
      });
    }
  }
  
  // 验证评分（如果提供）
  if (bookData.rating !== undefined) {
    if (typeof bookData.rating !== 'number' || bookData.rating < 0 || bookData.rating > 5) {
      return res.status(400).json({
        success: false,
        message: '评分必须是0到5之间的数字',
      });
    }
  }
  
  // 验证评分人数（如果提供）
  if (bookData.ratingCount !== undefined) {
    if (typeof bookData.ratingCount !== 'number' || bookData.ratingCount < 0 || !Number.isInteger(bookData.ratingCount)) {
      return res.status(400).json({
        success: false,
        message: '评分人数必须是一个非负整数',
      });
    }
  }
  
  // 验证目标读者（如果提供）
  if (bookData.targetReader !== undefined && typeof bookData.targetReader !== 'string') {
    return res.status(400).json({
      success: false,
      message: '目标读者必须是字符串',
    });
  }
  
  // 验证装帧方式（如果提供）
  if (bookData.binding !== undefined && typeof bookData.binding !== 'string') {
    return res.status(400).json({
      success: false,
      message: '装帧方式必须是字符串',
    });
  }

  console.log('书籍数据验证通过');
  next();
};

/**
 * 辅助函数：验证URL格式是否正确
 * @param {string} url - 需要验证的URL
 * @returns {boolean} - 是否是有效的URL
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 验证活动数据
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.validateActivity = (req, res, next) => {
  console.log('=== validateActivity 中间件被调用 ===');
  console.log('请求路径:', req.originalUrl);
  console.log('请求方法:', req.method);
  console.log('请求体数据:', JSON.stringify(req.body));
  
  const activityData = req.body;
  const isUpdate = req.method === 'PUT'; // 判断是否为更新操作
  
  // 只在创建操作时验证必填字段
  if (!isUpdate) {
    // 验证标题
    if (!activityData.title || typeof activityData.title !== 'string' || activityData.title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '活动标题不能为空'
      });
    }
    
    // 验证关联书籍
    if (!activityData.book) {
      return res.status(400).json({
        success: false,
        message: '必须关联一本书籍'
      });
    }
    
    // 验证描述
    if (!activityData.description || typeof activityData.description !== 'string' || activityData.description.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '活动描述不能为空'
      });
    }
    
    // 验证日期
    if (!activityData.startDate) {
      return res.status(400).json({
        success: false,
        message: '开始日期不能为空'
      });
    }
    
    if (!activityData.endDate) {
      return res.status(400).json({
        success: false,
        message: '结束日期不能为空'
      });
    }
  }
  
  // 对于所有操作（创建和更新）的字段验证
  
  // 验证标题（如果提供）
  if (activityData.title !== undefined && (typeof activityData.title !== 'string' || activityData.title.trim() === '')) {
    return res.status(400).json({
      success: false,
      message: '活动标题必须是非空字符串'
    });
  }
  
  // 验证描述（如果提供）
  if (activityData.description !== undefined && (typeof activityData.description !== 'string')) {
    return res.status(400).json({
      success: false,
      message: '活动描述必须是字符串'
    });
  }
  
  // 验证日期格式（如果提供）
  if (activityData.startDate !== undefined) {
    const startDate = new Date(activityData.startDate);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: '开始日期格式不正确'
      });
    }
  }
  
  if (activityData.endDate !== undefined) {
    const endDate = new Date(activityData.endDate);
    if (isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: '结束日期格式不正确'
      });
    }
    
    // 如果同时提供了开始日期和结束日期，检查结束日期是否晚于开始日期
    if (activityData.startDate !== undefined) {
      const startDate = new Date(activityData.startDate);
      if (endDate < startDate) {
        return res.status(400).json({
          success: false,
          message: '结束日期必须晚于或等于开始日期'
        });
      }
    }
  }
  
  // 验证最大参与人数（如果提供）
  if (activityData.maxParticipants !== undefined) {
    if (typeof activityData.maxParticipants !== 'number' || 
        activityData.maxParticipants < 1 || 
        !Number.isInteger(activityData.maxParticipants)) {
      return res.status(400).json({
        success: false,
        message: '最大参与人数必须是大于等于1的整数'
      });
    }
  }
  
  // 验证活动类型（如果提供）
  if (activityData.type !== undefined) {
    if (!['public', 'private'].includes(activityData.type)) {
      return res.status(400).json({
        success: false,
        message: '活动类型必须是 public 或 private'
      });
    }
  }
  
  // 验证活动规则（如果提供）
  if (activityData.rules !== undefined) {
    if (!Array.isArray(activityData.rules)) {
      return res.status(400).json({
        success: false,
        message: '活动规则必须是一个数组'
      });
    }
    
    for (const rule of activityData.rules) {
      if (typeof rule !== 'string') {
        return res.status(400).json({
          success: false,
          message: '活动规则必须是字符串数组'
        });
      }
    }
  }
  
  // 验证打卡要求（如果提供）
  if (activityData.checkInRequirements !== undefined) {
    const { frequency, contentTypes } = activityData.checkInRequirements;
    
    // 验证打卡频率
    if (frequency !== undefined && !['daily', 'flexible'].includes(frequency)) {
      return res.status(400).json({
        success: false,
        message: '打卡频率必须是 daily 或 flexible'
      });
    }
    
    // 验证内容类型
    if (contentTypes !== undefined) {
      if (!Array.isArray(contentTypes)) {
        return res.status(400).json({
          success: false,
          message: '内容类型必须是一个数组'
        });
      }
      
      const validTypes = ['text', 'image', 'audio'];
      for (const type of contentTypes) {
        if (!validTypes.includes(type)) {
          return res.status(400).json({
            success: false,
            message: `内容类型必须是以下之一：${validTypes.join(', ')}`
          });
        }
      }
    }
  }
  
  console.log('活动数据验证通过');
  next();
};

/**
 * 验证打卡记录数据
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.validateCheckIn = (req, res, next) => {
  console.log('=== validateCheckIn 中间件被调用 ===');
  console.log('请求路径:', req.originalUrl);
  console.log('请求方法:', req.method);
  console.log('请求体数据:', JSON.stringify(req.body));
  
  const checkInData = req.body;
  
  // 验证内容
  if (!checkInData.content || typeof checkInData.content !== 'string' || checkInData.content.trim() === '') {
    return res.status(400).json({
      success: false,
      message: '打卡内容不能为空'
    });
  }
  
  // 验证阅读时长（如果提供）
  if (checkInData.readingTime !== undefined) {
    if (typeof checkInData.readingTime !== 'number' || checkInData.readingTime <= 0) {
      return res.status(400).json({
        success: false,
        message: '阅读时长必须是大于0的数字'
      });
    }
  }
  
  // 验证阅读页码或进度（如果提供）
  if (checkInData.pageProgress !== undefined) {
    if (typeof checkInData.pageProgress !== 'number' || 
        checkInData.pageProgress < 0 || 
        !Number.isInteger(checkInData.pageProgress)) {
      return res.status(400).json({
        success: false,
        message: '阅读页码必须是非负整数'
      });
    }
  }
  
  // 验证总结（如果提供）
  if (checkInData.summary !== undefined && typeof checkInData.summary !== 'string') {
    return res.status(400).json({
      success: false,
      message: '总结必须是字符串'
    });
  }
  
  // 验证图片URL（如果提供）
  if (checkInData.imageUrls !== undefined) {
    if (!Array.isArray(checkInData.imageUrls)) {
      return res.status(400).json({
        success: false,
        message: '图片URL必须是一个数组'
      });
    }
    
    for (const url of checkInData.imageUrls) {
      if (typeof url !== 'string' || !isValidUrl(url)) {
        return res.status(400).json({
          success: false,
          message: '图片URL格式不正确'
        });
      }
    }
  }
  
  // 验证心情（如果提供）
  if (checkInData.mood !== undefined && typeof checkInData.mood !== 'string') {
    return res.status(400).json({
      success: false,
      message: '心情必须是字符串'
    });
  }
  
  console.log('打卡数据验证通过');
  next();
}; 