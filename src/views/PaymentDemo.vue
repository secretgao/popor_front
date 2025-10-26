<template>
  <div class="payment-demo">
    <el-card class="demo-card">
      <template #header>
        <h2>💳 Omise 支付流程演示</h2>
      </template>
      
      <!-- 步骤指示器 -->
      <el-steps :active="currentStep" finish-status="success">
        <el-step title="初始化" description="加载 Omise SDK"></el-step>
        <el-step title="创建令牌" description="生成支付令牌"></el-step>
        <el-step title="处理支付" description="提交支付请求"></el-step>
        <el-step title="完成" description="支付成功"></el-step>
      </el-steps>
      
      <el-divider />
      
      
      <!-- 支付表单 -->
      <OmisePaymentForm 
        v-if="currentStep < 3"
        @payment-success="handlePaymentSuccess"
        @payment-error="handlePaymentError"
      />
      
      <!-- 支付结果 -->
      <div v-if="currentStep === 3" class="payment-result">
        <el-result
          :icon="paymentResult.success ? 'success' : 'error'"
          :title="paymentResult.success ? '支付成功！' : '支付失败'"
          :sub-title="paymentResult.message"
        >
          <template #extra>
            <el-button type="primary" @click="resetDemo">重新支付</el-button>
            <el-button @click="viewDetails">查看详情</el-button>
          </template>
        </el-result>
      </div>
      
      <!-- 流程说明 -->
      <el-collapse class="process-info">
        <el-collapse-item title="📋 支付流程说明" name="process">
          <div class="process-steps">
            <div class="step">
              <h4>1. 前端初始化</h4>
              <p>加载 Omise SDK，设置公钥</p>
              <el-tag type="info">pkey_test_65ggqd9jdlaax89pkex</el-tag>
            </div>
            <div class="step">
              <h4>2. 创建支付令牌</h4>
              <p>使用 Omise SDK 创建安全的支付令牌</p>
              <el-tag type="warning">前端处理，不涉及后端</el-tag>
            </div>
            <div class="step">
              <h4>3. 提交支付</h4>
              <p>将令牌发送到后端处理支付</p>
              <el-tag type="success">POST /api/payment/process</el-tag>
            </div>
            <div class="step">
              <h4>4. 支付完成</h4>
              <p>返回支付结果和交易信息</p>
              <el-tag type="primary">charge_id, status, amount</el-tag>
            </div>
          </div>
        </el-collapse-item>
        
        <el-collapse-item title="🔧 技术实现" name="technical">
          <div class="technical-details">
            <h4>前端调用示例：</h4>
            <pre><code>// 1. 初始化 Omise
paymentService.initPayment()

// 2. 创建令牌
const token = await paymentService.createPaymentToken(cardData)

// 3. 处理支付
const result = await paymentService.processOmisePayment(cardData, paymentData)</code></pre>
            
            <h4>后端处理流程：</h4>
            <pre><code>// 1. 接收令牌和支付数据
// 2. 调用 Omise API 处理支付
// 3. 返回支付结果
// 4. 记录支付日志</code></pre>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import OmisePaymentForm from '@/components/OmisePaymentForm.vue'
import { paymentService } from '@/utils/payment'

// 当前步骤
const currentStep = ref(0)

// 支付结果
const paymentResult = reactive({
  success: false,
  message: '',
  data: null
})


// 初始化
onMounted(() => {
  initializePayment()
})

// 初始化支付
const initializePayment = async () => {
  try {
    currentStep.value = 0
    ElMessage.info('正在初始化 Omise 支付...')
    
    // 初始化 Omise
    paymentService.initPayment()
    
    // 模拟初始化时间
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    currentStep.value = 1
    ElMessage.success('Omise 初始化完成！')
  } catch (error) {
    ElMessage.error('初始化失败: ' + error.message)
  }
}

// 处理支付成功
const handlePaymentSuccess = (result) => {
  currentStep.value = 3
  paymentResult.success = true
  paymentResult.message = '支付处理成功！'
  paymentResult.data = result
  
  ElMessage.success('支付成功！')
}

// 处理支付错误
const handlePaymentError = (error) => {
  currentStep.value = 3
  paymentResult.success = false
  paymentResult.message = error.message || '支付失败'
  
  ElMessage.error('支付失败: ' + error.message)
}

// 重置演示
const resetDemo = () => {
  currentStep.value = 0
  paymentResult.success = false
  paymentResult.message = ''
  paymentResult.data = null
  
  initializePayment()
}

// 查看详情
const viewDetails = () => {
  if (paymentResult.data) {
    ElMessage.info('支付详情: ' + JSON.stringify(paymentResult.data, null, 2))
  }
}

</script>

<style scoped>
.payment-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.demo-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.payment-result {
  margin-top: 20px;
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

.technical-details {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.technical-details h4 {
  color: #409eff;
  margin: 15px 0 10px 0;
}

.technical-details pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 10px 0;
}

.technical-details code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
}
</style>
