import { ElMessage } from 'element-plus'

/**
 * 处理API错误响应
 * @param {Object} error - 错误对象
 * @param {string} defaultMessage - 默认错误消息
 * @returns {string} 处理后的错误消息
 */
export function handleApiError(error, defaultMessage = '操作失败，请稍后重试') {
  console.error('API错误:', error)
  
  let errorMessage = defaultMessage
  
  if (error.response) {
    // 服务器返回了错误响应
    const responseData = error.response.data
    
    if (responseData && responseData.message) {
      // 直接使用接口返回的错误消息
      errorMessage = responseData.message
    } else if (responseData && responseData.errors) {
      // 处理验证错误
      const errors = responseData.errors
      const firstError = Object.values(errors)[0]
      if (Array.isArray(firstError) && firstError.length > 0) {
        errorMessage = firstError[0]
      }
    } else {
      // 根据HTTP状态码提供不同的错误消息
      switch (error.response.status) {
        case 400:
          errorMessage = '请求参数错误'
          break
        case 401:
          errorMessage = '认证失败，请重新登录'
          break
        case 403:
          errorMessage = '权限不足，无法执行此操作'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 422:
          errorMessage = '数据验证失败'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        default:
          errorMessage = `请求失败 (${error.response.status})`
      }
    }
  } else if (error.request) {
    // 请求已发出但没有收到响应
    errorMessage = '网络连接失败，请检查网络设置'
  } else {
    // 其他错误
    errorMessage = error.message || defaultMessage
  }
  
  return errorMessage
}

/**
 * 显示API错误消息
 * @param {Object} error - 错误对象
 * @param {string} defaultMessage - 默认错误消息
 */
export function showApiError(error, defaultMessage = '操作失败，请稍后重试') {
  const errorMessage = handleApiError(error, defaultMessage)
  ElMessage.error(errorMessage)
}

/**
 * 处理API响应
 * @param {Object} response - API响应对象
 * @param {string} successMessage - 成功消息
 * @param {string} errorMessage - 错误消息
 * @returns {Object} 处理结果
 */
export function handleApiResponse(response, successMessage = '操作成功', errorMessage = '操作失败') {
  if (response.data && response.data.success) {
    return {
      success: true,
      message: response.data.message || successMessage,
      data: response.data.data
    }
  } else {
    return {
      success: false,
      message: response.data?.message || errorMessage
    }
  }
}

/**
 * 处理API错误并返回统一格式
 * @param {Object} error - 错误对象
 * @param {string} defaultMessage - 默认错误消息
 * @returns {Object} 统一格式的错误结果
 */
export function handleApiErrorResponse(error, defaultMessage = '操作失败，请稍后重试') {
  const errorMessage = handleApiError(error, defaultMessage)
  
  return {
    success: false,
    message: errorMessage
  }
}
