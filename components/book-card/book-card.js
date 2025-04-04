Component({
  /**
   * 组件的属性列表
   */
  properties: {
    book: {
      type: Object,
      value: {}
    },
    showRating: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    defaultCover: '/static/images/books/default-cover.png'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTap() {
      const { book } = this.properties;
      this.triggerEvent('tap', { bookId: book.id });
    },

    onCoverError() {
      const { book } = this.properties;
      this.triggerEvent('coverError', { bookId: book.id });
    }
  }
}) 