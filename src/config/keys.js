// ===========================================
// 教育管理系统前端配置
// ===========================================

// 环境变量验证函数
const getRequiredEnv = (key, description, defaultValue = null) => {
  const value = import.meta.env[key]
  console.log(`🔍 检查环境变量: ${key} = ${value}`)
  if (!value) {
    if (defaultValue !== null) {
      console.warn(`⚠️ 环境变量 ${key} 未找到，使用默认值: ${defaultValue}`)
      return defaultValue
    }
    console.error(`❌ 环境变量 ${key} 未找到`)
    console.log('可用的环境变量:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')))
    throw new Error(`❌ 缺少必需的环境变量: ${key} (${description})`)
  }
  return value
}

const getOptionalEnv = (key, defaultValue) => {
  return import.meta.env[key] || defaultValue
}

// 应用配置
export const APP_CONFIG = {
  NAME: getRequiredEnv('VITE_APP_NAME', '应用名称', '教育管理系统'),
  VERSION: getRequiredEnv('VITE_APP_VERSION', '应用版本', '1.0.0'),
  ENV: getRequiredEnv('VITE_APP_ENV', '应用环境', 'development'),
  DESCRIPTION: getRequiredEnv('VITE_APP_DESCRIPTION', '应用描述', '基于 Vue 3 + Element Plus 的教育管理系统前端'),
}

// API 配置
export const API_CONFIG = {
  BASE_URL: getRequiredEnv('VITE_API_BASE_URL', 'API 基础地址', 'https://poper-ops-interview-04.herokuapp.com'),
  TIMEOUT: parseInt(getRequiredEnv('VITE_API_TIMEOUT', 'API 超时时间', '10000')),
  VERSION: getRequiredEnv('VITE_API_VERSION', 'API 版本', 'v1'),
  ENDPOINTS: {
    AUTH: '/api/auth',
    PAYMENT: '/api/payment',
    USERS: '/api/users',
  }
}

// 后端服务地址配置
export const BACKEND_CONFIG = {
  ADMIN_API_URL: getRequiredEnv('VITE_ADMIN_API_URL', '管理后台 API 地址', 'http://admin.localhost'),
  API_SYSTEM_URL: getRequiredEnv('VITE_API_SYSTEM_URL', 'API 系统地址', 'http://api.localhost'),
  FRONT_API_URL: getRequiredEnv('VITE_FRONT_API_URL', '前端 API 地址', 'http://localhost:3000'),
}

// Omise 支付配置
export const OMISE_CONFIG = {
  PUBLIC_KEY: getRequiredEnv('VITE_OMISE_PUBLIC_KEY', 'Omise 公钥', 'pkey_test_65ggqd9jdlaax89pkex'),
  ENVIRONMENT: getRequiredEnv('VITE_OMISE_ENVIRONMENT', 'Omise 环境', 'test'),
  DEFAULT_CURRENCY: getRequiredEnv('VITE_OMISE_DEFAULT_CURRENCY', 'Omise 默认货币', 'THB'),
}

// 支付相关配置
export const PAYMENT_CONFIG = {
  ENABLED: getRequiredEnv('VITE_PAYMENT_ENABLED', '支付功能开关', 'true') === 'true',
  METHODS: getRequiredEnv('VITE_PAYMENT_METHODS', '支付方式', 'credit_card,bank_transfer').split(','),
  CURRENCIES: getRequiredEnv('VITE_PAYMENT_CURRENCIES', '支持货币', 'THB,USD,EUR,JPY,SGD').split(','),
}

// 认证配置
export const AUTH_CONFIG = {
  TOKEN_KEY: getRequiredEnv('VITE_AUTH_TOKEN_KEY', '认证令牌键名', 'education_token'),
  USER_KEY: getRequiredEnv('VITE_AUTH_USER_KEY', '用户信息键名', 'education_user'),
  ROLE_KEY: getRequiredEnv('VITE_AUTH_ROLE_KEY', '角色信息键名', 'education_role'),
  TOKEN_EXPIRE_TIME: parseInt(getRequiredEnv('VITE_TOKEN_EXPIRE_TIME', '令牌过期时间', '3600')),
}

