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
    
    // 初始化 Omise
    if (typeof window !== 'undefined' && window.Omise) {
      window.Omise.setPublicKey(this.publicKey)
      console.log('Omise 初始化成功')
    } else {
      console.warn('Omise SDK 未加载，请确保已引入 Omise.js')
    }
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
   * 处理 Omise 支付
   * @param {Object} cardData 卡片数据
   * @param {Object} paymentData 支付数据
   */
  async processOmisePayment(cardData, paymentData) {
    try {
      if (!window.Omise) {
        throw new Error('Omise SDK 未加载')
      }

      // 创建 Omise 令牌
      const token = await this.createOmiseToken(cardData)
      
      // 发送到后端处理支付
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/payment/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          token: token.id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          description: paymentData.description
        })
      })

      return await response.json()
    } catch (error) {
      console.error('Omise 支付处理失败:', error)
      throw error
    }
  }

  /**
   * 创建 Omise 令牌
   * @param {Object} cardData 卡片数据
   */
  async createOmiseToken(cardData) {
    return new Promise((resolve, reject) => {
      window.Omise.createToken('card', {
        number: cardData.number,
        expiration_month: cardData.expiration_month,
        expiration_year: cardData.expiration_year,
        security_code: cardData.security_code,
        name: cardData.name
      }, (statusCode, response) => {
        if (statusCode === 200) {
          resolve(response)
        } else {
          reject(new Error(response.message || '创建令牌失败'))
        }
      })
    })
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
