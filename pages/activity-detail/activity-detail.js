/**
 * 活动详情页面
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    activityId: '', // 活动ID
    activity: null, // 活动详情数据
    isCreator: false, // 是否为创建者
    hasJoined: false, // 是否已参与
    defaultCover: '/static/images/default-activity-cover.png', // 默认活动封面
    defaultBookCover: '/static/images/books/default-book-cover.png', // 默认图书封面
    loading: true, // 加载状态
    needRefresh: false // 标记是否需要刷新
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.id) {
      this.setData({
        activityId: options.id
      });
      this.loadActivityDetail();
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 加载活动详情
   */
  loadActivityDetail: function () {
    wx.showLoading({
      title: '加载中...'
    });

    // 获取当前用户信息（模拟）
    const currentUser = {
      id: 'user_001',
      nickname: '阅读者小明',
      avatarUrl: '/static/images/default-avatar.png'
    };

    // 从本地存储获取活动数据
    try {
      // 获取所有活动
      const activities = wx.getStorageSync('activities') || [];
      
      // 查找当前ID的活动
      let activityData = activities.find(activity => activity.id === this.data.activityId);
      
      // 如果没找到活动数据，使用默认小王子活动（兼容之前的测试）
      if (!activityData && this.data.activityId === 'activity_test_001') {
        activityData = this.getDefaultActivity();
      }
      
      // 如果还是没有活动数据，显示错误提示
      if (!activityData) {
        wx.hideLoading();
        wx.showToast({
          title: '未找到活动数据',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
        return;
      }
      
      // 计算活动当前状态
      activityData.status = this.calculateActivityStatus(activityData.startDate, activityData.endDate);
      
      // 判断是否为创建者
      const isCreator = currentUser.id === activityData.creator.id;

      // 判断是否已参与
      const hasJoined = activityData.participants && activityData.participants.some(p => p.id === currentUser.id);

      this.setData({
        activity: activityData,
        isCreator: isCreator,
        hasJoined: hasJoined,
        loading: false
      });

      wx.hideLoading();
    } catch (e) {
      console.error('获取活动数据失败', e);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    }
  },
  
  /**
   * 获取默认小王子活动（兼容原有测试入口）
   */
  getDefaultActivity: function() {
    return {
      id: 'activity_test_001',
      title: '《小王子》共读计划',
      coverUrl: '/static/images/activity-cover.png',
      status: 'ongoing', // recruiting, ongoing, finished
      book: {
        id: '1',
        title: '小王子',
        author: '安托万·德·圣-埃克苏佩里',
        coverUrl: '/static/images/books/little-prince.png'
      },
      startDate: '2023-07-01',
      endDate: '2023-07-30',
      maxParticipants: 30,
      currentParticipants: 12,
      creator: {
        id: 'user_002', // 不同于当前用户的ID
        nickname: '活动发起人',
        avatarUrl: '/static/images/default-avatar.png'
      },
      description: '《小王子》是一本充满哲理的童话故事，我们将在30天内完成阅读，每天交流读后感受，一起体会这个温暖人心的故事。',
      rules: [
        '每天阅读指定页数或章节',
        '按时完成打卡',
        '积极参与讨论，分享读后感想',
        '尊重其他参与者的观点和感受'
      ],
      checkInRequirement: 'daily',
      checkInStartTime: '08:00',
      checkInEndTime: '22:00',
      checkInContent: ['text', 'image', 'audio'],
      participants: [
        {
          id: 'user_002',
          nickname: '活动发起人',
          avatarUrl: '/static/images/default-avatar.png'
        },
        {
          id: 'user_003',
          nickname: '书虫小红',
          avatarUrl: '/static/images/default-avatar.png'
        },
        {
          id: 'user_004',
          nickname: '悦读者',
          avatarUrl: '/static/images/default-avatar.png'
        },
        {
          id: 'user_005',
          nickname: '阅读达人',
          avatarUrl: '/static/images/default-avatar.png'
        },
        {
          id: 'user_006',
          nickname: '书友一号',
          avatarUrl: '/static/images/default-avatar.png'
        }
      ],
      checkInRecords: [
        {
          id: 'record_001',
          user: {
            id: 'user_003',
            nickname: '书虫小红',
            avatarUrl: '/static/images/default-avatar.png'
          },
          content: '今天读完了第一章，小王子的纯真思考真的让人感动。特别是他对于大人们奇怪行为的疑惑，引发了我对成长过程中失去的童真的思考。',
          images: ['/static/images/demo-checkin.png'],
          createTime: '2023-07-01 10:15'
        },
        {
          id: 'record_002',
          user: {
            id: 'user_004',
            nickname: '悦读者',
            avatarUrl: '/static/images/default-avatar.png'
          },
          content: '第二章中，小王子遇到的狐狸告诉他"驯养"的意义，让我思考了友情和责任的关系，非常有启发。',
          images: [],
          createTime: '2023-07-02 21:30'
        }
      ],
      createdAt: '2023-06-25 14:30'
    };
  },

  /**
   * 计算活动状态
   * @param {string} startDate - 开始日期，格式：YYYY-MM-DD
   * @param {string} endDate - 结束日期，格式：YYYY-MM-DD
   * @returns {string} - 返回活动状态：recruiting(招募中)、ongoing(进行中)或finished(已结束)
   */
  calculateActivityStatus: function(startDate, endDate) {
    // 获取当前日期（去除时间部分）
    const now = new Date();
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // 解析开始日期和结束日期
    // 注意：将日期中的连字符替换为斜杠，以确保跨浏览器兼容性
    let start = null;
    let end = null;
    
    try {
      start = new Date(startDate.replace(/-/g, '/'));
      end = new Date(endDate.replace(/-/g, '/'));
      
      // 将开始日期和结束日期的时间部分也设置为0时0分0秒
      start = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      end = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    } catch (e) {
      console.error('日期解析错误:', e);
      return 'ongoing'; // 默认进行中状态
    }
    
    console.log('日期比较:', {
      currentDate: currentDate.toISOString(),
      startDate: start.toISOString(),
      endDate: end.toISOString()
    });
    
    // 判断状态
    if (currentDate < start) {
      // 当前日期在开始日期之前，活动处于招募中
      return 'recruiting';
    } else if (currentDate <= end) {
      // 当前日期在开始日期之后，结束日期之前或当天，活动进行中
      return 'ongoing';
    } else {
      // 当前日期在结束日期之后，活动已结束
      return 'finished';
    }
  },

  /**
   * 查看图书详情
   */
  viewBookDetail: function () {
    if (this.data.activity && this.data.activity.book) {
      wx.navigateTo({
        url: `/pages/book-detail/book-detail?id=${this.data.activity.book.id}`
      });
    }
  },

  /**
   * 查看所有成员
   */
  viewAllMembers: function () {
    // 实际实现可能会跳转到成员列表页面
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 查看所有打卡记录
   */
  viewAllRecords: function () {
    // 跳转到打卡记录列表页面
    wx.navigateTo({
      url: `/pages/check-in-records/check-in-records?activityId=${this.data.activityId}`
    });
  },

  /**
   * 预览图片
   */
  previewImage: function (e) {
    const src = e.currentTarget.dataset.src;
    const urls = e.currentTarget.dataset.urls;
    
    wx.previewImage({
      current: src,
      urls: urls
    });
  },

  /**
   * 编辑活动
   */
  editActivity: function () {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 参与/退出活动
   */
  toggleJoin: function () {
    if (this.data.hasJoined) {
      this.quitActivity();
    } else {
      this.joinActivity();
    }
  },

  /**
   * 参与活动
   */
  joinActivity: function () {
    wx.showLoading({
      title: '处理中...'
    });

    try {
      // 获取当前用户信息
      const currentUser = {
        id: 'user_001',
        nickname: '阅读者小明',
        avatarUrl: '/static/images/default-avatar.png'
      };
      
      // 获取所有活动
      const activities = wx.getStorageSync('activities') || [];
      
      // 找到当前活动的索引
      const activityIndex = activities.findIndex(a => a.id === this.data.activityId);
      
      if (activityIndex === -1) {
        wx.hideLoading();
        wx.showToast({
          title: '活动不存在',
          icon: 'none'
        });
        return;
      }
      
      // 复制当前活动数据
      const activity = {...activities[activityIndex]};
      
      // 确保participants数组已初始化
      if (!activity.participants) {
        activity.participants = [];
      }
      
      // 添加当前用户到参与者列表
      activity.participants.push(currentUser);
      activity.currentParticipants = activity.participants.length;
      
      // 更新活动数据
      activities[activityIndex] = activity;
      
      // 保存回本地存储
      wx.setStorageSync('activities', activities);
      
      // 更新页面数据
      this.setData({
        activity: activity,
        hasJoined: true
      });
      
      wx.hideLoading();
      
      wx.showToast({
        title: '参与成功',
        icon: 'success'
      });
    } catch (e) {
      console.error('参与活动失败', e);
      wx.hideLoading();
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 退出活动
   */
  quitActivity: function () {
    wx.showModal({
      title: '提示',
      content: '确定要退出当前活动吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中...'
          });
          
          try {
            const currentUserId = 'user_001';
            
            // 获取所有活动
            const activities = wx.getStorageSync('activities') || [];
            
            // 找到当前活动的索引
            const activityIndex = activities.findIndex(a => a.id === this.data.activityId);
            
            if (activityIndex === -1) {
              wx.hideLoading();
              wx.showToast({
                title: '活动不存在',
                icon: 'none'
              });
              return;
            }
            
            // 复制当前活动数据
            const activity = {...activities[activityIndex]};
            
            // 确保participants数组已初始化
            if (!activity.participants) {
              activity.participants = [];
              wx.hideLoading();
              wx.showToast({
                title: '您未参与此活动',
                icon: 'none'
              });
              return;
            }
            
            // 从参与者列表中移除当前用户
            activity.participants = activity.participants.filter(p => p.id !== currentUserId);
            activity.currentParticipants = activity.participants.length;
            
            // 更新活动数据
            activities[activityIndex] = activity;
            
            // 保存回本地存储
            wx.setStorageSync('activities', activities);
            
            // 更新页面数据
            this.setData({
              activity: activity,
              hasJoined: false
            });
            
            wx.hideLoading();
            
            wx.showToast({
              title: '已退出活动',
              icon: 'success'
            });
          } catch (e) {
            console.error('退出活动失败', e);
            wx.hideLoading();
            wx.showToast({
              title: '操作失败，请重试',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  /**
   * 前往打卡页面
   */
  goToCheckIn: function() {
    wx.navigateTo({
      url: `/pages/check-in/check-in?id=${this.data.activityId}`
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const activity = this.data.activity;
    return {
      title: activity ? `邀请你参加『${activity.title}』共读活动` : '共读活动邀请',
      path: `/pages/activity-detail/activity-detail?id=${this.data.activityId}`,
      imageUrl: activity ? activity.coverUrl : this.data.defaultCover
    };
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 每次显示页面时刷新数据，确保显示最新的打卡记录
    console.log('活动详情页显示，刷新数据');
    if (this.data.activityId) {
      this.loadActivityDetail();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadActivityDetail();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
}); 