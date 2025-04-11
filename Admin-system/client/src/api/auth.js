import request from './request'

// 管理员登录
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

// 获取当前管理员信息
export function getAdminInfo() {
  return request({
    url: '/auth/profile',
    method: 'get'
  })
}

// 登出
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
} 