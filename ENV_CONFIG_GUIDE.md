# 🔧 环境变量配置指南

## 📋 配置文件说明

### 1. 环境变量文件
- **开发环境**: `.env.development`
- **生产环境**: `.env.production`
- **示例文件**: `env.example`

### 2. 配置分类

#### 🏗️ 应用基本信息
```bash
VITE_APP_NAME=教育管理系统
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
VITE_APP_DESCRIPTION=基于 Vue 3 + Element Plus 的教育管理系统前端
```

#### 🌐 API 配置
```bash
VITE_API_BASE_URL=http://127.0.0.1
VITE_API_TIMEOUT=10000
VITE_API_VERSION=v1
```

#### 🏢 后端服务地址
```bash
VITE_ADMIN_API_URL=http://admin.localhost
VITE_API_SYSTEM_URL=http://api.localhost
VITE_FRONT_API_URL=http://localhost:3000
```

#### 💳 Omise 支付配置
```bash
VITE_OMISE_PUBLIC_KEY=pkey_test_65ggqd9jdlaax89pkex
VITE_OMISE_ENVIRONMENT=test
VITE_OMISE_DEFAULT_CURRENCY=THB
```

#### 🔐 认证配置
```bash
VITE_AUTH_TOKEN_KEY=education_token
VITE_AUTH_USER_KEY=education_user
VITE_AUTH_ROLE_KEY=education_role
VITE_TOKEN_EXPIRE_TIME=3600
```

#### 🎨 主题配置
```bash
VITE_THEME_PRIMARY_COLOR=#409eff
VITE_THEME_SUCCESS_COLOR=#67c23a
VITE_THEME_WARNING_COLOR=#e6a23c
VITE_THEME_DANGER_COLOR=#f56c6c
VITE_THEME_INFO_COLOR=#909399
```

#### 🚀 功能开关
```bash
VITE_FEATURE_PAYMENT=true
VITE_FEATURE_CHAT=false
VITE_FEATURE_NOTIFICATION=true
VITE_FEATURE_DARK_MODE=false
VITE_FEATURE_PWA=false
```

## 🔧 使用方法

### 1. 在代码中使用环境变量

#### 直接使用
```javascript
// 获取环境变量
const apiUrl = import.meta.env.VITE_API_BASE_URL
const omiseKey = import.meta.env.VITE_OMISE_PUBLIC_KEY
```

#### 通过配置对象使用
```javascript
import { API_CONFIG, OMISE_CONFIG } from '@/config/keys'

// 使用配置
const apiUrl = API_CONFIG.BASE_URL
const omiseKey = OMISE_CONFIG.PUBLIC_KEY
```

### 2. 在 Vite 配置中使用
```javascript
// vite.config.js
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    server: {
      port: parseInt(env.VITE_DEV_SERVER_PORT) || 3000,
      host: env.VITE_DEV_SERVER_HOST || '0.0.0.0',
    }
  }
})
```

## 🌍 环境配置

### 开发环境 (.env.development)
```bash
# 开发环境配置
VITE_APP_ENV=development
VITE_API_BASE_URL=http://127.0.0.1
VITE_OMISE_PUBLIC_KEY=pkey_test_65ggqd9jdlaax89pkex
VITE_DEBUG_ENABLED=true
```

### 生产环境 (.env.production)
```bash
# 生产环境配置
VITE_APP_ENV=production
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_OMISE_PUBLIC_KEY=pkey_live_xxxxxxxxxxxxxxxx
VITE_DEBUG_ENABLED=false
```

## 🔒 安全注意事项

### 1. 密钥管理
- ✅ **公钥**: 可以暴露在前端
- ❌ **私钥**: 绝对不能暴露在前端
- 🔄 **环境区分**: 测试和生产使用不同密钥

### 2. 敏感信息
```bash
# 可以暴露在前端
VITE_OMISE_PUBLIC_KEY=pkey_test_xxx
VITE_API_BASE_URL=http://localhost:3000

# 不能暴露在前端
# OMISE_SECRET_KEY=skey_test_xxx  # 错误！
# DATABASE_PASSWORD=password123   # 错误！
```

## 📱 移动端配置

### 响应式配置
```bash
VITE_MOBILE_BREAKPOINT=768
VITE_MOBILE_OPTIMIZATION=true
VITE_TOUCH_OPTIMIZATION=true
```

## 🎯 最佳实践

### 1. 配置管理
- 使用 `env.example` 作为模板
- 为不同环境创建不同的配置文件
- 定期更新配置文档

### 2. 类型安全
```typescript
// 定义环境变量类型
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_OMISE_PUBLIC_KEY: string
  readonly VITE_APP_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 3. 配置验证
```javascript
// 验证必需的环境变量
const requiredEnvVars = [
  'VITE_API_BASE_URL',
  'VITE_OMISE_PUBLIC_KEY'
]

requiredEnvVars.forEach(envVar => {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
})
```

## 🚀 部署配置

### Docker 环境
```dockerfile
# 在 Dockerfile 中设置环境变量
ENV VITE_API_BASE_URL=http://backend:8000
ENV VITE_OMISE_PUBLIC_KEY=pkey_live_xxx
```

### CI/CD 配置
```yaml
# GitHub Actions 示例
env:
  VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
  VITE_OMISE_PUBLIC_KEY: ${{ secrets.OMISE_PUBLIC_KEY }}
```

## 📋 配置检查清单

### 开发环境
- [ ] API 基础 URL 配置正确
- [ ] Omise 公钥配置正确
- [ ] 代理配置正确
- [ ] 调试模式开启

### 生产环境
- [ ] 使用生产环境 API URL
- [ ] 使用生产环境 Omise 公钥
- [ ] 关闭调试模式
- [ ] 启用压缩和优化

## 🔍 故障排除

### 常见问题

#### 1. 环境变量未生效
```bash
# 检查变量名是否正确（必须以 VITE_ 开头）
VITE_API_BASE_URL=http://localhost:3000  # ✅ 正确
API_BASE_URL=http://localhost:3000        # ❌ 错误
```

#### 2. 代理配置问题
```javascript
// 检查代理目标地址
proxy: {
  '/api': {
    target: env.VITE_PROXY_TARGET || 'http://127.0.0.1',
    changeOrigin: true
  }
}
```

#### 3. 构建问题
```bash
# 检查构建配置
VITE_BUILD_OUT_DIR=dist
VITE_BUILD_SOURCE_MAP=false
VITE_BUILD_MINIFY=true
```

---

## ✅ 配置完成！

现在您的项目已经完全配置了环境变量系统！

### 下一步
1. 复制 `env.example` 到 `.env.development`
2. 根据实际需求修改配置
3. 测试配置是否生效

**环境变量配置完成！** 🎉
