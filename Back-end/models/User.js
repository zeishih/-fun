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
    }
  },
  {
    // 自动生成创建时间和更新时间字段
    timestamps: true,
  }
);

// 创建并导出模型
const User = mongoose.model('User', userSchema);

module.exports = User; 