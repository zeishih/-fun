/**
 * 身份验证控制器
 * @module controllers/authController
 */
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 处理微信小程序用户登录
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回包含token的响应
 */
exports.login = async (req, res) => {
  try {
    // 从请求体中获取小程序通过wx.login获取的code
    const { code } = req.body;

    // 验证code是否存在
    if (!code) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：code',
      });
    }

    // 调用微信接口，获取openid和session_key
    const wxUrl = 'https://api.weixin.qq.com/sns/jscode2session';
    const wxResponse = await axios.get(wxUrl, {
      params: {
        appid: process.env.WECHAT_APPID,
        secret: process.env.WECHAT_SECRET,
        js_code: code,
        grant_type: 'authorization_code',
      },
    });

    // 处理微信接口返回的错误
    if (wxResponse.data.errcode) {
      console.error('微信登录接口返回错误:', wxResponse.data);
      return res.status(401).json({
        success: false,
        message: `微信登录失败，错误码：${wxResponse.data.errcode}`,
      });
    }

    // 从微信返回的数据中提取openid和session_key
    const { openid, session_key } = wxResponse.data;

    // 根据openid查找用户，如果不存在则创建
    let user = await User.findOne({ openid });

    if (!user) {
      // 创建新用户
      user = await User.create({ openid });
      console.log('新用户创建成功:', openid);
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user._id, openid },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 返回令牌和用户信息（不包含敏感数据）
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        role: user.role,
        statistics: user.statistics,
      },
    });
  } catch (error) {
    console.error('登录处理错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试',
    });
  }
};

/**
 * 更新用户信息（获取微信用户信息后）
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 返回更新后的用户信息
 */
exports.updateUserInfo = async (req, res) => {
  try {
    const { nickname, avatarUrl } = req.body;
    const userId = req.user.id; // 从认证中间件中获取

    // 更新用户信息
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { nickname, avatarUrl },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: updatedUser._id,
        nickname: updatedUser.nickname,
        avatarUrl: updatedUser.avatarUrl,
        role: updatedUser.role,
        statistics: updatedUser.statistics,
      },
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试',
    });
  }
}; 