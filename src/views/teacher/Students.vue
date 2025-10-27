<template>
  <div class="students-page">
    <div class="page-header">
      <h2>学生管理</h2>
      <p>查看和管理您的学生</p>
    </div>

    <!-- 学生列表 -->
    <el-card class="students-card">
      <template #header>
        <div class="card-header">
          <span>学生列表</span>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索学生姓名或邮箱"
              style="width: 300px; margin-right: 10px;"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" :icon="Plus" @click="showAddStudentDialog = true">
              添加学生
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredStudents" v-loading="loading" empty-text="暂无学生">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="is_active" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'danger'">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="primary" 
              @click="handleEditStudent(row)"
            >
              编辑
            </el-button>
            <el-button 
              v-if="row.is_active" 
              size="small" 
              type="danger" 
              @click="handleDeleteStudent(row)"
            >
              删除
            </el-button>
            <el-button 
              v-else 
              size="small" 
              type="success" 
              @click="handleRestoreStudent(row)"
            >
              恢复
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加学生对话框 -->
    <el-dialog v-model="showAddStudentDialog" title="添加学生" width="500px">
      <el-form :model="studentForm" :rules="studentRules" ref="studentFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="studentForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="studentForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="studentForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="studentForm.password" 
            type="password" 
            placeholder="请输入密码" 
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddStudentDialog = false">取消</el-button>
        <el-button type="primary" @click="addStudent" :loading="adding">
          添加
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑学生对话框 -->
    <el-dialog v-model="showEditStudentDialog" title="编辑学生" width="500px">
      <el-form :model="editStudentForm" :rules="editStudentRules" ref="editStudentFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editStudentForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editStudentForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editStudentForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="editStudentForm.password" 
            placeholder="请输入新密码（留空则不修改）" 
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditStudentDialog = false">取消</el-button>
        <el-button type="primary" @click="updateStudent" :loading="updating">
          更新
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
// 学生管理 API 已注释
// import { getStudents, createStudent, getStudentCourses, getStudentInvoices, updateStudentStatus, updateStudentInfo } from '@/utils/api'

const authStore = useAuthStore()

// 数据
const students = ref([])
const loading = ref(false)
const adding = ref(false)
const updating = ref(false)
const searchKeyword = ref('')
const showAddStudentDialog = ref(false)
const showEditStudentDialog = ref(false)

// 表单
const studentForm = reactive({
  username: '',
  name: '',
  email: '',
  password: ''
})

// 编辑表单
const editStudentForm = reactive({
  id: null,
  username: '',
  name: '',
  email: '',
  password: ''
})

// 验证规则
const studentRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 编辑验证规则（密码可选）
const editStudentRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 过滤后的学生列表
const filteredStudents = computed(() => {
  if (!searchKeyword.value) return students.value
  
  return students.value.filter(student => 
    student.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    student.email.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 加载学生列表 - 学生管理模块已注释
// const loadStudents = async () => {
//   loading.value = true
//   try {
//     const response = await getStudents({
//       page: 1,
//       per_page: 50
//     })
//     
//     if (response.data.success) {
//       students.value = response.data.data.students
//     } else {
//       ElMessage.error(response.data.message || '加载学生列表失败')
//     }
//   } catch (error) {
//     console.error('加载学生列表失败:', error)
//     ElMessage.error('加载学生列表失败')
//   } finally {
//     loading.value = false
//   }
// }

// 添加学生
const addStudent = async () => {
  // 前端参数校验
  if (!studentForm.username || studentForm.username.trim() === '') {
    ElMessage.error('请输入用户名')
    return
  }
  
  if (!studentForm.name || studentForm.name.trim() === '') {
    ElMessage.error('请输入姓名')
    return
  }
  
  if (!studentForm.email || studentForm.email.trim() === '') {
    ElMessage.error('请输入邮箱')
    return
  }
  
  // 邮箱格式校验
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(studentForm.email)) {
    ElMessage.error('请输入正确的邮箱格式')
    return
  }
  
  if (!studentForm.password || studentForm.password.trim() === '') {
    ElMessage.error('请输入密码')
    return
  }
  
  if (studentForm.password.length < 6) {
    ElMessage.error('密码长度不能少于6位')
    return
  }
  
  try {
    adding.value = true
    const response = await createStudent(studentForm)
    
    if (response.data.success) {
      ElMessage.success('学生添加成功')
      showAddStudentDialog.value = false
      Object.assign(studentForm, {
        username: '',
        name: '',
        email: '',
        password: ''
      })
      // loadStudents() // 学生管理模块已注释
    } else {
      ElMessage.error(response.data.message || '添加学生失败')
    }
  } catch (error) {
    console.error('添加学生失败:', error)
    ElMessage.error('添加学生失败')
  } finally {
    adding.value = false
  }
}

// 删除学生（软删除）
const handleDeleteStudent = async (student) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除学生 "${student.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await updateStudentStatus(student.id, { is_active: false })
    
    if (response.data.success) {
      ElMessage.success('学生删除成功')
      // loadStudents() // 学生管理模块已注释 // 重新加载列表
    } else {
      ElMessage.error(response.data.message || '删除学生失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除学生失败:', error)
      ElMessage.error('删除学生失败')
    }
  }
}

