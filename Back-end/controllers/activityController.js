const Activity = require('../models/Activity');
const Book = require('../models/Book');
const User = require('../models/User');
const CheckIn = require('../models/CheckInRecord');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * 创建活动
 * @route   POST /api/activities
 * @access  Private
 */
exports.createActivity = asyncHandler(async (req, res, next) => {
  const { title, book, startDate, endDate, description, rules, maxParticipants, type, checkInRequirements } = req.body;

  // 验证关联的书籍是否存在
  const bookExists = await Book.findById(book);
  if (!bookExists) {
    return next(new ErrorResponse(`未找到ID为 ${book} 的书籍`, 404));
  }

  // 构建活动数据
  const activityData = {
    title,
    book,
    startDate,
    endDate,
    description,
    maxParticipants,
    type,
    creator: {
      userId: req.user._id,
      nickname: req.user.nickname || '用户' + req.user._id.toString().substr(-4),
      avatarUrl: req.user.avatarUrl || ''
    },
    coverUrl: bookExists.coverUrl || '', // 默认使用书籍封面
    participants: [{
      userId: req.user._id,
      nickname: req.user.nickname || '用户' + req.user._id.toString().substr(-4),
      avatarUrl: req.user.avatarUrl || '',
      joinTime: new Date()
    }]
  };

  // 处理活动规则
  if (rules && Array.isArray(rules)) {
    activityData.rules = rules.filter(rule => rule.trim() !== '');
  }

  // 处理打卡要求
  if (checkInRequirements) {
    activityData.checkInRequirements = {
      frequency: checkInRequirements.frequency || 'flexible',
      startTime: checkInRequirements.startTime || '',
      endTime: checkInRequirements.endTime || '',
      contentTypes: checkInRequirements.contentTypes || ['text']
    };
  }

  // 创建活动
  const activity = await Activity.create(activityData);

  res.status(201).json({
    success: true,
    data: activity
  });
});

/**
 * 获取活动列表
 * @route   GET /api/activities
 * @access  Public
 */
exports.getActivities = asyncHandler(async (req, res, next) => {
  // 构建基本查询条件 - 默认只返回已审核通过的公开活动
  const query = {
    approvalStatus: 'approved',
    type: 'public'
  };

  // 如果用户登录，允许查看包含用户参与的私密活动
  if (req.user) {
    query.$or = [
      { type: 'public', approvalStatus: 'approved' },
      { 'participants.userId': req.user._id }
    ];
    delete query.approvalStatus;
    delete query.type;
  }

  // 搜索条件
  if (req.query.search) {
    // 使用文本搜索
    query.$text = { $search: req.query.search };
  }

  // 按状态筛选
  if (req.query.status && ['recruiting', 'ongoing', 'completed'].includes(req.query.status)) {
    query.status = req.query.status;
  }

  // 按书籍筛选
  if (req.query.book) {
    query.book = req.query.book;
  }

  // 分页
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // 排序方式 - 默认按创建时间降序
  const sortBy = req.query.sort || '-createdAt';

  // 执行查询
  const total = await Activity.countDocuments(query);
  const activities = await Activity.find(query)
    .populate('book', 'title author coverUrl')
    .skip(startIndex)
    .limit(limit)
    .sort(sortBy);

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
    count: activities.length,
    pagination,
    total,
    data: activities
  });
});

/**
 * 获取活动详情
 * @route   GET /api/activities/:id
 * @access  Public/Private (根据活动类型)
 */
