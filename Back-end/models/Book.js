const mongoose = require('mongoose');

/**
 * 书籍模型
 */
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '书名不能为空'],
    trim: true
  },
  author: {
    type: String,
    required: [true, '作者不能为空'],
    trim: true
  },
  coverUrl: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  introduction: {
    type: String,
    default: ''
  },
  genre: {
    type: [String],
    default: []
  },
  tags: {
    type: [String],
    default: []
  },
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  bookLanguage: {
    type: String,
    enum: ['zh', 'en', 'bilingual', 'other'],
    default: 'zh'
  },
  wordCount: {
    type: Number,
    default: 0
  },
  pageCount: {
    type: Number,
    default: 0
  },
  pages: {
    type: Number,
    default: 0
  },
  isbn: {
    type: String,
    default: ''
  },
  publisher: {
    type: String,
    default: ''
  },
  publishDate: {
    type: Date,
    default: null
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  targetReader: {
    type: String,
    default: ''
  },
  binding: {
    type: String,
    default: '平装'
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt 字段
});

// 创建索引以支持标题搜索
bookSchema.index({ title: 'text', author: 'text' },
  { 
    default_language: 'none', // <-- 重要：明确指定语言为 'none'
    
  }

);

// 增加虚拟属性id，使其与前端的id匹配
bookSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// 确保虚拟属性在toJSON时可见
bookSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    // 如果introduction为空但description不为空，使用description的值
    if (!ret.introduction && ret.description) {
      ret.introduction = ret.description;
    }
    // 如果tags为空但genre不为空，使用genre的值
    if ((!ret.tags || ret.tags.length === 0) && ret.genre && ret.genre.length > 0) {
      ret.tags = ret.genre;
    }
    // 如果pages为0但pageCount不为0，使用pageCount的值
    if (ret.pages === 0 && ret.pageCount !== 0) {
      ret.pages = ret.pageCount;
    }
    return ret;
  }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book; 