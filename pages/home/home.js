// pages/home/home.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    theme: 'light', // 默认浅色模式
    loading: true,
    pageTitle: '阅读越有fun',
    activities: [], // 所有活动列表
    dailyRecommend: null,
    hotActivities: [],
    recentUsers: [],
    popularBooks: [],
    organizer: {
      name: '阅读越有fun',
      logo: '/static/images/logo.png',
      slogan: '让阅读更有趣，让知识更丰富'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取系统主题
    const app = getApp();
    this.setData({
      theme: app.globalData.theme
    });
    
    // 注册主题变更回调
    app.themeChangeCallback = (theme) => {
      this.setData({
        theme: theme
      });
    };
    
    // 加载本地存储中的活动
    this.loadActivities();
    
    // 延迟一点加载书籍列表，模拟网络请求
    setTimeout(() => {
      this.setData({
        recommendBooks: [
          {
            id: 'book001',
            title: '小王子',
            author: '安托万·德·圣-埃克苏佩里',
            cover: '/static/images/books/little-prince.png'
          },
          {
            id: 'book002',
            title: '解忧杂货店',
            author: '东野圭吾',
            cover: '/static/images/books/keigo-higashino.png'
          },
          {
            id: 'book003',
            title: '窗边的小豆豆',
            author: '黑柳彻子',
            cover: '/static/images/books/totto-chan.png'
          }
        ]
      });
    }, 500);
  },

  /**
   * 加载活动列表
   */
 // 修改loadActivities函数
loadActivities: function() {
  try {
    this.setData({ loading: true });
    
    // 获取所有活动
    const allActivities = wx.getStorageSync('activities') || [];
    console.log('所有活动数量:', allActivities.length);
    
    // 只显示已审核通过的活动
    const approvedActivities = allActivities.filter(activity => {
      // 只有approvalStatus为approved的活动才显示
      return activity.approvalStatus === 'approved';
    });
    
    console.log('审核通过活动数量:', approvedActivities.length);
    
    // 更新页面数据
    this.setData({
      activities: approvedActivities,
      loading: false
    });
    
    // 提取热门活动
    if (approvedActivities.length > 0) {
      // 按参与人数排序
      const sortedByParticipants = [...approvedActivities].sort((a, b) => 
        (b.currentParticipants || 0) - (a.currentParticipants || 0)
      );
      
      this.setData({
        dailyRecommend: sortedByParticipants[0],
        hotActivities: sortedByParticipants.slice(0, 3)
      });
    }
  } catch (e) {
    console.error('加载活动失败:', e);
    this.setData({ loading: false });
  }
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
   * 获取默认小王子活动
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
      description: '《小王子》是一本充满哲理的童话故事，我们将在30天内完成阅读，每天交流读后感受，一起体会这个温暖人心的故事。',
      creator: {
        id: 'user_002',
        nickname: '活动发起人',
        avatarUrl: '/static/images/default-avatar.png'
      },
      createdAt: '2023-06-25 14:30'
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
    // 每次页面显示时刷新活动列表
    this.loadActivities();
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
    // 刷新页面数据
    this.loadActivities();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '阅读越有fun - 共读让阅读更有趣',
      path: '/pages/home/home'
    };
  },

  /**
   * 跳转到创建活动页面
   */
  goToCreateActivity: function() {
    wx.navigateTo({
      url: '/pages/create-activity/create-activity'
    });
  },
  
  /**
   * 跳转到活动列表页面
   */
  goToActivityList: function() {
    wx.navigateTo({
      url: '/pages/activity-list/activity-list'
    });
  },
  
  /**
   * 跳转到我的书架页面
   */
  goToMyBooks: function() {
    wx.navigateTo({
      url: '/pages/my-books/my-books'
    });
  },
  
  /**
   * 跳转到打卡页面
   */
  goToCheckin: function() {
    wx.navigateTo({
      url: '/pages/checkin/checkin'
    });
  },
  
  /**
   * 跳转到活动详情页
   * @param {Object} e - 事件对象
   */
  goToActivityDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity-detail/activity-detail?id=${id}`
    });
  },
  
  /**
   * 查看每日推荐书籍详情
   */
  viewRecommendBook: function() {
    if (this.data.dailyRecommend) {
      wx.navigateTo({
        url: `/pages/book-detail/book-detail?id=${this.data.dailyRecommend.id}`
      });
    }
  },
  
  /**
   * 查看更多推荐
   */
  viewMoreRecommends: function() {
    wx.navigateTo({
      url: '/pages/book-list/book-list?type=recommend'
    });
  }
}) 