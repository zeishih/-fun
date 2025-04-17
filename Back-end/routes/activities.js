const express = require('express');
const router = express.Router();

// 引入活动控制器方法
const {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  joinActivity,
  leaveActivity,
  createCheckIn,
  getActivityCheckIns,
  getUserCheckIns
} = require('../controllers/activityController');

// 引入中间件
const { protect, authorize } = require('../middleware/auth');
const { validateActivity, validateCheckIn } = require('../middleware/validator');

// 活动路由
// GET /api/activities - 获取活动列表
// POST /api/activities - 创建新活动
router
  .route('/')
  .get(getActivities)
  .post(protect, validateActivity, createActivity);

// GET /api/activities/:id - 获取单个活动详情
// PUT /api/activities/:id - 更新活动信息
// DELETE /api/activities/:id - 删除活动
router
  .route('/:id')
  .get(getActivityById)
  .put(protect, validateActivity, updateActivity)
  .delete(protect, deleteActivity);

// 活动参与路由
// POST /api/activities/:id/join - 加入活动
// DELETE /api/activities/:id/join - 退出活动
router
  .route('/:id/join')
  .post(protect, joinActivity)
  .delete(protect, leaveActivity);

// 打卡记录路由
// GET /api/activities/:id/checkin - 获取活动的所有打卡记录
// POST /api/activities/:id/checkin - 创建打卡记录
router
  .route('/:id/checkin')
  .get(protect, getActivityCheckIns)
  .post(protect, validateCheckIn, createCheckIn);

// 获取用户的打卡记录
// GET /api/activities/:id/user-checkins - 获取当前用户在特定活动中的打卡记录
router.route('/:id/user-checkins').get(protect, getUserCheckIns);

module.exports = router; 