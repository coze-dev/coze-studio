# /new-api - 全自动API开发流程

🚀 **完全自动化的API开发环境搭建**，从IDL定义到代码生成一键完成！

## ⚠️ 重要提醒

**绝对不要手写Handler业务逻辑代码！**
- Hz工具生成的Handler只是框架：`resp := new(space.CreateSpaceResponse)`
- **禁止**直接给结构体字段赋值，会导致编译错误！
- Thrift字段(`space_id`) ≠ Go字段(`SpaceID`) - 命名规则不匹配
- 正确做法：调用Application层服务处理业务逻辑

## 使用方式

```
/new-api module_name [method_name]
```

**参数说明：**
- `module_name`: 模块名称，使用snake_case格式（必需）
- `method_name`: 主要方法名称，使用PascalCase格式（可选）

**示例：**
- `/new-api user_management CreateUser`
- `/new-api product_catalog`
- `/new-api order_system UpdateOrderStatus`

## 执行步骤

使用参数：$ARGUMENTS

### 1. 解析参数和创建目录结构
```bash
# 解析传入的参数
MODULE_NAME=$(echo "$ARGUMENTS" | cut -d' ' -f1)
METHOD_NAME=$(echo "$ARGUMENTS" | cut -d' ' -f2)

# 创建IDL目录
mkdir -p "idl/${MODULE_NAME}"
```

### 2. 创建Thrift IDL文件模板

创建 `idl/${MODULE_NAME}/${MODULE_NAME}.thrift` 文件：

```thrift
namespace go ${MODULE_NAME}

// 基础数据结构
struct ${MODULE_NAME^}Item {
    1: required i64 id
    2: required string name
    3: optional string description  
    4: required i32 status
    5: required i64 created_at
    6: optional i64 updated_at
}

// 创建请求
struct Create${MODULE_NAME^}Request {
    1: required string name (api.body="name")
    2: optional string description (api.body="description")
}

struct Create${MODULE_NAME^}Response {
    253: required i32 code
    254: required string msg
    1: required ${MODULE_NAME^}Item data
}

// 列表请求
struct Get${MODULE_NAME^}ListRequest {
    1: optional i32 page (api.query="page")
    2: optional i32 page_size (api.query="page_size")
    3: optional i32 status (api.query="status")
}

struct Get${MODULE_NAME^}ListResponse {
    253: required i32 code
    254: required string msg
    1: required list<${MODULE_NAME^}Item> data
    2: required i32 total
}

// 更新请求
struct Update${MODULE_NAME^}Request {
    1: required i64 id (api.path="id")
    2: required string name (api.body="name")
    3: optional string description (api.body="description")
    4: optional i32 status (api.body="status")
}

struct Update${MODULE_NAME^}Response {
    253: required i32 code
    254: required string msg
    1: required ${MODULE_NAME^}Item data
}

// 删除请求
struct Delete${MODULE_NAME^}Request {
    1: required i64 id (api.path="id")
}

struct Delete${MODULE_NAME^}Response {
    253: required i32 code
    254: required string msg
}

// 服务定义
service ${MODULE_NAME^}Service {
    // 创建
    Create${MODULE_NAME^}Response Create${MODULE_NAME^}(1: Create${MODULE_NAME^}Request req) (api.post="/api/${MODULE_NAME}/create")
    
    // 获取列表
    Get${MODULE_NAME^}ListResponse Get${MODULE_NAME^}List(1: Get${MODULE_NAME^}ListRequest req) (api.get="/api/${MODULE_NAME}/list")
    
    // 更新
    Update${MODULE_NAME^}Response Update${MODULE_NAME^}(1: Update${MODULE_NAME^}Request req) (api.put="/api/${MODULE_NAME}/{id}")
    
    // 删除  
    Delete${MODULE_NAME^}Response Delete${MODULE_NAME^}(1: Delete${MODULE_NAME^}Request req) (api.delete="/api/${MODULE_NAME}/{id}")
}
```

### 3. 更新前端配置

在 `frontend/packages/arch/api-schema/api.config.js` 的 entries 中添加：

```javascript
${MODULE_NAME}: './idl/${MODULE_NAME}/${MODULE_NAME}.thrift',
```

### 4. 检查后端配置

验证 `backend/api/router/register.go` 中的 INSERT_POINT 格式：
- ✅ 正确格式：`//INSERT_POINT: DO NOT DELETE THIS LINE!`
- ❌ 错误格式：`// INSERT_POINT: DO NOT DELETE THIS LINE!`

### 5. 生成React组件模板

创建 `frontend/apps/coze-studio/src/pages/${MODULE_NAME//_/-}.tsx`：