exports.getActivityById = asyncHandler(async (req, res, next) => {
  const activity = await Activity.findById(req.params.id)
    .populate('book', 'title author coverUrl description');

  if (!activity) {
    return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的活动`, 404));
  }

  // 检查私密活动访问权限
  if (activity.type === 'private') {
    // 验证邀请码或检查用户是否为参与者/创建者
    const { inviteCode } = req.query;
    const isParticipant = req.user && (
      activity.participants.some(p => p.userId.toString() === req.user._id.toString()) ||
      activity.creator.userId.toString() === req.user._id.toString()
    );

    if (!isParticipant && (!inviteCode || inviteCode !== activity.inviteCode)) {
      return next(new ErrorResponse('无权访问此私密活动，请提供有效的邀请码', 403));
    }
  }

  // 检查审核状态
  if (activity.approvalStatus !== 'approved') {
    // 如果活动未审核通过，仅创建者和管理员可以查看
    const isCreator = req.user && activity.creator.userId.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isCreator && !isAdmin) {
      return next(new ErrorResponse('此活动尚未通过审核，暂不可查看', 403));
    }
  }

  // 获取最新的5条打卡记录
  let recentCheckIns = [];
  try {
    recentCheckIns = await CheckIn.find({ 
      activity: activity._id,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'nickname avatarUrl');
  } catch (err) {
    console.log('获取打卡记录失败:', err.message);
  }

  res.status(200).json({
    success: true,
    data: {
      activity,
      recentCheckIns
    }
  });
});

/**
 * 更新活动
 * @route   PUT /api/activities/:id
 * @access  Private (仅创建者)
 */
exports.updateActivity = asyncHandler(async (req, res, next) => {
  let activity = await Activity.findById(req.params.id);

  if (!activity) {
    return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的活动`, 404));
  }

  // 验证用户是否为活动创建者
  if (activity.creator.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ErrorResponse('无权更新此活动', 403));
  }

  // 活动开始后的限制更新字段
  const now = new Date();
  const isActivityStarted = new Date(activity.startDate) <= now;
  const updateData = { ...req.body };

  if (isActivityStarted) {
    // 活动开始后，某些字段不允许修改
    const restrictedFields = ['startDate', 'book', 'type'];
    restrictedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        delete updateData[field];
      }
    });
  }

  // 更新会将审核状态重置为待审核（管理员除外）
  if (req.user.role !== 'admin') {
    updateData.approvalStatus = 'pending';
    updateData.approvalComment = '';
    updateData.approvedBy = null;
    updateData.approvalDate = null;
  }

  // 更新活动
  activity = await Activity.findByIdAndUpdate(
    req.params.id, 
    updateData, 
    { new: true, runValidators: true }
  ).populate('book', 'title author coverUrl');

  res.status(200).json({
    success: true,
    data: activity
  });
});

/**
 * 取消活动
 * @route   PUT /api/activities/:id/cancel
 * @access  Private (仅创建者)
 */
exports.cancelActivity = asyncHandler(async (req, res, next) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的活动`, 404));
  }

  // 验证用户是否为活动创建者或管理员
  if (activity.creator.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ErrorResponse('无权取消此活动', 403));
  }

  // 已完成的活动不能取消
  if (activity.status === 'completed') {
    return next(new ErrorResponse('已完成的活动不能取消', 400));
  }

  // 更新活动状态为取消
  await Activity.findByIdAndUpdate(
    req.params.id,
    { status: 'cancelled' },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: { message: '活动已成功取消' }
  });
});

/**
 * 加入活动
 * @route   POST /api/activities/:id/join
 * @access  Private
 */
exports.joinActivity = asyncHandler(async (req, res, next) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的活动`, 404));
  }

  // 检查活动状态
  if (activity.status !== 'recruiting' && activity.status !== 'ongoing') {
    return next(new ErrorResponse(`该活动不在可加入状态`, 400));
  }

  // 验证审核状态
  if (activity.approvalStatus !== 'approved') {
    return next(new ErrorResponse(`该活动尚未通过审核，不能加入`, 400));
  }

  // 检查是否已经是参与者
  const isParticipant = activity.participants.some(
    p => p.userId.toString() === req.user._id.toString()
  );

  if (isParticipant) {
    return next(new ErrorResponse('您已经是该活动的参与者', 400));
  }

  // 检查人数限制
  if (activity.maxParticipants > 0 && activity.participants.length >= activity.maxParticipants) {
    return next(new ErrorResponse('该活动参与人数已达上限', 400));
  }

  // 如果是私密活动，检查邀请码
  if (activity.type === 'private') {
    const { inviteCode } = req.body;
    if (!inviteCode || inviteCode !== activity.inviteCode) {
      return next(new ErrorResponse('邀请码无效，无法加入私密活动', 403));
    }
  }

  // 添加用户到参与者列表
  const newParticipant = {
    userId: req.user._id,
    nickname: req.user.nickname || '用户' + req.user._id.toString().substr(-4),
    avatarUrl: req.user.avatarUrl || '',
    joinTime: new Date()
  };

  activity.participants.push(newParticipant);
  await activity.save();

  res.status(200).json({
    success: true,
    data: { message: '成功加入活动' }
  });
});

