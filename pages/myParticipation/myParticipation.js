// pages/myParticipation/myParticipation.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    theme: 'light',
    loading: true,
    activities: [],
    checkIns: [],
    teams: [],
    favorites: []
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
    
    // 模拟加载数据
    setTimeout(() => {
      this.setData({
        loading: false,
        activities: [
          {
            id: 'act001',
            title: '4月亲子共读月',
            progress: 60,
            startDate: '2023-04-01',
            endDate: '2023-04-30'
          }
        ],
        checkIns: [
          {
            id: 'checkin001',
            bookTitle: '小王子',
            date: '2023-04-05',
            content: '今天读到了第三章，小王子离开了自己的星球...',
            type: 'text'
          }
        ],
        teams: [
          {
            id: 'team001',
            name: '绘本交流小组',
            members: 5,
            books: ['好饿的毛毛虫', '月亮的味道']
          }
        ],
        favorites: [
          {
            id: 'book004',
            title: '了不起的狐狸爸爸',
            author: '罗尔德·达尔',
            cover: '/static/images/books/fantastic-mr-fox.png'
          }
        ]
      });
    }, 500);
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
    
  }
}) 