// 恢复学生
const handleRestoreStudent = async (student) => {
  try {
    await ElMessageBox.confirm(
      `确定要恢复学生 "${student.name}" 吗？`,
      '确认恢复',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    )
    
    const response = await updateStudentStatus(student.id, { is_active: true })
    
    if (response.data.success) {
      ElMessage.success('学生恢复成功')
      // loadStudents() // 学生管理模块已注释 // 重新加载列表
    } else {
      ElMessage.error(response.data.message || '恢复学生失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('恢复学生失败:', error)
      ElMessage.error('恢复学生失败')
    }
  }
}

// 编辑学生
const handleEditStudent = (student) => {
  editStudentForm.id = student.id
  editStudentForm.username = student.username
  editStudentForm.name = student.name
  editStudentForm.email = student.email
  editStudentForm.password = ''
  showEditStudentDialog.value = true
}

// 更新学生
const updateStudent = async () => {
  // 前端参数校验
  if (!editStudentForm.username || editStudentForm.username.trim() === '') {
    ElMessage.error('请输入用户名')
    return
  }
  
  if (!editStudentForm.name || editStudentForm.name.trim() === '') {
    ElMessage.error('请输入姓名')
    return
  }
  
  if (!editStudentForm.email || editStudentForm.email.trim() === '') {
    ElMessage.error('请输入邮箱')
    return
  }
  
  // 邮箱格式校验
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(editStudentForm.email)) {
    ElMessage.error('请输入正确的邮箱格式')
    return
  }
  
  // 如果输入了密码，校验密码长度
  if (editStudentForm.password && editStudentForm.password.trim() !== '' && editStudentForm.password.length < 6) {
    ElMessage.error('密码长度不能少于6位')
    return
  }
  
  try {
    updating.value = true
    
    // 准备更新数据
    const updateData = {
      username: editStudentForm.username,
      name: editStudentForm.name,
      email: editStudentForm.email
    }
    
    // 如果密码不为空，则更新密码
    if (editStudentForm.password && editStudentForm.password.trim() !== '') {
      updateData.password = editStudentForm.password
    }
    
    const response = await updateStudentInfo(editStudentForm.id, updateData)
    
    if (response.data.success) {
      ElMessage.success('学生信息更新成功')
      showEditStudentDialog.value = false
      // loadStudents() // 学生管理模块已注释 // 重新加载列表
    } else {
      ElMessage.error(response.data.message || '更新学生信息失败')
    }
  } catch (error) {
    console.error('更新学生信息失败:', error)
    ElMessage.error('更新学生信息失败')
  } finally {
    updating.value = false
  }
}



onMounted(() => {
  // loadStudents() // 学生管理模块已注释
})
</script>

<style scoped>
.students-page {
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

.students-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.amount {
  color: #e74c3c;
  font-weight: 600;
}
</style>
