const CheckInRecord = require('../models/CheckInRecord');
const Activity = require('../models/Activity');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * 创建打卡记录
 * @route   POST /api/activities/:id/checkin
 * @access  Private
 */
exports.createCheckIn = asyncHandler(async (req, res, next) => {
  const activityId = req.params.id;
  const { content, images, audioUrl, location, readingProgress } = req.body;
  
  // 验证活动是否存在
  const activity = await Activity.findById(activityId);
  if (!activity) {
    return next(new ErrorResponse(`未找到ID为 ${activityId} 的活动`, 404));
  }
  
  // 验证用户是否为活动参与者
  const isParticipant = activity.participants.some(
    p => p.userId.toString() === req.user._id.toString()
  );
  
  if (!isParticipant) {
    return next(new ErrorResponse('您不是该活动的参与者，无法打卡', 403));
  }
  
  // 验证活动状态
  if (activity.status !== 'ongoing') {
    return next(new ErrorResponse('只有进行中的活动才能打卡', 400));
  }
  
  // 检查打卡时间限制（如果有）
  if (activity.checkInRequirements.frequency === 'daily' && 
      activity.checkInRequirements.startTime && 
      activity.checkInRequirements.endTime) {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (currentTime < activity.checkInRequirements.startTime || currentTime > activity.checkInRequirements.endTime) {
      return next(new ErrorResponse(`当前不在打卡时间范围内 (${activity.checkInRequirements.startTime} - ${activity.checkInRequirements.endTime})`, 400));
    }
  }
  
  // 检查今日是否已经打卡（如果是每日打卡的活动）
  if (activity.checkInRequirements.frequency === 'daily') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingCheckIn = await CheckInRecord.findOne({
      activity: activityId,
      user: req.user._id,
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    if (existingCheckIn) {
      return next(new ErrorResponse('今天已经打过卡了', 400));
    }
  }
  
  // 计算打卡天数
  const startDate = new Date(activity.startDate);
  startDate.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(today - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const dayNumber = Math.max(1, diffDays);
  
  // 创建打卡记录
  const checkInData = {
    activity: activityId,
    user: req.user._id,
    content,
    dayNumber,
    readingProgress: readingProgress || 0
  };
  
  // 添加可选字段
  if (images && Array.isArray(images)) {
    checkInData.images = images;
  }
  
  if (audioUrl) {
    checkInData.audioUrl = audioUrl;
  }
  
  if (location) {
    checkInData.location = location;
  }
  
  const checkIn = await CheckInRecord.create(checkInData);
  
  // 更新活动的打卡记录引用
  await Activity.findByIdAndUpdate(activityId, {
    $push: { checkInRecords: checkIn._id },
    $inc: { 'statistics.totalCheckIns': 1 }
  });
  
  // 更新活动的统计数据
  const uniqueUsers = await CheckInRecord.distinct('user', { activity: activityId });
  await Activity.findByIdAndUpdate(activityId, {
    'statistics.activeParticipants': uniqueUsers.length
  });
  
  // 计算并更新完成率
  const totalDays = Math.ceil(Math.abs(new Date(activity.endDate) - new Date(activity.startDate)) / (1000 * 60 * 60 * 24));
  const completionRate = Math.min(100, Math.round((activity.statistics.totalCheckIns / (activity.participants.length * totalDays)) * 100));
  
  await Activity.findByIdAndUpdate(activityId, {
    'statistics.completionRate': completionRate
  });
  
  // 更新用户统计数据
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { 'statistics.totalReadingTime': 30 } // 假设每次打卡增加30分钟阅读时间
  });
  
  res.status(201).json({
    success: true,
    data: checkIn
  });
});

/**
 * 获取活动的打卡记录
 * @route   GET /api/activities/:id/checkins
 * @access  Public/Private (根据活动类型)
 */
