# Front API - Vue 3 前端应用

## 📋 系统概述

基于 Vue 3 的现代化前端应用，为教育管理系统提供用户界面，支持教师和学生两种角色，集成支付功能和响应式设计。

## 🎯 核心功能

### 1. 用户认证系统
- **登录界面**: 用户名、密码、角色选择
- **JWT Token 管理**: 自动存储和刷新
- **角色权限控制**: 根据角色显示不同功能

### 2. 仪表盘系统
- **实时统计**: 教师、学生、课程、账单数量
- **角色适配**: 教师和学生显示不同统计
- **快速操作**: 常用功能快捷入口

### 3. 教师功能
- **课程管理**: 创建、编辑、删除课程
- **学生管理**: 查看和管理学生信息
- **账单管理**: 创建和管理学生账单
- **数据统计**: 查看教学相关统计

### 4. 学生功能
- **课程查看**: 浏览所有可用课程
- **账单管理**: 查看个人账单
- **支付功能**: 在线支付账单
- **学习记录**: 查看学习历史

### 5. 支付集成
- **Omise 支付**: 信用卡支付集成
- **支付状态**: 实时支付状态更新
- **支付历史**: 查看支付记录

## 🏗️ 技术架构

### 核心技术
- **Vue 3**: 前端框架
- **Element Plus**: UI 组件库
- **Vite**: 构建工具
- **Pinia**: 状态管理
- **Axios**: HTTP 客户端
- **Vue Router**: 路由管理

### 项目结构
```
src/
├── views/                    # 页面组件
│   ├── Dashboard.vue         # 仪表盘
│   ├── Login.vue            # 登录页面
│   ├── PaymentDemo.vue      # 支付演示
│   ├── teacher/             # 教师功能页面
│   │   ├── Courses.vue     # 课程管理
│   │   ├── Students.vue    # 学生管理
│   │   └── Invoices.vue     # 账单管理
│   └── student/             # 学生功能页面
│       ├── MyCourses.vue   # 我的课程
│       └── MyInvoices.vue  # 我的账单
├── components/              # 通用组件
│   └── OmisePaymentForm.vue # 支付表单组件
├── stores/                  # 状态管理
│   └── auth.js             # 认证状态
├── utils/                   # 工具函数
│   ├── api.js              # API 接口
│   └── payment.js          # 支付工具
├── config/                  # 配置文件
│   └── keys.js             # 配置管理
└── router/                  # 路由配置
    └── index.js            # 路由定义
```

## 🔐 认证系统

### 登录流程
1. 用户输入用户名、密码、选择角色
2. 调用 API 登录接口
3. 获取 JWT Token 和用户信息
4. 存储到本地存储和状态管理
5. 根据角色跳转到相应页面

### 状态管理
```javascript
// stores/auth.js
export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const role = ref(localStorage.getItem('role') || '')
  
  const isAuthenticated = computed(() => !!token.value)
  const isTeacher = computed(() => role.value === 'teacher')
  const isStudent = computed(() => role.value === 'student')
  
  const loginUser = async (credentials) => {
    // 登录逻辑
  }
  
  const logoutUser = async () => {
    // 登出逻辑
  }
})
```

### 路由守卫
```javascript
// router/index.js
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth) {
    if (authStore.isAuthenticated) {
      // 检查角色权限
      if (to.meta.role) {
        const userRole = authStore.role
        if (to.meta.role === 'teacher' && !authStore.isTeacher) {
          ElMessage.error('您没有权限访问此页面')
          next('/dashboard')
          return
        }
      }
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
})
```

## 🎨 界面设计

### 1. 登录页面
- 用户名输入框
- 密码输入框
- 角色选择（教师/学生）
- 登录按钮
- 错误提示

### 2. 仪表盘
- 统计卡片展示
- 角色适配显示
- 快速操作按钮
- 导航菜单

### 3. 教师界面
- 课程管理页面
- 学生管理页面
- 账单管理页面
- 数据统计展示

### 4. 学生界面
- 我的课程页面
- 我的账单页面
- 支付功能页面
- 学习记录展示

## 💳 支付功能

### Omise 集成
```javascript
// utils/payment.js
export const processOmisePayment = async (paymentData) => {
  try {
    const response = await axios.post('/api/payment/process', {
      invoice_id: paymentData.invoiceId,
      token: paymentData.token,
      amount: paymentData.amount
    })
    
    return response.data
  } catch (error) {
    throw new Error('支付处理失败')
  }
}
```

### 支付表单组件
```vue
<!-- components/OmisePaymentForm.vue -->
<template>
  <el-form @submit.prevent="handlePayment">
    <el-form-item label="金额">
      <el-input v-model="amount" readonly />
    </el-form-item>
    <el-form-item label="信用卡信息">
      <div id="omise-form"></div>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handlePayment" :loading="processing">
        支付
      </el-button>
    </el-form-item>
  </el-form>
</template>
```

## 🔧 核心功能实现

### 1. API 接口管理

