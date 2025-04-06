// pages/profile/profile.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    theme: 'light',
    isLoggedIn: false,
    userInfo: {
      avatarUrl: '/static/images/avatars/default.png',
      nickName: '未登录',
      level: 0,
      points: 0,
      joinDate: ''
    },
    badges: [],
    notifications: 0,
    darkMode: false
  },
  
  /**
   * 跳转到登录页面
   */
  goToLogin: function() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },
  
  /**
   * 退出登录
   */
  logout: function() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用app的登出方法
          getApp().logout().then(() => {
            // 更新页面数据
            this.setData({
              isLoggedIn: false,
              userInfo: {
                avatarUrl: '/static/images/avatars/default.png',
                nickName: '未登录',
                level: 0,
                points: 0,
                joinDate: ''
              },
              badges: []
            });
            
            wx.showToast({
              title: '已退出登录',
              icon: 'success'
            });
          });
        }
      }
    });
  },

  /**
   * 切换主题
   */
  toggleDarkMode: function() {
    const app = getApp();
    const newTheme = this.data.theme === 'light' ? 'dark' : 'light';
    
    this.setData({
      theme: newTheme,
      darkMode: newTheme === 'dark'
    });
    
    app.globalData.theme = newTheme;
    // 通知其他页面主题变化
    if (app.themeChangeCallback) {
      app.themeChangeCallback(newTheme);
    }
  },

  /**
   * 跳转到消息通知页面
   */
  navigateToNotifications: function() {
    // 如果未登录，则跳转到登录页
    if (!this.data.isLoggedIn) {
      this.goToLogin();
      return;
    }
    
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 跳转到设置页面
   */
  navigateToSettings: function() {
    // 如果未登录，则跳转到登录页
    if (!this.data.isLoggedIn) {
      this.goToLogin();
      return;
    }
    
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取系统主题
    const app = getApp();
    const currentTheme = app.globalData.theme;
    
    this.setData({
      theme: currentTheme,
      darkMode: currentTheme === 'dark'
    });
    
    // 注册主题变更回调
    app.themeChangeCallback = (theme) => {
      this.setData({
        theme: theme,
        darkMode: theme === 'dark'
      });
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
    // 每次显示页面时检查登录状态
    const app = getApp();
    const isLoggedIn = app.globalData.isLoggedIn;
    
    if (isLoggedIn) {
      const userInfo = app.globalData.userInfo;
      
      // 读取勋章信息
      let badges = [];
      if (userInfo.userId === 'user_001') {
        // 演示数据
        badges = [
          { id: 'badge001', name: '读书达人', icon: '/static/images/badges/reader.png', date: '2023-04-02' },
          { id: 'badge002', name: '评论小能手', icon: '/static/images/badges/commenter.png', date: '2023-04-05' }
        ];
      }
      
      this.setData({
        isLoggedIn: true,
        userInfo: userInfo,
        badges: badges
      });
    } else {
      this.setData({
        isLoggedIn: false,
        userInfo: {
          avatarUrl: '/static/images/avatars/default.png',
          nickName: '未登录',
          level: 0,
          points: 0,
          joinDate: ''
        },
        badges: []
      });
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