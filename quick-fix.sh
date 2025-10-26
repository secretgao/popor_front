#!/bin/bash

echo "🚀 快速修复网络连接问题..."

echo "1. 检查 Docker 容器状态..."
docker-compose ps

echo ""
echo "2. 重启 nginx 容器..."
docker-compose restart nginx

echo ""
echo "3. 测试 API 连接..."
if curl -s http://127.0.0.1/api/test > /dev/null; then
    echo "✅ API 连接正常"
else
    echo "❌ API 连接失败"
fi

echo ""
echo "4. 检查 hosts 文件..."
if grep -q "api.localhost" /etc/hosts; then
    echo "✅ api.localhost 已配置"
else
    echo "❌ api.localhost 未配置"
    echo "请运行: echo '127.0.0.1 api.localhost' | sudo tee -a /etc/hosts"
fi

echo ""
echo "5. 启动前端服务器..."
echo "运行: npm run dev"
echo "访问: http://localhost:3000"

echo ""
echo "🔧 如果问题仍然存在，请检查："
echo "- 浏览器控制台错误信息"
echo "- 网络连接状态"
echo "- 防火墙设置"
