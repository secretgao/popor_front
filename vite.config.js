import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      port: parseInt(env.VITE_DEV_SERVER_PORT),
      host: env.VITE_DEV_SERVER_HOST,
      open: env.VITE_DEV_SERVER_OPEN === 'true',
      cors: env.VITE_DEV_SERVER_CORS === 'true',
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET,
          changeOrigin: env.VITE_PROXY_CHANGE_ORIGIN === 'true',
          secure: env.VITE_PROXY_SECURE === 'true',
          configure: (proxy, options) => {
            if (env.VITE_DEBUG_NETWORK === 'true') {
              proxy.on('error', (err, req, res) => {
                console.log('代理错误:', err);
              });
              proxy.on('proxyReq', (proxyReq, req, res) => {
                console.log('代理请求:', req.method, req.url);
              });
            }
          }
        }
      }
    },
    build: {
      outDir: env.VITE_BUILD_OUT_DIR,
      assetsDir: env.VITE_BUILD_ASSETS_DIR,
      sourcemap: env.VITE_BUILD_SOURCE_MAP === 'true',
      minify: env.VITE_BUILD_MINIFY === 'true' ? 'terser' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            element: ['element-plus'],
            utils: ['axios', 'dayjs']
          }
        }
      }
    },
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV || 'development')
    }
  }
})