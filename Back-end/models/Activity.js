const mongoose = require('mongoose');

/**
 * 活动模型
 */
const activitySchema = new mongoose.Schema({
  // 基本信息
  title: { 
    type: String, 
    required: [true, '活动标题不能为空'], 
    trim: true 
  },
  book: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book', 
    required: [true, '必须关联一本书籍'] 
  },
  description: { 
    type: String, 
    required: [true, '活动描述不能为空'] 
  },
  coverUrl: { 
    type: String, 
    default: '' 
  },
  
  // 时间信息
  startDate: { 
    type: Date, 
    required: [true, '开始日期不能为空'] 
  },
  endDate: { 
    type: Date, 
    required: [true, '结束日期不能为空'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: '结束日期必须晚于或等于开始日期'
    }
  },
  
  // 参与者信息
  maxParticipants: { 
    type: Number, 
    default: 20 
  },
  participants: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    nickname: { type: String },
    avatarUrl: { type: String },
    joinTime: { 
      type: Date, 
      default: Date.now 
    }
  }],
  
  // 创建者信息
  creator: {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    nickname: { 
      type: String, 
      required: true 
    },
    avatarUrl: { type: String }
  },
  
  // 活动类型与规则
  type: { 
    type: String, 
    enum: ['public', 'private'], 
    default: 'public' 
  },
  rules: [{ type: String }],
  
  // 打卡要求
  checkInRequirements: {
    frequency: { 
      type: String, 
      enum: ['daily', 'flexible'], 
      default: 'flexible' 
    },
    startTime: { type: String },
    endTime: { type: String },
    contentTypes: [{
      type: String, 
      enum: ['text', 'image', 'audio'],
      default: 'text'
    }]
  },
  
  // 打卡记录引用
  checkInRecords: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CheckInRecord' 
  }],
  
  // 活动状态
  status: { 
    type: String, 
    enum: ['recruiting', 'ongoing', 'completed', 'cancelled'], 
    default: 'recruiting' 
  },
  
  // 审核状态
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvalComment: { type: String },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  approvalDate: { type: Date },
  
  // 邀请码 (用于私密活动)
  inviteCode: { 
    type: String,
    index: true
  },
  
  // 统计数据
  statistics: {
    totalCheckIns: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    activeParticipants: { type: Number, default: 0 },
  }
}, {
  timestamps: true
});

// 索引设置
activitySchema.index({ title: 'text', description: 'text' });
activitySchema.index({ book: 1 });
activitySchema.index({ status: 1, approvalStatus: 1 });
activitySchema.index({ 'creator.userId': 1 });
activitySchema.index({ 'participants.userId': 1 });

// 自动生成邀请码
activitySchema.pre('save', async function(next) {
  if (this.isNew && this.type === 'private' && !this.inviteCode) {
    this.inviteCode = generateInviteCode();
  }
  next();
});

// 确保虚拟属性在toJSON时可见
activitySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// 辅助函数：生成6位邀请码
function generateInviteCode() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  return code;
}

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity; 