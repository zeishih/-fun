const mongoose = require('mongoose');

/**
 * 打卡记录模型
 */
const checkInRecordSchema = new mongoose.Schema({
  activity: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Activity', 
    required: true,
    index: true
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  content: { 
    type: String, 
    required: [true, '打卡内容不能为空'] 
  },
  images: [{ type: String }],  // 图片URL数组
  audioUrl: { type: String },  // 音频URL
  location: {  // 打卡位置（可选）
    latitude: Number,
    longitude: Number,
    name: String
  },
  likedBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  comments: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    nickname: String,
    avatarUrl: String,
    content: { 
      type: String,
      required: [true, '评论内容不能为空']
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  readingProgress: { 
    type: Number,
    min: 0,
    max: 100
  },  // 阅读进度（百分比）
  dayNumber: { 
    type: Number,
    min: 1
  },  // 打卡天数（从活动开始计算）
  isDeleted: {
    type: Boolean,
    default: false
  }, // 软删除标志
  deletedReason: {
    type: String
  }, // 删除原因
}, {
  timestamps: true
});

// 虚拟属性: 点赞数
checkInRecordSchema.virtual('likeCount').get(function() {
  return this.likedBy.length;
});

// 虚拟属性: 评论数
checkInRecordSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// 确保虚拟属性在toJSON时可见
checkInRecordSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    // 如果记录被删除，隐藏内容
    if (ret.isDeleted) {
      ret.content = '该内容已被删除';
      ret.images = [];
      ret.audioUrl = '';
    }
    return ret;
  }
});

// 索引设置
checkInRecordSchema.index({ activity: 1, user: 1, createdAt: 1 });
checkInRecordSchema.index({ createdAt: -1 });

const CheckInRecord = mongoose.model('CheckInRecord', checkInRecordSchema);

module.exports = CheckInRecord; 