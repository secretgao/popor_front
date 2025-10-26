import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, logout } from '@/utils/api'
import { handleApiErrorResponse } from '@/utils/errorHandler'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const role = ref(localStorage.getItem('role') || '')

  // 计算属性
  const isAuthenticated = computed(() => {
    const authenticated = !!token.value
    console.log('🔍 认证状态检查:', {
      token: token.value ? '存在' : '不存在',
      authenticated,
      role: role.value,
      user: user.value ? '存在' : '不存在'
    })
    return authenticated
  })
  const isTeacher = computed(() => {
    const isTeacherRole = role.value === 'teacher'
    console.log('🔍 教师角色检查:', { role: role.value, isTeacherRole })
    return isTeacherRole
  })
  const isStudent = computed(() => {
    const isStudentRole = role.value === 'student'
    console.log('🔍 学生角色检查:', { role: role.value, isStudentRole })
    return isStudentRole
  })

  // 登录
  const loginUser = async (credentials) => {
    try {
      console.log('🚀 Auth Store: 开始调用登录API')
      console.log('📤 Auth Store: 发送请求参数:', credentials)
      
      const response = await login(credentials)
      
      console.log('📥 Auth Store: 收到API响应:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      })
      
      if (response.data.success) {
        console.log('✅ Auth Store: 登录成功，处理用户数据')
        const { user: userData, token: userToken } = response.data.data
        
        console.log('👤 Auth Store: 用户数据:', userData)
        console.log('🔑 Auth Store: 令牌:', userToken)
        
        // 保存到状态
        token.value = userToken
        user.value = userData
        role.value = credentials.role
        
        // 保存到本地存储
        localStorage.setItem('token', userToken)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('role', credentials.role)
        
        console.log('💾 Auth Store: 数据已保存到本地存储')
        
        return { success: true, message: '登录成功' }
      } else {
        console.log('❌ Auth Store: 登录失败，服务器返回:', response.data)
        return { success: false, message: response.data.message || '登录失败' }
      }
    } catch (error) {
      console.error('💥 Auth Store: 登录异常:', error)
      console.log('🔍 Auth Store: 错误详情:', {
        message: error.message,
        response: error.response,
        request: error.request,
        config: error.config
      })
      
      if (error.response) {
        console.log('📡 Auth Store: 服务器响应详情:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        })
      }
      
      // 使用统一的错误处理工具
      const errorResult = handleApiErrorResponse(error, '登录失败，请检查用户名和密码')
      console.log('🔄 Auth Store: 错误处理结果:', errorResult)
      return errorResult
    }
  }

  // 登出
  const logoutUser = async () => {
    try {
      if (token.value) {
        await logout()
      }
    } catch (error) {
      console.error('登出错误:', error)
    } finally {
      // 清除状态和本地存储
      token.value = ''
      user.value = null
      role.value = ''
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
    }
  }

  // 检查认证状态
  const checkAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    const storedRole = localStorage.getItem('role')
    
    if (storedToken && storedUser && storedRole) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
      role.value = storedRole
    }
  }

  return {
    // 状态
    token,
    user,
    role,
    
    // 计算属性
    isAuthenticated,
    isTeacher,
    isStudent,
    
    // 方法
    loginUser,
    logoutUser,
    checkAuth
  }
})
