<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="6" v-for="(item, index) in statisticsData" :key="index">
        <el-card class="stat-card" shadow="hover" :class="{ 'clickable': item.path }" @click="handleCardClick(item)">
          <div class="card-content">
            <div class="card-icon" :style="{ backgroundColor: item.color }">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">{{ item.title }}</div>
              <div class="card-value">{{ item.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="chart-row">
      <!-- 图表区域 -->
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户活跃度</span>
            </div>
          </template>
          <div class="chart-placeholder">
            <el-empty description="暂无数据" />
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>阅读趋势</span>
            </div>
          </template>
          <div class="chart-placeholder">
            <el-empty description="暂无数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <!-- 最近活动 -->
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
            </div>
          </template>
          <el-table :data="recentActivities" style="width: 100%">
            <el-table-column prop="title" label="活动名称" width="250" />
            <el-table-column prop="creator" label="创建者" width="120" />
            <el-table-column prop="type" label="活动类型" width="120" />
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="participants" label="参与人数" width="120" />
            <el-table-column prop="createTime" label="创建时间" sortable width="180" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { User, Reading, Bell, Timer } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 统计数据
const statisticsData = ref([
  { 
    title: '总用户数', 
    value: 0, 
    icon: 'User', 
    color: '#409EFF'
  },
  { 
    title: '总书籍数', 
    value: 0, 
    icon: 'Reading', 
    color: '#67C23A' 
  },
  { 
    title: '活动数量', 
    value: 0, 
    icon: 'Bell', 
    color: '#E6A23C' 
  },
  { 
    title: '待审核活动', 
    value: 0, 
    icon: 'Timer', 
    color: '#F56C6C',
    path: '/activities',
    query: { approvalStatus: 'pending' }
  }
])

// 最近活动
const recentActivities = ref([])

// 获取状态标签类型
const getStatusType = (status) => {
  const map = {
    '进行中': 'success',
    '已结束': 'info',
    '待审核': 'warning',
    '已驳回': 'danger'
  }
  return map[status] || ''
}

// 处理卡片点击
const handleCardClick = (item) => {
  if (item.path) {
    router.push({
      path: item.path,
      query: item.query
    })
  }
}

// 获取仪表盘数据
const fetchDashboardData = async () => {
  try {
    // 这里应该调用API获取真实数据
    // 这里使用模拟数据
    
    // 更新统计数据
    statisticsData.value = [
      { title: '总用户数', value: 1258, icon: 'User', color: '#409EFF' },
      { title: '总书籍数', value: 324, icon: 'Reading', color: '#67C23A' },
      { title: '活动数量', value: 56, icon: 'Bell', color: '#E6A23C' },
      { 
        title: '待审核活动', 
        value: 8, 
        icon: 'Timer', 
        color: '#F56C6C',
        path: '/activities',
        query: { approvalStatus: 'pending' }
      }
    ]
    
    // 更新最近活动
    recentActivities.value = [
      { title: '21天阅读马拉松', creator: '王小明', type: '马拉松', status: '进行中', participants: 45, createTime: '2023-05-15 08:30:00' },
      { title: '《红楼梦》读书会', creator: '李华', type: '读书会', status: '待审核', participants: 0, createTime: '2023-05-14 16:45:00' },
      { title: '亲子共读活动', creator: '张三', type: '亲子', status: '已结束', participants: 28, createTime: '2023-05-10 10:15:00' },
      { title: '外语学习小组', creator: '赵四', type: '学习', status: '进行中', participants: 32, createTime: '2023-05-08 14:20:00' },
      { title: '职场书籍交流会', creator: '刘丽', type: '交流', status: '已驳回', participants: 0, createTime: '2023-05-05 09:00:00' }
    ]
  } catch (error) {
    console.error('获取仪表盘数据失败', error)
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.dashboard-container {
  padding: 10px;
}

.stat-card {
  margin-bottom: 20px;
}

.chart-row {
  margin-bottom: 20px;
}

.card-content {
  display: flex;
  align-items: center;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  font-size: 24px;
  color: white;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.card-value {
  font-size: 22px;
  font-weight: bold;
  color: #333;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-card {
  height: 350px;
}

.chart-placeholder {
  height: 280px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.clickable {
  cursor: pointer;
  transition: transform 0.2s;
}

.clickable:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}
</style> 