/**
 * pages/check-in-records/check-in-records.js
 * 打卡记录列表页面
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
    
    // 当前用户信息
    currentUser: {
      id: 'user_001',
      nickname: '阅读者小明',
      avatarUrl: '/static/images/default-avatar.png'
    },
    
    // 打卡记录
    allRecords: [], // 所有打卡记录
    filteredRecords: [], // 筛选后的打卡记录
    
    // 统计数据
    totalRecords: 0, // 总打卡数
    myRecords: 0, // 我的打卡数
    participantCount: 0, // 参与人数
    
    // 当前选中的标签
    currentTab: 'all', // all 或 my
    
    // 音频播放
    audioContext: null,
    currentPlayingIndex: -1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.activityId) {
      this.setData({
        activityId: options.activityId
      });
      
      // 初始化音频播放器
      this.initAudioContext();
      
      // 加载活动数据
      this.loadActivityData();
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 初始化音频播放器
   */
  initAudioContext: function() {
    const audioContext = wx.createInnerAudioContext();
    
    audioContext.onEnded(() => {
      this.stopAllAudioPlayingStatus();
    });
    
    audioContext.onStop(() => {
      this.stopAllAudioPlayingStatus();
    });
    
    audioContext.onError((res) => {
      console.error('音频播放失败:', res);
      wx.showToast({
        title: '音频播放失败',
        icon: 'none'
      });
      this.stopAllAudioPlayingStatus();
    });
    
    this.setData({
      audioContext: audioContext
    });
  },

  /**
   * 加载活动数据
   */
  loadActivityData: function() {
    wx.showLoading({
      title: '加载中...'
    });
    
    try {
      // 从本地存储获取活动数据
      const activities = wx.getStorageSync('activities') || [];
      const activity = activities.find(a => a.id === this.data.activityId);
      
      if (!activity) {
        wx.hideLoading();
        wx.showToast({
          title: '未找到活动数据',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
        return;
      }
      
      // 检查当前用户是否已加入活动
      const hasJoined = activity.participants && activity.participants.some(p => p.id === this.data.currentUser.id);
      
      // 获取所有打卡记录并处理
      console.log('所有打卡记录:', activity.checkInRecords);
      
      const recordsWithLikes = (activity.checkInRecords || []).map(record => {
        // 增加是否被当前用户点赞的标记
        const isLiked = record.likedBy ? record.likedBy.includes(this.data.currentUser.id) : false;
        // 处理点赞数量
        const likes = record.likedBy ? record.likedBy.length : 0;
        
        return {
          ...record,
          isLiked: isLiked,
          likes: likes,
          isPlaying: false
        };
      });
      
      // 我的打卡记录数量
      const myRecordsCount = recordsWithLikes.filter(record => record.user.id === this.data.currentUser.id).length;
      
      // 参与人数
      const participantCount = activity.participants ? activity.participants.length : 0;
      
      this.setData({
        activity: {
          ...activity,
          hasJoined: hasJoined
        },
        allRecords: recordsWithLikes,
        totalRecords: recordsWithLikes.length,
        myRecords: myRecordsCount,
        participantCount: participantCount,
        loading: false
      });
      
      // 默认显示全部记录
      this.filterRecords('all');
      
      wx.hideLoading();
      
    } catch (e) {
      console.error('获取活动数据失败', e);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 筛选记录
   */
  filterRecords: function(tabType) {
    const { allRecords, currentUser } = this.data;
    
    let filteredRecords = [];
    
    if (tabType === 'all') {
      filteredRecords = allRecords;
    } else if (tabType === 'my') {
      filteredRecords = allRecords.filter(record => record.user.id === currentUser.id);
    }
    
    this.setData({
      filteredRecords: filteredRecords
    });
  },

  /**
   * 切换标签
   */
  switchTab: function(e) {
    const tabType = e.currentTarget.dataset.tab;
    
    if (tabType !== this.data.currentTab) {
      this.setData({
        currentTab: tabType
      });
      
      this.filterRecords(tabType);
      
      // 停止播放所有音频
      if (this.data.currentPlayingIndex !== -1) {
        this.data.audioContext.stop();
      }
    }
  },

  /**
   * 获取打卡日期在活动中的天数
   */
  getDayNumber: function(dateTimeStr) {
    const { activity } = this.data;
    
    if (!activity || !activity.startDate || !dateTimeStr) {
      return 1; // 默认返回第1天
    }
    
    // 获取打卡日期（YYYY-MM-DD）
    const recordDate = dateTimeStr.split(' ')[0];
    
    // 活动开始日期
    const startDate = new Date(activity.startDate.replace(/-/g, '/'));
    
    // 打卡日期
    const currentDate = new Date(recordDate.replace(/-/g, '/'));
    
    // 计算时间差
    const diffTime = Math.abs(currentDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // 返回天数（从第1天开始）
    return diffDays + 1;
  },

  /**
   * 预览图片
   */
  previewImage: function(e) {
    const src = e.currentTarget.dataset.src;
    const urls = e.currentTarget.dataset.urls;
    
    wx.previewImage({
      current: src,
      urls: urls
    });
  },

  /**
   * 播放音频
   */
  playAudio: function(e) {
    const audioPath = e.currentTarget.dataset.audioPath;
    const index = e.currentTarget.dataset.index;
    const { currentPlayingIndex, audioContext } = this.data;
    
    // 如果点击的是当前正在播放的音频，则停止播放
    if (currentPlayingIndex === index) {
      audioContext.stop();
      return;
    }
    
    // 停止当前可能正在播放的音频
    if (currentPlayingIndex !== -1) {
      audioContext.stop();
    }
    
    // 更新所有记录的播放状态
    this.stopAllAudioPlayingStatus();
    
    // 更新当前播放的记录状态
    const filteredRecords = this.data.filteredRecords;
    filteredRecords[index].isPlaying = true;
    
    this.setData({
      filteredRecords: filteredRecords,
      currentPlayingIndex: index
    });
    
    // 播放新的音频
    audioContext.src = audioPath;
    audioContext.play();
  },

  /**
   * 停止所有音频播放状态
   */
  stopAllAudioPlayingStatus: function() {
    const filteredRecords = this.data.filteredRecords.map(record => {
      return {
        ...record,
        isPlaying: false
      };
    });
    
    this.setData({
      filteredRecords: filteredRecords,
      currentPlayingIndex: -1
    });
  },

  /**
   * 点赞记录
   */
  likeRecord: function(e) {
    const recordId = e.currentTarget.dataset.id;
    
    // 获取所有活动
    try {
      const activities = wx.getStorageSync('activities') || [];
      const activityIndex = activities.findIndex(a => a.id === this.data.activityId);
      
      if (activityIndex === -1) {
        wx.showToast({
          title: '活动不存在',
          icon: 'none'
        });
        return;
      }
      
      // 复制当前活动数据
      const activity = {...activities[activityIndex]};
      
      // 查找打卡记录
      const recordIndex = activity.checkInRecords.findIndex(r => r.id === recordId);
      
      if (recordIndex === -1) {
        wx.showToast({
          title: '记录不存在',
          icon: 'none'
        });
        return;
      }
      
      // 复制记录数据
      const record = {...activity.checkInRecords[recordIndex]};
      
      // 初始化点赞用户列表
      if (!record.likedBy) {
        record.likedBy = [];
      }
      
      // 当前用户ID
      const userId = this.data.currentUser.id;
      
      // 判断是否已点赞
      const likedIndex = record.likedBy.indexOf(userId);
      
      // 更新点赞状态
      if (likedIndex === -1) {
        // 添加点赞
        record.likedBy.push(userId);
      } else {
        // 取消点赞
        record.likedBy.splice(likedIndex, 1);
      }
      
      // 更新记录数据
      activity.checkInRecords[recordIndex] = record;
      
      // 更新活动数据
      activities[activityIndex] = activity;
      
      // 保存回本地存储
      wx.setStorageSync('activities', activities);
      
      // 更新页面数据
      this.refreshRecordsData(record, likedIndex === -1);
      
    } catch (e) {
      console.error('点赞操作失败', e);
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 刷新记录数据
   */
  refreshRecordsData: function(updatedRecord, isLiked) {
    // 更新所有记录
    const allRecords = this.data.allRecords.map(record => {
      if (record.id === updatedRecord.id) {
        return {
          ...record,
          isLiked: isLiked,
          likes: updatedRecord.likedBy.length
        };
      }
      return record;
    });
    
    // 更新筛选后的记录
    const filteredRecords = this.data.filteredRecords.map(record => {
      if (record.id === updatedRecord.id) {
        return {
          ...record,
          isLiked: isLiked,
          likes: updatedRecord.likedBy.length
        };
      }
      return record;
    });
    
    this.setData({
      allRecords: allRecords,
      filteredRecords: filteredRecords
    });
  },

  /**
   * 显示评论
   */
  showComments: function(e) {
    const recordId = e.currentTarget.dataset.id;
    
    // 先找到对应的记录
    const record = this.data.filteredRecords.find(r => r.id === recordId);
    
    if (!record) {
      wx.showToast({
        title: '无法找到该记录',
        icon: 'none'
      });
      return;
    }
    
    // 提取评论
    const comments = record.comments || [];
    
    if (comments.length === 0) {
      wx.showToast({
        title: '暂无评论',
        icon: 'none'
      });
      return;
    }
    
    // 构建评论显示内容
    const commentsList = comments.map(c => {
      return `${c.user.nickname}: ${c.content}`;
    }).join('\n\n');
    
    wx.showModal({
      title: '评论列表',
      content: commentsList || '暂无评论',
      showCancel: false,
      confirmText: '关闭'
    });
  },

  /**
   * 前往打卡页面
   */
  goToCheckIn: function() {
    wx.navigateTo({
      url: `/pages/check-in/check-in?id=${this.data.activityId}`
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 每次页面显示时重新加载数据，确保展示最新的打卡记录
    if (this.data.activityId) {
      this.loadActivityData();
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadActivityData();
    wx.stopPullDownRefresh();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    // 释放音频资源
    if (this.data.audioContext) {
      this.data.audioContext.stop();
      this.data.audioContext.destroy();
    }
  },

  /**
   * 加载活动打卡记录
   */
  loadCheckInRecords: function () {
    this.setData({ loading: true });
    
    try {
      const activities = wx.getStorageSync('activities') || [];
      const activity = activities.find(a => a.id === this.data.activityId);
      
      if (!activity) {
        this.setData({ loading: false });
        wx.showToast({
          title: '未找到活动数据',
          icon: 'none'
        });
        return;
      }
      
      // 获取活动信息
      const activityInfo = {
        id: activity.id,
        title: activity.title,
        coverUrl: activity.coverUrl || this.data.defaultCover,
        book: activity.book
      };
      
      // 获取所有打卡记录
      let records = [];
      if (activity.checkInRecords && activity.checkInRecords.length > 0) {
        records = activity.checkInRecords.map(record => {
          // 处理不同打卡记录结构兼容
          let processedRecord = {
            id: record.id,
            user: record.user,
            content: typeof record.content === 'string' ? record.content : (record.content?.text || ''),
            images: record.images || record.content?.imageList || [],
            audioPath: record.audioPath || record.content?.audioPath || '',
            videoPath: record.videoPath || record.content?.videoPath || '',
            createTime: record.createTime || record.createdAt || '未知时间',
            likes: record.likes || 0,
            comments: record.comments || []
          };
          
          return processedRecord;
        });
      }
      
      // 设置页面数据
      this.setData({
        activityInfo,
        records,
        loading: false
      });
      
      console.log('加载了打卡记录：', records.length);
    } catch (err) {
      console.error('加载打卡记录失败', err);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    }
  },
}); 