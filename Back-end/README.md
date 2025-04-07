# 阅读越有fun 微信小程序后端

这是"阅读越有fun"微信小程序的后端服务，提供用户认证、数据存储和业务逻辑处理功能。

## 技术栈

- **Node.js**: JavaScript运行时环境
- **Express**: Web应用框架
- **MongoDB**: NoSQL数据库
- **Mongoose**: MongoDB对象模型工具
- **JWT**: JSON Web Token用于用户认证
- **微信小程序API**: 用于用户登录和信息获取

## 项目结构

```
/
├── config/            # 配置文件
│   └── db.js          # 数据库连接配置
├── controllers/       # 控制器
│   └── authController.js # 身份验证控制器
├── middleware/        # 中间件
│   ├── auth.js        # 认证中间件
│   └── error.js       # 错误处理中间件
├── models/            # 数据模型
│   └── User.js        # 用户模型
├── routes/            # 路由
│   └── auth.js        # 认证路由
├── .env               # 环境变量（不提交到版本控制）
├── .gitignore         # Git忽略配置
├── package.json       # 项目依赖
├── README.md          # 项目说明文档
└── server.js          # 应用入口文件
```

## 已实现API

### 认证 API

- **登录**: `POST /api/auth/login`
  - 请求体: `{ code: "微信登录code" }`
  - 响应: `{ success: true, token: "JWT令牌", user: { id, nickname, avatarUrl, statistics } }`

- **更新用户信息**: `PUT /api/auth/user-info`
  - 请求头: `Authorization: Bearer {token}`
  - 请求体: `{ nickname: "用户昵称", avatarUrl: "头像URL" }`
  - 响应: `{ success: true, data: { id, nickname, avatarUrl, statistics } }`

## 环境变量

项目使用 `.env` 文件管理环境变量，需要创建一个包含以下内容的 `.env` 文件：

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/reading_fun_dev
JWT_SECRET=<你的JWT密钥>
WECHAT_APPID=<你的微信小程序AppID>
WECHAT_SECRET=<你的微信小程序AppSecret>
```

## 开发指南

1. 安装依赖:
   ```bash
   npm install
   ```

2. 开发环境运行:
   ```bash
   npm run dev
   ```

3. 生产环境运行:
   ```bash
   npm start
   ```

## 后续开发计划

1. 实现英语阅读内容管理API
2. 实现用户阅读进度跟踪
3. 实现阅读统计和数据分析
4. 添加单元测试和集成测试 