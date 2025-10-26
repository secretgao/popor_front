// 简单测试环境变量
console.log('=== 简单环境变量测试 ===')
console.log('import.meta.env:', import.meta.env)
console.log('VITE_THEME_PRIMARY_COLOR 原始值:', import.meta.env.VITE_THEME_PRIMARY_COLOR)
console.log('VITE_THEME_PRIMARY_COLOR 类型:', typeof import.meta.env.VITE_THEME_PRIMARY_COLOR)
console.log('VITE_THEME_PRIMARY_COLOR 长度:', import.meta.env.VITE_THEME_PRIMARY_COLOR?.length)
console.log('所有 VITE_ 变量:')
for (const [key, value] of Object.entries(import.meta.env)) {
  if (key.startsWith('VITE_')) {
    console.log(`  ${key}: "${value}" (${typeof value})`)
  }
}