```tsx
import React, { useEffect, useState } from 'react';
import { ${MODULE_NAME} } from '@coze-studio/api-schema';

interface ${MODULE_NAME^}Item {
  id: number;
  name: string;
  description?: string;
  status: number;
  created_at: number;
  updated_at?: number;
}

const ${MODULE_NAME^}Page: React.FC = () => {
  const [itemList, setItemList] = useState<${MODULE_NAME^}Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');

  // 获取列表
  const fetchItemList = async () => {
    try {
      setLoading(true);
      const response = await ${MODULE_NAME}.Get${MODULE_NAME^}List({});
      if (response.code === 200) {
        setItemList(response.data || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch list:', error);
      // 处理API客户端的特殊错误处理
      if (error.code === '200' || error.code === 200) {
        const responseData = error.response?.data;
        if (responseData && responseData.data) {
          setItemList(responseData.data);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // 创建新项目
  const createItem = async () => {
    if (!newItemName.trim()) return;
    
    try {
      const response = await ${MODULE_NAME}.Create${MODULE_NAME^}({
        name: newItemName,
        description: newItemDescription || undefined,
      });
      
      if (response.code === 200) {
        setNewItemName('');
        setNewItemDescription('');
        await fetchItemList();
      }
    } catch (error: any) {
      console.error('Failed to create item:', error);
      if (error.code === '200' || error.code === 200) {
        setNewItemName('');
        setNewItemDescription('');
        await fetchItemList();
      }
    }
  };

  useEffect(() => {
    fetchItemList();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <a 
          href="/space" 
          className="text-blue-500 hover:text-blue-700 underline"
        >
          ← Back to Workspace
        </a>
      </div>
      
      <h1 className="text-2xl font-bold mb-8">${MODULE_NAME^} Management</h1>
      
      {/* 创建新项目 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Create New ${MODULE_NAME^}</h2>
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Description (optional)"
            value={newItemDescription}
            onChange={(e) => setNewItemDescription(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={createItem}
            disabled={!newItemName.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Create ${MODULE_NAME^}
          </button>
        </div>
      </div>

      {/* 列表 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">${MODULE_NAME^} List</h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : itemList.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No items found</div>
        ) : (
          <div className="p-6">
            {itemList.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-md p-4 mb-4 last:mb-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    {item.description && (
                      <p className="text-gray-600 mt-1">{item.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>ID: {item.id}</span>
                      <span>Status: {item.status}</span>
                      <span>Created: {new Date(item.created_at * 1000).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ${MODULE_NAME^}Page;
```

### 6. 添加路由配置

在 `frontend/apps/coze-studio/src/routes/index.tsx` 中添加：

```tsx
// 在imports中添加
import ${MODULE_NAME^}Page from '../pages/${MODULE_NAME//_/-}';

// 在路由配置中添加
{
  path: '${MODULE_NAME//_/-}',
  element: <${MODULE_NAME^}Page />,
  loader: () => ({
    hasSider: false,
    requireAuth: false,
  }),
},
```

## 🚀 全自动代码生成流程

此命令将自动执行以下步骤：

### 2. 自动生成前端代码
```bash
echo "🎨 正在生成前端TypeScript代码..."
cd frontend/packages/arch/api-schema
npm run update
if [ $? -eq 0 ]; then
    echo "✅ 前端代码生成成功"
else
    echo "❌ 前端代码生成失败"
    exit 1
fi
cd - > /dev/null
```

### 3. 自动生成后端代码
```bash
echo "🔧 正在生成后端Go代码..."
cd backend

# 检查INSERT_POINT格式
if grep -q "// INSERT_POINT:" api/router/register.go; then
    echo "⚠️ 修复INSERT_POINT格式..."
    sed -i '' 's/\/\/ INSERT_POINT:/\/\/INSERT_POINT:/g' api/router/register.go
fi

hz update -idl ../idl/${MODULE_NAME}/${MODULE_NAME}.thrift
if [ $? -eq 0 ]; then
    echo "✅ 后端代码生成成功"
else
    echo "❌ 后端代码生成失败"
    exit 1
fi
cd - > /dev/null
```

### 4. 自动验证编译
```bash
echo "🔍 验证后端代码编译..."
cd backend
go build -o ${MODULE_NAME}-backend main.go
if [ $? -eq 0 ]; then
    echo "✅ 后端编译成功"
    rm ${MODULE_NAME}-backend
else
    echo "❌ 后端编译失败"
    exit 1
fi
cd - > /dev/null
```

### 5. 完成提示
```bash
echo ""
echo "🎉 ${MODULE_NAME} API开发环境设置完成！"
echo ""
echo "📋 下一步手动操作："
echo "1. **完善IDL文件** - 根据具体需求调整字段和方法"
echo "2. **实现业务逻辑** - 在Application层添加服务逻辑（不要在Handler中手写！）"
echo "3. **完善前端组件** - 根据UI需求调整组件样式和交互"
echo "4. **测试API** - 运行 /api-test ${MODULE_NAME} 验证接口"
echo ""
echo "📖 详细指南："
echo "   - 完整开发流程: CLAUDE.md"
echo "   - API状态检查: /api-status ${MODULE_NAME}"
echo "   - API接口测试: /api-test ${MODULE_NAME}"
```

## 相关资源

- 📖 详细开发流程：参考 `CLAUDE.md` 中的完整API开发流程
- 🐛 问题排查：参考常见问题和解决方案部分
- ✅ 检查清单：使用开发检查清单确保不遗漏步骤