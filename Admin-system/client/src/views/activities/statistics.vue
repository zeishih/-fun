<template>
  <div class="activity-statistics-container">
    <div class="page-header">
      <el-page-header @back="goBack" title="活动统计数据">
        <template #content>
          <div class="content">
            <span class="text">活动统计数据</span>
          </div>
        </template>
      </el-page-header>
    </div>

    <div v-loading="loading" class="statistics-cards">
      <!-- 总活动数统计卡片 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="box-card stat-card">
            <div class="stat-card-content">
              <div class="stat-icon primary">
                <el-icon :size="28"><Calendar /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">活动总数</div>
                <div class="stat-value">{{ statistics.totalActivities || 0 }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6" v-for="(item, index) in statusCards" :key="index">
          <el-card shadow="hover" class="box-card stat-card">
            <div class="stat-card-content">
              <div class="stat-icon" :class="item.color">
                <el-icon :size="28"><component :is="item.icon" /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">{{ item.title }}</div>
                <div class="stat-value">{{ item.value }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <el-row :gutter="20" class="chart-row">
      <!-- 状态分布 -->
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>活动状态分布</span>
            </div>
          </template>
          <div v-loading="loading" class="chart-container">
            <div id="statusChart" class="chart"></div>
            <div v-if="!loading && (!statistics.statusStats || statistics.statusStats.length === 0)" class="empty-chart">
              <el-empty description="暂无数据" :image-size="100"></el-empty>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 审核状态分布 -->
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>审核状态分布</span>
            </div>
          </template>
          <div v-loading="loading" class="chart-container">
            <div id="approvalChart" class="chart"></div>
            <div v-if="!loading && (!statistics.approvalStats || statistics.approvalStats.length === 0)" class="empty-chart">
              <el-empty description="暂无数据" :image-size="100"></el-empty>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="chart-row">
      <!-- 月度活动趋势 -->
      <el-col :span="24">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>月度活动创建趋势</span>
            </div>
          </template>
          <div v-loading="loading" class="chart-container">
            <div id="monthlyChart" class="chart"></div>
            <div v-if="!loading && (!statistics.monthlyStats || statistics.monthlyStats.length === 0)" class="empty-chart">
              <el-empty description="暂无数据" :image-size="100"></el-empty>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 热门活动排行 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>热门活动排行</span>
        </div>
      </template>
      <div v-loading="loading">
        <el-table
          v-if="!loading && statistics.topActivities && statistics.topActivities.length > 0"
          :data="statistics.topActivities"
          border
          style="width: 100%"
        >
          <el-table-column type="index" label="排名" width="80" />
          <el-table-column prop="title" label="活动名称" min-width="200">
            <template #default="{ row }">
              <router-link :to="`/activities/detail/${row._id}`" class="link-type">
                {{ row.title }}
              </router-link>
            </template>
          </el-table-column>
          <el-table-column prop="participantCount" label="参与人数" width="120" sortable />
          <el-table-column prop="status" label="活动状态" width="120">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)">
                {{ statusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="handleDetail(row)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div v-else-if="!loading && (!statistics.topActivities || statistics.topActivities.length === 0)" class="empty-table">
          <el-empty description="暂无热门活动数据"></el-empty>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Calendar, TrendCharts, Stamp, SetUp } from '@element-plus/icons-vue'
import { getActivityStatistics } from '../../api/activity'
import * as echarts from 'echarts/core'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent, GridComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册 ECharts 组件
echarts.use([
  PieChart, BarChart, LineChart,
  TooltipComponent, LegendComponent, GridComponent, TitleComponent,
  CanvasRenderer
])

const router = useRouter()

// 统计数据
const statistics = ref({
  totalActivities: 0,
  statusStats: [],
  approvalStats: [],
  monthlyStats: [],
  topActivities: []
})

const loading = ref(false)

// 状态卡片数据
const statusCards = computed(() => {
  if (!statistics.value.statusStats) return []
  
  // 计算各个状态的活动数量
  const statMap = {
    recruiting: { count: 0, title: '招募中', icon: 'Stamp', color: 'warning' },
    ongoing: { count: 0, title: '进行中', icon: 'TrendCharts', color: 'success' },
    completed: { count: 0, title: '已完成', icon: 'SetUp', color: 'info' }
  }
  
  // 填充数据
  statistics.value.statusStats.forEach(stat => {
    if (statMap[stat._id]) {
      statMap[stat._id].count = stat.count
    }
  })
  
  // 转换为数组
  return Object.values(statMap).map(item => ({
    title: item.title,
    value: item.count,
    icon: item.icon,
    color: item.color
  }))
})

// 获取统计数据
const getStatistics = async () => {
  loading.value = true
  try {
    const { data } = await getActivityStatistics()
    statistics.value = data.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
    
    // 初始化图表
    nextTick(() => {
      initCharts()
    })
  }
}

// 初始化图表
const initCharts = () => {
  if (!statistics.value) return
  
  // 活动状态分布饼图
  initStatusChart()
  
  // 审核状态分布饼图
  initApprovalChart()
  
  // 月度活动趋势图
  initMonthlyChart()
}

// 初始化状态分布图表
const initStatusChart = () => {
  const chartDom = document.getElementById('statusChart')
  if (!chartDom || !statistics.value.statusStats || statistics.value.statusStats.length === 0) return
  
  const myChart = echarts.init(chartDom)
  
  const statusMap = {
    recruiting: '招募中',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  
  const data = statistics.value.statusStats.map(item => ({
    name: statusMap[item._id] || item._id,
    value: item.count
  }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '活动状态',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  }
  
  myChart.setOption(option)
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    myChart.resize()
  })
}

// 初始化审核状态分布图表
const initApprovalChart = () => {
  const chartDom = document.getElementById('approvalChart')
  if (!chartDom || !statistics.value.approvalStats || statistics.value.approvalStats.length === 0) return
  
  const myChart = echarts.init(chartDom)
  
  const approvalMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  
  const colorMap = {
    pending: '#E6A23C',
    approved: '#67C23A',
    rejected: '#F56C6C'
  }
  
  const data = statistics.value.approvalStats.map(item => ({
    name: approvalMap[item._id] || item._id,
    value: item.count,
    itemStyle: {
      color: colorMap[item._id]
    }
  }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '审核状态',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  }
  
  myChart.setOption(option)
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    myChart.resize()
  })
}

// 初始化月度趋势图表
const initMonthlyChart = () => {
  const chartDom = document.getElementById('monthlyChart')
  if (!chartDom || !statistics.value.monthlyStats || statistics.value.monthlyStats.length === 0) return
  
  const myChart = echarts.init(chartDom)
  
  // 对月度数据进行排序和格式化
  const sortedData = [...statistics.value.monthlyStats]
    .sort((a, b) => {
      if (a._id.year !== b._id.year) {
        return a._id.year - b._id.year
      }
      return a._id.month - b._id.month
    })
  
  const months = sortedData.map(item => {
    return `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`
  })
  
  const counts = sortedData.map(item => item.count)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '活动数量',
        type: 'bar',
        barWidth: '60%',
        data: counts
      }
    ]
  }
  
  myChart.setOption(option)
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    myChart.resize()
  })
}

