# /api-test - 快速测试API接口

自动生成并执行API测试命令，验证接口是否正常工作。

## 使用方式

```
/api-test module_name
```

**参数：**
- `module_name`: 要测试的模块名称（必需）

**示例：**
- `/api-test user_management`
- `/api-test test_management`
- `/api-test product_catalog`

## 测试流程

使用参数：$ARGUMENTS

### 1. 基础连接测试

```bash
MODULE_NAME="$ARGUMENTS"
BASE_URL="http://localhost:8888"

echo "🧪 开始测试 ${MODULE_NAME} API..."
echo "📍 后端地址: ${BASE_URL}"
echo ""

# 检查后端服务状态
echo "1. 检查后端服务状态..."
if curl -s "${BASE_URL}" > /dev/null; then
    echo "✅ 后端服务正在运行"
else
    echo "❌ 后端服务未运行，请先启动后端服务"
    echo "   启动命令: cd backend && go run main.go"
    exit 1
fi
```

### 2. 测试GET接口（列表查询）

```bash
echo ""
echo "2. 测试 GET /api/${MODULE_NAME}/list..."

# 执行GET请求
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X GET "${BASE_URL}/api/${MODULE_NAME}/list" \
    -H "Content-Type: application/json")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

echo "状态码: $HTTP_CODE"
echo "响应体: $BODY"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ GET请求成功"
elif [ "$HTTP_CODE" = "700012006" ] || echo "$BODY" | grep -q "authentication failed"; then
    echo "⚠️ 认证失败（正常，说明路由工作）"
else
    echo "❌ GET请求失败"
fi
```

### 3. 测试POST接口（创建）

```bash
echo ""
echo "3. 测试 POST /api/${MODULE_NAME}/create..."

# 构造测试数据
TEST_DATA="{\"name\":\"测试项目\",\"description\":\"API测试创建的项目\"}"

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST "${BASE_URL}/api/${MODULE_NAME}/create" \
    -H "Content-Type: application/json" \
    -d "$TEST_DATA")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

echo "测试数据: $TEST_DATA"
echo "状态码: $HTTP_CODE"  
echo "响应体: $BODY"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ POST请求成功"
elif [ "$HTTP_CODE" = "700012006" ] || echo "$BODY" | grep -q "authentication failed"; then
    echo "⚠️ 认证失败（正常，说明路由工作）"
elif [ "$HTTP_CODE" = "400" ]; then
    echo "⚠️ 参数错误（可能需要调整请求格式）"
else
    echo "❌ POST请求失败"
fi
```

### 4. 测试PUT接口（更新）

```bash
echo ""
echo "4. 测试 PUT /api/${MODULE_NAME}/1..."

UPDATE_DATA="{\"id\":1,\"name\":\"更新的项目\",\"description\":\"API测试更新的项目\"}"

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X PUT "${BASE_URL}/api/${MODULE_NAME}/1" \
    -H "Content-Type: application/json" \
    -d "$UPDATE_DATA")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

echo "测试数据: $UPDATE_DATA"
echo "状态码: $HTTP_CODE"
echo "响应体: $BODY" 

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ PUT请求成功"
elif [ "$HTTP_CODE" = "700012006" ] || echo "$BODY" | grep -q "authentication failed"; then
    echo "⚠️ 认证失败（正常，说明路由工作）"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "⚠️ 路径参数问题（已知问题）"
else
    echo "❌ PUT请求失败"
fi
```

### 5. 测试DELETE接口（删除）

```bash
echo ""
echo "5. 测试 DELETE /api/${MODULE_NAME}/1..."

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X DELETE "${BASE_URL}/api/${MODULE_NAME}/1" \
    -H "Content-Type: application/json")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

echo "状态码: $HTTP_CODE"
echo "响应体: $BODY"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ DELETE请求成功"
elif [ "$HTTP_CODE" = "700012006" ] || echo "$BODY" | grep -q "authentication failed"; then
    echo "⚠️ 认证失败（正常，说明路由工作）"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "⚠️ 路径参数问题（已知问题）"
else
    echo "❌ DELETE请求失败"
fi
```

### 6. 前端测试

```bash
echo ""
echo "6. 检查前端配置..."

# 检查前端代码生成
if [ -f "frontend/packages/arch/api-schema/src/idl/${MODULE_NAME}.ts" ]; then
    echo "✅ 前端TypeScript文件已生成"
else
    echo "❌ 前端TypeScript文件未找到"
    echo "   请运行: cd frontend/packages/arch/api-schema && npm run update"
fi

# 检查前端导出
if grep -q "${MODULE_NAME}" "frontend/packages/arch/api-schema/src/index.ts"; then
    echo "✅ 前端API已导出"
else
    echo "⚠️ 前端API未在index.ts中导出"
    echo "   请手动添加: export * as ${MODULE_NAME} from './idl/${MODULE_NAME}';"
fi

# 检查前端页面
PAGE_PATH="frontend/apps/coze-studio/src/pages/${MODULE_NAME//_/-}.tsx"
if [ -f "$PAGE_PATH" ]; then
    echo "✅ 前端页面文件存在"
    
    # 检查前端服务
    if curl -s "http://localhost:8080" > /dev/null; then
        echo "✅ 前端服务正在运行"
        echo "🌐 访问地址: http://localhost:8080/${MODULE_NAME//_/-}"
    else
        echo "⚠️ 前端服务未运行"
        echo "   启动命令: cd frontend/apps/coze-studio && npm run dev"
    fi
else
    echo "⚠️ 前端页面文件未找到: $PAGE_PATH"
fi
```

### 7. 测试总结

```bash
echo ""
echo "📊 测试总结:"
echo "===================="
echo "模块名称: ${MODULE_NAME}"
echo "测试时间: $(date)"
echo ""
echo "🔍 后续调试建议:"
echo "1. 如果所有请求都返回认证错误，说明路由正常工作"
echo "2. 如果返回404，检查路由注册和IDL定义"
echo "3. 如果返回400，检查请求参数格式"
echo "4. 路径参数问题(PUT/DELETE)是已知问题，优先测试GET/POST"
echo ""
echo "📖 详细排查指南请参考 CLAUDE.md 中的问题解决方案部分"
```

## 高级测试选项

### 带认证的测试
如果有有效的session_key，可以添加认证头：

```bash
# 添加认证Cookie
-b "session_key=your_session_key_here"
```

### JSON格式化输出
```bash
# 格式化JSON响应
echo "$BODY" | python -m json.tool 2>/dev/null || echo "$BODY"
```

### 并发测试
```bash
# 简单并发测试
for i in {1..5}; do
  curl -s "${BASE_URL}/api/${MODULE_NAME}/list" &
done
wait
echo "并发测试完成"
```

## 快速诊断命令

### 检查服务状态
```bash
# 后端
ps aux | grep coze-studio-backend
netstat -an | grep :8888

# 前端  
ps aux | grep "npm run dev"
netstat -an | grep :8080
```

### 检查日志
```bash
# 后端日志
tail -f backend.log

# 前端控制台
# 浏览器开发者工具 -> Console
```

使用此测试指令可以快速验证新开发的API是否按预期工作，及时发现和定位问题。