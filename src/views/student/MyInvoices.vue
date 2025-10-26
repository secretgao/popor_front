<template>
  <div class="my-invoices-page">
    <div class="page-header">
      <h2>我的账单</h2>
      <p>查看和管理您的账单</p>
    </div>


    <!-- 账单列表 -->
    <el-card class="invoices-card">
      <el-table :data="invoices" v-loading="loading" empty-text="暂无账单">
        <el-table-column prop="id" label="账单ID" width="80" />
        <el-table-column prop="course_name" label="课程名称" />
        <el-table-column prop="teacher_name" label="授课教师" width="120" />
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
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="viewInvoice(row)">查看详情</el-button>
            <el-button 
              size="small" 
              type="primary" 
              @click="payInvoice(row)"
              :disabled="row.status === 1"
            >
              {{ row.status === 1 ? '已支付' : '立即支付' }}
            </el-button>
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

    <!-- 账单详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="账单详情" width="600px">
      <div v-if="currentInvoice" class="invoice-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="账单ID">{{ currentInvoice.id }}</el-descriptions-item>
          <el-descriptions-item label="课程名称">{{ currentInvoice.course_name }}</el-descriptions-item>
          <el-descriptions-item label="授课教师">{{ currentInvoice.teacher_name }}</el-descriptions-item>
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
          <el-descriptions-item label="支付时间" v-if="currentInvoice.paid_at">
            {{ currentInvoice.paid_at }}
          </el-descriptions-item>
          <el-descriptions-item label="账单描述" :span="2">
            {{ currentInvoice.description }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 支付对话框 -->
    <el-dialog v-model="showPaymentDialog" title="支付账单" width="500px">
      <div v-if="paymentInvoice" class="payment-detail">
        <el-alert
          title="支付信息"
          type="info"
          :closable="false"
          style="margin-bottom: 20px;"
        >
          <template #default>
            <p><strong>账单ID:</strong> {{ paymentInvoice.id }}</p>
            <p><strong>课程:</strong> {{ paymentInvoice.course_name }}</p>
            <p><strong>金额:</strong> <span class="amount">¥{{ paymentInvoice.amount }}</span></p>
            <p><strong>到期日期:</strong> {{ paymentInvoice.due_date }}</p>
          </template>
        </el-alert>

        <el-form :model="paymentForm" label-width="100px">
          <el-form-item label="支付方式">
            <el-radio-group v-model="paymentForm.payment_method">
              <el-radio label="credit_card">信用卡</el-radio>
              <el-radio label="debit_card">借记卡</el-radio>
              <el-radio label="bank_transfer">银行转账</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注">
            <el-input 
              v-model="paymentForm.notes" 
              type="textarea" 
              :rows="3"
              placeholder="支付备注（可选）"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showPaymentDialog = false">取消</el-button>
        <el-button type="primary" @click="processPayment" :loading="processing">
          确认支付
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { getInvoices, getCourses } from '@/utils/api'
import { showApiError } from '@/utils/errorHandler'

const authStore = useAuthStore()

// 数据
const invoices = ref([])
const courses = ref([])
const loading = ref(false)
const processing = ref(false)
const showDetailDialog = ref(false)
const showPaymentDialog = ref(false)
const currentInvoice = ref(null)
const paymentInvoice = ref(null)


// 分页
const pagination = reactive({
  current_page: 1,
  per_page: 10,
  total: 0
})

// 支付表单
const paymentForm = reactive({
  payment_method: 'credit_card',
  notes: ''
})

// 加载账单列表
const loadInvoices = async () => {
  loading.value = true
  try {
    console.log('🔍 开始加载学生账单列表')
    
    // 构建查询参数
    const params = {
      page: pagination.current_page,
      per_page: pagination.per_page
    }
    
    console.log('📤 发送账单查询请求:', params)
    
    // 调用API获取账单数据
    const response = await getInvoices(params)
    
    console.log('📥 收到账单API响应:', response.data)
    
    if (response.data.success) {
      invoices.value = response.data.data.invoices || []
      pagination.total = response.data.data.pagination?.total || 0
      pagination.current_page = response.data.data.pagination?.current_page || 1
      pagination.per_page = response.data.data.pagination?.per_page || 10
      
      console.log('✅ 账单数据加载成功:', {
        invoices: invoices.value.length,
        total: pagination.total,
        current_page: pagination.current_page
      })
    } else {
      console.log('❌ 账单数据加载失败:', response.data.message)
      ElMessage.error(response.data.message || '加载账单列表失败')
    }
  } catch (error) {
    console.error('💥 加载账单列表异常:', error)
    showApiError(error, '加载账单列表失败')
  } finally {
    loading.value = false
  }
}

// 加载课程数据
const loadCourses = async () => {
  try {
    console.log('🔍 开始加载课程列表')
    
    // 调用API获取课程数据
    const response = await getCourses()
    
    console.log('📥 收到课程API响应:', response.data)
    
    if (response.data.success) {
      courses.value = response.data.data.courses || []
      console.log('✅ 课程数据加载成功:', courses.value.length)
    } else {
      console.log('❌ 课程数据加载失败:', response.data.message)
      ElMessage.error(response.data.message || '加载课程列表失败')
    }
  } catch (error) {
    console.error('💥 加载课程列表异常:', error)
    showApiError(error, '加载课程列表失败')
  }
}

// 查看账单详情
const viewInvoice = (invoice) => {
  currentInvoice.value = invoice
  showDetailDialog.value = true
}

// 支付账单
const payInvoice = (invoice) => {
  paymentInvoice.value = invoice
  showPaymentDialog.value = true
  Object.assign(paymentForm, {
    payment_method: 'credit_card',
    notes: ''
  })
}

// 处理支付
const processPayment = async () => {
  try {
    processing.value = true
    
    console.log('🔍 开始处理支付:', paymentInvoice.value)
    console.log('📤 支付表单数据:', paymentForm)
    
    // 这里应该调用 API 处理支付
    // 暂时模拟支付成功
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('✅ 支付处理成功')
    ElMessage.success('支付成功！')
    showPaymentDialog.value = false
    loadInvoices() // 重新加载账单列表
  } catch (error) {
    console.error('💥 支付处理异常:', error)
    showApiError(error, '支付失败，请重试')
  } finally {
    processing.value = false
  }
}


// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 0: return 'warning'  // 待支付
    case 1: return 'success'   // 已支付
    case 2: return 'danger'    // 已过期
    default: return 'info'
  }
}

onMounted(() => {
  loadInvoices()
  loadCourses()
})
</script>

<style scoped>
.my-invoices-page {
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

.amount {
  color: #e74c3c;
  font-weight: 600;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.invoice-detail,
.payment-detail {
  padding: 10px 0;
}
</style>
