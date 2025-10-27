<template>
  <div class="dashboard">
    <!-- 顶部导航栏 -->
    <el-header class="dashboard-header">
      <div class="header-left">
        <h2 class="system-title">教育管理系统</h2>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-icon><User /></el-icon>
            {{ user?.name || '用户' }}
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人资料</el-dropdown-item>
              <el-dropdown-item command="settings">设置</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-container class="main-container">
      <!-- 侧边栏 -->
      <el-aside width="250px" class="sidebar">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          router
        >
          <el-menu-item index="/dashboard">
            <el-icon><House /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          
          <template v-if="isTeacher">
            <el-sub-menu index="teacher">
              <template #title>
                <el-icon><UserFilled /></el-icon>
                <span>教师功能</span>
              </template>
              <el-menu-item index="/courses">课程管理</el-menu-item>
              <!-- 学生管理模块已注释 -->
              <!-- <el-menu-item index="/students">学生管理</el-menu-item> -->
              <el-menu-item index="/invoices">账单管理</el-menu-item>
            </el-sub-menu>
          </template>
          
          <template v-if="isStudent">
            <el-sub-menu index="student">
              <template #title>
                <el-icon><Avatar /></el-icon>
                <span>学生功能</span>
              </template>
              <el-menu-item index="/my-courses">我的课程</el-menu-item>
              <el-menu-item index="/my-invoices">我的账单</el-menu-item>
            </el-sub-menu>
          </template>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <div class="content-header">
          <h3 class="page-title">欢迎回来，{{ user?.name || '用户' }}！</h3>
          <p class="page-subtitle">
            {{ isTeacher ? '教师' : '学生' }}控制台
          </p>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-grid" v-loading="loading">
          <!-- 教师角色显示所有统计 -->
          <template v-if="isTeacher">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon teacher">
                  <el-icon><UserFilled /></el-icon>
                </div>
                <div class="stat-info">
                  <h4>教师数量</h4>
                  <p class="stat-number">{{ stats.teachers }}</p>
                </div>
              </div>
            </el-card>

            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon student">
                  <el-icon><Avatar /></el-icon>
                </div>
                <div class="stat-info">
                  <h4>学生数量</h4>
                  <p class="stat-number">{{ stats.students }}</p>
                </div>
              </div>
            </el-card>
          </template>

          <!-- 课程数量 - 所有角色都显示 -->
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon course">
                <el-icon><Reading /></el-icon>
              </div>
              <div class="stat-info">
                <h4>课程数量</h4>
                <p class="stat-number">{{ stats.courses }}</p>
              </div>
            </div>
          </el-card>

        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDashboardStats } from '@/utils/api'
import { 
  User, ArrowDown, House, UserFilled, Avatar, 
  Reading, Document
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 当前激活的菜单
const activeMenu = ref('/dashboard')

// 用户信息
const user = computed(() => authStore.user)
const isTeacher = computed(() => authStore.isTeacher)
const isStudent = computed(() => authStore.isStudent)

// 统计数据
const stats = reactive({
  teachers: 0,
  students: 0,
  courses: 0
})

// 加载状态
const loading = ref(false)

// 处理下拉菜单命令
const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人资料功能开发中...')
      break
    case 'settings':
      ElMessage.info('设置功能开发中...')
      break
    case 'logout':
      await handleLogout()
      break
  }
}

// 处理登出
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '确认退出',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await authStore.logoutUser()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('登出失败:', error)
    }
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    loading.value = true
    const response = await getDashboardStats()
    
    if (response.data.success) {
      const data = response.data.data
      stats.teachers = data.teachers_count || 0
      stats.students = data.students_count || 0
      stats.courses = data.courses_count || 0
    } else {
      ElMessage.error(response.data.message || '获取统计数据失败')
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left .system-title {
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.header-right .user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.header-right .user-info:hover {
  background-color: #f5f7fa;
}

.main-container {
  flex: 1;
  height: calc(100vh - 60px);
}

.sidebar {
  background: #fff;
  border-right: 1px solid #e4e7ed;
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

.main-content {
  background: #f5f7fa;
  padding: 20px;
}

.content-header {
  margin-bottom: 20px;
}

.page-title {
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: #7f8c8d;
  font-size: 14px;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.teacher {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.student {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.course {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}


.stat-info h4 {
  color: #7f8c8d;
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 5px 0;
}

.stat-number {
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}


/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 200px !important;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>