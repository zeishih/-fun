import userService from '../../services/user';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    canUseGetUserProfile: false,
    isLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 检查当前环境是否支持getUserProfile接口
    if (wx.getUserProfile) {
      this.setData({
        canUseGetUserProfile: true
      });
    }
    
    // 检查是否已登录，如果已登录则返回上一页或跳转到首页
    if (userService.checkLogin()) {
      this.navigateBack();
    }
  },
  
  /**
   * 使用getUserProfile获取用户信息
   */
  getUserProfile: function () {
    // 显示加载中
    this.setData({ isLoading: true });
    
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        // 成功获取用户信息后，进行登录
        this.login(res.userInfo);
      },
      fail: (err) => {
        console.error('获取用户信息失败', err);
        this.setData({ isLoading: false });
        wx.showToast({
          title: '获取信息失败',
          icon: 'none'
        });
      }
    });
  },
  
  /**
   * 登录处理
   */
  login: function (userInfo) {
    // 调用微信登录接口获取code
    wx.login({
      success: (res) => {
        if (res.code) {
          console.log('获取到的 wx.login code:', res.code); 
          // // <-- 在这里打印 code
          /*// 使用code和用户信息进行登录
          userService.login(res.code, userInfo)
            .then((loginRes) => {
              if (loginRes.success) {
                // 更新全局用户信息
                getApp().globalData.userInfo = loginRes.userInfo;
                getApp().globalData.isLoggedIn = true;
                
                // 显示登录成功提示
                wx.showToast({
                  title: '登录成功',
                  icon: 'success'
                });
                
                // 获取当前页面栈
                const pages = getCurrentPages();
                // 判断是否来自创建活动页
                let fromCreateActivity = false;
                
                if (pages.length > 1) {
                  const previousPage = pages[pages.length - 2];
                  if (previousPage.route && previousPage.route.includes('create-activity')) {
                    fromCreateActivity = true;
                  }
                }
                
                // 登录成功，跳转到相应页面
                setTimeout(() => {
                  if (fromCreateActivity) {
                    // 如果来自创建活动页，登录成功后直接跳转回创建活动页
                    wx.redirectTo({
                      url: '/pages/create-activity/create-activity'
                    });
                  } else {
                    // 其他情况正常返回
                    this.navigateBack();
                  }
                }, 1500);
              } else {
                // 登录失败
                this.setData({ isLoading: false });
                wx.showToast({
                  title: '登录失败',
                  icon: 'none'
                });
              }
            })
            .catch((err) => {
              console.error('登录失败', err);
              this.setData({ isLoading: false });
              wx.showToast({
                title: '登录失败',
                icon: 'none'
              });
            });*/
        } else {
          this.setData({ isLoading: false });
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('微信登录失败', err);
        this.setData({ isLoading: false });
        wx.showToast({
          title: '微信登录失败',
          icon: 'none'
        });
      }
    });
  },
  
  /**
   * 返回上一页，如果是从创建活动页返回，则跳转到首页
   */
  navigateBack: function () {
    const pages = getCurrentPages();
    
    // 检查前一个页面是否是创建活动页
    if (pages.length > 1) {
      const previousPage = pages[pages.length - 2];
      
      // 如果前一个页面是创建活动页，跳转到首页
      if (previousPage.route && previousPage.route.includes('create-activity')) {
        wx.switchTab({
          url: '/pages/home/home'
        });
        return;
      }
      
      // 其他情况正常返回
      wx.navigateBack();
    } else {
      // 没有上一页则跳转到首页
      wx.switchTab({
        url: '/pages/home/home'
      });
    }
  },
  
  /**
   * 跳过登录（游客模式）
   */
  skipLogin: function () {
    wx.showToast({
      title: '游客模式开发中',
      icon: 'none'
    });
    // 这里可以添加游客访问的逻辑
  }
}); 