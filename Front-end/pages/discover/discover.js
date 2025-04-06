// pages/discover/discover.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    theme: 'light',
    pageTitle: '发现',
    activeTab: 0,
    tabs: [
      { id: 0, name: '书目库' },
      { id: 1, name: '官方共读' },
      { id: 2, name: '自由组队' },
      { id: 3, name: '活动日历' }
    ],
    // 书籍数据
    books: [],
    loading: true,
    hasMore: true,
    page: 1,
    pageSize: 10,
    
    // 搜索和筛选
    searchKeyword: '',
    showFilterPanel: false,
    currentTag: 'all',
    
    // 分类数据
    bookTags: [
      { id: 'all', name: '全部' },
      { id: 'popular', name: '热门' },
      { id: 'new', name: '新书' },
      { id: 'picture', name: '绘本' },
      { id: 'fiction', name: '小说' },
      { id: 'science', name: '科普' },
      { id: 'children', name: '儿童文学' }
    ],
    
    // 筛选数据
    selectedCategories: [],
    selectedLanguages: [],
    selectedLevels: [],
    
    categories: [
      { id: 'picture', name: '绘本' },
      { id: 'fiction', name: '小说' },
      { id: 'science', name: '科普' },
      { id: 'children', name: '儿童文学' },
      { id: 'poetry', name: '诗歌' },
      { id: 'biography', name: '传记' }
    ],
    
    languages: [
      { id: 'zh', name: '中文' },
      { id: 'en', name: '英文' },
      { id: 'bilingual', name: '中英双语' },
      { id: 'other', name: '其他语言' }
    ],
    
    levels: [
      { id: 'beginner', name: '入门级' },
      { id: 'elementary', name: '初级' },
      { id: 'intermediate', name: '中级' },
      { id: 'advanced', name: '高级' }
    ]
  },

  /**
   * 切换标签页
   */
  switchTab: function(e) {
    const tabId = parseInt(e.currentTarget.dataset.id);
    this.setData({
      activeTab: tabId
    });
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

    // 加载初始书籍数据
    this.loadBooks();
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
    // 重置参数，重新加载书籍
    this.setData({
      books: [],
      page: 1,
      hasMore: true
    });
    this.loadBooks().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '发现好书，爱上阅读！',
      path: '/pages/discover/discover'
    };
  },

  /**
   * 加载书籍数据
   */
  loadBooks: function() {
    // 设置loading状态
    this.setData({ loading: true });
    
    // 在实际项目中，这里应该是调用API获取数据
    // 这里使用模拟数据示例
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟书籍数据
        const mockBooks = [
          {
            id: '1',
            title: '小王子',
            author: '安托万·德·圣-埃克苏佩里',
            coverUrl: '/static/images/books/little-prince.png',
            rating: 4.7,
            readerCount: 1520,
            tags: ['经典', '哲理', '童话']
          },
          {
            id: '2',
            title: '夏洛的网',
            author: 'E.B. 怀特',
            coverUrl: '/static/images/books/charlottes-web.png',
            rating: 4.5,
            readerCount: 986,
            tags: ['友情', '成长', '动物']
          },
          {
            id: '3',
            title: '窗边的小豆豆',
            author: '黑柳彻子',
            coverUrl: '/static/images/books/totto-chan.png',
            rating: 4.6,
            readerCount: 1243,
            tags: ['教育', '成长', '日本']
          },
          {
            id: '4',
            title: '哈利·波特与魔法石',
            author: 'J.K. 罗琳',
            coverUrl: '/static/images/books/harry-potter.png',
            rating: 4.8,
            readerCount: 2350,
            tags: ['魔幻', '冒险', '成长']
          },
          {
            id: '5',
            title: '爱丽丝梦游仙境',
            author: '刘易斯·卡罗尔',
            coverUrl: '/static/images/books/alice.png',
            rating: 4.4,
            readerCount: 967,
            tags: ['奇幻', '童话', '经典']
          }
        ];
        
        // 应用搜索和筛选
        let filteredBooks = this.filterBooks(mockBooks);
        
        // 判断是否有更多数据
        const hasMore = this.data.page < 3; // 模拟只有3页数据
        
        this.setData({
          books: this.data.books.concat(filteredBooks),
          loading: false,
          hasMore: hasMore
        });
        
        resolve();
      }, 1000); // 模拟网络延迟
    });
  },
  
  /**
   * 根据条件筛选书籍
   */
  filterBooks: function(books) {
    const { searchKeyword, currentTag, selectedCategories, selectedLanguages, selectedLevels } = this.data;
    
    return books.filter(book => {
      // 搜索关键字过滤
      if (searchKeyword && 
          !book.title.includes(searchKeyword) && 
          !book.author.includes(searchKeyword) &&
          !book.tags.some(tag => tag.includes(searchKeyword))) {
        return false;
      }
      
      // 当前标签过滤
      if (currentTag !== 'all') {
        // 这里简化处理，实际应根据标签规则过滤
        if (currentTag === 'popular' && book.readerCount < 1000) return false;
        if (currentTag === 'new' && book.id > '3') return false;
        if (currentTag === 'picture' && !book.tags.includes('童话')) return false;
        if (currentTag === 'fiction' && !book.tags.includes('魔幻') && !book.tags.includes('奇幻')) return false;
        if (currentTag === 'science' && !book.tags.includes('科学')) return false;
        if (currentTag === 'children' && !book.tags.includes('成长')) return false;
      }
      
      // 分类过滤（仅在有选择时过滤）
      if (selectedCategories.length > 0) {
        // 简化处理，实际应有完整的分类映射
        const tagMap = {
          'picture': ['童话'],
          'fiction': ['魔幻', '奇幻'],
          'science': ['科学', '教育'],
          'children': ['成长'],
          'poetry': ['诗歌'],
          'biography': ['传记']
        };
        
        const matchesCategory = selectedCategories.some(category => {
          return tagMap[category]?.some(tag => book.tags.includes(tag));
        });
        
        if (!matchesCategory) return false;
      }
      
      // 语言和级别过滤在实际应用中实现
      // 这里省略实现
      
      return true;
    });
  },
  
  /**
   * 加载更多书籍
   */
  loadMore: function() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({
      page: this.data.page + 1
    });
    
    this.loadBooks();
  },
  
  /**
   * 处理搜索输入
   */
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },
  
  /**
   * 处理搜索确认
   */
  onSearchConfirm: function(e) {
    this.setData({
      books: [],
      page: 1,
      hasMore: true
    });
    
    this.loadBooks();
  },
  
  /**
   * 清除搜索
   */
  clearSearch: function() {
    this.setData({
      searchKeyword: '',
      books: [],
      page: 1,
      hasMore: true
    });
    
    this.loadBooks();
  },
  
  /**
   * 选择标签
   */
  selectTag: function(e) {
    const tagId = e.currentTarget.dataset.id;
    
    this.setData({
      currentTag: tagId,
      books: [],
      page: 1,
      hasMore: true
    });
    
    this.loadBooks();
  },
  
  /**
   * 切换筛选面板
   */
  toggleFilterPanel: function() {
    this.setData({
      showFilterPanel: !this.data.showFilterPanel
    });
  },
  
  /**
   * 切换分类选择
   */
  toggleCategory: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    const categories = [...this.data.selectedCategories];
    
    const index = categories.indexOf(categoryId);
    if (index > -1) {
      categories.splice(index, 1);
    } else {
      categories.push(categoryId);
    }
    
    this.setData({
      selectedCategories: categories
    });
  },
  
  /**
   * 切换语言选择
   */
  toggleLanguage: function(e) {
    const languageId = e.currentTarget.dataset.id;
    const languages = [...this.data.selectedLanguages];
    
    const index = languages.indexOf(languageId);
    if (index > -1) {
      languages.splice(index, 1);
    } else {
      languages.push(languageId);
    }
    
    this.setData({
      selectedLanguages: languages
    });
  },
  
  /**
   * 切换难度选择
   */
  toggleLevel: function(e) {
    const levelId = e.currentTarget.dataset.id;
    const levels = [...this.data.selectedLevels];
    
    const index = levels.indexOf(levelId);
    if (index > -1) {
      levels.splice(index, 1);
    } else {
      levels.push(levelId);
    }
    
    this.setData({
      selectedLevels: levels
    });
  },
  
  /**
   * 重置筛选条件
   */
  resetFilters: function() {
    this.setData({
      selectedCategories: [],
      selectedLanguages: [],
      selectedLevels: []
    });
  },
  
  /**
   * 应用筛选条件
   */
  applyFilters: function() {
    this.setData({
      showFilterPanel: false,
      books: [],
      page: 1,
      hasMore: true
    });
    
    this.loadBooks();
  },
  
  /**
   * 跳转到书籍详情页
   */
  navigateToBookDetail: function(e) {
    const { bookId } = e.detail;
    console.log('跳转到图书详情，bookId:', bookId);
    wx.navigateTo({
      url: `/pages/book-detail/book-detail?id=${bookId}`
    });
  }
}) 