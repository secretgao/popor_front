#!/bin/bash

echo "🚀 启动教育管理系统前端..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    npm install
fi

echo "✅ 依赖检查完成"

# 启动开发服务器
echo "🌐 启动开发服务器..."
echo "访问地址: http://localhost:3000"
echo "API 代理: http://api.localhost"

npm run dev
