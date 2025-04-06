Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    book: null,
    defaultCover: '/static/images/books/default-cover.png',
    activeTab: 0,
    tabs: [
      { id: 0, name: '内容简介' },
      { id: 1, name: '共读活动' },
      { id: 2, name: '读者评价' }
    ],
    readingActivities: [],
    reviews: [],
    hasMoreReviews: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const bookId = options.id;
    console.log('书籍详情页接收到bookId:', bookId);
    
    if (!bookId) {
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    // 获取图书详情
    this.fetchBookDetail(bookId);
    
    // 获取相关共读活动
    this.fetchReadingActivities(bookId);
    
    // 获取读者评价
    this.fetchReviews(bookId);
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const { book } = this.data;
    if (!book) return {};
    
    return {
      title: `《${book.title}》- ${book.author}`,
      path: `/pages/book-detail/book-detail?id=${book.id}`,
      imageUrl: book.coverUrl
    };
  },
  
  /**
   * 获取图书详情
   */
  fetchBookDetail: function(bookId) {
    // 在实际项目中，应该调用API获取数据
    setTimeout(() => {
      // 模拟数据库中的图书信息
      const booksData = {
        '1': {
          id: '1',
          title: '小王子',
          author: '安托万·德·圣-埃克苏佩里',
          coverUrl: '/static/images/books/little-prince.png',
          rating: 4.7,
          ratingCount: 12563,
          tags: ['经典', '哲理', '童话'],
          introduction: '《小王子》是一本充满诗意的童话故事，由法国作家安托万·德·圣-埃克苏佩里于1942年写成。故事讲述了一位来自外星球的小王子环游各星球，最后在地球上遇见飞行员的奇妙旅程。这个温柔而忧伤的故事，寓意深刻，启示人们重新发现纯真、爱与责任的珍贵。本书自问世以来，已被翻译成250多种语言，全球销量超过2亿册，是有史以来最畅销的图书之一。',
          targetReader: '适合各年龄段读者阅读，特别是对寻找生活意义和珍视友情的人。',
          publisher: '人民文学出版社',
          publishDate: '2016-01-01',
          isbn: '9787020042494',
          pages: 97,
          binding: '精装'
        },
        '2': {
          id: '2',
          title: '夏洛的网',
          author: 'E.B. 怀特',
          coverUrl: '/static/images/books/charlottes-web.png',
          rating: 4.5,
          ratingCount: 8652,
          tags: ['友情', '成长', '动物'],
          introduction: '《夏洛的网》是美国作家E.B.怀特创作的一部儿童文学经典。故事讲述了一只名叫威尔伯的小猪和一只叫夏洛的蜘蛛之间的友谊。当威尔伯面临被宰杀的命运时，聪明的夏洛用她的丝编织出赞美威尔伯的文字，救了小猪的命。这个感人的故事展现了友情、牺牲和生命轮回的主题，被誉为"有史以来最好的儿童读物之一"。',
          targetReader: '适合所有年龄段的读者，尤其是5-12岁的儿童。',
          publisher: '上海译文出版社',
          publishDate: '2017-03-01',
          isbn: '9787532773480',
          pages: 184,
          binding: '平装'
        },
        '3': {
          id: '3',
          title: '窗边的小豆豆',
          author: '黑柳彻子',
          coverUrl: '/static/images/books/totto-chan.png',
          rating: 4.6,
          ratingCount: 9547,
          tags: ['教育', '成长', '日本'],
          introduction: '《窗边的小豆豆》是日本作家黑柳彻子的自传体作品，记录了作者小时候在巴学园的生活。小豆豆是一个好奇心旺盛、精力充沛的小女孩，因为在普通学校无法适应而被退学，后来进入了由小林宗作校长创办的巴学园。在这所独特的学校里，小豆豆找到了自己的成长空间，也感受到了教育的真谛。这本书展示了一种尊重儿童天性、激发创造力的教育理念。',
          targetReader: '适合儿童、家长和教育工作者阅读。',
          publisher: '南海出版公司',
          publishDate: '2003-01-01',
          isbn: '9787544242165',
          pages: 266,
          binding: '平装'
        },
        '4': {
          id: '4',
          title: '哈利·波特与魔法石',
          author: 'J.K. 罗琳',
          coverUrl: '/static/images/books/harry-potter.png',
          rating: 4.8,
          ratingCount: 18652,
          tags: ['魔幻', '冒险', '成长'],
          introduction: '《哈利·波特与魔法石》是J.K.罗琳创作的魔幻文学系列的第一部作品。故事讲述了一个被麻瓜（普通人）抚养长大的男孩哈利·波特，在11岁生日时发现自己是一名巫师，并被邀请就读霍格沃茨魔法学校的经历。在学校里，哈利结交了好友罗恩和赫敏，一起揭开了魔法石的秘密，并阻止了邪恶的伏地魔复活的计划。这部小说开启了一个充满魔法和冒险的奇幻世界。',
          targetReader: '适合9岁以上的读者，特别是对奇幻文学感兴趣的人。',
          publisher: '人民文学出版社',
          publishDate: '2000-09-01',
          isbn: '9787020033430',
          pages: 191,
          binding: '精装'
        },
        '5': {
          id: '5',
          title: '爱丽丝梦游仙境',
          author: '刘易斯·卡罗尔',
          coverUrl: '/static/images/books/alice.png',
          rating: 4.4,
          ratingCount: 7625,
          tags: ['奇幻', '童话', '经典'],
          introduction: '《爱丽丝梦游仙境》是英国作家刘易斯·卡罗尔于1865年创作的幻想文学作品。故事讲述了一个名叫爱丽丝的小女孩追逐一只兔子掉进兔子洞后，进入了一个充满各种奇怪生物和不可思议事件的仙境的冒险。这部作品以其丰富的想象力、荒谬的逻辑和文字游戏而闻名，被认为是儿童文学的重要里程碑，同时也以其对传统和权威的隐晦批评吸引了成人读者。',
          targetReader: '适合儿童和成人阅读，尤其是喜欢幻想和文字游戏的读者。',
          publisher: '译林出版社',
          publishDate: '2015-05-01',
          isbn: '9787544737227',
          pages: 176,
          binding: '精装'
        }
      };
      
      // 根据ID获取对应的图书信息
      const mockBookDetail = booksData[bookId] || booksData['1']; // 如果找不到对应的书籍，返回默认的小王子
      
      this.setData({
        book: mockBookDetail,
        loading: false
      });
    }, 1000); // 模拟网络延迟
  },
  
  /**
   * 获取相关共读活动
   */
  fetchReadingActivities: function(bookId) {
    // 在实际项目中，应该调用API获取数据
    setTimeout(() => {
      console.log('获取共读活动，bookId:', bookId);
      
      // 模拟不同书籍的共读活动数据
      const activitiesData = {
        '1': [
          {
            id: '1',
            title: '《小王子》30天共读活动',
            status: 'active',
            startDate: '2023-10-01',
            endDate: '2023-10-30',
            participantCount: 128,
            organizer: {
              id: 'user1',
              name: '阅读君',
              avatarUrl: '/static/images/avatars/user1.png'
            }
          },
          {
            id: '2',
            title: '探索小王子的哲学世界',
            status: 'ended',
            startDate: '2023-08-15',
            endDate: '2023-09-15',
            participantCount: 89,
            organizer: {
              id: 'user2',
              name: '哲学书友会',
              avatarUrl: '/static/images/avatars/user2.png'
            }
          }
        ],
        '4': [
          {
            id: '3',
            title: '哈利·波特魔法世界探索',
            status: 'active',
            startDate: '2023-09-01',
            endDate: '2023-10-15',
            participantCount: 156,
            organizer: {
              id: 'user3',
              name: '魔法爱好者',
              avatarUrl: '/static/images/avatars/user3.png'
            }
          }
        ]
      };
      
      // 获取对应书籍的活动，如果没有则返回空数组
      const mockActivities = activitiesData[bookId] || [];
      
      this.setData({
        readingActivities: mockActivities
      });
    }, 1200); // 模拟网络延迟
  },
  
  /**
   * 获取读者评价
   */
  fetchReviews: function(bookId) {
    // 在实际项目中，应该调用API获取数据
    setTimeout(() => {
      console.log('获取读者评价，bookId:', bookId);
      
      // 模拟不同书籍的评论数据
      const reviewsData = {
        '1': [
          {
            id: 'r1',
            user: {
              id: 'user3',
              name: '阅读爱好者',
              avatarUrl: '/static/images/avatars/user3.png'
            },
            rating: 5,
            content: '这本书陪伴了我的童年，如今重读仍能感受到那份纯真和感动。小王子教会我们用心去看，重要的东西用眼睛是看不见的。',
            date: '2023-09-15',
            likes: 34,
            comments: 5,
            liked: false
          },
          {
            id: 'r2',
            user: {
              id: 'user4',
              name: '文学探索者',
              avatarUrl: '/static/images/avatars/user4.png'
            },
            rating: 4,
            content: '简单的故事蕴含深刻的哲理，每一个形象都有其象征意义。无论是傲慢的国王、虚荣的人、贪婪的商人还是忠实的狐狸，都在提醒我们思考生活的本质。',
            date: '2023-08-22',
            likes: 18,
            comments: 2,
            liked: true
          }
        ],
        '2': [
          {
            id: 'r3',
            user: {
              id: 'user5',
              name: '童书爱好者',
              avatarUrl: '/static/images/avatars/user5.png'
            },
            rating: 5,
            content: '夏洛的网是一个关于友情、忠诚和牺牲的美丽故事。夏洛为救威尔伯付出的一切，让我每次读都忍不住落泪。这本书教会了我生命的意义和价值。',
            date: '2023-07-18',
            likes: 42,
            comments: 7,
            liked: false
          }
        ],
        '3': [
          {
            id: 'r4',
            user: {
              id: 'user6',
              name: '教育工作者',
              avatarUrl: '/static/images/avatars/user6.png'
            },
            rating: 5,
            content: '作为一名教师，这本书给了我很多启发。小林校长的教育理念非常前卫，尊重孩子的天性和兴趣。希望更多的学校能够采纳这种以学生为中心的教育方式。',
            date: '2023-08-05',
            likes: 56,
            comments: 12,
            liked: false
          }
        ],
        '4': [
          {
            id: 'r5',
            user: {
              id: 'user7',
              name: '魔法迷',
              avatarUrl: '/static/images/avatars/user7.png'
            },
            rating: 5,
            content: '哈利波特系列的开篇之作，罗琳创造了一个令人着迷的魔法世界。霍格沃茨、对角巷、魁地奇，每一个细节都让人沉浸其中。非常适合作为孩子的入门奇幻读物。',
            date: '2023-09-01',
            likes: 78,
            comments: 15,
            liked: true
          }
        ],
        '5': [
          {
            id: 'r6',
            user: {
              id: 'user8',
              name: '经典文学爱好者',
              avatarUrl: '/static/images/avatars/user8.png'
            },
            rating: 4,
            content: '这本书的荒诞不经和隐喻令人着迷。卡罗尔创造的仙境充满了对维多利亚时代社会的批判，同时又保持了童话的趣味性。几乎每个角色都成为了文化符号。',
            date: '2023-06-30',
            likes: 33,
            comments: 8,
            liked: false
          }
        ]
      };
      
      // 获取对应书籍的评论，如果没有则返回空数组
      const mockReviews = reviewsData[bookId] || [];
      const hasMore = bookId === '1'; // 只有小王子有更多评论
      
      this.setData({
        reviews: mockReviews,
        hasMoreReviews: hasMore
      });
    }, 1500); // 模拟网络延迟
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
   * 加入书架
   */
  addToBookshelf: function() {
    wx.showToast({
      title: '已加入书架',
      icon: 'success'
    });
    
    // 实际应用中，应该将数据保存到服务器
  },
  
  /**
   * 参与共读
   */
  joinReading: function() {
    const { readingActivities } = this.data;
    
    if (readingActivities.length > 0) {
      // 有共读活动，跳转到活动详情
      const activeActivity = readingActivities.find(activity => activity.status === 'active');
      
      if (activeActivity) {
        wx.navigateTo({
          url: `/pages/activity-detail/activity-detail?id=${activeActivity.id}`
        });
      } else {
        wx.showModal({
          title: '提示',
          content: '当前没有进行中的共读活动，是否创建新活动？',
          confirmText: '创建',
          success: (res) => {
            if (res.confirm) {
              this.createActivity();
            }
          }
        });
      }
    } else {
      // 无共读活动，创建新活动
      this.createActivity();
    }
  },
  
  /**
   * 创建共读活动
   */
  createActivity: function() {
    wx.navigateTo({
      url: `/pages/create-activity/create-activity?bookId=${this.data.book.id}`
    });
  },
  
  /**
   * 跳转到活动详情
   */
  navigateToActivity: function(e) {
    const activityId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity-detail/activity-detail?id=${activityId}`
    });
  },
  
  /**
   * 写评价
   */
  writeReview: function() {
    wx.navigateTo({
      url: `/pages/write-review/write-review?bookId=${this.data.book.id}`
    });
  },
  
  /**
   * 点赞评论
   */
  likeReview: function(e) {
    const reviewId = e.currentTarget.dataset.id;
    const reviews = [...this.data.reviews];
    
    const index = reviews.findIndex(review => review.id === reviewId);
    if (index !== -1) {
      const review = reviews[index];
      const liked = !review.liked;
      const likes = liked ? review.likes + 1 : review.likes - 1;
      
      reviews[index] = {
        ...review,
        liked,
        likes
      };
      
      this.setData({
        reviews
      });
      
      // 实际应用中，应该将点赞状态保存到服务器
    }
  },
  
  /**
   * 评论
   */
  commentReview: function(e) {
    const reviewId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/review-comments/review-comments?reviewId=${reviewId}`
    });
  },
  
  /**
   * 加载更多评论
   */
  loadMoreReviews: function() {
    wx.showLoading({
      title: '加载中...'
    });
    
    const { book } = this.data;
    
    // 实际应用中，应该调用API获取更多评论
    setTimeout(() => {
      wx.hideLoading();
      
      // 只有小王子(id=1)有更多评论
      if (book && book.id === '1') {
        // 模拟数据
        const moreReviews = [
          {
            id: 'r3',
            user: {
              id: 'user5',
              name: '童话爱好者',
              avatarUrl: '/static/images/avatars/user5.png'
            },
            rating: 5,
            content: '这本书不仅仅是一个童话故事，更是一段心灵的旅程。当小王子告诉我们"只有用心才能看得清"时，我被深深打动了。',
            date: '2023-07-30',
            likes: 27,
            comments: 3,
            liked: false
          }
        ];
        
        this.setData({
          reviews: [...this.data.reviews, ...moreReviews],
          hasMoreReviews: false // 模拟没有更多数据
        });
      } else {
        this.setData({
          hasMoreReviews: false
        });
      }
    }, 1000);
  },
  
  /**
   * 返回上一页
   */
  goBack: function() {
    wx.navigateBack();
  }
}) 