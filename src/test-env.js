// 测试环境变量加载
console.log('=== 环境变量测试 ===')
console.log('VITE_THEME_PRIMARY_COLOR:', import.meta.env.VITE_THEME_PRIMARY_COLOR)
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
console.log('VITE_APP_NAME:', import.meta.env.VITE_APP_NAME)
console.log('所有 VITE_ 开头的环境变量:')
Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')).forEach(key => {
  console.log(`${key}:`, import.meta.env[key])
})
console.log('=== 测试完成 ===')
