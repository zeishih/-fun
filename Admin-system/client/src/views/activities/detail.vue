<template>
  <div class="activity-detail-container">
    <div class="page-header">
      <el-page-header @back="goBack" :title="activity.title || '活动详情'">
        <template #content>
          <div class="content">
            <span class="text">{{ activity.title || '加载中...' }}</span>
            <el-tag v-if="activity.status" :type="statusTagType(activity.status)">
              {{ statusLabel(activity.status) }}
            </el-tag>
            <el-tag v-if="activity.approvalStatus" :type="approvalTagType(activity.approvalStatus)" style="margin-left: 10px">
              {{ approvalLabel(activity.approvalStatus) }}
            </el-tag>
          </div>
        </template>
      </el-page-header>
    </div>

    <el-card v-loading="loading" class="box-card">
      <template #header>
        <div class="card-header">
          <span>活动信息</span>
          <div class="operations">
            <el-button 
              v-if="activity.approvalStatus === 'pending'"
              type="primary" 
              size="small" 
              @click="handleApprove"
            >
              审核
            </el-button>
          </div>
        </div>
      </template>
      
      <div v-if="!loading && activity._id">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="活动ID" :span="2">{{ activity._id }}</el-descriptions-item>
          <el-descriptions-item label="活动名称" :span="2">{{ activity.title }}</el-descriptions-item>
          <el-descriptions-item label="关联书籍">
            <div v-if="activity.book">
              <div class="book-info">
                <div v-if="activity.book.coverUrl" class="book-cover">
                  <el-image :src="activity.book.coverUrl" fit="cover" style="width: 60px; height: 80px"></el-image>
                </div>
                <div class="book-meta">
                  <div>《{{ activity.book.title }}》</div>
                  <div class="book-author">{{ activity.book.author }}</div>
                </div>
              </div>
            </div>
            <span v-else>--</span>
          </el-descriptions-item>
          <el-descriptions-item label="活动类型">
            <el-tag :type="activity.type === 'public' ? 'success' : 'warning'">
              {{ activity.type === 'public' ? '公开' : '私密' }}
            </el-tag>
            <template v-if="activity.type === 'private' && activity.inviteCode">
              <div class="invite-code">邀请码: {{ activity.inviteCode }}</div>
            </template>
          </el-descriptions-item>
          <el-descriptions-item label="活动时间" :span="2">
            {{ formatDate(activity.startDate) }} ~ {{ formatDate(activity.endDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="活动状态">
            <el-tag :type="statusTagType(activity.status)">
              {{ statusLabel(activity.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="approvalTagType(activity.approvalStatus)">
              {{ approvalLabel(activity.approvalStatus) }}
            </el-tag>
            <div v-if="activity.approvalComment" class="approval-comment">
              <div>审核意见: {{ activity.approvalComment }}</div>
              <div v-if="activity.approvalDate">
                审核时间: {{ formatDate(activity.approvalDate) }}
              </div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="创建者" :span="2">
            <div class="user-info" v-if="activity.creator">
              <el-avatar :size="32" :src="activity.creator.avatarUrl || ''">
                {{ activity.creator.nickname ? activity.creator.nickname.substring(0, 1) : '用' }}
              </el-avatar>
              <span class="user-nickname">{{ activity.creator.nickname }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="参与人数" :span="2">
            {{ activity.participants ? activity.participants.length : 0 }} / 
            {{ activity.maxParticipants > 0 ? activity.maxParticipants : '不限' }}
          </el-descriptions-item>
          <el-descriptions-item label="活动描述" :span="2">
            <div class="rich-text">{{ activity.description || '无描述' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="活动规则" :span="2">
            <div v-if="activity.rules && activity.rules.length > 0">
              <ul class="rules-list">
                <li v-for="(rule, index) in activity.rules" :key="index">{{ rule }}</li>
              </ul>
            </div>
            <div v-else>无规则</div>
          </el-descriptions-item>
          <el-descriptions-item label="打卡要求" :span="2">
            <div v-if="activity.checkInRequirements" class="checkin-requirements">
              <div>频率: {{ formatFrequency(activity.checkInRequirements.frequency) }}</div>
              <div v-if="activity.checkInRequirements.startTime || activity.checkInRequirements.endTime">
                打卡时间: 
                {{ activity.checkInRequirements.startTime || '不限' }} - 
                {{ activity.checkInRequirements.endTime || '不限' }}
              </div>
              <div>
                内容类型: 
                <el-tag 
                  v-for="type in activity.checkInRequirements.contentTypes" 
                  :key="type"
                  size="small"
                  style="margin-right: 5px"
                >
                  {{ formatContentType(type) }}
                </el-tag>
              </div>
            </div>
            <div v-else>无特殊要求</div>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(activity.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDate(activity.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <div v-else-if="!loading && !activity._id" class="empty-state">
        <el-empty description="未找到活动信息"></el-empty>
      </div>
    </el-card>
    
    <!-- 参与者列表 -->
    <el-card v-if="!loading && activity._id && activity.participants && activity.participants.length > 0" class="box-card participants-card">
      <template #header>
        <div class="card-header">
          <span>活动参与者 ({{ activity.participants.length }})</span>
        </div>
      </template>
      
      <el-table :data="activity.participants" border max-height="500">
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatarUrl || ''">
              {{ row.nickname ? row.nickname.substring(0, 1) : '用' }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column label="是否创建者" width="120">
          <template #default="{ row }">
            <el-tag v-if="isCreator(row.userId)" type="danger">创建者</el-tag>
            <span v-else>参与者</span>
          </template>
        </el-table-column>
        <el-table-column prop="joinTime" label="加入时间" min-width="170">
          <template #default="{ row }">
            {{ formatDate(row.joinTime) }}
          </template>
        </el-table-column>
      </el-table>
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
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getActivityById, approveActivity } from '../../api/activity'

const router = useRouter()
const route = useRoute()
const activityId = route.params.id

// 活动数据
const activity = ref({})
const loading = ref(false)

// 审核表单
const approveDialogVisible = ref(false)
const approveForm = reactive({
  approvalStatus: 'approved',
  comment: ''
})

// 获取活动详情
const getActivityDetail = async () => {
  loading.value = true
  try {
    const { data } = await getActivityById(activityId)
    activity.value = data.data.activity
  } catch (error) {
    console.error('获取活动详情失败:', error)
    ElMessage.error('获取活动详情失败')
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 打开审核对话框
const handleApprove = () => {
  approveForm.approvalStatus = 'approved'
  approveForm.comment = ''
  approveDialogVisible.value = true
}

// 提交审核
const submitApprove = async () => {
  try {
    await approveActivity(activityId, {
      approvalStatus: approveForm.approvalStatus,
      comment: approveForm.comment
    })
    
    ElMessage.success('审核操作成功')
    approveDialogVisible.value = false
    // 重新获取活动详情
    getActivityDetail()
  } catch (error) {
    console.error('审核失败:', error)
  }
}

// 检查是否为创建者
const isCreator = (userId) => {
  if (!activity.value || !activity.value.creator) return false
  return activity.value.creator.userId === userId
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

// 格式化打卡频率
const formatFrequency = (frequency) => {
  const map = {
    'daily': '每日打卡',
    'weekly': '每周打卡',
    'flexible': '自由打卡'
  }
  return map[frequency] || frequency
}

// 格式化内容类型
const formatContentType = (type) => {
  const map = {
    'text': '文字',
    'image': '图片',
    'audio': '音频',
    'video': '视频'
  }
  return map[type] || type
}

onMounted(() => {
  getActivityDetail()
})
</script>

<style scoped>
.activity-detail-container {
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
  margin-right: 8px;
  font-size: 18px;
  font-weight: bold;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  margin-bottom: 20px;
}

.participants-card {
  margin-top: 20px;
}

.book-info {
  display: flex;
  align-items: center;
}

.book-meta {
  margin-left: 10px;
}

.book-author {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.invite-code {
  margin-top: 5px;
  font-size: 12px;
  color: #666;
}

.approval-comment {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-nickname {
  margin-left: 10px;
}

.rich-text {
  white-space: pre-wrap;
}

.rules-list {
  margin: 0;
  padding-left: 20px;
}

.checkin-requirements {
  line-height: 1.8;
}

.empty-state {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}
</style> 