// pages/myParticipation/myParticipation.js
import userService from '../../services/user';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoggedIn: false,
    activities: [],
    myActivities: [],
    joinedActivities: [],
    activeTab: 'joined',
    userInfo: null,
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取系统主题
    const app = getApp();
    const currentTheme = app.globalData.theme;
    
    this.setData({
      theme: currentTheme
    });
    
    // 注册主题变更回调
    app.themeChangeCallback = (theme) => {
      this.setData({
        theme: theme
      });
    };
  },

  /**
   * 切换标签页
   */
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
  },

  /**
   * 跳转到登录页
   */
  goToLogin: function() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  /**
   * 跳转到活动详情
   */
  goToActivityDetail: function(e) {
    const activityId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity-detail/activity-detail?id=${activityId}`
    });
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
   * 加载用户参与的活动
   */
  loadUserActivities: function() {
    this.setData({ loading: true });
    
    try {
      // 获取用户信息
      const userInfo = userService.getUserInfo();
      
      if (!userInfo) {
        this.setData({
          isLoggedIn: false,
          loading: false
        });
        return;
      }
      
      // 获取所有活动
      const activities = wx.getStorageSync('activities') || [];
      
      // 过滤我创建的活动
      const myActivities = activities.filter(activity => 
        activity.creator && activity.creator.userId === userInfo.userId
      );
      
      // 过滤我参与的活动（不包括自己创建的）
      const joinedActivities = activities.filter(activity => 
        activity.participants && 
        activity.participants.some(p => p.userId === userInfo.userId) &&
        (!activity.creator || activity.creator.userId !== userInfo.userId)
      );
      
      this.setData({
        isLoggedIn: true,
        userInfo: userInfo,
        activities: activities,
        myActivities: myActivities,
        joinedActivities: joinedActivities,
        loading: false
      });
    } catch (e) {
      console.error('加载活动失败', e);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 检查登录状态
    const isLoggedIn = userService.checkLogin();
    
    this.setData({
      isLoggedIn: isLoggedIn
    });
    
    if (isLoggedIn) {
      // 如果已登录，加载用户参与的活动
      this.loadUserActivities();
    } else {
      this.setData({
        loading: false
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
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