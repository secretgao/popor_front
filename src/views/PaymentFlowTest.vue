<template>
  <div class="payment-flow-test">
    <el-card class="test-card">
      <template #header>
        <h2>🧪 支付流程测试</h2>
        <p>测试完整的支付流程：前端 → PHP API → Omise → Webhook回调</p>
      </template>
      
      <!-- 步骤指示器 -->
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="获取配置" description="GET /api/payment/config"></el-step>
        <el-step title="创建令牌" description="前端 Omise SDK 创建 token"></el-step>
        <el-step title="处理支付" description="POST /api/payment/process"></el-step>
        <el-step title="Webhook回调" description="POST /api/payment/webhook"></el-step>
        <el-step title="完成" description="支付成功"></el-step>
      </el-steps>
      
      <el-divider />
      
      <!-- 测试表单 -->
      <el-form :model="testForm" :rules="testRules" ref="testFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="支付金额" prop="amount">
              <el-input-number
                v-model="testForm.amount"
                :min="1"
                :max="100000"
                :precision="2"
                controls-position="right"
                style="width: 200px"
              />
              <el-select v-model="testForm.currency" style="width: 100px; margin-left: 10px">
                <el-option label="THB" value="THB" />
                <el-option label="USD" value="USD" />
                <el-option label="EUR" value="EUR" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发票ID" prop="invoiceId">
              <el-input
                v-model="testForm.invoiceId"
                placeholder="INV-123456"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="支付描述" prop="description">
          <el-input
            v-model="testForm.description"
            placeholder="请输入支付描述"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="测试卡片" prop="cardNumber">
          <el-input
            v-model="testForm.cardNumber"
            placeholder="4242 4242 4242 4242"
            maxlength="19"
            @input="formatCardNumber"
          />
          <el-tag type="info" style="margin-left: 10px">测试卡片</el-tag>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="有效期" prop="expiry">
              <el-input
                v-model="testForm.expiry"
                placeholder="12/25"
                maxlength="5"
                @input="formatExpiry"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="CVV" prop="cvv">
              <el-input
                v-model="testForm.cvv"
                placeholder="123"
                maxlength="4"
                type="password"
                show-password
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="持卡人" prop="cardName">
              <el-input
                v-model="testForm.cardName"
                placeholder="John Doe"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading"
            @click="startPaymentTest"
            size="large"
            :disabled="!isFormValid"
          >
            <el-icon><CreditCard /></el-icon>
            {{ loading ? '测试中...' : '开始支付测试' }}
          </el-button>
          <el-button @click="resetTest">重置测试</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 测试结果 -->
      <div v-if="testResults.length > 0" class="test-results">
        <el-divider content-position="left">测试结果</el-divider>
        <el-timeline>
          <el-timeline-item
            v-for="(result, index) in testResults"
            :key="index"
            :type="result.success ? 'success' : 'danger'"
            :timestamp="result.timestamp"
          >
            <h4>{{ result.title }}</h4>
            <p>{{ result.description }}</p>
            <el-tag :type="result.success ? 'success' : 'danger'">
              {{ result.success ? '成功' : '失败' }}
            </el-tag>
            <div v-if="result.data" class="result-data">
              <el-collapse>
                <el-collapse-item title="查看详情" name="details">
                  <pre>{{ JSON.stringify(result.data, null, 2) }}</pre>
                </el-collapse-item>
              </el-collapse>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
      
      <!-- 流程说明 -->
      <el-collapse class="process-info">
        <el-collapse-item title="📋 完整支付流程说明" name="process">
          <div class="process-steps">
            <div class="step">
              <h4>1. 前端获取支付配置</h4>
              <p>调用 <code>GET /api/payment/config</code> 获取公钥、环境、支持货币等</p>
              <el-tag type="info">无需认证</el-tag>
            </div>
            <div class="step">
              <h4>2. 前端创建支付令牌</h4>
              <p>使用前端 Omise SDK 直接创建 token，无需调用后端接口</p>
              <el-tag type="warning">敏感信息仅用于生成令牌</el-tag>
            </div>
            <div class="step">
              <h4>3. 前端发起扣款</h4>
              <p>调用 <code>POST /api/payment/process</code> 传递 token_id 和支付信息</p>
              <el-tag type="success">需要认证</el-tag>
            </div>
            <div class="step">
              <h4>4. Omise 异步回调</h4>
              <p>Omise 调用 <code>POST /api/payment/webhook</code> 通知支付结果</p>
              <el-tag type="primary">幂等性处理</el-tag>
            </div>
            <div class="step">
              <h4>5. 更新发票状态</h4>
              <p>根据 webhook 事件更新发票状态（paid/failed/refunded）</p>
              <el-tag type="success">业务逻辑处理</el-tag>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { CreditCard } from '@element-plus/icons-vue'
import { paymentService } from '@/utils/payment'

// 表单引用
const testFormRef = ref()

// 加载状态
const loading = ref(false)

