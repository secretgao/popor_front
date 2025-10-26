<template>
  <div class="omise-payment-form">
    <el-card class="payment-card">
      <template #header>
        <div class="card-header">
          <h3>
            <el-icon><CreditCard /></el-icon>
            Omise 支付
          </h3>
          <el-tag type="success">测试环境</el-tag>
        </div>
      </template>
      
      <el-form :model="paymentForm" :rules="paymentRules" ref="paymentFormRef" label-width="120px">
        <!-- 支付金额 -->
        <el-form-item label="支付金额" prop="amount">
          <el-input-number
            v-model="paymentForm.amount"
            :min="1"
            :max="100000"
            :precision="2"
            controls-position="right"
            style="width: 200px"
          />
          <el-select v-model="paymentForm.currency" style="width: 100px; margin-left: 10px">
            <el-option label="JPY" value="JPY" />
            <el-option label="USD" value="USD" />
            <el-option label="EUR" value="EUR" />
          </el-select>
        </el-form-item>
        
        <!-- 支付描述 -->
        <el-form-item label="支付描述" prop="description">
          <el-input
            v-model="paymentForm.description"
            placeholder="请输入支付描述"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <!-- 卡片信息 -->
        <el-divider content-position="left">信用卡信息</el-divider>
        
        <el-form-item label="卡片号码" prop="cardNumber">
          <el-input
            v-model="paymentForm.cardNumber"
            placeholder="1234 5678 9012 3456"
            maxlength="19"
            @input="formatCardNumber"
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="有效期" prop="expiry">
              <el-input
                v-model="paymentForm.expiry"
                placeholder="MM/YY"
                maxlength="5"
                @input="formatExpiry"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="CVV" prop="cvv">
              <el-input
                v-model="paymentForm.cvv"
                placeholder="123"
                maxlength="4"
                type="password"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="持卡人姓名" prop="cardName">
          <el-input
            v-model="paymentForm.cardName"
            placeholder="请输入持卡人姓名"
            maxlength="50"
          />
        </el-form-item>
        
        <!-- 支付按钮 -->
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading"
            @click="handleOmisePayment"
            size="large"
            :disabled="!isFormValid"
          >
            <el-icon><CreditCard /></el-icon>
            {{ loading ? '处理中...' : '立即支付' }}
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 支付信息 -->
      <div class="payment-info">
        <el-alert
          title="Omise 支付信息"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <p><strong>公钥:</strong> {{ maskedPublicKey }}</p>
            <p><strong>环境:</strong> 测试环境</p>
            <p><strong>支持货币:</strong> JPY, USD, EUR</p>
            <p><strong>测试卡片:</strong> 4242 4242 4242 4242</p>
          </template>
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { CreditCard } from '@element-plus/icons-vue'
import { paymentService } from '@/utils/payment'
import { API_KEYS } from '@/config/keys'

// 定义事件
const emit = defineEmits(['payment-success', 'payment-error'])

// 表单引用
const paymentFormRef = ref()

// 加载状态
const loading = ref(false)

// 支付表单数据
const paymentForm = reactive({
  amount: 100,
  currency: 'JPY',
  description: '教育费用',
  cardNumber: '',
  expiry: '',
  cvv: '',
  cardName: ''
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
  cardNumber: [
    { required: true, message: '请输入卡片号码', trigger: 'blur' },
    { min: 13, max: 19, message: '卡片号码长度不正确', trigger: 'blur' }
  ],
  expiry: [
    { required: true, message: '请输入有效期', trigger: 'blur' },
    { pattern: /^(0[1-9]|1[0-2])\/\d{2}$/, message: '格式应为 MM/YY', trigger: 'blur' }
  ],
  cvv: [
    { required: true, message: '请输入CVV', trigger: 'blur' },
    { min: 3, max: 4, message: 'CVV长度应为3-4位', trigger: 'blur' }
  ],
  cardName: [
    { required: true, message: '请输入持卡人姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度在2到50个字符', trigger: 'blur' }
  ]
}

// 掩码显示公钥
const maskedPublicKey = computed(() => {
  const key = API_KEYS.PAYMENT_PUBLIC_KEY
  return key.substring(0, 8) + '...' + key.substring(key.length - 8)
})

// 表单是否有效
const isFormValid = computed(() => {
  return paymentForm.amount > 0 &&
         paymentForm.description.length >= 5 &&
         paymentForm.cardNumber.length >= 13 &&
         paymentForm.expiry.length === 5 &&
         paymentForm.cvv.length >= 3 &&
         paymentForm.cardName.length >= 2
})

// 格式化卡片号码
const formatCardNumber = (value) => {
  // 移除所有非数字字符
  const numbers = value.replace(/\D/g, '')
  // 每4位添加空格
  paymentForm.cardNumber = numbers.replace(/(\d{4})(?=\d)/g, '$1 ')
}

// 格式化有效期
const formatExpiry = (value) => {
  // 移除所有非数字字符
  const numbers = value.replace(/\D/g, '')
  // 在MM后添加斜杠
  if (numbers.length >= 2) {
    paymentForm.expiry = numbers.substring(0, 2) + '/' + numbers.substring(2, 4)
  } else {
    paymentForm.expiry = numbers
  }
}

// 处理 Omise 支付
const handleOmisePayment = async () => {
  if (!paymentFormRef.value) return
  
  try {
    await paymentFormRef.value.validate()
    
    loading.value = true
    
    // 准备卡片数据
    const cardData = {
      number: paymentForm.cardNumber.replace(/\s/g, ''),
      expiration_month: paymentForm.expiry.split('/')[0],
      expiration_year: '20' + paymentForm.expiry.split('/')[1],
      security_code: paymentForm.cvv,
      name: paymentForm.cardName
    }
    
    // 准备支付数据
    const paymentData = {
      amount: paymentForm.amount,
      currency: paymentForm.currency,
      description: paymentForm.description,
      invoice_id: 'INV-' + Date.now() // 示例发票ID
    }
    
    console.log('🚀 开始支付流程:', { cardData, paymentData })
    
    // 使用完整的支付流程
    const result = await paymentService.processOmisePayment(cardData, paymentData)
    
    ElMessage.success('支付成功！' + JSON.stringify(result))
    
    // 触发支付成功事件
    emit('payment-success', result)
    
  } catch (error) {
    console.error('❌ Omise 支付失败:', error)
    ElMessage.error('支付失败: ' + error.message)
    
    // 触发支付错误事件
    emit('payment-error', error)
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  paymentFormRef.value?.resetFields()
  paymentForm.amount = 100
  paymentForm.currency = 'JPY'
  paymentForm.description = '教育费用'
  paymentForm.cardNumber = ''
  paymentForm.expiry = ''
  paymentForm.cvv = ''
  paymentForm.cardName = ''
}

// 组件挂载时初始化
onMounted(() => {
  paymentService.initPayment()
})
</script>

<style scoped>
.omise-payment-form {
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
  display: flex;
  align-items: center;
  gap: 8px;
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
  .omise-payment-form {
    padding: 10px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