// 开发服务器配置
export const DEV_CONFIG = {
  PORT: parseInt(getRequiredEnv('VITE_DEV_SERVER_PORT', '开发服务器端口', '3000')),
  HOST: getRequiredEnv('VITE_DEV_SERVER_HOST', '开发服务器主机', '0.0.0.0'),
  OPEN: getRequiredEnv('VITE_DEV_SERVER_OPEN', '自动打开浏览器', 'true') === 'true',
  CORS: getRequiredEnv('VITE_DEV_SERVER_CORS', 'CORS 支持', 'true') === 'true',
}

// 构建配置
export const BUILD_CONFIG = {
  OUT_DIR: getRequiredEnv('VITE_BUILD_OUT_DIR', '构建输出目录', 'dist'),
  ASSETS_DIR: getRequiredEnv('VITE_BUILD_ASSETS_DIR', '资源目录', 'assets'),
  SOURCE_MAP: getRequiredEnv('VITE_BUILD_SOURCE_MAP', '源码映射', 'true') === 'true',
  MINIFY: getRequiredEnv('VITE_BUILD_MINIFY', '代码压缩', 'true') === 'true',
}

// 代理配置
export const PROXY_CONFIG = {
  TARGET: getRequiredEnv('VITE_PROXY_TARGET', '代理目标地址', 'http://api.localhost'),
  CHANGE_ORIGIN: getRequiredEnv('VITE_PROXY_CHANGE_ORIGIN', '代理变更源', 'true') === 'true',
  SECURE: getRequiredEnv('VITE_PROXY_SECURE', '代理安全模式', 'false') === 'true',
}

// 主题配置 (暂未使用)
// export const THEME_CONFIG = {
//   PRIMARY_COLOR: getRequiredEnv('VITE_THEME_PRIMARY_COLOR', '主题主色'),
//   SUCCESS_COLOR: getRequiredEnv('VITE_THEME_SUCCESS_COLOR', '成功色'),
//   WARNING_COLOR: getRequiredEnv('VITE_THEME_WARNING_COLOR', '警告色'),
//   DANGER_COLOR: getRequiredEnv('VITE_THEME_DANGER_COLOR', '危险色'),
//   INFO_COLOR: getRequiredEnv('VITE_THEME_INFO_COLOR', '信息色'),
// }

// 国际化配置
export const I18N_CONFIG = {
  LOCALE: getRequiredEnv('VITE_I18N_LOCALE', '默认语言', 'zh-CN'),
  FALLBACK_LOCALE: getRequiredEnv('VITE_I18N_FALLBACK_LOCALE', '回退语言', 'en-US'),
  AVAILABLE_LOCALES: getRequiredEnv('VITE_I18N_AVAILABLE_LOCALES', '可用语言', 'zh-CN,en-US,th-TH').split(','),
}

// 功能开关
export const FEATURE_CONFIG = {
  PAYMENT: getRequiredEnv('VITE_FEATURE_PAYMENT', '支付功能', 'true') === 'true',
  CHAT: getRequiredEnv('VITE_FEATURE_CHAT', '聊天功能', 'false') === 'true',
  NOTIFICATION: getRequiredEnv('VITE_FEATURE_NOTIFICATION', '通知功能', 'true') === 'true',
  DARK_MODE: getRequiredEnv('VITE_FEATURE_DARK_MODE', '暗色模式', 'false') === 'true',
  PWA: getRequiredEnv('VITE_FEATURE_PWA', 'PWA 功能', 'false') === 'true',
}

