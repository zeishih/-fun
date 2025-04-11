<template>
  <div class="users-container">
    <el-card class="box-card">
      <!-- 搜索和筛选区域 -->
      <div class="filter-container">
        <el-input
          v-model="listQuery.keyword"
          placeholder="用户名/昵称"
          style="width: 200px;"
          class="filter-item"
          clearable
          @keyup.enter="handleFilter"
        />
        
        <el-select
          v-model="listQuery.status"
          placeholder="用户状态"
          clearable
          class="filter-item"
          style="width: 130px"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        
        <el-button
          type="primary"
          class="filter-item"
          @click="handleFilter"
        >
          搜索
        </el-button>
      </div>
      
      <!-- 用户列表 -->
      <el-table
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column
          align="center"
          label="ID"
          width="80"
        >
          <template #default="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        
        <el-table-column
          align="center"
          label="头像"
          width="100"
        >
          <template #default="scope">
            <el-avatar :size="40" :src="scope.row.avatar" />
          </template>
        </el-table-column>
        
        <el-table-column
          label="用户名"
          width="120"
        >
          <template #default="scope">
            <span>{{ scope.row.username }}</span>
          </template>
        </el-table-column>
        
        <el-table-column
          label="昵称"
          width="120"
        >
          <template #default="scope">
            <span>{{ scope.row.nickname }}</span>
          </template>
        </el-table-column>
        
        <el-table-column
          label="手机号"
          width="120"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.phone || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column
          label="活动数"
          width="100"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.activityCount }}</span>
          </template>
        </el-table-column>
        
        <el-table-column
          label="注册时间"
          width="160"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        
        <el-table-column
          label="状态"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          label="操作"
          align="center"
          min-width="150"
        >
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              link
              @click="handleDetail(scope.row)"
            >
              详情
            </el-button>
            
            <el-button
              size="small"
              :type="scope.row.status === 1 ? 'danger' : 'success'"
              link
              @click="handleUpdateStatus(scope.row)"
            >
              {{ scope.row.status === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="listQuery.page"
          v-model:page-size="listQuery.limit"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 用户详情对话框 -->
    <el-dialog
      title="用户详情"
      v-model="dialogVisible"
      width="600px"
    >
      <el-descriptions
        class="margin-top"
        :column="2"
        border
      >
        <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentUser.nickname }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentUser.status === 1 ? 'success' : 'danger'">
            {{ currentUser.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentUser.createTime }}</el-descriptions-item>
        <el-descriptions-item label="上次登录">{{ currentUser.lastLoginTime }}</el-descriptions-item>
        <el-descriptions-item label="活动数">{{ currentUser.activityCount }}</el-descriptions-item>
        <el-descriptions-item label="头像" :span="2">
          <el-image
            style="width: 100px; height: 100px"
            :src="currentUser.avatar"
            fit="cover"
          />
        </el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button 
            :type="currentUser.status === 1 ? 'danger' : 'success'"
            @click="handleUpdateStatus(currentUser, true)"
          >
            {{ currentUser.status === 1 ? '禁用用户' : '启用用户' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, getUserDetail, updateUserStatus } from '../../api/user'

// 列表数据
const list = ref([])
const total = ref(0)
const listLoading = ref(true)
const dialogVisible = ref(false)
const currentUser = ref({})

// 查询参数
const listQuery = reactive({
  page: 1,
  limit: 10,
  keyword: '',
  status: ''
})

// 状态选项
const statusOptions = [
  { label: '正常', value: 1 },
  { label: '禁用', value: 0 }
]

// 获取用户列表
const getList = async () => {
  listLoading.value = true
  try {
    // 此处应该调用真实API，这里使用模拟数据
    // 模拟API调用
    // const { data } = await getUserList(listQuery)
    
    // 模拟后端返回的数据
    const mockData = {
      total: 100,
      items: Array.from({ length: listQuery.limit }).map((_, index) => ({
        id: `user_${(listQuery.page - 1) * listQuery.limit + index + 1}`,
        username: `user_${index + 1}`,
        nickname: `用户${index + 1}`,
        avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        phone: index % 3 === 0 ? `138${String(index).padStart(8, '0')}` : '',
        activityCount: Math.floor(Math.random() * 10),
        createTime: '2023-05-15 10:30:00',
        lastLoginTime: '2023-05-20 15:45:00',
        status: index % 5 === 0 ? 0 : 1
      }))
    }
    
    list.value = mockData.items
    total.value = mockData.total
  } catch (error) {
    console.error('获取用户列表失败', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    listLoading.value = false
  }
}

// 处理筛选
const handleFilter = () => {
  listQuery.page = 1
  getList()
}

// 处理分页大小变更
const handleSizeChange = (val) => {
  listQuery.limit = val
  getList()
}

// 处理页码变更
const handleCurrentChange = (val) => {
  listQuery.page = val
  getList()
}

// 查看用户详情
const handleDetail = (row) => {
  try {
    // 在实际应用中，这里应该调用API获取完整的用户信息
    // const { data } = await getUserDetail(row.id)
    // currentUser.value = data.user
    
    // 这里使用模拟数据
    currentUser.value = { ...row }
    dialogVisible.value = true
  } catch (error) {
    console.error('获取用户详情失败', error)
    ElMessage.error('获取用户详情失败')
  }
}

// 更新用户状态
const handleUpdateStatus = (row, isFromDialog = false) => {
  const statusText = row.status === 1 ? '禁用' : '启用'
  const messageText = `确定要${statusText}该用户吗？`
  
  ElMessageBox.confirm(messageText, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 在实际应用中，应该调用API更新用户状态
      // await updateUserStatus(row.id, row.status === 1 ? 0 : 1)
      
      // 模拟更新成功
      const newStatus = row.status === 1 ? 0 : 1
      
      // 更新列表中的状态
      if (isFromDialog) {
        currentUser.value.status = newStatus
      }
      
      // 查找并更新列表中对应的用户
      const userIndex = list.value.findIndex(user => user.id === row.id)
      if (userIndex !== -1) {
        list.value[userIndex].status = newStatus
      }
      
      ElMessage.success(`${statusText}用户成功`)
    } catch (error) {
      console.error(`${statusText}用户失败`, error)
      ElMessage.error(`${statusText}用户失败`)
    }
  }).catch(() => {})
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.users-container {
  padding: 10px;
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.filter-item {
  margin-right: 10px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style> 