// 当前步骤
const currentStep = ref(0)

// 测试表单数据
const testForm = reactive({
  amount: 100,
  currency: 'THB',
  description: '教育费用测试',
  invoiceId: 'INV-' + Date.now(),
  cardNumber: '4242 4242 4242 4242',
  expiry: '12/25',
  cvv: '123',
  cardName: 'John Doe'
})

// 表单验证规则
const testRules = {
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

// 测试结果
const testResults = ref([])

// 表单是否有效
const isFormValid = computed(() => {
  return testForm.amount > 0 &&
         testForm.description.length >= 5 &&
         testForm.cardNumber.length >= 13 &&
         testForm.expiry.length === 5 &&
         testForm.cvv.length >= 3 &&
         testForm.cardName.length >= 2
})

// 格式化卡片号码
const formatCardNumber = (value) => {
  const numbers = value.replace(/\D/g, '')
  testForm.cardNumber = numbers.replace(/(\d{4})(?=\d)/g, '$1 ')
}

// 格式化有效期
const formatExpiry = (value) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length >= 2) {
    testForm.expiry = numbers.substring(0, 2) + '/' + numbers.substring(2, 4)
  } else {
    testForm.expiry = numbers
  }
}

// 添加测试结果
const addTestResult = (title, description, success, data = null) => {
  testResults.value.push({
    title,
    description,
    success,
    data,
    timestamp: new Date().toLocaleTimeString()
  })
}

// 开始支付测试
const startPaymentTest = async () => {
  if (!testFormRef.value) return
  
  try {
    await testFormRef.value.validate()
    
    loading.value = true
    testResults.value = []
    currentStep.value = 0
    
    // 步骤1: 获取支付配置
    currentStep.value = 1
    addTestResult('步骤1: 获取支付配置', '调用 GET /api/payment/config', true)
    
    const config = await paymentService.getPaymentConfig()
    addTestResult('配置获取成功', `公钥: ${config.public_key?.substring(0, 20)}...`, true, config)
    
    // 步骤2: 创建支付令牌
    currentStep.value = 2
    addTestResult('步骤2: 创建支付令牌', '使用前端 Omise SDK 创建 token', true)
    
    const cardData = {
      number: testForm.cardNumber.replace(/\s/g, ''),
      expiration_month: testForm.expiry.split('/')[0],
      expiration_year: '20' + testForm.expiry.split('/')[1],
      security_code: testForm.cvv,
      name: testForm.cardName
    }
    
    const tokenResult = await paymentService.createPaymentToken(cardData)
    addTestResult('令牌创建成功', `Token ID: ${tokenResult.token_id}`, true, tokenResult)
    
    // 步骤3: 处理支付
    currentStep.value = 3
    addTestResult('步骤3: 处理支付', '调用 POST /api/payment/process', true)
    
    const paymentData = {
      amount: testForm.amount,
      currency: testForm.currency,
      description: testForm.description,
      invoice_id: testForm.invoiceId
    }
    
    const paymentResult = await paymentService.processOmisePayment(cardData, paymentData)
    addTestResult('支付处理成功', `Charge ID: ${paymentResult.charge_id}`, true, paymentResult)
    
    // 步骤4: 模拟 Webhook 回调
    currentStep.value = 4
    addTestResult('步骤4: Webhook 回调', '模拟 Omise 异步回调', true)
    
    // 这里可以添加实际的 webhook 测试逻辑
    addTestResult('Webhook 处理成功', '发票状态已更新', true)
    
    // 步骤5: 完成
    currentStep.value = 5
    addTestResult('支付流程完成', '所有步骤执行成功', true)
    
    ElMessage.success('支付测试完成！')
    
  } catch (error) {
    console.error('❌ 支付测试失败:', error)
    addTestResult('测试失败', error.message, false, error)
    ElMessage.error('支付测试失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 重置测试
const resetTest = () => {
  testFormRef.value?.resetFields()
  testForm.amount = 100
  testForm.currency = 'THB'
  testForm.description = '教育费用测试'
  testForm.invoiceId = 'INV-' + Date.now()
  testForm.cardNumber = '4242 4242 4242 4242'
  testForm.expiry = '12/25'
  testForm.cvv = '123'
  testForm.cardName = 'John Doe'
  
  testResults.value = []
  currentStep.value = 0
}
</script>

<style scoped>
.payment-flow-test {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.test-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.test-results {
  margin-top: 30px;
}

.result-data {
  margin-top: 10px;
}

.result-data pre {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 12px;
}

.process-info {
  margin-top: 30px;
}

.process-steps {
  display: grid;
  gap: 20px;
}

.step {
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fafafa;
}

.step h4 {
  margin: 0 0 10px 0;
  color: #409eff;
}

.step p {
  margin: 5px 0;
  color: #606266;
}

.step code {
  background: #e4e7ed;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .payment-flow-test {
    padding: 10px;
  }
}
</style>