#### API 配置
```javascript
// utils/api.js
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL + '/api',
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

#### 接口方法
```javascript
// 认证相关
export const login = (credentials) => api.post('/auth/login', credentials)
export const logout = () => api.post('/auth/logout')
export const fetchMe = () => api.get('/auth/me')

// 课程管理
export const getCourses = (params) => api.get('/courses', { params })
export const createCourse = (data) => api.post('/courses', data)
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data)
export const deleteCourse = (id) => api.delete(`/courses/${id}`)

// 学生管理
export const getStudents = (params) => api.get('/students', { params })
export const createStudent = (data) => api.post('/students', data)

// 账单管理
export const getInvoices = (params) => api.get('/invoices', { params })
export const createInvoice = (data) => api.post('/invoices', data)
export const updateInvoice = (id, data) => api.put(`/invoices/${id}`, data)

// 仪表盘统计
export const getDashboardStats = () => api.get('/dashboard/stats')
```

### 2. 角色权限控制

#### 路由配置
```javascript
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  // 教师功能路由
  {
    path: '/courses',
    name: 'TeacherCourses',
    component: () => import('@/views/teacher/Courses.vue'),
    meta: { requiresAuth: true, role: 'teacher' }
  },
  // 学生功能路由
  {
    path: '/my-courses',
    name: 'StudentCourses',
    component: () => import('@/views/student/MyCourses.vue'),
    meta: { requiresAuth: true, role: 'student' }
  }
]
```

### 3. 数据管理

#### 课程管理
```vue
<!-- views/teacher/Courses.vue -->
<template>
  <div class="courses-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>课程管理</span>
          <el-button type="primary" @click="openCreateDialog">
            创建课程
          </el-button>
        </div>
      </template>
      
      <el-table :data="courses" v-loading="loading">
        <el-table-column prop="name" label="课程名称" />
        <el-table-column prop="year_month" label="年月" />
        <el-table-column prop="fee" label="费用" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click="editCourse(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteCourse(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
```

#### 学生管理
```vue
<!-- views/teacher/Students.vue -->
<template>
  <div class="students-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学生管理</span>
          <el-button type="primary" @click="openAddStudentDialog">
            添加学生
          </el-button>
        </div>
      </template>
      
      <el-table :data="students" v-loading="loading">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click="viewStudent(row)">查看</el-button>
            <el-button size="small" @click="viewInvoices(row)">查看账单</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
```

## 🎨 界面设计

### 1. 响应式设计
- 移动端适配
- 平板端适配
- 桌面端适配

### 2. 主题设计
- 现代化 UI 设计
- 统一的色彩方案
- 优雅的动画效果

### 3. 用户体验
- 直观的操作流程
- 友好的错误提示
- 流畅的页面切换

## 🚀 部署配置

### 环境配置
```env
# 应用配置
VITE_APP_NAME=教育管理系统
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production

# API 配置
VITE_API_BASE_URL=http://api.localhost
VITE_API_TIMEOUT=10000
VITE_API_VERSION=v1

# Omise 配置
VITE_OMISE_PUBLIC_KEY=pkey_test_65ggqd9jdlaax89pkex
VITE_OMISE_ENVIRONMENT=test
VITE_OMISE_DEFAULT_CURRENCY=THB

# 开发服务器配置
VITE_DEV_SERVER_PORT=3000
VITE_DEV_SERVER_HOST=localhost
VITE_DEV_SERVER_OPEN=true
VITE_DEV_SERVER_CORS=true

# 代理配置
VITE_PROXY_TARGET=http://api.localhost
VITE_PROXY_CHANGE_ORIGIN=true
VITE_PROXY_SECURE=false
```

### 安装步骤
```bash
# 1. 安装依赖
npm install

# 2. 环境配置
cp env.example .env

# 3. 启动开发服务器
npm run dev

# 4. 构建生产版本
npm run build
```

## 📊 性能优化

### 1. 代码分割
- 路由懒加载
- 组件懒加载
- 第三方库分离

### 2. 资源优化
- 图片压缩
- 静态资源缓存
- CDN 加速

### 3. 构建优化
- Vite 构建优化
- 代码压缩
- 源码映射

## 🔒 安全措施

### 1. 数据安全
- Token 安全存储
- 敏感信息加密
- XSS 防护

### 2. 网络安全
- HTTPS 支持
- CORS 配置
- 请求验证

## 🐛 故障排除

### 常见问题
1. **登录失败**: 检查 API 连接
2. **权限错误**: 检查用户角色
3. **支付失败**: 检查 Omise 配置

### 调试方法
- 浏览器开发者工具
- Vue DevTools
- 网络请求监控

## 📈 监控和维护

### 性能监控
- 页面加载时间
- API 响应时间
- 用户操作统计

### 错误监控
- JavaScript 错误
- API 请求错误
- 用户行为异常

---

**注意**: 这是基于 Vue 3 的现代化前端应用，提供完整的教育管理功能，包括用户认证、课程管理、学生管理、账单管理和支付功能。应用具有良好的用户体验和可维护性。