<template>
  <div class="invoices-page">
    <div class="page-header">
      <h2>账单管理</h2>
      <p>管理所有账单信息</p>
    </div>


    <!-- 账单列表 -->
    <el-card class="invoices-card">
      <template #header>
        <div class="card-header">
          <span>账单列表</span>
          <div class="header-actions">
            <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">
              创建账单
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="invoices" v-loading="loading" empty-text="暂无账单">
        <el-table-column prop="id" label="账单ID" width="80" />
        <el-table-column prop="student_name" label="学生姓名" />
        <el-table-column prop="student_email" label="学生邮箱" />
        <el-table-column prop="course_name" label="课程名称" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status_name" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status_name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" @click="viewInvoice(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current_page"
          v-model:page-size="pagination.per_page"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadInvoices"
          @current-change="loadInvoices"
        />
      </div>
    </el-card>

    <!-- 创建账单对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建账单" width="600px">
      <el-form :model="invoiceForm" :rules="invoiceRules" ref="invoiceFormRef" label-width="100px">
        <el-form-item label="选择学生" prop="student_id">
          <el-select v-model="invoiceForm.student_id" placeholder="请选择学生" style="width: 100%;" filterable>
            <el-option
              v-for="student in students"
              :key="student.id"
              :label="`${student.name} (${student.email})`"
              :value="student.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择课程" prop="course_id">
          <el-select v-model="invoiceForm.course_id" placeholder="请选择课程" style="width: 100%;">
            <el-option
              v-for="course in courses"
              :key="course.id"
              :label="`${course.name} - ¥${course.price}`"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="账单金额" prop="amount">
          <el-input-number 
            v-model="invoiceForm.amount" 
            :min="0" 
            :precision="2"
            :disabled="true"
            placeholder="请先选择课程" 
            style="width: 100%;"
          />
          <div class="amount-tip">
            <el-text type="info" size="small">
              账单金额将自动带入所选课程的价格
            </el-text>
          </div>
        </el-form-item>
        <el-form-item label="账单描述" prop="description">
          <el-input 
            v-model="invoiceForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入账单描述" 
          />
        </el-form-item>
        <el-form-item label="年月" prop="year_month">
          <el-date-picker
            v-model="invoiceForm.year_month"
            type="month"
            placeholder="选择年月"
            style="width: 100%;"
            format="YYYY-MM"
            value-format="YYYYMM"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createInvoiceHandler" :loading="creating">
          创建账单
        </el-button>
      </template>
    </el-dialog>

    <!-- 账单详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="账单详情" width="600px">
      <div v-if="currentInvoice" class="invoice-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="账单ID">{{ currentInvoice.id }}</el-descriptions-item>
          <el-descriptions-item label="学生姓名">{{ currentInvoice.student_name }}</el-descriptions-item>
          <el-descriptions-item label="学生邮箱">{{ currentInvoice.student_email }}</el-descriptions-item>
          <el-descriptions-item label="课程名称">{{ currentInvoice.course_name }}</el-descriptions-item>
          <el-descriptions-item label="账单金额">
            <span class="amount">¥{{ currentInvoice.amount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="账单状态">
            <el-tag :type="getStatusType(currentInvoice.status)">
              {{ currentInvoice.status_name }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="到期日期">{{ currentInvoice.due_date }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentInvoice.created_at }}</el-descriptions-item>
          <el-descriptions-item label="账单描述" :span="2">
            {{ currentInvoice.description }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getInvoices, createInvoice, updateInvoice, getStudents, getCourses } from '@/utils/api'

// 数据
const invoices = ref([])
const students = ref([])
const courses = ref([])
const loading = ref(false)
const creating = ref(false)
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const currentInvoice = ref(null)


// 分页
const pagination = reactive({
  current_page: 1,
  per_page: 10,
  total: 0
})

// 表单
const invoiceForm = reactive({
  student_id: '',
  course_id: '',
  amount: 0,
  description: '',
  year_month: ''
})

// 验证规则
const invoiceRules = {
  student_id: [
    { required: true, message: '请选择学生', trigger: 'change' }
  ],
  course_id: [
    { required: true, message: '请选择课程', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入账单金额', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入账单描述', trigger: 'blur' }
  ],
  year_month: [
    { required: true, message: '请选择年月', trigger: 'change' }
  ]
}

// 加载账单列表
const loadInvoices = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current_page,
      per_page: pagination.per_page
    }
    
    const response = await getInvoices(params)
    
    if (response.data.success) {
      invoices.value = response.data.data.invoices
      pagination.total = response.data.data.pagination.total
    } else {
      ElMessage.error(response.data.message || '加载账单列表失败')
    }
  } catch (error) {
    console.error('加载账单列表失败:', error)
    ElMessage.error('加载账单列表失败')
  } finally {
    loading.value = false
  }
}

