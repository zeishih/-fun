import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('../layout/index.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/users/index.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'books',
        name: 'Books',
        component: () => import('../views/books/index.vue'),
        meta: { title: '书籍管理', icon: 'Reading' }
      }
    ]
  },
  {
    // 捕获所有未匹配的路由
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token || localStorage.getItem('token')
  
  // 需要认证且没有token
  if (to.meta.requiresAuth !== false && !token) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router 