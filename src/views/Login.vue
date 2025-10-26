<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1 class="login-title">教育管理系统</h1>
        <p class="login-subtitle">请登录您的账户</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="role">
          <el-select
            v-model="loginForm.role"
            placeholder="请选择角色"
            size="large"
            style="width: 100%"
            clearable
          >
            <el-option
              label="教师"
              value="teacher"
              :icon="UserFilled"
            />
            <el-option
              label="学生"
              value="student"
              :icon="Avatar"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            class="login-button"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p class="help-text">
          教师角色：可以管理课程和学生<br>
          学生角色：可以查看课程和缴费
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { User, Lock, UserFilled, Avatar } from '@element-plus/icons-vue'
import { showApiError, handleApiError } from '@/utils/errorHandler'

const router = useRouter()
const authStore = useAuthStore()

// 表单引用
const loginFormRef = ref()

// 加载状态
const loading = ref(false)

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  role: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    // 验证表单
    await loginFormRef.value.validate()
    
    loading.value = true
    
    console.log('🔍 开始登录，请求参数:', loginForm)
    
    // 调用登录 API
    const result = await authStore.loginUser(loginForm)
    
    console.log('📥 登录API返回结果:', result)
   
    if (result.success) {
      console.log('✅ 登录成功:', result.message)
      ElMessage.success(result.message)
      
      // 根据角色跳转到不同页面
      if (loginForm.role === 'teacher') {
        router.push('/dashboard')
      } else if (loginForm.role === 'student') {
        router.push('/dashboard')
      }
    } else {
      console.log('❌ 登录失败:', result.message)
      // 显示具体的错误信息，5秒后刷新页面
      ElMessage.error(result.message || '登录失败')
      setTimeout(() => {
        window.location.reload()
      }, 5000)
    }
  } catch (error) {
    console.error('💥 登录异常:', error)
    console.log('🔍 错误详情:', {
      message: error.message,
      response: error.response,
      request: error.request,
      config: error.config
    })
    
    if (error.response) {
      console.log('📡 服务器响应:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      })
    }
    
    // 获取错误信息并显示
    const errorMessage = handleApiError(error, '登录失败，请检查用户名和密码')
    console.log('📢 显示错误信息:', errorMessage)
    ElMessage.error(errorMessage)
    
    // 5秒后刷新页面
    setTimeout(() => {
      console.log('🔄 5秒后刷新页面')
      window.location.reload()
    }, 5000)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.login-subtitle {
  color: #7f8c8d;
  font-size: 14px;
}

.login-form {
  margin-bottom: 20px;
}

.login-form .el-form-item {
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
  font-weight: 500;
}

.login-footer {
  text-align: center;
}

.help-text {
  color: #7f8c8d;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-box {
    margin: 10px;
    padding: 30px 20px;
  }
  
  .login-title {
    font-size: 24px;
  }
}
</style>
