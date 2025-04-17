<template>
  <div class="activities-container">
    <div class="filter-container">
      <el-card class="box-card">
        <div class="filter-line">
          <el-form :inline="true" :model="queryParams" class="filter-form">
            <el-form-item label="活动状态">
              <el-select v-model="queryParams.status" placeholder="选择活动状态" clearable>
                <el-option label="招募中" value="recruiting" />
                <el-option label="进行中" value="ongoing" />
                <el-option label="已完成" value="completed" />
                <el-option label="已取消" value="cancelled" />
              </el-select>
            </el-form-item>
            <el-form-item label="审核状态">
              <el-select v-model="queryParams.approvalStatus" placeholder="选择审核状态" clearable>
                <el-option label="待审核" value="pending" />
                <el-option label="已通过" value="approved" />
                <el-option label="已拒绝" value="rejected" />
              </el-select>
            </el-form-item>
            <el-form-item label="搜索">
              <el-input v-model="queryParams.search" placeholder="输入关键词" clearable />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="getList">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>

    <el-card class="box-card">
      <div class="table-operations">
        <el-button type="primary" icon="Plus" @click="handleRefresh">刷新</el-button>
        <el-button type="success" icon="DataAnalysis" @click="goToStatistics">查看统计</el-button>
      </div>
      
      <el-table v-loading="loading" :data="activityList" border style="width: 100%">
        <el-table-column prop="title" label="活动名称" min-width="150">
          <template #default="{ row }">
            <router-link :to="`/activities/detail/${row._id}`" class="link-type">
              {{ row.title }}
            </router-link>
          </template>
        </el-table-column>
        
        <el-table-column prop="type" label="活动类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'public' ? 'success' : 'warning'">
              {{ row.type === 'public' ? '公开' : '私密' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="活动状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="approvalStatus" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="approvalTagType(row.approvalStatus)">
              {{ approvalLabel(row.approvalStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="creator.nickname" label="创建者" width="120" />
        
        <el-table-column label="参与人数" width="100">
          <template #default="{ row }">
            {{ row.participants ? row.participants.length : 0 }} / 
            {{ row.maxParticipants > 0 ? row.maxParticipants : '不限' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.approvalStatus === 'pending'"
              type="primary" 
              size="small" 
              @click="handleApprove(row)"
            >
              审核
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="handleDetail(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:currentPage="queryParams.page"
          v-model:page-size="queryParams.limit"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 审核对话框 -->
    <el-dialog
      v-model="approveDialogVisible"
      title="活动审核"
      width="500px"
    >
      <el-form :model="approveForm" label-width="100px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="approveForm.approvalStatus">
            <el-radio label="approved">通过</el-radio>
            <el-radio label="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input
            v-model="approveForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入审核意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approveDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitApprove">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getActivities, approveActivity } from '../../api/activity'

const router = useRouter()

// 活动列表数据
const activityList = ref([])
const total = ref(0)
const loading = ref(false)

// 查询参数
const queryParams = reactive({
  page: 1,
  limit: 10,
  status: '',
  approvalStatus: '',
  search: ''
})

// 审核表单
const approveDialogVisible = ref(false)
const approveForm = reactive({
  id: '',
  approvalStatus: 'approved',
  comment: ''
})

// 获取活动列表
const getList = async () => {
  loading.value = true
  try {
    const { data } = await getActivities(queryParams)
    activityList.value = data.data
    total.value = data.total
  } catch (error) {
    console.error('获取活动列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 重置查询条件
const resetQuery = () => {
  Object.assign(queryParams, {
    page: 1,
    limit: 10,
    status: '',
    approvalStatus: '',
    search: ''
  })
  getList()
}

// 刷新列表
const handleRefresh = () => {
  getList()
}

// 处理分页变化
const handleSizeChange = (size) => {
  queryParams.limit = size
  getList()
}

const handleCurrentChange = (page) => {
  queryParams.page = page
  getList()
}

// 查看详情
const handleDetail = (row) => {
  router.push(`/activities/detail/${row._id}`)
}

// 打开审核对话框
const handleApprove = (row) => {
  approveForm.id = row._id
  approveForm.approvalStatus = 'approved'
  approveForm.comment = ''
  approveDialogVisible.value = true
}

// 提交审核
const submitApprove = async () => {
  try {
    await approveActivity(approveForm.id, {
      approvalStatus: approveForm.approvalStatus,
      comment: approveForm.comment
    })
    
    ElMessage.success('审核操作成功')
    approveDialogVisible.value = false
    getList()
  } catch (error) {
    console.error('审核失败:', error)
  }
}

// 跳转到统计页面
const goToStatistics = () => {
  router.push('/activities/statistics')
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
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

// 审核状态标签类型
const approvalTagType = (status) => {
  const map = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  }
  return map[status] || 'info'
}

// 审核状态标签文本
const approvalLabel = (status) => {
  const map = {
    'pending': '待审核',
    'approved': '已通过',
    'rejected': '已拒绝'
  }
  return map[status] || status
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.activities-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.table-operations {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.link-type {
  color: #409EFF;
  text-decoration: none;
}

.link-type:hover {
  text-decoration: underline;
}
</style> 