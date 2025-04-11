/**
 * 用户数据模型
 * @module models/User
 */
const mongoose = require('mongoose');

/**
 * 用户模式定义
 * @type {mongoose.Schema}
 */
const userSchema = new mongoose.Schema(
  {
    // 微信用户唯一标识
    openid: {
      type: String,
      required: true,
      unique: true,
    },
    // 用户角色
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // 用户昵称
    nickname: {
      type: String,
      default: '',
    },
    // 用户头像URL
    avatarUrl: {
      type: String,
      default: '',
    },
    // 用户学习统计数据
    statistics: {
      totalReadingTime: { type: Number, default: 0 }, // 总阅读时长(分钟)
      totalBooks: { type: Number, default: 0 }, // 总阅读书籍数
      totalWords: { type: Number, default: 0 }, // 总阅读单词数
      currentStreak: { type: Number, default: 0 }, // 当前连续阅读天数
      longestStreak: { type: Number, default: 0 }, // 最长连续阅读天数
      lastReadingDate: { type: Date }, // 最后阅读日期
    },
    // 学习目标
    goals: {
      dailyReadingTime: { type: Number, default: 30 }, // 每日阅读目标(分钟)
      dailyWords: { type: Number, default: 100 }, // 每日单词目标
      weeklyBooks: { type: Number, default: 1 }, // 每周阅读书籍目标
    },
    // 阅读偏好
    preferences: {
      difficultyLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
      favoriteGenres: [{ type: String }], // 喜欢的阅读类型
      readingSpeed: { type: String, enum: ['slow', 'medium', 'fast'], default: 'medium' },
    },
    // 学习计划
    studyPlan: {
      dailySchedule: [{
        day: { type: Number, min: 0, max: 6 }, // 0-6 表示周日到周六
        timeSlots: [{
          startTime: String,
          endTime: String,
        }],
      }],
      currentBook: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
      readingProgress: { type: Number, default: 0 }, // 当前书籍阅读进度(0-100)
    },
    // 成就系统
    achievements: [{
      id: String, // 成就ID
      name: String, // 成就名称
      description: String, // 成就描述
      unlockedAt: Date, // 解锁时间
      progress: { type: Number, default: 0 }, // 成就进度
    }],
    // 用户设置
    settings: {
      notifications: {
        dailyReminder: { type: Boolean, default: true },
        achievementUnlocked: { type: Boolean, default: true },
        readingProgress: { type: Boolean, default: true },
      },
      language: { type: String, default: 'zh-CN' },
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    },
  },
  {
    // 自动生成创建时间和更新时间字段
    timestamps: true,
  }
);

// 创建并导出模型
const User = mongoose.model('User', userSchema);

module.exports = User; 