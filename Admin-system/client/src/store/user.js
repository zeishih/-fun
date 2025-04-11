import { defineStore } from 'pinia'
import { login as apiLogin } from '../api/auth'
import router from '../router'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  
  actions: {
    // 用户登录
    async login(credentials) {
      try {
        const { data } = await apiLogin(credentials)
        
        // 保存token和用户信息
        this.token = data.token
        this.userInfo = data.admin
        
        // 存储到localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('userInfo', JSON.stringify(data.admin))
        
        return Promise.resolve(data)
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    // 用户登出
    logout() {
      // 清除token和用户信息
      this.token = ''
      this.userInfo = {}
      
      // 清除localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      
      // 重定向到登录页
      router.push('/login')
    }
  }
}) 