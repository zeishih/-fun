import request from './request'

// 获取用户列表
export function getUserList(params) {
  return request({
    url: '/users',
    method: 'get',
    params
  })
}

// 获取用户详情
export function getUserDetail(id) {
  return request({
    url: `/users/${id}`,
    method: 'get'
  })
}

// 禁用/启用用户
export function updateUserStatus(id, status) {
  return request({
    url: `/users/${id}/status`,
    method: 'put',
    data: { status }
  })
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: `/users/${id}`,
    method: 'delete'
  })
} 