// 文件上传配置
export const UPLOAD_CONFIG = {
  MAX_SIZE: parseInt(getRequiredEnv('VITE_UPLOAD_MAX_SIZE', '文件最大大小', '10485760')),
  ALLOWED_TYPES: getRequiredEnv('VITE_UPLOAD_ALLOWED_TYPES', '允许的文件类型', 'jpg,jpeg,png,gif,pdf,doc,docx').split(','),
  PATH: getRequiredEnv('VITE_UPLOAD_PATH', '上传路径', '/uploads'),
}

// 缓存配置
export const CACHE_CONFIG = {
  ENABLED: getRequiredEnv('VITE_CACHE_ENABLED', '缓存开关', 'true') === 'true',
  PREFIX: getRequiredEnv('VITE_CACHE_PREFIX', '缓存前缀', 'education_'),
  TTL: parseInt(getRequiredEnv('VITE_CACHE_TTL', '缓存过期时间', '3600')),
}

// 安全配置
export const SECURITY_CONFIG = {
  CSRF: getRequiredEnv('VITE_SECURITY_CSRF', 'CSRF 保护', 'true') === 'true',
  XSS: getRequiredEnv('VITE_SECURITY_XSS', 'XSS 保护', 'true') === 'true',
  CSP: getRequiredEnv('VITE_SECURITY_CSP', 'CSP 保护', 'true') === 'true',
}

// 性能配置
export const PERFORMANCE_CONFIG = {
  LAZY_LOAD: getRequiredEnv('VITE_PERFORMANCE_LAZY_LOAD', '懒加载', 'true') === 'true',
  PRELOAD: getRequiredEnv('VITE_PERFORMANCE_PRELOAD', '预加载', 'true') === 'true',
  COMPRESSION: getRequiredEnv('VITE_PERFORMANCE_COMPRESSION', '压缩', 'true') === 'true',
}

// 调试配置
export const DEBUG_CONFIG = {
  ENABLED: getRequiredEnv('VITE_DEBUG_ENABLED', '调试开关', 'true') === 'true',
  LEVEL: getRequiredEnv('VITE_DEBUG_LEVEL', '调试级别', 'info'),
  CONSOLE: getRequiredEnv('VITE_DEBUG_CONSOLE', '控制台调试', 'true') === 'true',
  NETWORK: getRequiredEnv('VITE_DEBUG_NETWORK', '网络调试', 'true') === 'true',
}

// 第三方服务配置
export const THIRD_PARTY_CONFIG = {
  SENTRY_DSN: getOptionalEnv('VITE_SENTRY_DSN', ''),
  GOOGLE_ANALYTICS_ID: getOptionalEnv('VITE_GOOGLE_ANALYTICS_ID', ''),
  BAIDU_ANALYTICS_ID: getOptionalEnv('VITE_BAIDU_ANALYTICS_ID', ''),
}

// 兼容性配置（保持向后兼容）
export const API_KEYS = {
  OMISE_PUBLIC_KEY: OMISE_CONFIG.PUBLIC_KEY,
  PAYMENT_PUBLIC_KEY: OMISE_CONFIG.PUBLIC_KEY,
}

// 导出所有配置
export const CONFIG = {
  APP: APP_CONFIG,
  API: API_CONFIG,
  BACKEND: BACKEND_CONFIG,
  OMISE: OMISE_CONFIG,
  PAYMENT: PAYMENT_CONFIG,
  AUTH: AUTH_CONFIG,
  DEV: DEV_CONFIG,
  BUILD: BUILD_CONFIG,
  PROXY: PROXY_CONFIG,
  // THEME: THEME_CONFIG, // 暂未使用
  I18N: I18N_CONFIG,
  FEATURE: FEATURE_CONFIG,
  UPLOAD: UPLOAD_CONFIG,
  CACHE: CACHE_CONFIG,
  SECURITY: SECURITY_CONFIG,
  PERFORMANCE: PERFORMANCE_CONFIG,
  DEBUG: DEBUG_CONFIG,
  THIRD_PARTY: THIRD_PARTY_CONFIG,
}

// 默认导出
export default CONFIG