#!/bin/bash

echo "=== Coze Transformer 后端连接测试 ==="
echo ""

# 检查后端服务是否运行
echo "1. 检查后端服务状态..."
if curl -s http://localhost:8888 > /dev/null 2>&1; then
    echo "✅ 后端服务正在运行 (http://localhost:8888)"
else
    echo "❌ 后端服务未运行或无法访问"
    echo "   请确保在 coze_transformer/backend 目录下运行: go run main.go"
    exit 1
fi

echo ""

# 测试工作空间列表API
echo "2. 测试工作空间列表API..."
response=$(curl -s -w "%{http_code}" -X POST http://localhost:8888/api/playground_api/space/list \
    -H "Content-Type: application/json" \
    -d '{}' 2>/dev/null)

http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" = "200" ]; then
    echo "✅ 工作空间列表API响应正常"
    echo "   响应内容: $body"
else
    echo "❌ 工作空间列表API响应异常 (HTTP $http_code)"
    echo "   响应内容: $body"
fi

echo ""

# 测试工作流导入API
echo "3. 测试工作流导入API连通性..."
response=$(curl -s -w "%{http_code}" -X POST http://localhost:8888/api/workflow_api/import \
    -H "Content-Type: application/json" \
    -d '{"workflow_data":"test","workflow_name":"test","space_id":"1","creator_id":"1","import_format":"json"}' 2>/dev/null)

http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" = "200" ] || [ "$http_code" = "400" ]; then
    echo "✅ 工作流导入API可访问"
    if [ "$http_code" = "400" ]; then
        echo "   (返回400是正常的，因为测试数据无效)"
    fi
else
    echo "❌ 工作流导入API响应异常 (HTTP $http_code)"
    echo "   响应内容: $body"
fi

echo ""
echo "=== 测试完成 ==="
echo ""
echo "如果所有测试都通过，但前端仍有问题，请："
echo "1. 清除浏览器缓存并刷新页面"
echo "2. 检查浏览器开发者工具的Console和Network标签"
echo "3. 确认前端代理配置正确 (/api -> http://localhost:8888/)"