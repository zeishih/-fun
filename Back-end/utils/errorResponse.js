class ErrorResponse extends Error {
    constructor(message, statusCode) {
      super(message); // 调用父类 Error 的构造函数
      this.statusCode = statusCode; // 添加 statusCode 属性
  
      // 可选: 捕获堆栈跟踪，但不包括 ErrorResponse 构造函数本身
      Error.captureStackTrace(this, this.constructor); 
    }
  }
  
  module.exports = ErrorResponse; // 导出这个类，以便其他文件可以通过 require 使用