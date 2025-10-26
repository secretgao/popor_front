<template>
  <div class="my-courses">
    <div class="page-header">
      <h2>我的课程</h2>
      <p>查看您已选的所有课程</p>
    </div>

    <el-card class="courses-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>课程列表</span>
          <el-button type="primary" @click="loadCourses" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table 
        :data="courses" 
        stripe 
        style="width: 100%"
        empty-text="暂无课程数据"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="课程名称" min-width="150" />
        <el-table-column prop="year_month" label="年月" width="120" />
        <el-table-column prop="fee" label="费用" width="100">
          <template #default="{ row }">
            ¥{{ row.fee }}
          </template>
        </el-table-column>
        <el-table-column prop="teacher_name" label="授课教师" min-width="120" />
        <el-table-column prop="created_at" label="选课时间" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container" v-if="pagination.total > 0">
        <el-pagination
          v-model:current-page="pagination.current_page"
          v-model:page-size="pagination.per_page"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getMyCourses } from '@/utils/api'

const authStore = useAuthStore()

// 数据
const courses = ref([])
const loading = ref(false)
const pagination = reactive({
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1
})

// 加载课程数据
const loadCourses = async () => {
  try {
    loading.value = true
    const response = await getMyCourses({
      page: pagination.current_page,
      per_page: pagination.per_page
    })
    
    if (response.data.success) {
      courses.value = response.data.data.courses || []
      pagination.current_page = response.data.data.pagination.current_page
      pagination.per_page = response.data.data.pagination.per_page
      pagination.total = response.data.data.pagination.total
      pagination.last_page = response.data.data.pagination.last_page
    } else {
      ElMessage.error(response.data.message || '获取课程数据失败')
    }
  } catch (error) {
    console.error('加载课程数据失败:', error)
    ElMessage.error('加载课程数据失败')
  } finally {
    loading.value = false
  }
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.per_page = val
  pagination.current_page = 1
  loadCourses()
}

const handleCurrentChange = (val) => {
  pagination.current_page = val
  loadCourses()
}

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 1: return 'success'
    case 0: return 'warning'
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 1: return '已选课'
    case 0: return '待确认'
    default: return '未知'
  }
}

onMounted(() => {
  loadCourses()
})
</script>

<style scoped>
.my-courses {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.page-header p {
  color: #7f8c8d;
  font-size: 14px;
  margin: 0;
}

.courses-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .my-courses {
    padding: 10px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
}
</style>