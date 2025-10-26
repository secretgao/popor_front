import { OMISE_CONFIG, PAYMENT_CONFIG, API_CONFIG } from '@/config/keys'

/**
 * 支付服务工具类
 */
export class PaymentService {
  constructor() {
    this.publicKey = OMISE_CONFIG.PUBLIC_KEY
    this.omiseKey = OMISE_CONFIG.PUBLIC_KEY
    this.environment = OMISE_CONFIG.ENVIRONMENT
    this.defaultCurrency = OMISE_CONFIG.DEFAULT_CURRENCY
  }

  /**
   * 初始化 Omise 支付网关
   */
  initPayment() {
    console.log('Omise 支付网关初始化，公钥:', this.publicKey)
    
    // 检查 Omise SDK 是否已加载
    if (typeof window !== 'undefined' && window.Omise) {
      window.Omise.setPublicKey(this.publicKey)
      console.log('✅ Omise 初始化成功')
      return true
    } else {
      console.error('❌ Omise SDK 未加载，请检查网络连接或刷新页面')
      return false
    }
  }

  /**
   * 等待 Omise SDK 加载
   */
  async waitForOmiseSDK(maxAttempts = 10, delay = 500) {
    for (let i = 0; i < maxAttempts; i++) {
      if (typeof window !== 'undefined' && window.Omise) {
        console.log('✅ Omise SDK 已加载')
        return true
      }
      console.log(`⏳ 等待 Omise SDK 加载... (${i + 1}/${maxAttempts})`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    throw new Error('Omise SDK 加载超时，请检查网络连接')
  }

  /**
   * 创建 Omise 支付表单
   * @param {Object} options 支付选项
   */
  createOmiseForm(options = {}) {
    return {
      publicKey: this.publicKey,
      amount: options.amount || 0,
      currency: options.currency || 'THB',
      description: options.description || '教育费用',
      // Omise 特定参数
      omise: {
        publicKey: this.publicKey,
        amount: options.amount * 100, // Omise 使用分为单位
        currency: options.currency || 'THB',
        description: options.description,
        returnUri: options.returnUri || window.location.origin + '/payment/success',
        cancelUri: options.cancelUri || window.location.origin + '/payment/cancel'
      }
    }
  }

  /**
   * 获取支付配置
   */
  async getPaymentConfig() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/payment/config`)
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ 支付配置获取成功:', result.data)
        return result.data
      } else {
        throw new Error(result.message || '获取支付配置失败')
      }
    } catch (error) {
      console.error('❌ 获取支付配置失败:', error)
      throw error
    }
  }

  /**
   * 创建支付令牌（前端直接调用 Omise SDK）
   * @param {Object} cardData 卡片数据
   */
  async createPaymentToken(cardData) {
    try {
      // 等待 Omise SDK 加载
      await this.waitForOmiseSDK()
      
      // 设置公钥
      window.Omise.setPublicKey(this.publicKey)

      console.log('🔑 使用 Omise SDK 创建支付令牌...')
      
      // 直接调用 Omise SDK 创建 token
      const token = await window.Omise.createToken({
        card: {
          name: cardData.name,
          number: cardData.number,
          expiration_month: cardData.expiration_month,
          expiration_year: cardData.expiration_year,
          security_code: cardData.security_code
        }
      })

      console.log('✅ 支付令牌创建成功:', token.id)
      return {
        token_id: token.id,
        token: token
      }
    } catch (error) {
      console.error('❌ 创建支付令牌失败:', error)
      throw error
    }
  }

  /**
   * 处理 Omise 支付
   * @param {Object} cardData 卡片数据
   * @param {Object} paymentData 支付数据
   */
  async processOmisePayment(cardData, paymentData) {
    try {
      console.log('🚀 开始支付流程...')
      
      // 步骤1: 获取支付配置
      console.log('📋 步骤1: 获取支付配置')
      const config = await this.getPaymentConfig()
      
      // 步骤2: 创建支付令牌
      console.log('🔑 步骤2: 创建支付令牌')
      const tokenResult = await this.createPaymentToken(cardData)
      
      // 步骤3: 处理支付
      console.log('💳 步骤3: 处理支付')
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/payment/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          token: tokenResult.token_id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          description: paymentData.description,
          invoice_id: paymentData.invoice_id // 添加发票ID支持
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ 支付处理成功:', result.data)
        return result.data
      } else {
        throw new Error(result.message || '支付处理失败')
      }
    } catch (error) {
      console.error('❌ Omise 支付处理失败:', error)
      throw error
    }
  }


  /**
   * 创建支付表单
   * @param {Object} options 支付选项
   */
  createPaymentForm(options = {}) {
    return {
      publicKey: this.publicKey,
      amount: options.amount || 0,
      currency: options.currency || 'THB',
      description: options.description || '教育费用',
      // 其他支付参数...
    }
  }

  /**
   * 验证支付
   * @param {string} token 支付令牌
   */
  async verifyPayment(token) {
    try {
      // 这里调用后端 API 验证支付
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ token })
      })
      
      return await response.json()
    } catch (error) {
      console.error('支付验证失败:', error)
      throw error
    }
  }
}

// 创建单例实例
export const paymentService = new PaymentService()

// 默认导出
export default paymentService