// 加载学生和课程数据
const loadFormData = async () => {
  try {
    // 并行加载学生和课程数据
    const [studentsResponse, coursesResponse] = await Promise.all([
      getStudents({ per_page: 1000 }), // 获取所有学生
      getCourses({ per_page: 1000 })   // 获取所有课程
    ])
    
    // 处理学生数据
    if (studentsResponse.data.success) {
      students.value = studentsResponse.data.data.students || []
      console.log('✅ 学生数据加载成功:', students.value.length, '个学生')
    } else {
      console.error('❌ 学生数据加载失败:', studentsResponse.data.message)
      students.value = []
    }
    
    // 处理课程数据
    if (coursesResponse.data.success) {
      courses.value = coursesResponse.data.data.courses || []
      console.log('✅ 课程数据加载成功:', courses.value.length, '个课程')
    } else {
      console.error('❌ 课程数据加载失败:', coursesResponse.data.message)
      courses.value = []
    }
    
  } catch (error) {
    console.error('❌ 加载表单数据失败:', error)
    ElMessage.error('加载表单数据失败: ' + (error.response?.data?.message || error.message))
    
    // 设置空数组作为后备
    students.value = []
    courses.value = []
  }
}

// 创建账单
const createInvoiceHandler = async () => {
  // 防止重复点击
  if (creating.value) {
    return
  }
  
  try {
    creating.value = true
    const response = await createInvoice(invoiceForm)
    
    console.log('创建账单响应:', response)
    
    // 检查响应是否存在
    if (!response || !response.data) {
      ElMessage.error('服务器响应异常，请稍后重试')
      return
    }
    
    // 检查响应数据
    if (response.data.success) {
      ElMessage.success('账单创建成功')
      showCreateDialog.value = false
      Object.assign(invoiceForm, {
        student_id: '',
        course_id: '',
        amount: 0,
        description: '',
        year_month: ''
      })
      loadInvoices()
    } else {
      // 如果 success 为 false，直接显示接口返回的错误信息
      const errorMessage = response.data.message || '创建账单失败'
      ElMessage.error(errorMessage)
      console.error('创建账单失败:', response.data)
    }
  } catch (error) {
    console.error('创建账单失败:', error)
    
    // 更详细的错误处理
    if (error.response) {
      // 服务器响应了错误状态码，优先使用接口返回的错误信息
      const errorMessage = error.response.data?.message || error.response.statusText || '服务器错误'
      
      // 直接显示接口返回的错误信息，不重复处理
      if (error.response.data?.message) {
        ElMessage.error(errorMessage)
      } else {
        ElMessage.error(`创建账单失败: ${errorMessage}`)
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      // 其他错误
      ElMessage.error('创建账单失败: ' + error.message)
    }
  } finally {
    creating.value = false
  }
}

// 查看账单
const viewInvoice = (invoice) => {
  currentInvoice.value = invoice
  showDetailDialog.value = true
}



// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 0: return 'warning'    // 待支付
    case 1: return 'info'        // 支付中
    case 2: return 'success'     // 支付成功
    case 3: return 'danger'      // 支付失败
    default: return 'info'
  }
}

// 监听课程选择变化，自动更新账单金额
watch(() => invoiceForm.course_id, (newCourseId) => {
  if (newCourseId && courses.value.length > 0) {
    const selectedCourse = courses.value.find(course => course.id === newCourseId)
    if (selectedCourse) {
      invoiceForm.amount = selectedCourse.price
      console.log('✅ 自动设置账单金额:', selectedCourse.price)
    }
  } else {
    invoiceForm.amount = 0
  }
})

onMounted(() => {
  loadInvoices()
  loadFormData()
})
</script>

<style scoped>
.invoices-page {
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

.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.invoices-card {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.invoice-detail {
  padding: 10px 0;
}

.amount-tip {
  margin-top: 5px;
}
</style>
