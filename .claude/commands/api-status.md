# /api-status - 检查API开发状态

检查指定API模块的开发完成状态，显示缺失的步骤和文件。

## 使用方式

```
/api-status module_name
```

**参数：**
- `module_name`: 要检查的模块名称（必需）

**示例：**
- `/api-status user_management`
- `/api-status test_management`  
- `/api-status product_catalog`

## 检查项目

使用参数：$ARGUMENTS

### 1. IDL文件检查

```bash
MODULE_NAME="$ARGUMENTS"
echo "🔍 检查 ${MODULE_NAME} API开发状态..."
echo "===========================================" 
echo ""

# 检查IDL文件
echo "📋 1. IDL定义检查"
IDL_FILE="idl/${MODULE_NAME}/${MODULE_NAME}.thrift"
if [ -f "$IDL_FILE" ]; then
    echo "✅ IDL文件存在: $IDL_FILE"
    
    # 检查基本结构
    if grep -q "service.*${MODULE_NAME^}Service" "$IDL_FILE"; then
        echo "✅ 服务定义完整"
    else
        echo "⚠️ 服务定义可能不完整"
    fi
    
    # 统计方法数量
    METHOD_COUNT=$(grep -c "api\." "$IDL_FILE")
    echo "📊 定义的API方法数量: $METHOD_COUNT"
    
else
    echo "❌ IDL文件不存在: $IDL_FILE"
    echo "   请先运行: /new-api $MODULE_NAME"
fi
echo ""
```

### 2. 前端生成状态检查

```bash
echo "🎨 2. 前端代码生成检查"

# 检查api.config.js配置
CONFIG_FILE="frontend/packages/arch/api-schema/api.config.js"
if grep -q "${MODULE_NAME}" "$CONFIG_FILE" 2>/dev/null; then
    echo "✅ api.config.js 已配置"
else
    echo "❌ api.config.js 未配置"
    echo "   需要在 entries 中添加: ${MODULE_NAME}: './idl/${MODULE_NAME}.thrift'"
fi

# 检查TypeScript生成文件
TS_FILE="frontend/packages/arch/api-schema/src/idl/${MODULE_NAME}.ts"
if [ -f "$TS_FILE" ]; then
    echo "✅ TypeScript类型文件已生成: $TS_FILE"
    
    # 统计生成的接口和函数
    INTERFACE_COUNT=$(grep -c "^export interface" "$TS_FILE")
    FUNCTION_COUNT=$(grep -c "^export const.*createAPI" "$TS_FILE")
    echo "   📊 生成的接口数量: $INTERFACE_COUNT"
    echo "   📊 生成的API函数数量: $FUNCTION_COUNT"
else
    echo "❌ TypeScript类型文件未生成"
    echo "   请运行: cd frontend/packages/arch/api-schema && npm run update"
fi

# 检查index.ts导出
INDEX_FILE="frontend/packages/arch/api-schema/src/index.ts"
if grep -q "${MODULE_NAME}" "$INDEX_FILE" 2>/dev/null; then
    echo "✅ API已在index.ts中导出"
else
    echo "❌ API未在index.ts中导出"
    echo "   需要添加: export * as ${MODULE_NAME} from './idl/${MODULE_NAME}';"
fi
echo ""
```

### 3. 后端生成状态检查