/**
 * 退出活动
 * @route   DELETE /api/activities/:id/join
 * @access  Private
 */
exports.quitActivity = asyncHandler(async (req, res, next) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的活动`, 404));
  }

  // 创建者不能退出活动
  if (activity.creator.userId.toString() === req.user._id.toString()) {
    return next(new ErrorResponse('活动创建者不能退出活动', 400));
  }

  // 检查用户是否为参与者
  const participantIndex = activity.participants.findIndex(
    p => p.userId.toString() === req.user._id.toString()
  );

  if (participantIndex === -1) {
    return next(new ErrorResponse('您不是该活动的参与者', 400));
  }

  // 已完成的活动不能退出
  if (activity.status === 'completed') {
    return next(new ErrorResponse('已完成的活动不能退出', 400));
  }

  // 移除参与者
  activity.participants.splice(participantIndex, 1);
  await activity.save();

  res.status(200).json({
    success: true,
    data: { message: '成功退出活动' }
  });
});

/**
 * 获取我创建的活动
 * @route   GET /api/activities/created
 * @access  Private
 */
exports.getCreatedActivities = asyncHandler(async (req, res, next) => {
  // 构建查询条件
  const query = {
    'creator.userId': req.user._id
  };

  // 状态筛选
  if (req.query.status) {
    query.status = req.query.status;
  }

  // 审核状态筛选
  if (req.query.approvalStatus) {
    query.approvalStatus = req.query.approvalStatus;
  }

  // 分页
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // 执行查询
  const total = await Activity.countDocuments(query);
  const activities = await Activity.find(query)
    .populate('book', 'title author coverUrl')
    .skip(startIndex)
    .limit(limit)
    .sort('-createdAt');

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
    count: activities.length,
    pagination,
    total,
    data: activities
  });
});

/**
 * 获取我参与的活动
 * @route   GET /api/activities/joined
 * @access  Private
 */
exports.getJoinedActivities = asyncHandler(async (req, res, next) => {
  // 构建查询条件
  const query = {
    'participants.userId': req.user._id,
    // 排除自己创建的活动
    'creator.userId': { $ne: req.user._id }
  };

  // 状态筛选
  if (req.query.status) {
    query.status = req.query.status;
  }

  // 分页
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // 执行查询
  const total = await Activity.countDocuments(query);
  const activities = await Activity.find(query)
    .populate('book', 'title author coverUrl')
    .skip(startIndex)
    .limit(limit)
    .sort('-createdAt');

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
    count: activities.length,
    pagination,
    total,
    data: activities
  });
});

// 管理员API部分
/**
 * 审核活动
 * @route   PUT /api/admin/activities/:id/approve
 * @access  Private/Admin
 */
exports.approveActivity = asyncHandler(async (req, res, next) => {
  const { approvalStatus, comment } = req.body;

  if (!['approved', 'rejected'].includes(approvalStatus)) {
    return next(new ErrorResponse('无效的审核状态', 400));
  }

  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的活动`, 404));
  }

  // 更新审核状态
  activity.approvalStatus = approvalStatus;
  activity.approvalComment = comment || '';
  activity.approvedBy = req.admin._id;
  activity.approvalDate = new Date();

  await activity.save();

  res.status(200).json({
    success: true,
    data: activity
  });
});

