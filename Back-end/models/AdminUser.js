/**
 * 管理员用户数据模型
 * @module models/AdminUser
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * 管理员用户模式定义
 * @type {mongoose.Schema}
 */
const adminUserSchema = new mongoose.Schema(
  {
    // 用户名
    username: {
      type: String,
      required: [true, '请输入用户名'],
      unique: true,
      trim: true,
      maxlength: [50, '用户名不能超过50个字符']
    },
    // 密码
    password: {
      type: String,
      required: [true, '请输入密码'],
      minlength: [6, '密码至少需要6个字符'],
      select: false // 查询时不返回密码
    },
    // 姓名
    name: {
      type: String,
      required: [true, '请输入姓名']
    },
    // 头像
    avatar: {
      type: String,
      default: ''
    },
    // 电子邮箱
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        '请输入有效的电子邮箱'
      ]
    },
    // 手机号码
    phone: {
      type: String
    },
    // 角色
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'editor'],
      default: 'admin'
    },
    // 账号状态
    status: {
      type: Boolean,
      default: true
    },
    // 最后登录时间
    lastLogin: {
      type: Date
    },
    // 权限（可以用于更细粒度的权限控制）
    permissions: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true // 自动生成创建时间和更新时间字段
  }
);

// 密码加密的中间件
adminUserSchema.pre('save', async function(next) {
  // 只有在密码被修改时才进行加密
  if (!this.isModified('password')) {
    next();
  }

  try {
    // 生成盐
    const salt = await bcrypt.genSalt(10);
    // 生成加密密码
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码的方法
adminUserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 生成JWT令牌的方法
adminUserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role, username: this.username },
    process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// 创建并导出模型
const AdminUser = mongoose.model('AdminUser', adminUserSchema);

module.exports = AdminUser; 