/**
 * 图书选择页面
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    searchKeyword: '', // 搜索关键词
    searchHistory: [], // 搜索历史
    bookList: [], // 图书列表
    pageNum: 1, // 当前页码
    pageSize: 10, // 每页数量
    hasMore: true, // 是否有更多数据
    isLoading: false, // 是否正在加载
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 加载搜索历史
    this.loadSearchHistory();
    // 加载图书列表
    this.loadBookList();
  },

  /**
   * 加载搜索历史
   */
  loadSearchHistory: function () {
    const history = wx.getStorageSync('bookSearchHistory') || [];
    this.setData({
      searchHistory: history
    });
  },

  /**
   * 保存搜索历史
   */
  saveSearchHistory: function (keyword) {
    if (!keyword) return;
    
    let history = wx.getStorageSync('bookSearchHistory') || [];
    // 移除已存在的相同关键词
    history = history.filter(item => item !== keyword);
    // 添加到最前面
    history.unshift(keyword);
    // 只保留最新的10条
    if (history.length > 10) {
      history = history.slice(0, 10);
    }
    
    wx.setStorageSync('bookSearchHistory', history);
    this.setData({
      searchHistory: history
    });
  },

  /**
   * 清除搜索历史
   */
  clearHistory: function () {
    wx.showModal({
      title: '提示',
      content: '确定清除所有搜索历史？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('bookSearchHistory');
          this.setData({
            searchHistory: []
          });
        }
      }
    });
  },

  /**
   * 搜索框输入事件
   */
  onSearchInput: function (e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  /**
   * 搜索事件
   */
  onSearch: function () {
    const keyword = this.data.searchKeyword.trim();
    if (keyword) {
      this.saveSearchHistory(keyword);
      this.setData({
        bookList: [],
        pageNum: 1,
        hasMore: true
      });
      this.loadBookList();
    }
  },

  /**
   * 点击历史记录项
   */
  onHistoryItemTap: function (e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({
      searchKeyword: keyword,
      bookList: [],
      pageNum: 1,
      hasMore: true
    });
    this.loadBookList();
  },

  /**
   * 加载图书列表
   */
  loadBookList: function () {
    if (this.data.isLoading || !this.data.hasMore) return;
    
    this.setData({ isLoading: true });
    
    // 模拟网络请求获取图书列表
    setTimeout(() => {
      // 这里应该是真实的API请求，现在用模拟数据
      const mockBooks = this.getMockBooks();
      const keyword = this.data.searchKeyword;
      
      let filteredBooks = mockBooks;
      if (keyword) {
        filteredBooks = mockBooks.filter(book => 
          book.title.includes(keyword) || book.author.includes(keyword)
        );
      }
      
      const startIndex = (this.data.pageNum - 1) * this.data.pageSize;
      const endIndex = startIndex + this.data.pageSize;
      const currentPageBooks = filteredBooks.slice(startIndex, endIndex);
      
      let bookList = this.data.bookList;
      if (this.data.pageNum === 1) {
        bookList = currentPageBooks;
      } else {
        bookList = bookList.concat(currentPageBooks);
      }
      
      this.setData({
        bookList: bookList,
        hasMore: endIndex < filteredBooks.length,
        isLoading: false
      });
    }, 500);
  },

  /**
   * 加载更多
   */
  loadMore: function () {
    if (this.data.hasMore && !this.data.isLoading) {
      this.setData({
        pageNum: this.data.pageNum + 1
      });
      this.loadBookList();
    }
  },

  /**
   * 选择图书
   */
  onSelectBook: function (e) {
    const book = e.currentTarget.dataset.book;
    // 将选中的图书信息返回给上一页
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2]; // 上一页
    
    if (prevPage) {
      // 调用上一页的setSelectedBook方法
      prevPage.setSelectedBook(book);
      wx.navigateBack();
    }
  },

  /**
   * 获取模拟图书数据
   */
  getMockBooks: function () {
    return [
      {
        id: '1',
        title: '活着',
        author: '余华',
        coverUrl: 'https://img3.doubanio.com/view/subject/l/public/s29053580.jpg',
        description: '《活着》是作家余华的代表作，讲述了一个人历经世间沧桑和种种磨难的生命历程，读来让人感到宽广和沉重。'
      },
      {
        id: '2',
        title: '小王子',
        author: '[法] 安东尼·德·圣-埃克苏佩里',
        coverUrl: 'https://img2.doubanio.com/view/subject/l/public/s1103152.jpg',
        description: '小王子是一个超凡脱俗的仙童，他住在一颗只比他大一丁点儿的小行星上。他爱上了一朵骄傲的玫瑰花，为了玫瑰花，他开始了遨游太空的旅行。'
      },
      {
        id: '3',
        title: '百年孤独',
        author: '[哥伦比亚] 加西亚·马尔克斯',
        coverUrl: 'https://img1.doubanio.com/view/subject/l/public/s6384944.jpg',
        description: '《百年孤独》是魔幻现实主义文学的代表作，描写了布恩迪亚家族七代人的传奇故事，以及加勒比海沿岸小镇马孔多的百年兴衰，反映了拉丁美洲一个世纪以来风云变幻的历史。'
      },
      {
        id: '4',
        title: '解忧杂货店',
        author: '[日] 东野圭吾',
        coverUrl: 'https://img1.doubanio.com/view/subject/l/public/s27284878.jpg',
        description: '现代人内心流失的东西，这家杂货店能帮你找回。僻静的街道旁有一家杂货店，只要写下烦恼投进卷帘门的投信口，第二天就会在店后的牛奶箱里得到回答。'
      },
      {
        id: '5',
        title: '人类简史',
        author: '[以色列] 尤瓦尔·赫拉利',
        coverUrl: 'https://img2.doubanio.com/view/subject/l/public/s27814883.jpg',
        description: '《人类简史》是以色列历史学家的一部重磅作品。从十万年前有生命迹象开始到21世纪资本、科技交织的人类发展史。'
      },
      {
        id: '6',
        title: '白夜行',
        author: '[日] 东野圭吾',
        coverUrl: 'https://img1.doubanio.com/view/subject/l/public/s24514468.jpg',
        description: '《白夜行》是日本作家东野圭吾的代表作。故事围绕着一对有着不同寻常情愫的少年少女，描述了他们对彼此的执著，同时也展现了人性的挣扎与救赎。'
      },
      {
        id: '7',
        title: '三体',
        author: '刘慈欣',
        coverUrl: 'https://img1.doubanio.com/view/subject/l/public/s2768378.jpg',
        description: '《三体》是刘慈欣创作的系列长篇科幻小说，由《三体》《三体Ⅱ·黑暗森林》《三体Ⅲ·死神永生》组成，是中国科幻文学的代表作。'
      },
      {
        id: '8',
        title: '追风筝的人',
        author: '[美] 卡勒德·胡赛尼',
        coverUrl: 'https://img9.doubanio.com/view/subject/l/public/s1727290.jpg',
        description: '12岁的阿富汗富家少爷阿米尔与仆人哈桑情同手足。然而，在一场风筝比赛后，发生了一件悲惨不堪的事，阿米尔为自己的懦弱感到自责和痛苦，逼走了哈桑，不久，自己也跟随父亲逃往美国。'
      },
      {
        id: '9',
        title: '围城',
        author: '钱钟书',
        coverUrl: 'https://img2.doubanio.com/view/subject/l/public/s1070222.jpg',
        description: '《围城》是钱钟书所著的长篇小说，完成于1946年。小说以抗战初期为背景，通过对主人公方鸿渐从留学回国到再度出国过程的描述，刻画了当时中国社会各阶层人物的形象。'
      },
      {
        id: '10',
        title: '红楼梦',
        author: '曹雪芹',
        coverUrl: 'https://img1.doubanio.com/view/subject/l/public/s1070959.jpg',
        description: '《红楼梦》是中国古代章回体长篇小说，中国古典四大名著之一，通过描写贾、史、王、薛四大家族的兴衰，展示了封建社会的方方面面。'
      },
      {
        id: '11',
        title: '月亮与六便士',
        author: '[英] 威廉·萨默塞特·毛姆',
        coverUrl: 'https://img1.doubanio.com/view/subject/l/public/s2659208.jpg',
        description: '银行家查尔斯，人到中年后突然着了魔似的，抛弃一切到南太平洋的塔希提岛与土著人一起生活，获得灵感，创作出惊世杰作。'
      },
      {
        id: '12',
        title: '平凡的世界',
        author: '路遥',
        coverUrl: 'https://img1.doubanio.com/view/subject/l/public/s1144911.jpg',
        description: '《平凡的世界》是中国作家路遥创作的一部百万字的小说。这是一部全景式地表现中国当代城乡社会生活的长篇小说。'
      }
    ];
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      bookList: [],
      pageNum: 1,
      hasMore: true
    });
    this.loadBookList();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadMore();
  }
}); 