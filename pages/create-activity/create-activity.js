Page({
  /**
   * 页面的初始数据
   */
  data: {
    defaultCover: '/static/images/books/default-cover.png',
    formData: {
      title: '',
      book: null,
      startDate: '',
      endDate: '',
      maxParticipants: 20,
      activityType: 'public',
      description: '',
      rules: ['每天阅读指定页数或章节', '按时完成打卡'],
      checkInRequirement: 'flexible',
      checkInStartTime: '',
      checkInEndTime: '',
      checkInContent: ['text', 'image'],
      agreed: false
    },
    formValid: false,
    
    // 日期选择器相关
    minDate: '',
    maxDate: '',
    startDateForEnd: '',
    
    // 参与人数选项
    participantOptions: ['不限制', '10人', '20人', '30人', '50人', '100人'],
    participantIndex: 2,
    
    // 打卡内容选项
    checkInContentOptions: [
      { label: '文字', value: 'text' },
      { label: '图片', value: 'image' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const bookId = options.bookId;
    
    // 设置日期范围
    const today = new Date();
    const minDate = this.formatDate(today);
    
    const maxDateObj = new Date();
    maxDateObj.setFullYear(maxDateObj.getFullYear() + 1);
    const maxDate = this.formatDate(maxDateObj);
    
    this.setData({
      minDate,
      maxDate,
      startDateForEnd: minDate
    });
    
    // 如果传入了bookId，获取书籍信息
    if (bookId) {
      this.fetchBookInfo(bookId);
    }
    
    // 检查表单有效性
    this.checkFormValidity();
  },

  /**
   * 获取书籍信息
   */
  fetchBookInfo: function(bookId) {
    // 在实际项目中，应该调用API获取数据
    // 这里简单模拟
    const booksData = {
      '1': {
        id: '1',
        title: '小王子',
        author: '安托万·德·圣-埃克苏佩里',
        coverUrl: '/static/images/books/little-prince.png'
      },
      '2': {
        id: '2',
        title: '夏洛的网',
        author: 'E.B. 怀特',
        coverUrl: '/static/images/books/charlottes-web.png'
      },
      '3': {
        id: '3',
        title: '窗边的小豆豆',
        author: '黑柳彻子',
        coverUrl: '/static/images/books/totto-chan.png'
      },
      '4': {
        id: '4',
        title: '哈利·波特与魔法石',
        author: 'J.K. 罗琳',
        coverUrl: '/static/images/books/harry-potter.png'
      },
      '5': {
        id: '5',
        title: '爱丽丝梦游仙境',
        author: '刘易斯·卡罗尔',
        coverUrl: '/static/images/books/alice.png'
      }
    };
    
    const book = booksData[bookId];
    if (book) {
      this.setData({
        'formData.book': book
      });
      
      this.checkFormValidity();
    }
  },

  /**
   * 选择图书
   */
  selectBook: function() {
    wx.navigateTo({
      url: '/pages/select-book/select-book'
    });
  },

  /**
   * 接收图书选择页面返回的图书
   */
  setSelectedBook: function(book) {
    this.setData({
      'formData.book': book
    });
    
    this.checkFormValidity();
  },

  /**
   * 开始日期变更
   */
  onStartDateChange: function(e) {
    const startDate = e.detail.value;
    
    this.setData({
      'formData.startDate': startDate,
      startDateForEnd: startDate,
      // 如果结束日期早于新的开始日期，则重置结束日期
      'formData.endDate': this.data.formData.endDate && this.data.formData.endDate < startDate ? '' : this.data.formData.endDate
    });
    
    this.checkFormValidity();
  },

  /**
   * 结束日期变更
   */
  onEndDateChange: function(e) {
    this.setData({
      'formData.endDate': e.detail.value
    });
    
    this.checkFormValidity();
  },

  /**
   * 参与人数变更
   */
  onParticipantChange: function(e) {
    const index = e.detail.value;
    let maxParticipants = 0;
    
    switch (index) {
      case '0': maxParticipants = 0; break; // 不限制
      case '1': maxParticipants = 10; break;
      case '2': maxParticipants = 20; break;
      case '3': maxParticipants = 30; break;
      case '4': maxParticipants = 50; break;
      case '5': maxParticipants = 100; break;
      default: maxParticipants = 20;
    }
    
    this.setData({
      participantIndex: index,
      'formData.maxParticipants': maxParticipants
    });
  },

  /**
   * 活动类型变更
   */
  onActivityTypeChange: function(e) {
    this.setData({
      'formData.activityType': e.detail.value
    });
  },

  /**
   * 添加规则
   */
  addRule: function() {
    const rules = this.data.formData.rules;
    if (rules.length < 5) { // 最多5条规则
      rules.push('');
      this.setData({
        'formData.rules': rules
      });
    } else {
      wx.showToast({
        title: '最多添加5条规则',
        icon: 'none'
      });
    }
  },

  /**
   * 删除规则
   */
  deleteRule: function(e) {
    const index = e.currentTarget.dataset.index;
    const rules = this.data.formData.rules;
    rules.splice(index, 1);
    
    this.setData({
      'formData.rules': rules
    });
  },

  /**
   * 规则内容输入
   */
  onRuleInput: function(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const rules = this.data.formData.rules;
    rules[index] = value;
    
    this.setData({
      'formData.rules': rules
    });
  },

  /**
   * 打卡要求变更
   */
  onCheckInRequirementChange: function(e) {
    this.setData({
      'formData.checkInRequirement': e.detail.value
    });
  },

  /**
   * 打卡开始时间变更
   */
  onCheckInStartTimeChange: function(e) {
    this.setData({
      'formData.checkInStartTime': e.detail.value
    });
  },

  /**
   * 打卡结束时间变更
   */
  onCheckInEndTimeChange: function(e) {
    this.setData({
      'formData.checkInEndTime': e.detail.value
    });
  },

  /**
   * 打卡内容变更
   */
  onCheckInContentChange: function(e) {
    // 获取用户选择的内容类型
    let selectedTypes = e.detail.value;
    
    // 确保文字和图片始终被选中
    if (!selectedTypes.includes('text')) {
      selectedTypes.push('text');
    }
    if (!selectedTypes.includes('image')) {
      selectedTypes.push('image');
    }
    
    this.setData({
      'formData.checkInContent': selectedTypes
    });
  },

  /**
   * 协议同意状态变更
   */
  onAgreementChange: function(e) {
    const agreed = e.detail.value.includes('agreed');
    this.setData({
      'formData.agreed': agreed
    });
    
    this.checkFormValidity();
  },

  /**
   * 显示协议
   */
  showAgreement: function() {
    wx.showModal({
      title: '共读活动创建协议',
      content: '1. 创建者需对活动内容负责，不得包含违法、色情、暴力等不良信息。\n\n2. 活动中产生的用户内容需遵守相关法律法规。\n\n3. 平台有权对违规活动进行处理。',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  /**
   * 检查表单有效性
   */
  checkFormValidity: function() {
    const { title, book, startDate, endDate, description, agreed } = this.data.formData;
    
    // 添加更多日志以便调试
    console.log('表单原始数据:', this.data.formData);
    
    // 放宽验证条件
    let isValid = agreed; // 首先至少需要同意协议
    
    // 标题验证
    const titleValid = title && title.trim() !== '';
    // 图书验证
    const bookValid = book !== null;
    // 日期验证
    const startDateValid = startDate !== '';
    const endDateValid = endDate !== '';
    // 描述验证
    const descriptionValid = description && description.trim() !== '';
    
    console.log('表单详细验证结果:', {
      title,
      titleValid,
      book,
      bookValid,
      startDate,
      startDateValid,
      endDate,
      endDateValid,
      description,
      descriptionValid,
      agreed
    });
    
    // 如果所有条件都满足，表单有效
    isValid = titleValid && bookValid && startDateValid && endDateValid && descriptionValid && agreed;
    
    console.log('表单最终验证结果:', isValid);
    
    // 强制将按钮设为可用（调试用，实际上线前应该去掉）
    // isValid = true;
    
    this.setData({
      formValid: isValid
    });
  },

  /**
   * 表单提交
   */
  submitForm: function() {
    const { formData } = this.data;
    
    // 如果表单验证未通过，不提交
    if (!this.data.formValid) {
      wx.showToast({
        title: '请完善活动信息',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '创建中...'
    });
    
    // 构建要提交的数据
    const submitData = {
      id: `activity_${Date.now()}`,
      title: formData.title,
      book: formData.book,
      startDate: formData.startDate,
      endDate: formData.endDate,
      maxParticipants: formData.maxParticipants,
      currentParticipants: 1, // 创建者自己
      activityType: formData.activityType,
      description: formData.description,
      rules: formData.rules.filter(rule => rule.trim() !== ''),
      checkInRequirement: formData.checkInRequirement,
      checkInStartTime: formData.checkInStartTime,
      checkInEndTime: formData.checkInEndTime,
      // 确保checkInContent是数组格式
      checkInContent: Array.isArray(formData.checkInContent) ? formData.checkInContent : ['text'],
      creator: {
        id: 'user_001',
        nickname: '阅读者小明',
        avatarUrl: '/static/images/default-avatar.png'
      },
      participants: [
        {
          id: 'user_001',
          nickname: '阅读者小明',
          avatarUrl: '/static/images/default-avatar.png'
        }
      ],
      checkInRecords: [],
      coverUrl: formData.book ? formData.book.coverUrl : this.data.defaultCover,
      createdAt: new Date().toISOString()
    };
    
    console.log('创建活动数据:', submitData);
    console.log('打卡内容类型:', submitData.checkInContent);
    
    try {
      // 获取现有活动数据
      const activities = wx.getStorageSync('activities') || [];
      
      // 添加新活动
      activities.unshift(submitData);
      
      // 保存回本地存储
      wx.setStorageSync('activities', activities);
      
      wx.hideLoading();
      
      // 显示成功提示
      wx.showModal({
        title: '创建成功',
        content: '活动已成功创建！',
        confirmText: '立即查看',
        cancelText: '返回首页',
        success: (res) => {
          if (res.confirm) {
            // 跳转到活动详情页
            wx.navigateTo({
              url: `/pages/activity-detail/activity-detail?id=${submitData.id}`
            });
          } else {
            // 返回首页
            wx.switchTab({
              url: '/pages/home/home'
            });
          }
        }
      });
    } catch (e) {
      console.error('创建活动失败', e);
      wx.hideLoading();
      wx.showToast({
        title: '创建失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 日期格式化（YYYY-MM-DD）
   */
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },

  /**
   * 标题输入处理
   */
  onTitleInput: function(e) {
    this.setData({
      'formData.title': e.detail.value
    });
    this.checkFormValidity();
  },
  
  /**
   * 描述输入处理
   */
  onDescriptionInput: function(e) {
    this.setData({
      'formData.description': e.detail.value
    });
    this.checkFormValidity();
  }
}) 