// app.js
import userService from './services/user';

App({
  onLaunch: function() {
    // 小程序启动时执行的逻辑
    console.log('小程序启动');
    
    // 获取系统信息
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.globalData.systemInfo = systemInfo;
      
      // 判断是否为深色模式
      if (systemInfo.theme) {
        this.globalData.theme = systemInfo.theme;
      }
    } catch (e) {
      console.error('获取系统信息失败:', e);
    }
    
    // 监听系统主题变化
    wx.onThemeChange((result) => {
      this.globalData.theme = result.theme;
      // 通知页面主题变化
      if (this.themeChangeCallback) {
        this.themeChangeCallback(result.theme);
      }
    });
    
    // 初始化应用数据
    this.initAppData();
    
    // 检查用户登录状态
    this.checkLoginStatus();
  },
  
  /**
   * 检查登录状态
   */
  checkLoginStatus: function() {
    const isLoggedIn = userService.checkLogin();
    
    if (isLoggedIn) {
      // 获取用户信息
      const userInfo = userService.getUserInfo();
      
      // 更新全局状态
      this.globalData.userInfo = userInfo;
      this.globalData.isLoggedIn = true;
      
      console.log('用户已登录:', userInfo.nickName);
    } else {
      console.log('用户未登录');
    }
  },
  
  /**
   * 检查是否需要登录
   * @param {Object} options - 配置选项
   * @param {boolean} options.redirectToLogin - 是否自动跳转到登录页，默认为true
   * @param {string} options.message - 提示用户的消息，默认为"请先登录"
   * @param {boolean} options.showToast - 是否显示提示信息，默认为true
   * @returns {boolean} 是否已登录
   */
  checkNeedLogin: function(options = {}) {
    // 设置默认选项
    const defaultOptions = {
      redirectToLogin: true,
      message: '请先登录',
      showToast: true
    };
    
    const opt = {...defaultOptions, ...options};
    const isLoggedIn = this.globalData.isLoggedIn;
    
    if (!isLoggedIn) {
      // 显示提示信息
      if (opt.showToast) {
        wx.showToast({
          title: opt.message,
          icon: 'none',
          duration: 1500
        });
      }
      
      // 跳转到登录页
      if (opt.redirectToLogin) {
        // 延迟跳转，让提示消息显示完
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }, 1000);
      }
    }
    
    return isLoggedIn;
  },
  
  /**
   * 登出
   */
  logout: function() {
    return userService.logout().then(() => {
      // 清除全局用户信息
      this.globalData.userInfo = null;
      this.globalData.isLoggedIn = false;
      
      // 跳转到首页
      wx.switchTab({
        url: '/pages/home/home'
      });
    });
  },
  
  /**
   * 初始化应用数据
   */
  initAppData: function() {
    try {
      // 检查活动数据是否存在
      const activities = wx.getStorageSync('activities');
      
      // 如果不存在或者不是数组，则初始化为空数组
      if (!activities || !Array.isArray(activities)) {
        console.log('初始化活动数据结构');
        wx.setStorageSync('activities', []);
      } else {
        console.log('已有活动数据，数量:', activities.length);
        
        // 检查每个活动是否包含必要的字段
        const updatedActivities = activities.map(activity => {
          // 确保有checkInRecords字段
          if (!activity.checkInRecords) {
            activity.checkInRecords = [];
          }
          
          // 确保有participants字段
          if (!activity.participants) {
            activity.participants = [];
            // 如果有creator，自动添加为参与者
            if (activity.creator) {
              activity.participants.push(activity.creator);
            }
          }
          
          // 确保有status字段
          if (!activity.status) {
            // 基于日期计算状态
            activity.status = this.calculateActivityStatus(activity.startDate, activity.endDate);
          }
          
          return activity;
        });
        
        // 重新保存更新后的活动数据
        wx.setStorageSync('activities', updatedActivities);
      }
    } catch (err) {
      console.error('初始化应用数据失败:', err);
    }
  },
  
  /**
   * 计算活动状态
   * @param {string} startDate - 开始日期，格式：YYYY-MM-DD
   * @param {string} endDate - 结束日期，格式：YYYY-MM-DD
   * @returns {string} - 返回活动状态：recruiting(招募中)、ongoing(进行中)或finished(已结束)
   */
  calculateActivityStatus: function(startDate, endDate) {
    // 如果没有日期信息，默认为进行中
    if (!startDate || !endDate) {
      return 'ongoing';
    }
    
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
      console.error('日期解析错误:', e, startDate, endDate);
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
   * 检查登录并直接跳转（不带提示）
   * 用于需要立即重定向到登录页面的场景
   * @returns {boolean} 是否已登录
   */
  checkLoginAndRedirect: function() {
    const isLoggedIn = this.globalData.isLoggedIn;
    
    if (!isLoggedIn) {
      // 直接跳转到登录页面
      wx.redirectTo({
        url: '/pages/login/login'
      });
    }
    
    return isLoggedIn;
  },
  
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    systemInfo: {},
    theme: 'light', // 默认浅色模式
  }
}) 