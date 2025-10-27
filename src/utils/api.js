import axios from 'axios'
import { ElMessage } from 'element-plus'
import { API_CONFIG } from '@/config/keys'

// 创建 axios 实例
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL + '/api',
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('📤 API请求发送:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      data: config.data,
      params: config.params
    })
    
    // 添加认证 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 API: 添加认证令牌')
    } else {
      console.log('🔓 API: 无认证令牌')
    }
    
    return config
  },
  (error) => {
    console.error('💥 API请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('✅ API响应成功:', {
      url: response.config?.url,
      method: response.config?.method,
      status: response.status,
      statusText: response.statusText,
      data: response.data
    })
    return response
  },
  (error) => {
    console.error('💥 API请求错误:', error)
    console.log('🔍 API错误详情:', {
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
      response: error.response,
      request: error.request
    })
    
    if (error.response) {
      console.log('📡 API服务器响应:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      })
    }
    
    // 处理认证错误
    if (error.response?.status === 401) {
      console.log('🔐 API: 认证失败，清除本地存储')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
      // 移除自动跳转，让组件处理错误信息显示
      return Promise.reject(error)
    }
    
    // 处理网络错误
    if (!error.response) {
      console.error('🌐 API: 网络连接错误:', error.message)
      ElMessage.error('网络连接失败，请检查网络设置或稍后重试')
      return Promise.reject(error)
    }
    
    // 处理服务器错误
    const message = error.response?.data?.message || '服务器错误，请稍后重试'
    console.error('🖥️ API: 服务器错误:', message)
    
    // 显示错误消息（登录接口的错误由登录页面处理）
    ElMessage.error(message)
    
    return Promise.reject(error)
  }
)

// API 方法
export const login = (credentials) => {
  return api.post('/auth/login', credentials)
}

export const logout = () => {
  return api.post('/auth/logout')
}

export const getCurrentUser = () => {
  return api.get('/auth/me')
}

export const refreshToken = () => {
  return api.post('/auth/refresh')
}

// 课程管理 API
export const getCourses = (params = {}) => {
  return api.get('/courses', { params })
}

export const createCourse = (data) => {
  return api.post('/courses', data)
}


export const updateCourse = (id, data) => {
  return api.put(`/courses/${id}`, data)
}

export const updateCourseStatus = (id, data) => {
  return api.put(`/courses/${id}/status`, data)
}


// 学生管理 API
export const getStudents = (params = {}) => {
  return api.get('/students', { params })
}

export const createStudent = (data) => {
  return api.post('/students', data)
}

export const getStudent = (id) => {
  return api.get(`/students/${id}`)
}

export const getStudentCourses = (id) => {
  return api.get(`/students/${id}/courses`)
}

export const updateStudentStatus = (id, data) => {
  return api.put(`/students/${id}/status`, data)
}

export const updateStudentInfo = (id, data) => {
  return api.put(`/students/${id}`, data)
}

export const getStudentInvoices = (id) => {
  return api.get(`/students/${id}/invoices`)
}

// 学生我的课程 API
export const getMyCourses = (params = {}) => {
  return api.get('/students/my-courses', { params })
}

// 账单管理 API
export const getInvoices = (params = {}) => {
  return api.get('/invoices', { params })
}

export const createInvoice = (data) => {
  return api.post('/invoices', data)
}

export const getInvoice = (id) => {
  return api.get(`/invoices/${id}`)
}

export const updateInvoice = (id, data) => {
  return api.put(`/invoices/${id}`, data)
}

export const deleteInvoice = (id) => {
  return api.delete(`/invoices/${id}`)
}

export const updateInvoiceStatus = (id, status) => {
  return api.put(`/invoices/${id}/status`, { status })
}

// 仪表盘统计 API
export const getDashboardStats = () => {
  return api.get('/dashboard/stats')
}

export default api
