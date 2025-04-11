<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <div class="sidebar-container" :class="{ 'is-collapsed': isCollapsed }">
      <div class="logo-container">
        <h1 class="logo-title">阅读越有fun</h1>
      </div>
      
      <!-- 菜单 -->
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        :collapse="isCollapsed"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        
        <el-menu-item index="/books">
          <el-icon><Reading /></el-icon>
          <span>书籍管理</span>
        </el-menu-item>
      </el-menu>
    </div>
    
    <!-- 主体区域 -->
    <div class="main-container">
      <!-- 顶部导航 -->
      <div class="navbar">
        <div class="left-area">
          <el-icon class="toggle-sidebar" @click="toggleSidebar">
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
          <breadcrumb />
        </div>
        
        <div class="right-menu">
          <el-dropdown trigger="click">
            <div class="avatar-wrapper">
              <el-avatar :size="36" icon="UserFilled" />
              <span class="user-name">{{ userInfo.username || '管理员' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Odometer, User, Reading, Fold, Expand, ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'
import { ElMessageBox } from 'element-plus'

// 导入面包屑组件
// 这里假设有面包屑组件，可以根据需要实现或删除该引用
const Breadcrumb = defineAsyncComponent(() => import('./components/Breadcrumb.vue'))

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 折叠状态
const isCollapsed = ref(false)

// 计算当前活动菜单
const activeMenu = computed(() => {
  return route.path
})

// 获取用户信息
const userInfo = computed(() => {
  return userStore.userInfo
})

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

// 处理登出
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
  }).catch(() => {})
}
</script>

<style scoped>
.app-wrapper {
  position: relative;
  height: 100vh;
  width: 100%;
  display: flex;
}

.sidebar-container {
  width: 210px;
  height: 100%;
  background: #304156;
  transition: width 0.28s;
  overflow: hidden;
}

.sidebar-container.is-collapsed {
  width: 64px;
}

.logo-container {
  height: 60px;
  padding: 10px 0;
  text-align: center;
  overflow: hidden;
}

.logo-title {
  color: #fff;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.navbar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.left-area {
  display: flex;
  align-items: center;
}

.toggle-sidebar {
  font-size: 20px;
  cursor: pointer;
  margin-right: 15px;
}

.right-menu {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-name {
  margin: 0 5px;
}

.app-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f0f2f5;
}

/* 过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from,
.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 