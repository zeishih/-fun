import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 创建axios实例
const request = axios.create({
  baseURL: '/api/admin', // 后端管理员API前缀
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    
    // 如果有token则添加到请求头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
    return response
  },
  error => {
    const { status, data } = error.response || {}
    
    if (status === 401) {
      // 401: 未登录或token过期
      ElMessage.error('登录已过期，请重新登录')
      // 清除token
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      // 跳转登录页
      router.push('/login')
    } else if (status === 403) {
      // 403: 权限不足
      ElMessage.error('权限不足，无法执行此操作')
    } else {
      // 其他错误
      ElMessage.error(data?.message || '请求失败，请稍后重试')
    }
    
    return Promise.reject(error)
  }
)

export default request 