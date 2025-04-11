import request from './request'

// 获取书籍列表
export function getBookList(params) {
  return request({
    url: '/books',
    method: 'get',
    params
  })
}

// 获取书籍详情
export function getBookDetail(id) {
  return request({
    url: `/books/${id}`,
    method: 'get'
  })
}

// 添加书籍
export function addBook(data) {
  return request({
    url: '/books',
    method: 'post',
    data
  })
}

// 更新书籍
export function updateBook(id, data) {
  return request({
    url: `/books/${id}`,
    method: 'put',
    data
  })
}

// 删除书籍
export function deleteBook(id) {
  return request({
    url: `/books/${id}`,
    method: 'delete'
  })
} 