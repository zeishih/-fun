/**
 * 用户服务
 * 处理用户登录、登出、信息获取等功能
 */

const userService = {
  /**
   * 用户登录
   * @param {string} code - 微信登录凭证
   * @param {object} userInfo - 用户信息
   * @returns {Promise} 登录结果
   */
  login(code, userInfo) {
    // 目前使用本地模拟
    return new Promise((resolve) => {
      console.log('登录code:', code);
      
      // 生成模拟用户ID和Token
      const userId = 'user_' + new Date().getTime();
      const token = 'mock_token_' + new Date().getTime();
      
      // 构建完整用户信息
      const fullUserInfo = {
        ...userInfo,
        userId: userId,
        level: 1,
        points: 0,
        joinDate: this.formatDate(new Date()),
        token: token
      };
      
      // 存储用户信息到本地
      wx.setStorageSync('userInfo', fullUserInfo);
      wx.setStorageSync('token', token);
      wx.setStorageSync('isLoggedIn', true);
      
      // 返回登录成功
      resolve({
        success: true,
        userInfo: fullUserInfo,
        token: token
      });
    });
  },
  
  /**
   * 检查用户是否已登录
   * @returns {boolean} 登录状态
   */
  checkLogin() {
    return wx.getStorageSync('isLoggedIn') || false;
  },
  
  /**
   * 获取用户信息
   * @returns {object|null} 用户信息对象，未登录时返回null
   */
  getUserInfo() {
    if (this.checkLogin()) {
      return wx.getStorageSync('userInfo');
    }
    return null;
  },
  
  /**
   * 更新用户信息
   * @param {object} userInfo - 要更新的用户信息
   * @returns {Promise} 更新结果
   */
  updateUserInfo(userInfo) {
    return new Promise((resolve) => {
      const oldUserInfo = wx.getStorageSync('userInfo') || {};
      const newUserInfo = {...oldUserInfo, ...userInfo};
      
      wx.setStorageSync('userInfo', newUserInfo);
      
      resolve({
        success: true,
        userInfo: newUserInfo
      });
    });
  },
  
  /**
   * 用户登出
   * @returns {Promise} 登出结果
   */
  logout() {
    return new Promise((resolve) => {
      // 清除本地存储的用户信息
      wx.removeStorageSync('userInfo');
      wx.removeStorageSync('token');
      wx.removeStorageSync('isLoggedIn');
      
      resolve({
        success: true
      });
    });
  },
  
  /**
   * 格式化日期
   * @param {Date} date - 日期对象
   * @returns {string} 格式化的日期字符串，如 "2023年4月"
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}年${month}月`;
  }
};

export default userService; 