exports.getActivityCheckIns = asyncHandler(async (req, res, next) => {
  const activityId = req.params.id;
  
  // 验证活动是否存在
  const activity = await Activity.findById(activityId);
  if (!activity) {
    return next(new ErrorResponse(`未找到ID为 ${activityId} 的活动`, 404));
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
      return next(new ErrorResponse('无权访问此私密活动的打卡记录', 403));
    }
  }
  
  // 分页
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  // 筛选条件
  const query = {
    activity: activityId,
    isDeleted: false
  };
  
  // 按用户筛选
  if (req.query.user) {
    query.user = req.query.user;
  }
  
  // 按日期范围筛选
  if (req.query.startDate) {
    query.createdAt = { $gte: new Date(req.query.startDate) };
  }
  
  if (req.query.endDate) {
    if (!query.createdAt) query.createdAt = {};
    query.createdAt.$lte = new Date(req.query.endDate);
  }
  
  // 按日期筛选
  if (req.query.date) {
    const date = new Date(req.query.date);
    date.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    query.createdAt = { $gte: date, $lt: nextDay };
  }
  
  // 执行查询
  const total = await CheckInRecord.countDocuments(query);
  const checkIns = await CheckInRecord.find(query)
    .populate('user', 'nickname avatarUrl')
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
    count: checkIns.length,
    pagination,
    total,
    data: checkIns
  });
});

/**
 * 获取用户打卡记录
 * @route   GET /api/users/:id/checkins
 * @access  Public/Private
 */
exports.getUserCheckIns = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  
  // 验证用户是否存在
  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    return next(new ErrorResponse(`未找到ID为 ${userId} 的用户`, 404));
  }
  
  // 分页
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  // 查询条件
  const query = {
    user: userId,
    isDeleted: false
  };
  
  // 若不是本人或管理员查询，则只返回公开活动的打卡
  if (!req.user || (req.user._id.toString() !== userId && req.user.role !== 'admin')) {
    const publicActivities = await Activity.find({ type: 'public', approvalStatus: 'approved' }).select('_id');
    const publicActivityIds = publicActivities.map(a => a._id);
    query.activity = { $in: publicActivityIds };
  }
  
  // 活动筛选
  if (req.query.activity) {
    query.activity = req.query.activity;
  }
  
  // 执行查询
  const total = await CheckInRecord.countDocuments(query);
  const checkIns = await CheckInRecord.find(query)
    .populate('activity', 'title')
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
    count: checkIns.length,
    pagination,
    total,
    data: checkIns
  });
});

/**
 * 点赞打卡记录
 * @route   POST /api/checkins/:id/like
 * @access  Private
 */
exports.likeCheckIn = asyncHandler(async (req, res, next) => {
  const checkInId = req.params.id;
  
  // 验证打卡记录是否存在
  const checkIn = await CheckInRecord.findById(checkInId);
  if (!checkIn) {
    return next(new ErrorResponse(`未找到ID为 ${checkInId} 的打卡记录`, 404));
  }
  
  // 检查是否已经点赞
  const alreadyLiked = checkIn.likedBy.some(id => id.toString() === req.user._id.toString());
  
  if (alreadyLiked) {
    // 取消点赞
    checkIn.likedBy = checkIn.likedBy.filter(id => id.toString() !== req.user._id.toString());
  } else {
    // 添加点赞
    checkIn.likedBy.push(req.user._id);
  }
  
  await checkIn.save();
  
  res.status(200).json({
    success: true,
    data: {
      liked: !alreadyLiked,
      likeCount: checkIn.likedBy.length
    }
  });
});

/**
 * 评论打卡记录
 * @route   POST /api/checkins/:id/comment
 * @access  Private
 */
exports.commentCheckIn = asyncHandler(async (req, res, next) => {
  const checkInId = req.params.id;
  const { content } = req.body;
  
  if (!content || content.trim() === '') {
    return next(new ErrorResponse('评论内容不能为空', 400));
  }
  
  // 验证打卡记录是否存在
  const checkIn = await CheckInRecord.findById(checkInId);
  if (!checkIn) {
    return next(new ErrorResponse(`未找到ID为 ${checkInId} 的打卡记录`, 404));
  }
  
  // 验证打卡记录所属活动
  const activity = await Activity.findById(checkIn.activity);
  if (!activity) {
    return next(new ErrorResponse('此打卡记录关联的活动不存在', 404));
  }
  
  // 检查活动状态
  if (activity.status === 'cancelled') {
    return next(new ErrorResponse('已取消的活动不允许评论', 400));
  }
  
  // 添加评论
  const newComment = {
    user: req.user._id,
    nickname: req.user.nickname || '用户' + req.user._id.toString().substr(-4),
    avatarUrl: req.user.avatarUrl || '',
    content,
    createdAt: new Date()
  };
  
  checkIn.comments.push(newComment);
  await checkIn.save();
  
  res.status(201).json({
    success: true,
    data: newComment
  });
});

