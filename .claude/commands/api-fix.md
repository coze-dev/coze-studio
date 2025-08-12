# /api-fix - API开发问题诊断和修复

自动检查和修复API开发中的常见问题。

## 功能

快速诊断和修复以下常见问题：
1. Hz工具INSERT_POINT格式错误
2. 前端API导入错误
3. 路由注册问题
4. main.go配置问题
5. API响应错误处理

## 使用方式

```
/api-fix [module_name]
```

**参数：**
- `module_name`: 要检查的模块名称（可选，不提供则检查整体配置）

## 检查项目

### 1. 检查INSERT_POINT格式

验证 `backend/api/router/register.go` 中的格式：

```bash
# 检查是否存在错误格式
grep -n "// INSERT_POINT:" backend/api/router/register.go
```

**修复方案：**
- 错误格式：`// INSERT_POINT: DO NOT DELETE THIS LINE!`
- 正确格式：`//INSERT_POINT: DO NOT DELETE THIS LINE!`
- 关键：`//` 和 `INSERT_POINT` 之间不能有空格

### 2. 检查前端API导入

验证常见的导入错误：

```tsx
// ❌ 错误导入
import { testManagement } from '@coze-studio/api-schema';

// ✅ 正确导入（注意下划线）
import { test_management } from '@coze-studio/api-schema';
```

### 3. 检查main.go配置

验证main.go中的路由注册：

```go
// 确保有正确的导入
import (
    "github.com/cloudwego/hertz/pkg/app/server"
    "github.com/coze-dev/coze-studio/backend/api/router"
)

func main() {
    h := server.Default()
    router.GeneratedRegister(h)  // 使用正确的函数名
    h.Spin()
}
```

### 4. 检查API响应处理

验证前端错误处理配置：

```tsx
catch (error: any) {
  console.error('API Error:', error);
  
  // 检查是否是成功响应被当作错误
  if (error.code === '200' || error.code === 200) {
    const responseData = error.response?.data;
    if (responseData && responseData.data) {
      // 处理成功响应数据
      setData(responseData.data);
    }
  }
}
```

### 5. 检查路径参数问题

诊断DELETE/PUT请求的路径参数问题：

```bash
# 检查生成的API配置
grep -A 5 -B 5 "DELETE\|PUT" frontend/packages/arch/api-schema/src/idl/*.ts
```

**已知问题：**
- DELETE和PUT请求可能存在路径参数替换问题
- URL可能显示为 `%7Bid%7D` 而不是实际ID值
- 临时解决方案：优先实现GET和POST功能

## 自动修复脚本

```bash
#!/bin/bash

echo "🔍 开始API问题诊断..."

# 检查INSERT_POINT格式
echo "1. 检查INSERT_POINT格式..."
if grep -q "// INSERT_POINT:" backend/api/router/register.go; then
    echo "❌ 发现INSERT_POINT格式错误"
    echo "🔧 正在修复..."
    sed -i 's|// INSERT_POINT:|//INSERT_POINT:|g' backend/api/router/register.go
    echo "✅ INSERT_POINT格式已修复"
else
    echo "✅ INSERT_POINT格式正确"
fi

# 检查main.go导入
echo "2. 检查main.go配置..."
if ! grep -q "github.com/coze-dev/coze-studio/backend/api/router" backend/main.go; then
    echo "⚠️ main.go可能缺少router导入"
fi

if ! grep -q "router.GeneratedRegister" backend/main.go; then
    echo "⚠️ main.go可能使用了错误的注册函数"
fi

# 检查前端配置
echo "3. 检查前端配置..."
if [ ! -f "frontend/packages/arch/api-schema/src/index.ts" ]; then
    echo "❌ 前端API schema索引文件不存在"
else
    echo "✅ 前端配置存在"
fi

echo "🎉 诊断完成！"
```

## 常见问题速查

### Hz工具报错
```bash
# 错误：insert-point not found
# 解决：检查INSERT_POINT格式，确保没有多余空格
```

### 前端API调用错误
```bash
# 错误：Cannot read properties of undefined
# 解决：检查导入名称，使用下划线而不是驼峰命名
```

### 后端编译错误
```bash
# 错误：undefined: register
# 解决：检查main.go中的导入和函数调用
```

### API响应异常
```bash
# 错误：成功响应进入catch分支
# 解决：在错误处理中检查error.code === '200'
```

## 验证步骤

1. **编译测试**：`go build -o coze-studio-backend main.go`
2. **前端测试**：`cd frontend/packages/arch/api-schema && npm run update`
3. **API测试**：`curl -X GET http://localhost:8888/api/[module]/list`
4. **前端访问**：浏览器访问对应页面

修复后建议重新运行完整的代码生成流程验证修复效果。