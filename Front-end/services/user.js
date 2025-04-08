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
    // 定义你的本地后端基础 URL
    const BASE_URL = 'http://localhost:3000'; // <--- 确认这是你的本地后端地址和端口

    return new Promise((resolve, reject) => {
      wx.request({
        url: BASE_URL + '/api/auth/login', // <--- 拼接登录接口地址
        method: 'POST',
        data: {
          code: code
          // 注意：根据你的后端 authController.js 实现，
          // 确认是否需要在登录时就传递 userInfo (nickname, avatarUrl)。
          // 如果你的后端是先用 code 登录/注册，获取 token，
          // 然后再用另一个接口让用户更新信息，这里就只需要传 code。
          // 如果你的后端 login 接口设计就是接收 code, nickname, avatarUrl，
          // 那就需要把下面两行取消注释：
          // nickname: userInfo ? userInfo.nickName : undefined,
          // avatarUrl: userInfo ? userInfo.avatarUrl : undefined
        },
        success: (res) => {
          console.log('后端登录响应:', res); // 打印完整的后端响应，方便调试
          // 检查后端返回的数据结构是否符合预期
          if (res.statusCode === 200 && res.data && res.data.success && res.data.token) {
            // 登录成功，存储 token 和可能的 userId
            wx.setStorageSync('token', res.data.token);
            wx.setStorageSync('isLoggedIn', true);

            // 注意：后端现在返回的是 token 和 user 对象（包含 id, nickname, avatarUrl）
            // 你需要根据后端实际返回的 user 对象来更新全局或本地存储的用户信息
            // 例如： getApp().globalData.userInfo = res.data.user;
            // wx.setStorageSync('userInfo', res.data.user); // 或者直接存后端返回的 user 对象

            console.log('Token 已保存:', res.data.token);
            console.log('用户信息已更新:', res.data.user);

            resolve({ // 将后端的重要信息传递给调用者 (login.js)
              success: true,
              token: res.data.token,
              userInfo: res.data.user // 传递后端返回的用户对象
            });
          } else {
            // 后端返回了错误信息或非预期结构
            console.error('后端登录失败:', res.data);
            wx.removeStorageSync('token'); // 清理可能残留的无效 token
            wx.setStorageSync('isLoggedIn', false);
            reject({ // 将错误信息传递出去
              success: false,
              message: res.data ? res.data.message : '登录失败，请稍后再试',
              data: res.data // 传递完整的后端错误响应
            });
          }
        },
        fail: (err) => {
          // 网络请求本身失败
          console.error('wx.request 请求失败:', err);
          wx.removeStorageSync('token');
          wx.setStorageSync('isLoggedIn', false);
          reject({
            success: false,
            message: '网络请求失败，请检查网络连接',
            error: err
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