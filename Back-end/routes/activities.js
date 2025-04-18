const express = require('express');
const router = express.Router();

// 引入整个活动控制器
const activityController = require('../controllers/activityController');
// 引入打卡记录控制器
const checkInController = require('../controllers/checkInController');

// 引入中间件
const { protect, authorize } = require('../middleware/auth');
const { validateActivity, validateCheckIn } = require('../middleware/validator');

// 活动路由
// GET /api/activities - 获取活动列表
// POST /api/activities - 创建新活动
router
  .route('/')
  .get(activityController.getActivities)
  .post(protect, validateActivity, activityController.createActivity);

// GET /api/activities/:id - 获取单个活动详情
// PUT /api/activities/:id - 更新活动信息
router
  .route('/:id')
  .get(activityController.getActivityById)
  .put(protect, validateActivity, activityController.updateActivity);

// 取消活动路由
// PUT /api/activities/:id/cancel - 取消活动
router.route('/:id/cancel').put(protect, activityController.cancelActivity);

// 活动参与路由
// POST /api/activities/:id/join - 加入活动
// DELETE /api/activities/:id/join - 退出活动
router
  .route('/:id/join')
  .post(protect, activityController.joinActivity)
  .delete(protect, activityController.quitActivity);

// 打卡记录路由
// GET /api/activities/:id/checkin - 获取活动的所有打卡记录
// POST /api/activities/:id/checkin - 创建打卡记录
router
  .route('/:id/checkin')
  .get(protect, checkInController.getActivityCheckIns)
  .post(protect, validateCheckIn, checkInController.createCheckIn);

// 获取用户的打卡记录
// GET /api/activities/:id/user-checkins - 获取当前用户在特定活动中的打卡记录
router.route('/:id/user-checkins').get(protect, activityController.getUserCheckIns);

module.exports = router; 