```bash
echo "🔧 3. 后端代码生成检查"

# 检查INSERT_POINT格式
REGISTER_FILE="backend/api/router/register.go"
if grep -q "//INSERT_POINT:" "$REGISTER_FILE"; then
    echo "✅ INSERT_POINT格式正确"
else
    if grep -q "// INSERT_POINT:" "$REGISTER_FILE"; then
        echo "❌ INSERT_POINT格式错误（有多余空格）"
        echo "   请运行: /api-fix"
    else
        echo "⚠️ 未找到INSERT_POINT标记"
    fi
fi

# 检查生成的模型文件
MODEL_FILE="backend/api/model/${MODULE_NAME}/${MODULE_NAME}.go"
if [ -f "$MODEL_FILE" ]; then
    echo "✅ Go模型文件已生成: $MODEL_FILE"
    
    # 统计生成的结构体
    STRUCT_COUNT=$(grep -c "^type.*struct" "$MODEL_FILE")
    echo "   📊 生成的结构体数量: $STRUCT_COUNT"
else
    echo "❌ Go模型文件未生成"
    echo "   请运行: cd backend && hz update -idl ../idl/${MODULE_NAME}/${MODULE_NAME}.thrift"
fi

# 检查生成的处理器文件
HANDLER_FILE="backend/api/handler/${MODULE_NAME}/${MODULE_NAME}_service.go"
if [ -f "$HANDLER_FILE" ]; then
    echo "✅ Go处理器文件已生成: $HANDLER_FILE"
    
    # 检查业务逻辑实现状态
    if grep -q "// TODO\|// 添加业务逻辑\|// Add your business logic here" "$HANDLER_FILE"; then
        echo "⚠️ 业务逻辑尚未实现（包含TODO注释）"
    else
        echo "✅ 业务逻辑已实现"
    fi
else
    echo "❌ Go处理器文件未生成"
    echo "   请运行: cd backend && hz update -idl ../idl/${MODULE_NAME}/${MODULE_NAME}.thrift"
fi

# 检查路由注册
ROUTER_FILE="backend/api/router/${MODULE_NAME}/${MODULE_NAME}.go"
if [ -f "$ROUTER_FILE" ]; then
    echo "✅ Go路由文件已生成: $ROUTER_FILE"
else
    echo "❌ Go路由文件未生成"
fi

# 检查路由是否已注册到主路由
if grep -q "${MODULE_NAME}.Register" "$REGISTER_FILE" 2>/dev/null; then
    echo "✅ 路由已注册到主路由文件"
else
    echo "❌ 路由未注册到主路由文件"
    echo "   hz工具应该会自动添加，检查INSERT_POINT格式"
fi
echo ""
```

### 4. 前端页面状态检查

```bash
echo "🌐 4. 前端页面开发检查"

# 检查页面文件
PAGE_FILE="frontend/apps/coze-studio/src/pages/${MODULE_NAME//_/-}.tsx"
if [ -f "$PAGE_FILE" ]; then
    echo "✅ React页面文件存在: $PAGE_FILE"
    
    # 检查API导入
    if grep -q "import.*${MODULE_NAME}" "$PAGE_FILE"; then
        echo "✅ 页面中已导入API"
    else
        echo "⚠️ 页面中未导入API"
    fi
    
    # 检查基本功能实现
    if grep -q "useState\|useEffect" "$PAGE_FILE"; then
        echo "✅ 页面包含状态管理和生命周期"
    else
        echo "⚠️ 页面功能可能不完整"
    fi
else
    echo "❌ React页面文件不存在"
    echo "   建议路径: $PAGE_FILE"
fi

# 检查路由配置
ROUTES_FILE="frontend/apps/coze-studio/src/routes/index.tsx"
if grep -q "${MODULE_NAME//_/-}" "$ROUTES_FILE" 2>/dev/null; then
    echo "✅ 路由配置已添加"
else
    echo "❌ 路由配置未添加"
    echo "   需要在routes/index.tsx中添加路由配置"
fi
echo ""
```

### 5. 服务运行状态检查

```bash
echo "🚀 5. 服务运行状态检查"

# 检查后端服务
if curl -s "http://localhost:8888" > /dev/null 2>&1; then
    echo "✅ 后端服务正在运行 (http://localhost:8888)"
    
    # 简单测试API可达性
    if curl -s "http://localhost:8888/api/${MODULE_NAME}/list" > /dev/null 2>&1; then
        echo "✅ API端点可访问"
    else
        echo "⚠️ API端点可能不可访问（可能是认证问题）"
    fi
else
    echo "❌ 后端服务未运行"
    echo "   启动命令: cd backend && go run main.go"
fi

# 检查前端服务
if curl -s "http://localhost:8080" > /dev/null 2>&1; then
    echo "✅ 前端服务正在运行 (http://localhost:8080)"
    echo "🌐 页面访问地址: http://localhost:8080/${MODULE_NAME//_/-}"
else
    echo "❌ 前端服务未运行" 
    echo "   启动命令: cd frontend/apps/coze-studio && npm run dev"
fi
echo ""
```

### 6. 开发进度总结

