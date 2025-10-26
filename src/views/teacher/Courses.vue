<template>
  <div class="courses-page">
    <div class="page-header">
      <h2>课程管理</h2>
      <p>管理您的课程信息</p>
    </div>

    <!-- 课程列表 -->
    <el-card class="courses-card">
      <template #header>
        <div class="card-header">
          <span>我的课程</span>
          <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">
            创建课程
          </el-button>
        </div>
      </template>

        <el-table :data="courses" v-loading="loading" empty-text="暂无课程">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="课程名称" />
          <el-table-column prop="teacher_name" label="创建老师" width="120">
            <template #default="{ row }">
              <span>{{ row.teacher_name || '未知老师' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="year_month" label="年月" width="100" />
          <el-table-column prop="price" label="费用" width="120">
            <template #default="{ row }">
              <span class="price">¥{{ row.price }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="is_del" label="删除状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.is_del ? 'danger' : 'success'">
                {{ row.is_del ? '已删除' : '正常' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="editCourse(row)">编辑</el-button>
            <el-button 
              v-if="!row.is_del" 
              size="small" 
              type="danger" 
              @click="handleDeleteCourse(row)"
            >
              删除
            </el-button>
            <el-button 
              v-else 
              size="small" 
              type="success" 
              @click="handleRestoreCourse(row)"
            >
              恢复
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建/编辑课程对话框 -->
    <el-dialog v-model="showCreateDialog" :title="isEditing ? '编辑课程' : '创建课程'" width="500px">
        <el-form :model="courseForm" :rules="courseRules" ref="courseFormRef" label-width="80px">
          <el-form-item label="课程名称" prop="name">
            <el-input v-model="courseForm.name" placeholder="请输入课程名称" />
          </el-form-item>
          <el-form-item label="年月" prop="year_month">
            <el-date-picker
              v-model="courseForm.year_month"
              type="month"
              placeholder="选择年月"
              format="YYYYMM"
              value-format="YYYYMM"
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item label="课程费用" prop="fee">
            <el-input-number 
              v-model="courseForm.fee" 
              :min="0" 
              :precision="2"
              placeholder="请输入课程费用" 
              style="width: 100%;"
            />
          </el-form-item>
        </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createCourseHandler" :loading="creating">
          {{ isEditing ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { getCourses, createCourse, updateCourse, updateCourseStatus } from '@/utils/api'

const authStore = useAuthStore()

// 数据
const courses = ref([])
const loading = ref(false)
const creating = ref(false)
const isEditing = ref(false)
const showCreateDialog = ref(false)
const currentCourse = ref(null)

// 表单
const courseForm = reactive({
  name: '',
  year_month: '',
  fee: 0
})

const courseRules = {
  name: [
    { required: true, message: '请输入课程名称', trigger: 'blur' }
  ],
  year_month: [
    { required: true, message: '请选择年月', trigger: 'change' }
  ],
  fee: [
    { required: true, message: '请输入课程费用', trigger: 'blur' }
  ]
}

// 加载课程列表
const loadCourses = async () => {
  loading.value = true
  try {
    const response = await getCourses({
      page: 1,
      per_page: 50
    })
    
    if (response.data.success) {
      courses.value = response.data.data.courses
    } else {
      ElMessage.error(response.data.message || '加载课程失败')
    }
  } catch (error) {
    console.error('加载课程失败:', error)
    ElMessage.error('加载课程失败')
  } finally {
    loading.value = false
  }
}

// 创建/更新课程
const createCourseHandler = async () => {
  try {
    creating.value = true
    
    let response
    if (isEditing.value) {
      // 更新课程
      response = await updateCourse(currentCourse.value.id, courseForm)
    } else {
      // 创建课程
      response = await createCourse(courseForm)
    }
    
    if (response.data.success) {
      ElMessage.success(isEditing.value ? '课程更新成功' : '课程创建成功')
      showCreateDialog.value = false
      courseForm.name = ''
      courseForm.year_month = ''
      courseForm.fee = 0
      isEditing.value = false
      currentCourse.value = null
      loadCourses()
    } else {
      ElMessage.error(response.data.message || (isEditing.value ? '更新课程失败' : '创建课程失败'))
    }
  } catch (error) {
    console.error(isEditing.value ? '更新课程失败:' : '创建课程失败:', error)
    ElMessage.error(isEditing.value ? '更新课程失败' : '创建课程失败')
  } finally {
    creating.value = false
  }
}


// 删除课程
const deleteCourseHandler = async (course) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除课程 "${course.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const response = await deleteCourse(course.id)
    
    if (response.data.success) {
      ElMessage.success('课程删除成功')
      loadCourses()
    } else {
      ElMessage.error(response.data.message || '删除课程失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除课程失败:', error)
      ElMessage.error('删除课程失败')
    }
  }
}

// 编辑课程
const editCourse = (course) => {
  currentCourse.value = course
  Object.assign(courseForm, {
    name: course.name,
    year_month: course.year_month,
    fee: course.price
  })
  showCreateDialog.value = true
  isEditing.value = true
}

// 软删除课程
const handleDeleteCourse = async (course) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除课程 "${course.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await updateCourseStatus(course.id, { is_del: true })
    
    if (response.data.success) {
      ElMessage.success('课程删除成功')
      loadCourses() // 重新加载列表
    } else {
      ElMessage.error(response.data.message || '删除课程失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除课程失败:', error)
      ElMessage.error('删除课程失败')
    }
  }
}

// 恢复课程
const handleRestoreCourse = async (course) => {
  try {
    await ElMessageBox.confirm(
      `确定要恢复课程 "${course.name}" 吗？`,
      '确认恢复',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    )
    
    const response = await updateCourseStatus(course.id, { is_del: false })
    
    if (response.data.success) {
      ElMessage.success('课程恢复成功')
      loadCourses() // 重新加载列表
    } else {
      ElMessage.error(response.data.message || '恢复课程失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('恢复课程失败:', error)
      ElMessage.error('恢复课程失败')
    }
  }
}


onMounted(() => {
  loadCourses()
})
</script>

<style scoped>
.courses-page {
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

.price {
  color: #e74c3c;
  font-weight: 600;
}

.students-management h4 {
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 15px 0;
}

.add-student-section {
  margin-bottom: 20px;
}

.current-students {
  margin-top: 20px;
}
</style>
