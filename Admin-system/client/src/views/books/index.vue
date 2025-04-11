<template>
  <div class="books-container">
    <el-card class="box-card">
      <!-- 搜索和筛选区域 -->
      <div class="filter-container">
        <el-input
          v-model="listQuery.keyword"
          placeholder="书名/作者"
          style="width: 200px;"
          class="filter-item"
          clearable
          @keyup.enter="handleFilter"
        />
        
        <el-select
          v-model="listQuery.category"
          placeholder="图书分类"
          clearable
          class="filter-item"
          style="width: 130px"
        >
          <el-option
            v-for="item in categoryOptions"
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
        
        <el-button
          type="success"
          class="filter-item"
          @click="handleCreate"
        >
          添加图书
        </el-button>
      </div>
      
      <!-- 书籍列表 -->
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
          label="封面"
          width="100"
        >
          <template #default="scope">
            <el-image
              style="width: 60px; height: 80px"
              :src="scope.row.cover"
              fit="cover"
              :preview-src-list="[scope.row.cover]"
            />
          </template>
        </el-table-column>
        
        <el-table-column
          label="书名"
          min-width="120"
        >
          <template #default="scope">
            <span>{{ scope.row.title }}</span>
          </template>
        </el-table-column>
        
        <el-table-column
          label="作者"
          width="120"
        >
          <template #default="scope">
            <span>{{ scope.row.author }}</span>
          </template>
        </el-table-column>
        
        <el-table-column
          label="分类"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-tag>{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          label="ISBN"
          width="130"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.isbn }}</span>
          </template>
        </el-table-column>
        
        <el-table-column
          label="评分"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-rate
              v-model="scope.row.rating"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
            />
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
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            
            <el-button
              size="small"
              type="danger"
              link
              @click="handleDelete(scope.row)"
            >
              删除
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
    
    <!-- 编辑/添加图书对话框 -->
    <el-dialog
      :title="dialogStatus === 'create' ? '添加图书' : '编辑图书'"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form
        ref="bookFormRef"
        :model="bookForm"
        :rules="bookRules"
        label-width="100px"
      >
        <el-form-item label="书名" prop="title">
          <el-input v-model="bookForm.title" placeholder="请输入书名" />
        </el-form-item>
        
        <el-form-item label="作者" prop="author">
          <el-input v-model="bookForm.author" placeholder="请输入作者" />
        </el-form-item>
        
        <el-form-item label="分类" prop="category">
          <el-select v-model="bookForm.category" placeholder="请选择分类">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="ISBN" prop="isbn">
          <el-input v-model="bookForm.isbn" placeholder="请输入ISBN" />
        </el-form-item>
        
        <el-form-item label="出版社" prop="publisher">
          <el-input v-model="bookForm.publisher" placeholder="请输入出版社" />
        </el-form-item>
        
        <el-form-item label="出版日期" prop="publishDate">
          <el-date-picker
            v-model="bookForm.publishDate"
            type="date"
            placeholder="选择出版日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="页数" prop="pages">
          <el-input-number v-model="bookForm.pages" :min="1" placeholder="请输入页数" />
        </el-form-item>
        
        <el-form-item label="评分" prop="rating">
          <el-rate v-model="bookForm.rating" />
        </el-form-item>
        
        <el-form-item label="图书封面" prop="cover">
          <el-input v-model="bookForm.cover" placeholder="请输入封面图片URL" />
          <div class="cover-preview" v-if="bookForm.cover">
            <el-image
              style="width: 100px; height: 120px"
              :src="bookForm.cover"
              fit="cover"
            />
          </div>
        </el-form-item>
        
        <el-form-item label="图书简介" prop="description">
          <el-input
            v-model="bookForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入图书简介"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">
            {{ dialogStatus === 'create' ? '创建' : '更新' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBookList, getBookDetail, addBook, updateBook, deleteBook } from '../../api/book'

// 列表数据
const list = ref([])
const total = ref(0)
const listLoading = ref(true)
const dialogVisible = ref(false)
const dialogStatus = ref('create')
const bookFormRef = ref(null)

// 查询参数
const listQuery = reactive({
  page: 1,
  limit: 10,
  keyword: '',
  category: ''
})

// 图书分类选项
const categoryOptions = [
  { label: '文学', value: '文学' },
  { label: '小说', value: '小说' },
  { label: '历史', value: '历史' },
  { label: '科技', value: '科技' },
  { label: '经济', value: '经济' },
  { label: '管理', value: '管理' },
  { label: '艺术', value: '艺术' },
  { label: '漫画', value: '漫画' },
  { label: '少儿', value: '少儿' },
  { label: '教育', value: '教育' }
]

// 图书表单
const bookForm = reactive({
  id: undefined,
  title: '',
  author: '',
  category: '',
  isbn: '',
  publisher: '',
  publishDate: '',
  pages: 0,
  rating: 0,
  cover: '',
  description: ''
})

// 表单验证规则
const bookRules = {
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  isbn: [{ required: true, message: '请输入ISBN', trigger: 'blur' }]
}

// 获取图书列表
const getList = async () => {
  listLoading.value = true
  try {
    // 此处应该调用真实API，这里使用模拟数据
    // 模拟API调用
    // const { data } = await getBookList(listQuery)
    
    // 模拟后端返回的数据
    const mockData = {
      total: 100,
      items: Array.from({ length: listQuery.limit }).map((_, index) => ({
        id: `book_${(listQuery.page - 1) * listQuery.limit + index + 1}`,
        title: `书籍${index + 1}`,
        author: `作者${index + 1}`,
        category: categoryOptions[index % categoryOptions.length].value,
        isbn: `978-7-${String(index).padStart(6, '0')}-${String(index % 10)}`,
        publisher: `出版社${index % 10 + 1}`,
        publishDate: '2023-01-15',
        pages: 200 + index * 10,
        rating: (index % 5) + 1,
        cover: 'https://img3.doubanio.com/view/subject/l/public/s29988481.jpg',
        description: `这是书籍${index + 1}的详细描述，包含了该书的主要内容和特点。`
      }))
    }
    
    list.value = mockData.items
    total.value = mockData.total
  } catch (error) {
    console.error('获取图书列表失败', error)
    ElMessage.error('获取图书列表失败')
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

// 重置表单
const resetForm = () => {
  bookForm.id = undefined
  bookForm.title = ''
  bookForm.author = ''
  bookForm.category = ''
  bookForm.isbn = ''
  bookForm.publisher = ''
  bookForm.publishDate = ''
  bookForm.pages = 0
  bookForm.rating = 0
  bookForm.cover = ''
  bookForm.description = ''
  
  // 重置表单验证状态
  if (bookFormRef.value) {
    bookFormRef.value.resetFields()
  }
}

// 显示创建图书对话框
const handleCreate = () => {
  resetForm()
  dialogStatus.value = 'create'
  dialogVisible.value = true
}

// 显示编辑图书对话框
const handleEdit = (row) => {
  resetForm()
  dialogStatus.value = 'update'
  
  // 在实际应用中，可能需要单独获取详情
  // const { data } = await getBookDetail(row.id)
  
  // 填充表单数据
  Object.assign(bookForm, row)
  
  dialogVisible.value = true
}

// 保存图书（创建或更新）
const handleSave = () => {
  bookFormRef.value.validate(async valid => {
    if (!valid) return
    
    try {
      if (dialogStatus.value === 'create') {
        // 创建新图书
        // await addBook(bookForm)
        
        // 模拟创建成功
        ElMessage.success('创建图书成功')
      } else {
        // 更新图书
        // await updateBook(bookForm.id, bookForm)
        
        // 模拟更新成功
        // 查找并更新列表中对应的图书
        const bookIndex = list.value.findIndex(book => book.id === bookForm.id)
        if (bookIndex !== -1) {
          list.value[bookIndex] = { ...bookForm }
        }
        
        ElMessage.success('更新图书成功')
      }
      
      dialogVisible.value = false
      getList() // 重新获取列表数据
    } catch (error) {
      console.error('保存图书失败', error)
      ElMessage.error('保存图书失败')
    }
  })
}

// 删除图书
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该图书吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 在实际应用中，应该调用API删除图书
      // await deleteBook(row.id)
      
      // 模拟删除成功
      const index = list.value.findIndex(book => book.id === row.id)
      if (index !== -1) {
        list.value.splice(index, 1)
      }
      
      ElMessage.success('删除图书成功')
    } catch (error) {
      console.error('删除图书失败', error)
      ElMessage.error('删除图书失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.books-container {
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

.cover-preview {
  margin-top: 10px;
}
</style> 