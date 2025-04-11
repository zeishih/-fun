<template>
  <el-breadcrumb separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.path">
        {{ item.meta.title }}
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const breadcrumbs = ref([])

// 生成面包屑数据
const getBreadcrumbs = () => {
  // 过滤掉没有meta或meta.title的路由
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  
  // 如果第一个不是 Dashboard，添加 Dashboard 作为首页
  if (matched.length && matched[0].path !== '/dashboard') {
    matched.unshift({
      path: '/dashboard',
      meta: { title: '首页' }
    })
  }
  
  breadcrumbs.value = matched
}

// 初始化及路由变化时更新面包屑
getBreadcrumbs()
watch(() => route.path, getBreadcrumbs)
</script>

<style scoped>
.el-breadcrumb {
  display: inline-block;
  line-height: 60px;
}

/* 面包屑动画 */
.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all 0.5s;
}
.breadcrumb-enter-from,
.breadcrumb-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style> 