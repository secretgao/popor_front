import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { 
      title: '登录',
      requiresAuth: false 
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { 
      title: '仪表盘',
      requiresAuth: true 
    }
  },
  {
    path: '/payment-demo',
    name: 'PaymentDemo',
    component: () => import('@/views/PaymentDemo.vue'),
    meta: { 
      title: '支付演示',
      requiresAuth: true 
    }
  },
  // 教师功能路由
  {
    path: '/courses',
    name: 'TeacherCourses',
    component: () => import('@/views/teacher/Courses.vue'),
    meta: { 
      title: '课程管理',
      requiresAuth: true,
      role: 'teacher'
    }
  },
  // 学生管理模块已注释
  // {
  //   path: '/students',
  //   name: 'TeacherStudents',
  //   component: () => import('@/views/teacher/Students.vue'),
  //   meta: { 
  //     title: '学生管理',
  //     requiresAuth: true,
  //     role: 'teacher'
  //   }
  // },
  {
    path: '/invoices',
    name: 'TeacherInvoices',
    component: () => import('@/views/teacher/Invoices.vue'),
    meta: { 
      title: '账单管理',
      requiresAuth: true,
      role: 'teacher'
    }
  },
  {
    path: '/test-api',
    name: 'TestAPI',
    component: () => import('@/views/teacher/TestAPI.vue'),
    meta: { 
      title: 'API测试',
      requiresAuth: true,
      role: 'teacher'
    }
  },
  // 学生功能路由
  {
    path: '/my-courses',
    name: 'StudentCourses',
    component: () => import('@/views/student/MyCourses.vue'),
    meta: { 
      title: '我的课程',
      requiresAuth: true,
      role: 'student'
    }
  },
  {
    path: '/my-invoices',
    name: 'StudentInvoices',
    component: () => import('@/views/student/MyInvoices.vue'),
    meta: { 
      title: '我的账单',
      requiresAuth: true,
      role: 'student'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 调试信息
  console.log('🔍 路由守卫调试信息:', {
    to: to.path,
    requiresAuth: to.meta.requiresAuth,
    role: to.meta.role,
    isAuthenticated: authStore.isAuthenticated,
    userRole: authStore.role,
    isTeacher: authStore.isTeacher,
    isStudent: authStore.isStudent,
    token: authStore.token ? '存在' : '不存在',
    user: authStore.user ? '存在' : '不存在'
  })
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 教育管理系统`
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (authStore.isAuthenticated) {
      // 检查角色权限
      if (to.meta.role) {
        const userRole = authStore.role
        if (to.meta.role === 'teacher' && !authStore.isTeacher) {
          console.log('❌ 教师权限检查失败')
          ElMessage.error('您没有权限访问此页面')
          next('/dashboard')
          return
        }
        if (to.meta.role === 'student' && !authStore.isStudent) {
          console.log('❌ 学生权限检查失败')
          ElMessage.error('您没有权限访问此页面')
          next('/dashboard')
          return
        }
      }
      console.log('✅ 认证和权限检查通过')
      next()
    } else {
      console.log('❌ 用户未认证，跳转到登录页')
      next('/login')
    }
  } else {
    // 如果已登录且访问登录页，重定向到仪表盘
    if (to.name === 'Login' && authStore.isAuthenticated) {
      next('/dashboard')
    } else {
      next()
    }
  }
})

export default router