```bash
echo "📊 6. 开发进度总结"
echo "===========================================" 

# 计算完成度
TOTAL_STEPS=10
COMPLETED_STEPS=0

# IDL定义 (1分)
[ -f "$IDL_FILE" ] && COMPLETED_STEPS=$((COMPLETED_STEPS + 1))

# 前端配置 (1分)
grep -q "${MODULE_NAME}" "$CONFIG_FILE" 2>/dev/null && COMPLETED_STEPS=$((COMPLETED_STEPS + 1))

# 前端代码生成 (1分)
[ -f "$TS_FILE" ] && COMPLETED_STEPS=$((COMPLETED_STEPS + 1))

# 前端导出 (1分)
grep -q "${MODULE_NAME}" "$INDEX_FILE" 2>/dev/null && COMPLETED_STEPS=$((COMPLETED_STEPS + 1))

# 后端模型生成 (1分)
[ -f "$MODEL_FILE" ] && COMPLETED_STEPS=$((COMPLETED_STEPS + 1))

# 后端处理器生成 (1分)
[ -f "$HANDLER_FILE" ] && COMPLETED_STEPS=$((COMPLETED_STEPS + 1))

# 后端路由生成 (1分)
[ -f "$ROUTER_FILE" ] && COMPLETED_STEPS=$((COMPLETED_STEPS + 1))

# 前端页面 (1分)
[ -f "$PAGE_FILE" ] && COMPLETED_STEPS=$((COMPLETED_STEPS + 1))

# 路由配置 (1分)
grep -q "${MODULE_NAME//_/-}" "$ROUTES_FILE" 2>/dev/null && COMPLETED_STEPS=$((COMPLETED_STEPS + 1))

# 服务运行 (1分)
curl -s "http://localhost:8888" > /dev/null 2>&1 && COMPLETED_STEPS=$((COMPLETED_STEPS + 1))

PROGRESS_PERCENT=$((COMPLETED_STEPS * 100 / TOTAL_STEPS))

echo "📈 完成进度: $COMPLETED_STEPS/$TOTAL_STEPS ($PROGRESS_PERCENT%)"

if [ $PROGRESS_PERCENT -ge 80 ]; then
    echo "🎉 开发基本完成，可以开始测试"
    echo "   建议运行: /api-test $MODULE_NAME"
elif [ $PROGRESS_PERCENT -ge 60 ]; then
    echo "🔄 开发进行中，还需要完善部分功能"
elif [ $PROGRESS_PERCENT -ge 40 ]; then
    echo "🚧 开发刚起步，需要继续完成代码生成"
else
    echo "🏁 开发尚未开始或刚开始"
    echo "   建议运行: /new-api $MODULE_NAME"
fi

echo ""
echo "🎯 下一步建议:"
if [ ! -f "$IDL_FILE" ]; then
    echo "1. 运行 /new-api $MODULE_NAME 创建基础结构"
elif [ ! -f "$TS_FILE" ]; then
    echo "1. 运行前端代码生成: cd frontend/packages/arch/api-schema && npm run update"
elif [ ! -f "$MODEL_FILE" ]; then
    echo "1. 运行后端代码生成: cd backend && hz update -idl ../idl/${MODULE_NAME}/${MODULE_NAME}.thrift"
elif [ ! -f "$PAGE_FILE" ]; then
    echo "1. 创建前端页面和路由配置"
else
    echo "1. 完善业务逻辑实现"
    echo "2. 运行测试: /api-test $MODULE_NAME"
    echo "3. 启动服务进行联调"
fi

echo ""
echo "📚 参考文档: CLAUDE.md 中的完整API开发流程"
```

## 快速状态检查

### 一键检查所有API模块
```bash
# 检查所有已创建的API模块
for dir in idl/*/; do
    if [ -d "$dir" ]; then
        module_name=$(basename "$dir")
        echo "检查模块: $module_name"
        # 运行状态检查...
    fi
done
```

### 输出格式说明

- ✅ **绿色对勾**：步骤已完成
- ❌ **红色叉号**：步骤缺失或有错误
- ⚠️ **黄色警告**：步骤部分完成或需要注意
- 📊 **蓝色统计**：数量统计信息
- 🎯 **目标箭头**：建议的下一步操作

使用此状态检查指令可以快速了解API开发的当前状态，明确还需要完成哪些步骤。