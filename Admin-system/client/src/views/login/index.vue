<template>
  <div class="login-container">
    <div class="login-form-container">
      <div class="title-container">
        <h3 class="title">阅读越有fun - 管理系统</h3>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        auto-complete="on"
        label-position="left"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            type="text"
            tabindex="1"
            :prefix-icon="User"
            auto-complete="on"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="密码"
            :type="passwordVisible ? 'text' : 'password'"
            tabindex="2"
            :prefix-icon="Lock"
            auto-complete="on"
            show-password
          />
        </el-form-item>
        
        <el-button
          :loading="loading"
          type="primary"
          style="width: 100%; margin-bottom: 30px"
          @click.prevent="handleLogin"
        >
          登录
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '../../store/user'

const router = useRouter()
const userStore = useUserStore()

// 登录表单
const loginFormRef = ref(null)
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const loading = ref(false)
const passwordVisible = ref(false)

// 处理登录
const handleLogin = () => {
  loginFormRef.value.validate(async valid => {
    if (!valid) return
    
    loading.value = true
    try {
      await userStore.login(loginForm)
      ElMessage.success('登录成功')
      router.push('/')
    } catch (error) {
      ElMessage.error(error.response?.data?.message || '登录失败，请检查用户名和密码')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  width: 100%;
  background-color: #2d3a4b;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-form-container {
  width: 520px;
  max-width: 100%;
  padding: 35px 35px 15px;
  margin: 0 auto;
  overflow: hidden;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title-container {
  position: relative;
  margin-bottom: 30px;
}

.title {
  font-size: 26px;
  color: #333;
  margin: 0 auto 40px;
  text-align: center;
  font-weight: bold;
}

.login-form {
  position: relative;
  width: 100%;
  max-width: 100%;
}
</style> 