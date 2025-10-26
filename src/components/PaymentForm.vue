<template>
  <div class="payment-form">
    <el-card class="payment-card">
      <template #header>
        <div class="card-header">
          <h3>支付表单</h3>
          <el-tag type="success">测试环境</el-tag>
        </div>
      </template>
      
      <el-form :model="paymentForm" :rules="paymentRules" ref="paymentFormRef" label-width="100px">
        <el-form-item label="金额" prop="amount">
          <el-input-number
            v-model="paymentForm.amount"
            :min="1"
            :max="100000"
            :precision="2"
            controls-position="right"
            style="width: 200px"
          />
          <span class="currency">JPY</span>
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="paymentForm.description"
            placeholder="请输入支付描述"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="支付方式" prop="method">
          <el-select v-model="paymentForm.method" placeholder="请选择支付方式">
            <el-option label="信用卡" value="credit_card" />
            <el-option label="银行转账" value="bank_transfer" />
            <el-option label="支付宝" value="alipay" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading"
            @click="handlePayment"
            size="large"
          >
            {{ loading ? '处理中...' : '立即支付' }}
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div class="payment-info">
        <el-alert
          title="支付信息"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <p>公钥: {{ maskedPublicKey }}</p>
            <p>环境: 测试环境</p>
            <p>支持货币: JPY, USD, EUR</p>
          </template>
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { paymentService } from '@/utils/payment'
import { API_KEYS } from '@/config/keys'

// 表单引用
const paymentFormRef = ref()

// 加载状态
const loading = ref(false)

// 支付表单数据
const paymentForm = reactive({
  amount: 100,
  description: '教育费用',
  method: 'credit_card'
})

// 表单验证规则
const paymentRules = {
  amount: [
    { required: true, message: '请输入支付金额', trigger: 'blur' },
    { type: 'number', min: 1, message: '金额必须大于0', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入支付描述', trigger: 'blur' },
    { min: 5, max: 100, message: '描述长度在5到100个字符', trigger: 'blur' }
  ],
  method: [
    { required: true, message: '请选择支付方式', trigger: 'change' }
  ]
}

// 掩码显示公钥
const maskedPublicKey = computed(() => {
  const key = API_KEYS.PAYMENT_PUBLIC_KEY
  return key.substring(0, 8) + '...' + key.substring(key.length - 8)
})

// 处理支付
const handlePayment = async () => {
  if (!paymentFormRef.value) return
  
  try {
    await paymentFormRef.value.validate()
    
    loading.value = true
    
    // 初始化支付服务
    paymentService.initPayment()
    
    // 创建支付表单
    const paymentData = paymentService.createPaymentForm({
      amount: paymentForm.amount,
      description: paymentForm.description,
      currency: 'JPY'
    })
    
    console.log('支付数据:', paymentData)
    
    // 模拟支付处理
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('支付处理成功！')
    
  } catch (error) {
    console.error('支付失败:', error)
    ElMessage.error('支付失败，请重试')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  paymentFormRef.value?.resetFields()
  paymentForm.amount = 100
  paymentForm.description = '教育费用'
  paymentForm.method = 'credit_card'
}
</script>

<style scoped>
.payment-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.payment-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #2c3e50;
}

.currency {
  margin-left: 10px;
  color: #7f8c8d;
  font-weight: 500;
}

.payment-info {
  margin-top: 20px;
}

.payment-info p {
  margin: 5px 0;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .payment-form {
    padding: 10px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
