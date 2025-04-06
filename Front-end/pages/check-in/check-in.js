/**
 * pages/check-in/check-in.js
 * 打卡页面
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    activityId: '', // 活动ID
    activity: null, // 活动数据
    loading: true, // 加载状态
    defaultCover: '/static/images/default-activity-cover.png', // 默认活动封面

    // 当前日期和时间
    currentDate: new Date(),
    currentDateStr: '', // 例如：2023年7月1日

    // 打卡类型选项
    allowedContentTypes: ['text', 'image'], // 默认允许文字和图片
    // 打卡内容
    checkInData: {
      text: '',
      imageList: [],
      audioPath: '',
      videoPath: ''
    },
    // 是否显示调试信息
    showDebugInfo: false,
    // 调试信息
    debugInfo: {},
    // 提交状态
    submitInProgress: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 检查登录状态
    if (!getApp().checkNeedLogin({
      message: '请先登录后再进行打卡',
      showToast: true
    })) {
      return;
    }
    
    console.log('打卡页面接收到的参数:', options);
    
    const activityId = options.id;
    if (!activityId) {
      wx.showToast({
        title: '活动ID不能为空',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    // 设置当前日期字符串
    this.setCurrentDateStr();

    this.setData({
      activityId
    });

    this.loadActivityDetail();
  },

  /**
   * 设置当前日期字符串
   */
  setCurrentDateStr: function() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    this.setData({
      currentDateStr: `${year}年${month}月${day}日`
    });
  },

  /**
   * 加载活动详情
   */
  loadActivityDetail: function () {
    try {
      const activities = wx.getStorageSync('activities') || [];
      console.log('查找活动ID:', this.data.activityId);
      console.log('所有活动:', activities.map(a => ({id: a.id, activityId: a.activityId, title: a.title})));
      
      // 同时检查id和activityId字段
      const activity = activities.find(item => 
        item.activityId === this.data.activityId || 
        item.id === this.data.activityId
      );

      // 输出完整活动数据，用于调试
      console.log('找到活动数据：', activity);

      if (!activity) {
        this.setData({ loading: false });
        wx.showToast({
          title: '找不到活动信息',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
        return;
      }

      // 确保 checkInContent 字段是数组
      let allowedContentTypes = [];
      if (activity.checkInRequirements && activity.checkInRequirements.contentTypes) {
        allowedContentTypes = activity.checkInRequirements.contentTypes;
      } else if (activity.checkInContent) {
        if (Array.isArray(activity.checkInContent)) {
          allowedContentTypes = activity.checkInContent;
        } else if (typeof activity.checkInContent === 'string') {
          // 如果是字符串，转换为数组
          allowedContentTypes = [activity.checkInContent];
        } else {
          console.error('无法识别的打卡内容类型格式：', activity.checkInContent);
          allowedContentTypes = ['text', 'image']; // 默认允许文字和图片打卡
        }
      } else {
        allowedContentTypes = ['text', 'image']; // 默认允许文字和图片打卡
      }

      // 确保允许类型中至少包含 text 和 image
      if (!allowedContentTypes.includes('text')) {
        allowedContentTypes.push('text');
      }
      if (!allowedContentTypes.includes('image')) {
        allowedContentTypes.push('image');
      }

      console.log('允许的打卡内容类型：', allowedContentTypes);

      // 准备调试信息
      const debugInfo = {
        activityId: activity.activityId || activity.id,
        rawCheckInContent: activity.checkInContent || (activity.checkInRequirements ? activity.checkInRequirements.contentTypes : []),
        parsedAllowedTypes: allowedContentTypes,
        activityType: activity.activityType,
        checkInRequirement: activity.checkInRequirement || (activity.checkInRequirements ? activity.checkInRequirements.frequency : 'flexible')
      };

      this.setData({
        activity,
        allowedContentTypes,
        debugInfo,
        loading: false // 加载完成
      });

      // 在调试模式下显示调试信息
      if (this.data.showDebugInfo) {
        this.showDebugModal();
      }
    } catch (err) {
      console.error('加载活动详情失败', err);
      this.setData({ 
        loading: false,
        allowedContentTypes: ['text', 'image'] // 确保默认至少有这两种类型
      });
      wx.showToast({
        title: '加载活动详情失败',
        icon: 'none'
      });
    }
  },

  /**
   * 显示调试信息对话框
   */
  showDebugModal: function() {
    const { debugInfo, checkInData, allowedContentTypes } = this.data;
    
    // 判断表单是否已填写
    const hasText = checkInData.text.trim() !== '';
    const hasImages = checkInData.imageList.length > 0;
    const hasAudio = checkInData.audioPath !== '';
    const hasVideo = checkInData.videoPath !== '';
    
    const contentStatus = {
      text: allowedContentTypes.includes('text') ? (hasText ? '已填写' : '未填写') : '不允许',
      image: allowedContentTypes.includes('image') ? (hasImages ? '已上传' : '未上传') : '不允许',
      audio: allowedContentTypes.includes('audio') ? (hasAudio ? '已录制' : '未录制') : '不允许',
      video: allowedContentTypes.includes('video') ? (hasVideo ? '已上传' : '未上传') : '不允许'
    };
    
    // 构建调试信息内容
    const content = `活动ID: ${debugInfo.activityId}\n` +
                   `原始打卡内容类型: ${JSON.stringify(debugInfo.rawCheckInContent)}\n` +
                   `解析后允许类型: ${JSON.stringify(allowedContentTypes)}\n` +
                   `活动类型: ${debugInfo.activityType}\n` +
                   `打卡要求: ${debugInfo.checkInRequirement}\n\n` +
                   `表单状态:\n` +
                   `- 文字: ${contentStatus.text}\n` +
                   `- 图片: ${contentStatus.image}\n` +
                   `- 音频: ${contentStatus.audio}\n` +
                   `- 视频: ${contentStatus.video}`;
    
    // 显示模态框
    wx.showModal({
      title: '活动打卡调试信息',
      content: content,
      showCancel: false,
      confirmText: '确定'
    });
  },

  /**
   * 切换调试模式
   */
  toggleDebugMode: function() {
    this.setData({
      showDebugInfo: !this.data.showDebugInfo
    });
    
    if (this.data.showDebugInfo) {
      this.showDebugModal();
    }
  },

  /**
   * 输入文本打卡内容
   */
  onTextInput: function (e) {
    this.setData({
      'checkInData.text': e.detail.value
    });
  },

  /**
   * 选择打卡图片
   */
  chooseImage: function () {
    const that = this;
    wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('选择图片成功：', res);
        // 获取已有图片列表
        const currentImages = that.data.checkInData.imageList || [];
        // 添加新选择的图片
        const newImages = res.tempFiles.map(file => file.tempFilePath);
        
        // 合并图片列表，最多9张
        const allImages = [...currentImages, ...newImages].slice(0, 9);
        
        that.setData({
          'checkInData.imageList': allImages
        });
        
        console.log('图片列表更新为：', allImages);
      },
      fail: (err) => {
        console.error('选择图片失败：', err);
      }
    });
  },

  /**
   * 删除已选图片
   */
  deleteImage: function (e) {
    const index = e.currentTarget.dataset.index;
    const imageList = this.data.checkInData.imageList;
    imageList.splice(index, 1);
    this.setData({
      'checkInData.imageList': imageList
    });
  },

  /**
   * 录制音频
   */
  recordAudio: function () {
    const that = this;
    // 开始录音
    const recorderManager = wx.getRecorderManager();
    recorderManager.onStart(() => {
      wx.showLoading({
        title: '录音中...',
      });
    });
    
    recorderManager.onStop((res) => {
      wx.hideLoading();
      if (res.tempFilePath) {
        that.setData({
          'checkInData.audioPath': res.tempFilePath
        });
      }
    });
    
    recorderManager.onError((res) => {
      wx.hideLoading();
      wx.showToast({
        title: '录音失败',
        icon: 'none'
      });
    });
    
    // 设置录音参数
    const options = {
      duration: 60000, // 最长一分钟
      sampleRate: 44100,
      numberOfChannels: 2,
      encodeBitRate: 192000,
      format: 'mp3'
    };
    
    // 开始录音
    recorderManager.start(options);
    
    // 提示用户录音中，点击停止
    wx.showModal({
      title: '录音中',
      content: '点击停止结束录音',
      showCancel: false,
      success: () => {
        recorderManager.stop();
      }
    });
  },

  /**
   * 播放音频
   */
  playAudio: function () {
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.src = this.data.checkInData.audioPath;
    innerAudioContext.play();
  },

  /**
   * 删除音频
   */
  deleteAudio: function () {
    this.setData({
      'checkInData.audioPath': ''
    });
  },

  /**
   * 录制视频
   */
  recordVideo: function () {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: (res) => {
        that.setData({
          'checkInData.videoPath': res.tempFiles[0].tempFilePath
        });
      }
    });
  },

  /**
   * 删除视频
   */
  deleteVideo: function () {
    this.setData({
      'checkInData.videoPath': ''
    });
  },

  /**
   * 是否允许使用特定内容类型
   */
  isContentTypeAllowed: function(type) {
    return this.data.allowedContentTypes.includes(type);
  },

  /**
   * 提交打卡
   */
  submitCheckIn: function () {
    // 再次检查登录状态
    if (!getApp().checkNeedLogin({
      message: '登录状态已过期，请重新登录',
      showToast: true
    })) {
      return;
    }
    
    const { checkInData, activity, activityId } = this.data;
    
    console.log('===== 打卡提交 =====');
    console.log('活动ID:', activityId);
    console.log('打卡内容:', checkInData);
    console.log('允许的内容类型:', this.data.allowedContentTypes);
    
    // 检查是否有内容提交
    const hasText = this.data.allowedContentTypes.includes('text') && checkInData.text && checkInData.text.trim() !== '';
    const hasImages = this.data.allowedContentTypes.includes('image') && checkInData.imageList && checkInData.imageList.length > 0;
    
    console.log('文本内容状态:', hasText);
    console.log('图片内容状态:', hasImages);
    
    // 避免重复提交
    if (this.submitInProgress) {
      console.log('正在提交中，请勿重复操作');
      return;
    }
    
    this.submitInProgress = true;
    
    // 开始提交流程
    console.log('开始提交');
    wx.showLoading({
      title: '提交中...',
    });
    
    // 获取当前用户信息
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    
    if (!userInfo) {
      wx.hideLoading();
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
      return;
    }
    
    // 获取当前时间
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${year}-${month}-${day} ${hours}:${minutes}`;
    
    // 构建打卡记录
    const checkInRecord = {
      id: `check_in_${Date.now()}`,
      userId: userInfo.userId,
      userName: userInfo.nickName,
      userAvatar: userInfo.avatarUrl,
      activityId: activityId,
      content: checkInData.text || '完成今日阅读打卡', // 没有文字时提供默认内容
      images: checkInData.imageList || [],
      audioPath: checkInData.audioPath || '',
      videoPath: checkInData.videoPath || '',
      likes: 0,
      comments: [],
      createTime: timeStr,
      likedBy: []  // 增加点赞记录字段
    };
    
    console.log('最终打卡记录:', checkInRecord);
    
    try {
      // 获取所有活动
      const activities = wx.getStorageSync('activities') || [];
      console.log('获取到活动数量:', activities.length);
      
      // 找到当前活动的索引 - 同时检查id和activityId字段
      const activityIndex = activities.findIndex(a => 
        a.activityId === activityId || a.id === activityId
      );
      console.log('当前活动索引:', activityIndex);
      
      if (activityIndex !== -1) {
        // 创建一个活动的副本，而不是直接修改原对象
        const updatedActivity = JSON.parse(JSON.stringify(activities[activityIndex]));
        
        // 确保有 checkInRecords 数组
        if (!updatedActivity.checkInRecords) {
          updatedActivity.checkInRecords = [];
        }
        
        // 检查是否已经打卡
        const today = new Date().toISOString().split('T')[0];
        const alreadyCheckedIn = updatedActivity.checkInRecords.some(
          record => record.userId === userInfo.userId && record.date === today
        );
        
        if (alreadyCheckedIn && !this.data.showDebugInfo) {
          wx.hideLoading();
          wx.showToast({
            title: '今日已完成打卡',
            icon: 'none'
          });
          return;
        }
        
        // 添加打卡记录到活动中
        updatedActivity.checkInRecords.unshift(checkInRecord);
        console.log('添加打卡记录成功，当前记录数:', updatedActivity.checkInRecords.length);
        
        // 更新活动数组中的对象
        activities[activityIndex] = updatedActivity;
        
        // 更新本地存储
        wx.setStorageSync('activities', activities);
        console.log('更新本地存储成功');
        
        wx.hideLoading();
        
        // 显示成功提示
        wx.showToast({
          title: '打卡成功',
          icon: 'success',
          duration: 1500,
          mask: true, // 防止用户触摸操作
          success: () => {
            // 延迟后返回活动详情页
            setTimeout(() => {
              this.submitInProgress = false;
              
              // 获取正确的活动ID用于跳转
              const correctActivityId = updatedActivity.activityId || updatedActivity.id;
              
              wx.redirectTo({
                url: `/pages/activity-detail/activity-detail?id=${correctActivityId}`
              });
            }, 1500);
          }
        });
      } else {
        // 活动不存在的情况下，记录错误并返回
        console.error('找不到活动:', activityId);
        wx.hideLoading();
        wx.showToast({
          title: '活动不存在，无法打卡',
          icon: 'none'
        });
        setTimeout(() => {
          this.submitInProgress = false;
          wx.navigateBack();
        }, 1500);
      }
    } catch (err) {
      this.submitInProgress = false;
      console.error('提交打卡失败', err);
      wx.hideLoading();
      wx.showToast({
        title: '提交失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // 释放资源
    if (this.data.recorderManager) {
      // 如果正在录音，停止录音
      if (this.data.recording) {
        this.data.recorderManager.stop();
      }
    }
    
    if (this.data.innerAudioContext) {
      // 如果正在播放，停止播放
      if (this.data.audioPlaying) {
        this.data.innerAudioContext.stop();
      }
      this.data.innerAudioContext.destroy();
    }
  }
}); 