/**
 * 获取所有活动（管理员用）
 * @route   GET /api/admin/activities
 * @access  Private/Admin
 */
exports.getAllActivities = asyncHandler(async (req, res, next) => {
  // 构建查询条件
  const query = {};

  // 状态筛选
  if (req.query.status) {
    query.status = req.query.status;
  }

  // 审核状态筛选
  if (req.query.approvalStatus) {
    query.approvalStatus = req.query.approvalStatus;
  }

  // 搜索功能
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // 按创建者查询
  if (req.query.creator) {
    query['creator.userId'] = req.query.creator;
  }

  // 分页
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // 排序
  const sortBy = req.query.sort || '-createdAt';

  // 执行查询
  const total = await Activity.countDocuments(query);
  const activities = await Activity.find(query)
    .populate('book', 'title author coverUrl')
    .populate('approvedBy', 'nickname')
    .skip(startIndex)
    .limit(limit)
    .sort(sortBy);

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
    count: activities.length,
    pagination,
    total,
    data: activities
  });
});

/**
 * 获取活动统计数据
 * @route   GET /api/admin/activities/statistics
 * @access  Private/Admin
 */
exports.getActivityStatistics = asyncHandler(async (req, res, next) => {
  // 获取活动总数
  const totalActivities = await Activity.countDocuments();

  // 按状态分组统计
  const statusStats = await Activity.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // 按审核状态分组统计
  const approvalStats = await Activity.aggregate([
    { $group: { _id: '$approvalStatus', count: { $sum: 1 } } }
  ]);

  // 按月份统计创建的活动数
  const monthlyStats = await Activity.aggregate([
    { 
      $group: { 
        _id: { 
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' } 
        }, 
        count: { $sum: 1 } 
      } 
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  // 参与人数最多的活动（Top 5）
  const topActivities = await Activity.aggregate([
    { $match: { approvalStatus: 'approved' } },
    { $addFields: { participantCount: { $size: '$participants' } } },
    { $sort: { participantCount: -1 } },
    { $limit: 5 },
    { 
      $project: { 
        _id: 1, 
        title: 1, 
        participantCount: 1,
        createdAt: 1,
        status: 1
      } 
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalActivities,
      statusStats,
      approvalStats,
      monthlyStats,
      topActivities
    }
  });
});

// 辅助函数：更新活动状态
exports.updateActivityStatuses = asyncHandler(async () => {
  const now = new Date();
  
  // 更新招募中->进行中
  await Activity.updateMany(
    {
      status: 'recruiting',
      startDate: { $lte: now },
      approvalStatus: 'approved'
    },
    { status: 'ongoing' }
  );
  
  // 更新进行中->已完成
  await Activity.updateMany(
    {
      status: 'ongoing',
      endDate: { $lte: now }
    },
    { status: 'completed' }
  );
  
  console.log('活动状态更新完成');
});

/**
 * @desc    获取用户在特定活动中的打卡记录
 * @route   GET /api/activities/:id/user-checkins
 * @access  Private
 */
exports.getUserCheckIns = asyncHandler(async (req, res) => {
  const activityId = req.params.id;
  const userId = req.user._id;

  // 检查活动是否存在
  const activity = await Activity.findById(activityId);
  if (!activity) {
    return res.status(404).json({
      success: false,
      error: '找不到该活动'
    });
  }

  // 获取用户在该活动中的所有打卡记录
  const checkIns = await CheckIn.find({
    activity: activityId,
    user: userId
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: checkIns.length,
    data: checkIns
  });
}); 