// 返回上一页
const goBack = () => {
  router.push('/activities')
}

// 查看活动详情
const handleDetail = (row) => {
  router.push(`/activities/detail/${row._id}`)
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '--'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 活动状态标签类型
const statusTagType = (status) => {
  const map = {
    'recruiting': 'primary',
    'ongoing': 'success',
    'completed': 'info',
    'cancelled': 'danger'
  }
  return map[status] || 'info'
}

// 活动状态标签文本
const statusLabel = (status) => {
  const map = {
    'recruiting': '招募中',
    'ongoing': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return map[status] || status
}

onMounted(() => {
  getStatistics()
})
</script>

<style scoped>
.activity-statistics-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.content {
  display: flex;
  align-items: center;
}

.text {
  font-size: 18px;
  font-weight: bold;
}

.statistics-cards {
  margin-bottom: 20px;
}

.chart-row {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
  display: flex;
  align-items: center;
}

.stat-card-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
}

.stat-icon.primary {
  background-color: #409EFF;
}

.stat-icon.success {
  background-color: #67C23A;
}

.stat-icon.warning {
  background-color: #E6A23C;
}

.stat-icon.info {
  background-color: #909399;
}

.stat-icon.danger {
  background-color: #F56C6C;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.chart-container {
  position: relative;
  height: 300px;
}

.chart {
  width: 100%;
  height: 100%;
}

.empty-chart, .empty-table {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.link-type {
  color: #409EFF;
  text-decoration: none;
}

.link-type:hover {
  text-decoration: underline;
}
</style> 