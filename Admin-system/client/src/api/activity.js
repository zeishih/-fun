import request from './request'

/**
 * 获取所有活动列表
 * @param {Object} params - 查询参数
 * @returns {Promise} - 请求Promise对象
 */
export function getActivities(params) {
  return request({
    url: '/activities',
    method: 'get',
    params
  })
}

/**
 * 获取活动详情
 * @param {String} id - 活动ID
 * @returns {Promise} - 请求Promise对象
 */
export function getActivityById(id) {
  return request({
    url: `/activities/${id}`,
    method: 'get'
  })
}

/**
 * 审核活动
 * @param {String} id - 活动ID
 * @param {Object} data - 审核数据
 * @returns {Promise} - 请求Promise对象
 */
export function approveActivity(id, data) {
  return request({
    url: `/activities/${id}/approve`,
    method: 'put',
    data
  })
}

/**
 * 获取活动统计数据
 * @returns {Promise} - 请求Promise对象
 */
export function getActivityStatistics() {
  return request({
    url: '/activities/statistics',
    method: 'get'
  })
} 