/**
 * 删除打卡记录（用户端）
 * @route   DELETE /api/checkins/:id
 * @access  Private
 */
exports.deleteCheckIn = asyncHandler(async (req, res, next) => {
  const checkIn = await CheckInRecord.findById(req.params.id);
  
  if (!checkIn) {
    return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的打卡记录`, 404));
  }
  
  // 验证用户是否为打卡记录创建者
  if (checkIn.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ErrorResponse('无权删除此打卡记录', 403));
  }
  
  // 使用软删除
  checkIn.isDeleted = true;
  checkIn.deletedReason = '用户删除';
  await checkIn.save();
  
  // 更新活动统计数据
  await Activity.findByIdAndUpdate(checkIn.activity, {
    $inc: { 'statistics.totalCheckIns': -1 }
  });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// 管理员API部分
/**
 * 获取所有打卡记录（管理员用）
 * @route   GET /api/admin/checkins
 * @access  Private/Admin
 */
exports.getAllCheckIns = asyncHandler(async (req, res, next) => {
  // 构建查询条件
  const query = {};
  
  // 活动筛选
  if (req.query.activity) {
    query.activity = req.query.activity;
  }
  
  // 用户筛选
  if (req.query.user) {
    query.user = req.query.user;
  }
  
  // 时间范围筛选
  if (req.query.startDate) {
    query.createdAt = { $gte: new Date(req.query.startDate) };
  }
  
  if (req.query.endDate) {
    if (!query.createdAt) query.createdAt = {};
    query.createdAt.$lte = new Date(req.query.endDate);
  }
  
  // 删除状态筛选
  if (req.query.isDeleted) {
    query.isDeleted = req.query.isDeleted === 'true';
  }
  
  // 分页
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  // 执行查询
  const total = await CheckInRecord.countDocuments(query);
  const checkIns = await CheckInRecord.find(query)
    .populate('user', 'nickname avatarUrl')
    .populate('activity', 'title')
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
    count: checkIns.length,
    pagination,
    total,
    data: checkIns
  });
});

/**
 * 管理员删除打卡记录
 * @route   DELETE /api/admin/checkins/:id
 * @access  Private/Admin
 */
exports.adminDeleteCheckIn = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  
  const checkIn = await CheckInRecord.findById(req.params.id);
  
  if (!checkIn) {
    return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的打卡记录`, 404));
  }
  
  // 使用软删除
  checkIn.isDeleted = true;
  checkIn.deletedReason = reason || '管理员删除';
  await checkIn.save();
  
  // 更新活动统计数据
  await Activity.findByIdAndUpdate(checkIn.activity, {
    $inc: { 'statistics.totalCheckIns': -1 }
  });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * 管理员删除评论
 * @route   DELETE /api/admin/checkins/:id/comments/:commentId
 * @access  Private/Admin
 */
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  const checkInId = req.params.id;
  const commentId = req.params.commentId;
  
  const checkIn = await CheckInRecord.findById(checkInId);
  
  if (!checkIn) {
    return next(new ErrorResponse(`未找到ID为 ${checkInId} 的打卡记录`, 404));
  }
  
  // 查找评论
  const commentIndex = checkIn.comments.findIndex(c => c._id.toString() === commentId);
  
  if (commentIndex === -1) {
    return next(new ErrorResponse(`未找到ID为 ${commentId} 的评论`, 404));
  }
  
  // 删除评论
  checkIn.comments.splice(commentIndex, 1);
  await checkIn.save();
  
  res.status(200).json({
    success: true,
    data: {}
  });
}); 