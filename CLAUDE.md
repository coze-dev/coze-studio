# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Coze Studio is an open-source AI agent development platform with a full-stack architecture:
- **Backend**: Go-based microservices using CloudWeGo/Hertz framework with Domain-Driven Design (DDD)
- **Frontend**: React + TypeScript monorepo managed by Rush.js with 300+ packages
- **API**: Thrift IDL-based code generation for type-safe frontend-backend communication

## 🚀 完整API开发流程

从零到完成一个新API接口的完整步骤，包含所有可能遇到的问题和解决方案。

### 阶段一：Thrift IDL 定义

#### 1. 创建IDL文件
```bash
# 在项目根目录创建新的IDL文件
# 文件位置：/idl/[module_name]/[module_name].thrift

# 例如：/idl/test_management/test_management.thrift
```

#### 2. IDL文件内容结构
```thrift
namespace go test_management

// 数据结构定义
struct TestItem {
    1: required i64 id
    2: required string title
    3: optional string description
    4: required i32 status  // 0: pending, 1: in_progress, 2: completed
    5: required i64 created_at
    6: optional i64 updated_at
}

// 请求响应结构
struct CreateTestRequest {
    1: required string title (api.body="title")
    2: optional string description (api.body="description")
}

struct CreateTestResponse {
    253: required i32 code
    254: required string msg
    1: required TestItem data
}

// 服务定义
service TestManagementService {
    // POST请求
    CreateTestResponse CreateTest(1: CreateTestRequest req) (api.post="/api/test/create")
    
    // GET请求
    GetTestListResponse GetTestList(1: GetTestListRequest req) (api.get="/api/test/list")
    
    // PUT请求（带路径参数）
    UpdateTestStatusResponse UpdateTestStatus(1: UpdateTestStatusRequest req) (api.put="/api/test/{id}/status")
    
    // DELETE请求（带路径参数）
    DeleteTestResponse DeleteTest(1: DeleteTestRequest req) (api.delete="/api/test/{id}")
}
```

#### 3. IDL关键规则
- **路径参数**：请求结构中使用 `(api.path="id")` 标记
- **响应码字段**：使用 `253: required i32 code` 和 `254: required string msg`
- **API注解**：服务方法必须包含 `api.post/get/put/delete` 注解
- **命名规范**：使用 PascalCase 和 snake_case 混合

### 阶段二：前端代码生成

#### 1. 配置api.config.js
```bash
# 文件位置：frontend/packages/arch/api-schema/api.config.js
```

```javascript
{
  idlRoot: '../../../../opencoze',  // 或 '../../../..' 根据实际路径
  entries: {
    passport: './idl/passport/passport.thrift',
    explore: './idl/flow/marketplace/flow_marketplace_product/public_api.thrift',
    test_management: './idl/test_management.thrift',  // 新增这行
  },
  output: './src'
}
```

#### 2. 生成前端TypeScript代码
```bash
cd frontend/packages/arch/api-schema
npm run update  # 等同于 idl2ts gen ./
```

#### 3. 导出新生成的API
```bash
# 检查 src/index.ts 是否自动添加了导出
# 如果没有，手动添加：
export * as test_management from './idl/test_management';
```

#### 4. 验证生成结果
生成的文件结构：
```
src/idl/test_management.ts  # TypeScript类型定义和API客户端
```

### 阶段三：后端代码生成

#### 1. ⚠️ 关键步骤：检查INSERT_POINT格式
```bash
# 必须检查 backend/api/router/register.go 中的INSERT_POINT格式
# 错误格式：// INSERT_POINT: DO NOT DELETE THIS LINE!
# 正确格式：//INSERT_POINT: DO NOT DELETE THIS LINE!
# 注意：双斜杠和INSERT_POINT之间不能有空格！
```

#### 2. 使用Hz工具生成后端代码
```bash
cd backend
hz update -idl ../idl/test_management/test_management.thrift
```

#### 3. 验证生成的文件
生成的文件结构：
```
backend/api/model/test_management/test_management.go       # Go结构体定义
backend/api/handler/test_management/test_management_service.go  # API处理器
backend/api/router/test_management/test_management.go     # 路由注册
```

#### 4. 检查路由注册
确认 `backend/api/router/register.go` 中自动添加了：
```go
//INSERT_POINT: DO NOT DELETE THIS LINE!
test_management.Register(r)
```

### 阶段四：实现业务逻辑

#### 1. 实现API处理器
编辑 `backend/api/handler/test_management/test_management_service.go`：

```go
// 在生成的处理器函数中添加业务逻辑
func CreateTest(ctx context.Context, c *app.RequestContext) {
    var err error
    var req test_management.CreateTestRequest
    err = c.BindAndValidate(&req)
    if err != nil {
        c.String(consts.StatusBadRequest, err.Error())
        return
    }

    // 添加你的业务逻辑
    testItem := &test_management.TestItem{
        ID:          1,
        Title:       req.GetTitle(),
        Description: req.Description,
        Status:      0,
        CreatedAt:   time.Now().Unix(),
        UpdatedAt:   nil,
    }

    resp := &test_management.CreateTestResponse{
        Data: testItem,
        Code: 200,
        Msg:  "创建成功",
    }

    c.JSON(consts.StatusOK, resp)
}
```

#### 2. 修复main.go导入问题
如果遇到 `undefined: register` 错误，检查 `main.go`：
```go
import (
    "github.com/cloudwego/hertz/pkg/app/server"
    "github.com/coze-dev/coze-studio/backend/api/router"  // 确保有这行
)

func main() {
    h := server.Default()
    router.GeneratedRegister(h)  // 使用正确的函数名
    h.Spin()
}
```

### 阶段五：前端页面开发

#### 1. 创建React组件
```tsx
import React, { useEffect, useState } from 'react';
import { test_management } from '@coze-studio/api-schema';  // 注意导入名称

const TestManagementPage: React.FC = () => {
  const [testList, setTestList] = useState([]);

  const fetchTestList = async () => {
    try {
      const response = await test_management.GetTestList({});
      if (response.code === 200) {
        setTestList(response.data || []);
      }
    } catch (error: any) {
      // ⚠️ 重要：处理API客户端的特殊错误处理
      if (error.code === '200' || error.code === 200) {
        const responseData = error.response?.data;
        if (responseData && responseData.data) {
          setTestList(responseData.data);
        }
      }
    }
  };

  // 其他CRUD操作...
};
```

#### 2. 配置路由
在 `frontend/apps/coze-studio/src/routes/index.tsx` 中添加：
```tsx
{
  path: 'test-management',
  element: <TestManagementPage />,
  loader: () => ({
    hasSider: false,
    requireAuth: false, // 开发阶段可设为false
  }),
}
```

### 阶段六：测试和调试

#### 1. 启动服务
```bash
# 后端
cd backend
go build -o coze-studio-backend main.go
./coze-studio-backend

# 前端
cd frontend/apps/coze-studio
npm run dev
```

#### 2. 测试API接口
```bash
# 直接测试后端API
curl -X GET "http://localhost:8888/api/test/list" -H "Content-Type: application/json"
# 预期：返回认证错误（说明路由工作正常）

curl -X POST "http://localhost:8888/api/test/create" \
  -H "Content-Type: application/json" \
  -d '{"title":"测试","description":"描述"}'
```

## ⚠️ **核心原则：不要手写Handler业务逻辑**

**问题根源**：Hz工具只生成纯净的框架代码，不包含具体业务实现。

### 🚫 **绝对禁止的做法**
```go
// ❌ 不要这样做 - 会导致编译错误！
resp := &space.CreateSpaceResponse{
    Data: &space.SpaceInfo{
        SpaceId: 1,     // 编译错误：字段名应该是SpaceID
        IconUrl: "",    // 编译错误：字段名应该是IconURL
        Page: req.Page, // 编译错误：类型不匹配 (*int32 vs int32)
    },
}
```

**为什么会出错**：
- Thrift IDL使用 `snake_case`：`space_id`, `icon_url`
- Go结构体使用 `PascalCase`：`SpaceID`, `IconURL`
- 可选字段生成为指针类型：`*int32`, `*string`

### ✅ **正确的做法**
```go
// ✅ 正确：保持框架纯净，调用业务服务
func CreateSpace(ctx context.Context, c *app.RequestContext) {
    var req space.CreateSpaceRequest
    err := c.BindAndValidate(&req)
    if err != nil {
        c.String(consts.StatusBadRequest, err.Error())
        return
    }

    // 调用Application层服务
    spaceService := application.GetSpaceService()
    resp, err := spaceService.CreateSpace(ctx, &req)
    if err != nil {
        c.String(consts.StatusInternalServerError, err.Error())
        return
    }

    c.JSON(consts.StatusOK, resp)
}
```

### 🎯 **Hz工具的正确输出**
Hz工具生成的Handler应该只包含：
```go
func CreateSpace(ctx context.Context, c *app.RequestContext) {
    var req space.CreateSpaceRequest
    err := c.BindAndValidate(&req)
    if err != nil {
        c.String(consts.StatusBadRequest, err.Error())
        return
    }

    resp := new(space.CreateSpaceResponse)  // 空的响应对象

    c.JSON(consts.StatusOK, resp)
}
```

## 🚨 常见问题和解决方案

### 1. Hz工具INSERT_POINT错误
**错误信息**：`insert-point '//INSERT_POINT\: DO NOT DELETE THIS LINE\!' not found`

**解决方案**：
```bash
# 检查 backend/api/router/register.go
# 确保格式为：//INSERT_POINT: DO NOT DELETE THIS LINE!
# 注意：// 和 INSERT_POINT 之间不能有空格
```

### 2. 前端API调用错误
**错误信息**：`Cannot read properties of undefined (reading 'GetTestList')`

**解决方案**：
```tsx
// 错误导入
import { testManagement } from '@coze-studio/api-schema';

// 正确导入（注意下划线）
import { test_management } from '@coze-studio/api-schema';
```

### 3. 成功响应被当作错误
**现象**：API返回200状态码但进入catch分支

**解决方案**：
```tsx
catch (error: any) {
  if (error.code === '200' || error.code === 200) {
    // 从错误对象中提取成功响应
    const responseData = error.response?.data;
    if (responseData && responseData.data) {
      setTestList(responseData.data);
    }
  }
}
```

### 4. DELETE路径参数问题
**现象**：URL变成 `/api/test/%7Bid%7D` 而不是 `/api/test/1`

**原因**：前端API客户端路径参数替换机制问题

**临时解决方案**：
- GET和POST请求正常工作
- DELETE和PUT带路径参数的请求需要进一步调试
- 可以先实现核心CRUD功能

### 5. Node.js版本要求
**错误信息**：`requires nodeSupportedVersionRange=">=21"`

**解决方案**：
```bash
# 升级Node.js到21+版本
# 或使用nvm管理版本
nvm install 21
nvm use 21
```

## 📝 开发检查清单

### Thrift IDL阶段
- [ ] IDL文件创建在正确位置
- [ ] 结构定义包含所需字段
- [ ] API注解正确配置
- [ ] 路径参数正确标记

### 前端生成阶段  
- [ ] api.config.js配置更新
- [ ] npm run update执行成功
- [ ] TypeScript类型文件生成
- [ ] index.ts导出配置

### 后端生成阶段
- [ ] INSERT_POINT格式正确
- [ ] hz update命令执行成功
- [ ] 路由自动注册成功
- [ ] main.go导入正确

### 实现阶段
- [ ] 业务逻辑实现完成
- [ ] 前端组件创建完成
- [ ] 路由配置添加
- [ ] 错误处理正确配置

### 测试阶段
- [ ] 后端API可访问
- [ ] 前端页面可访问
- [ ] 主要CRUD功能工作
- [ ] 错误处理正常

## 🎯 最佳实践

1. **增量开发**：先实现GET和POST，再添加PUT和DELETE
2. **错误优先**：重视错误处理和边界情况
3. **类型安全**：充分利用TypeScript类型检查
4. **测试驱动**：每个阶段都进行验证测试
5. **文档同步**：及时更新API文档和使用说明

这个流程已在实际项目中验证，覆盖了所有主要问题和解决方案。

## 🤖 Claude Code 快捷指令

### `/new-api` - 自动化API开发流程

快速创建新API接口的完整流程指令。

**使用方式**：
```
/new-api module_name method_name
```

**示例**：
```
/new-api user_management CreateUser
/new-api product_catalog GetProductList  
/new-api order_system UpdateOrderStatus
```

**指令说明**：
- `module_name`: 模块名称，使用snake_case格式（如：user_management）
- `method_name`: 方法名称，使用PascalCase格式（如：CreateUser）

**自动执行步骤**：
1. 🗂️ **创建IDL文件结构** - 生成基础Thrift IDL模板
2. ⚙️ **配置前端代码生成** - 更新api.config.js
3. 🔧 **检查后端配置** - 验证INSERT_POINT格式
4. 📝 **生成代码模板** - 创建处理器和前端组件模板
5. 🧪 **创建测试文件** - 生成基础测试代码
6. 📋 **输出操作清单** - 显示后续手动步骤

**指令实现**：
```bash
# 这个指令会自动：
# 1. 创建 /idl/{module_name}/{module_name}.thrift 模板
# 2. 更新 frontend/packages/arch/api-schema/api.config.js
# 3. 检查 backend/api/router/register.go 的INSERT_POINT格式
# 4. 生成处理器模板到 backend/api/handler/{module_name}/
# 5. 生成React组件模板到 frontend/apps/coze-studio/src/pages/
# 6. 创建路由配置模板
# 7. 输出完整的操作检查清单
```

**输出示例**：
```
✅ IDL文件已创建: /idl/user_management/user_management.thrift
✅ 前端配置已更新: api.config.js 
✅ 后端配置检查通过: INSERT_POINT格式正确
✅ 处理器模板已生成: backend/api/handler/user_management/
✅ 前端组件模板已生成: src/pages/user-management.tsx
✅ 路由配置模板已准备

📋 接下来的手动步骤:
1. 完善IDL文件中的字段定义
2. 执行: cd frontend/packages/arch/api-schema && npm run update
3. 执行: cd backend && hz update -idl ../idl/user_management/user_management.thrift  
4. 实现业务逻辑到生成的处理器中
5. 完善前端组件的UI和逻辑
6. 测试API接口

🔗 详细步骤参考: CLAUDE.md 完整API开发流程部分
```

### `/new-menu` - 自动化菜单创建流程 🆕

快速为新功能添加导航菜单项的完整流程指令。

**使用方式**：
```
/new-menu menu_name path icon parent_menu [layout_style]
```

**示例**：
```
/new-menu 成员管理 /space/{id}/members people 资源库 library
/new-menu 设置 /space/{id}/settings settings 空间管理 simple
/new-menu 分析 /space/{id}/analytics chart 工作台
```

**参数说明**：
- `menu_name`: 菜单显示名称（如：成员管理）
- `path`: 路由路径，支持动态参数（如：/space/{id}/members）
- `icon`: 图标名称（如：people, settings, chart）
- `parent_menu`: 父菜单名称（如：资源库, 空间管理, 工作台）
- `layout_style`: 布局风格（可选）：library（资源库风格）、simple（简单布局）、dashboard（仪表板风格）

**自动执行步骤**：
1. 🔍 **分析现有导航结构** - 找到正确的导航配置文件
2. 📍 **定位父菜单位置** - 确定菜单项插入位置
3. ➕ **添加菜单配置** - 在正确位置插入菜单项
4. 📄 **创建页面组件** - 根据布局风格生成页面模板
5. 🛣️ **配置路由** - 在路由配置中添加新路由
6. 🎨 **应用布局风格** - 根据指定风格应用相应的Layout组件
7. 📋 **输出检查清单** - 显示后续手动步骤

**生成的代码示例**：

导航配置（workspace.tsx）：
```typescript
{
  text: '成员管理',
  path: `/space/${id}/members`,
  icon: {
    prefix: 'local',
    name: 'people',
  },
}
```

页面组件（library风格）：
```tsx
import { Layout, Table } from '@coze-arch/coze-design';

const MembersPage: React.FC = () => {
  return (
    <Layout>
      <Layout.Header>
        {/* 页面标题和操作按钮 */}
      </Layout.Header>
      <Layout.Content>
        {/* 主要内容区域 */}
      </Layout.Content>
    </Layout>
  );
};
```

**输出示例**：
```
✅ 导航配置已更新: src/navigation/workspace.tsx
✅ 页面组件已创建: src/pages/space-members.tsx
✅ 路由配置已更新: src/routes/index.tsx
✅ 布局风格已应用: library

📋 接下来的手动步骤:
1. 完善页面组件的业务逻辑
2. 实现数据获取和状态管理
3. 添加必要的权限控制
4. 测试菜单跳转和页面功能

⚠️ 注意事项:
- 确保动态参数(如space_id)的正确传递
- 检查图标名称是否在图标库中存在
- 验证父菜单是否存在
```

### 其他实用指令建议

#### `/api-test` - 快速测试API
```
/api-test module_name
# 自动生成并执行API测试命令，验证接口是否正常工作
```

#### `/api-fix` - 快速问题诊断
```
/api-fix 
# 自动检查常见问题：INSERT_POINT格式、导入错误、路由注册等
```

#### `/api-status` - 检查开发状态
```
/api-status module_name
# 检查某个API模块的开发完成状态，显示缺失的步骤
```

#### `/menu-status` - 检查菜单配置状态
```
/menu-status menu_name
# 检查菜单项的配置状态，包括导航、路由、页面组件等
```

## 🚨 开发中的常见坑和解决方案

### 1. JavaScript 大整数精度丢失问题 ⚠️

**问题描述**：
JavaScript的Number类型只能安全表示 -(2^53-1) 到 2^53-1 之间的整数（约16位数字）。当处理18位或更长的ID时，会发生精度丢失。

**实际案例**：
```javascript
// 原始ID: 7532762164705099776
// JS处理后: 7532762164705100000  // 最后几位变成0了！

// space_id精度丢失
const spaceId = 7532755646102372352;  // 原始值
parseInt(spaceId)  // 返回 7532755646102372000  // 错误！
```

**解决方案**：

1. **IDL定义时使用字符串传输**：
```thrift
// 使用 api.js_conv 和 agw.js_conv 注解
struct SpaceInfo {
    1: required i64 space_id (api.js_conv='true',agw.js_conv="str")
    7: required i64 owner_id (api.js_conv='true',agw.js_conv="str")
}

// 对于列表，直接使用string类型
struct InviteMemberRequest {
    2: required list<string> user_ids (api.body="user_ids")  // 不是 list<i64>
}
```

2. **前端避免parseInt**：
```typescript
// ❌ 错误做法
const spaceId = parseInt(params.space_id);

// ✅ 正确做法
const spaceId = params.space_id;  // 保持为字符串
```

3. **后端处理字符串ID**：
```go
// 转换字符串ID为int64
userID, err := strconv.ParseInt(userIDStr, 10, 64)
if err != nil {
    return nil, errorx.WrapByCode(err, errno.ErrUserInvalidParamCode, 
        errorx.KV("msg", "invalid user ID format"))
}
```

### 2. 导航菜单配置位置问题 📍

**问题描述**：
不同的菜单需要添加到不同的导航配置文件中，位置错误会导致菜单不显示。

**正确的配置位置**：
- **空间相关菜单**：`frontend/apps/coze-studio/src/navigation/workspace.tsx`
- **全局菜单**：`frontend/apps/coze-studio/src/navigation/index.tsx`
- **用户菜单**：`frontend/packages/foundation/layout/src/components/account-dropdown/index.tsx`

**添加方式**：
```typescript
// 在 workspace.tsx 中的 subNav 数组中添加
{
  text: '成员管理',
  path: `/space/${id}/members`,
  icon: {
    prefix: 'local',  // 或 'coz' 用于 Coze 图标
    name: 'people',
  },
}
```

### 3. 页面布局风格选择 🎨

**问题描述**：
不同页面需要不同的布局风格，选择错误会导致页面风格不一致。

**常用布局组件**：
```typescript
// Library风格（资源库页面）
import { Layout } from '@coze-arch/coze-design';

<Layout>
  <Layout.Header className="pb-0">
    {/* 页面标题和操作按钮 */}
  </Layout.Header>
  <Layout.Content>
    {/* 主要内容 */}
  </Layout.Content>
</Layout>

// 简单页面
<div className="p-6">
  {/* 页面内容 */}
</div>
```

### 4. @coze-arch/coze-design 组件使用坑 ⚡

**Input组件onChange事件**：
```typescript
// ❌ 错误：coze-design的Input不是原生input
<Input onChange={(e) => setValue(e.target.value)} />

// ✅ 正确：直接接收value
<Input onChange={(value) => setValue(value)} />
```

**Search组件**：
```typescript
// 使用onSearch而不是onChange
<Search 
  onSearch={(value) => setSearchKeyword(value)}
  placeholder="搜索..."
/>
```

### 5. Hz工具路由参数格式问题 🛣️

**问题描述**：
Hz工具生成的路由使用`{param}`格式，但Hertz框架需要`:param`格式。

**问题表现**：
```go
// Hz生成的（错误）
_space.GET("/{space_id}/members", ...)  // 导致404

// 需要手动修改为（正确）
_space.GET("/:space_id/members", ...)
```

**解决方案**：
生成代码后手动修改路由注册文件中的参数格式。

### 6. API响应处理特殊情况 🔄

**问题描述**：
某些情况下，成功的响应会被前端错误处理机制捕获。

**处理方式**：
```typescript
try {
  const response = await api.someMethod(params);
  // 处理成功响应
} catch (error: any) {
  // 特殊处理：有时200响应会进入catch
  if (error.code === '200' || error.code === 200) {
    const responseData = error.response?.data;
    if (responseData && responseData.data) {
      // 实际上是成功的，使用数据
      setData(responseData.data);
    }
  } else {
    // 真正的错误
    console.error('API调用失败:', error);
  }
}
```

### 7. 前端API导入名称问题 📦

**问题描述**：
生成的API模块名使用下划线，不是驼峰命名。

**正确导入方式**：
```typescript
// ❌ 错误
import { spaceManagement } from '@coze-studio/api-schema';

// ✅ 正确（注意下划线）
import { space_management } from '@coze-studio/api-schema';
```

### 8. 开发流程检查清单 ✅

避免问题的最佳实践：

1. **创建API前**：
   - [ ] 检查ID字段是否需要防精度丢失处理
   - [ ] 确认INSERT_POINT格式正确（无空格）
   - [ ] 选择正确的响应码字段位置（253, 254）

2. **生成代码后**：
   - [ ] 手动修复路由参数格式（{} → :）
   - [ ] 检查生成的import是否正确
   - [ ] 验证API导出名称（下划线格式）

3. **前端开发时**：
   - [ ] 不要对大整数ID使用parseInt
   - [ ] 使用正确的组件事件处理方式
   - [ ] 选择合适的页面布局组件

4. **测试时**：
   - [ ] 检查大整数ID是否正确传递
   - [ ] 验证菜单是否在正确位置显示
   - [ ] 确认页面风格与整体一致

## Common Development Commands

### Backend Development

```bash
# Start full development environment
make debug

# Start only middleware services (MySQL, Redis, ES, etc.)
make middleware

# Build and start server only
make server

# Build server without starting
make build_server

# Database operations
make sync_db    # Sync schema to database
make dump_db    # Export database schema
```

### Frontend Development

```bash
# Install dependencies (from project root)
rush install

# Build all packages
rush build

# Start development server
cd frontend/apps/coze-studio
npm run dev

# Lint all packages
rush lint

# Run tests
rush test
```

### API Schema Management

The project uses a unique dual-layer API approach:

1. **@coze-arch/bot-api** - Core internal APIs (40+ services) - DO NOT MODIFY
2. **@coze-studio/api-schema** - Open source extension layer for community APIs

To add new APIs:

```bash
# 1. Add Thrift IDL files to /idl directory
# 2. Update frontend API schema
cd frontend/packages/arch/api-schema
npm run update  # Runs idl2ts gen ./

# 3. Generate backend code
cd backend
hz update -idl ../idl/your-service.thrift
```

### Docker Operations

```bash
# Start full stack (recommended for production testing)
cd docker
cp .env.example .env
docker compose up -d

# Stop all services
make down

# Clean volumes and restart fresh
make clean
```

## Architecture Overview

### Backend Structure (DDD)

```
backend/
├── api/           # HTTP layer (handlers, models, routers)
├── application/   # Application services
├── domain/        # Domain entities and business logic
├── infra/         # Infrastructure (DB, cache, external services)
├── crossdomain/   # Cross-domain contracts and implementations
└── types/         # Shared types and constants
```

Key patterns:
- **Handlers**: HTTP request/response handling (generated by Hz tool)
- **Application Services**: Business logic orchestration
- **Domain Entities**: Core business models and rules
- **Repository Pattern**: Data access abstraction

### Frontend Structure (Rush Monorepo)

```
frontend/
├── apps/coze-studio/          # Main application
├── packages/arch/             # Architecture packages (Level 1)
├── packages/components/       # Reusable UI components
├── packages/common/          # Shared utilities
├── packages/data/           # Data management
├── packages/workflow/       # Workflow-specific packages
└── config/                  # Shared configurations
```

Package levels (Rush tags):
- **Level 1**: Core architecture (bot-api, bot-http, etc.)
- **Level 2**: Common utilities and adapters
- **Level 3**: Business logic and UI components
- **Level 4**: Applications

### API Code Generation Flow

1. Define services in Thrift IDL files (`/idl/*.thrift`)
2. Backend: `hz update -idl` generates Go structs, handlers, routers
3. Frontend: `npm run update` generates TypeScript types and API clients
4. Type-safe API calls across the stack

## Development Guidelines

### Thrift IDL Changes

When modifying API contracts:

1. **Update IDL files** in `/idl` directory
2. **Backend generation**: `hz update -idl ../idl/service.thrift`
3. **Frontend generation**: `cd frontend/packages/arch/api-schema && npm run update`
4. **Implement business logic** in generated handler functions (not the generated framework code)

### Database Migrations

Uses Atlas for schema management:

```bash
# Create migration after schema changes
make dump_db

# Apply migrations
make sync_db

# Rehash migration files if needed
make atlas-hash
```

### Testing

```bash
# Frontend tests
rush test

# Backend tests (from backend/ directory)
go test ./...

# Integration tests with Docker
make middleware  # Start services
make server     # Start server
# Run your tests
```

### Key Configuration Files

- **rush.json**: Monorepo package definitions and dependencies
- **api.config.js**: IDL-to-TypeScript generation configuration
- **.hz**: Backend code generation configuration
- **docker-compose.yml**: Full service stack
- **Makefile**: Development workflow commands

## 完整接口开发流程

### 🎯 添加新API接口的完整步骤

当你需要添加一个新的API接口时，按照以下步骤进行：

#### 第一步：定义Thrift IDL

1. **选择合适的IDL文件位置**
   ```bash
   # 根据功能模块选择对应目录
   /idl/passport/     # 用户认证相关
   /idl/marketplace/  # 市场相关
   /idl/space/        # 空间管理（如果是新功能）
   /idl/workflow/     # 工作流相关
   # ... 其他模块
   ```

2. **编写Thrift IDL定义**
   ```thrift
   // 例：在 /idl/space/space_management.thrift 中
   namespace go space
   
   struct CreateSpaceRequest {
       1: required string name
       2: optional string description
       3: optional string icon_url
   }
   
   struct CreateSpaceResponse {
       1: required SpaceInfo data
       253: required i32 code
       254: required string msg
   }
   
   struct SpaceInfo {
       1: required i64 space_id
       2: required string name
       3: optional string description
       4: optional string icon_url
       5: required i64 created_at
   }
   
   service SpaceService {
       CreateSpaceResponse CreateSpace(1: CreateSpaceRequest req) (api.post="/api/space/create/")
   }
   ```

#### 第二步：生成前端TypeScript代码

1. **配置api.config.js**
   ```bash
   cd frontend/packages/arch/api-schema
   ```
   
   在`api.config.js`中添加新的IDL入口：
   ```javascript
   entries: {
       passport: './idl/passport/passport.thrift',
       explore: './idl/marketplace/public_api.thrift',
       space: './idl/space/space_management.thrift', // 👈 新增
   }
   ```

2. **运行代码生成**
   ```bash
   npm run update  # 等同于 idl2ts gen ./
   ```

3. **验证生成的TypeScript文件**
   ```typescript
   // 生成的文件：src/idl/space/space_management.ts
   export interface CreateSpaceRequest {
       name: string,
       description?: string,
       icon_url?: string,
   }
   
   export interface CreateSpaceResponse {
       data: SpaceInfo,
       code: number,
       msg: string,
   }
   
   // API调用函数也会自动生成
   export const CreateSpace = createAPI<CreateSpaceRequest, CreateSpaceResponse>({
       url: '/api/space/create/',
       method: 'POST'
   });
   ```

4. **更新模块导出**
   在`src/index.ts`中添加导出：
   ```typescript
   export * as space from './idl/space/space_management';
   ```

#### 第三步：生成后端Go代码

1. **运行Hz代码生成**
   ```bash
   cd backend
   hz update -idl ../idl/space/space_management.thrift
   ```

2. **验证生成的文件结构**
   ```
   backend/api/
   ├── model/space/space_management.go     # 数据结构定义
   ├── handler/coze/space_service.go       # HTTP处理器
   └── router/coze/api.go                  # 路由注册（更新）
   ```

3. **生成的Go结构体示例**
   ```go
   // api/model/space/space_management.go
   type CreateSpaceRequest struct {
       Name        string  `json:"name" form:"name" query:"name"`
       Description *string `json:"description,omitempty" form:"description" query:"description"`
       IconUrl     *string `json:"icon_url,omitempty" form:"icon_url" query:"icon_url"`
   }
   
   type CreateSpaceResponse struct {
       Data SpaceInfo `json:"data" form:"data" query:"data"`
       Code int32     `json:"code" form:"code" query:"code"`
       Msg  string    `json:"msg" form:"msg" query:"msg"`
   }
   ```

4. **生成的Handler框架**
   ```go
   // api/handler/coze/space_service.go
   // @router /api/space/create/ [POST]
   func CreateSpace(ctx context.Context, c *app.RequestContext) {
       var req space.CreateSpaceRequest
       err := c.BindAndValidate(&req)
       if err != nil {
           // 错误处理
           return
       }
       
       // 👈 在这里添加业务逻辑调用
       // resp, err := spaceApplication.CreateSpace(ctx, &req)
       
       c.JSON(http.StatusOK, resp)
   }
   ```

#### 第四步：实现业务逻辑

1. **在Application层实现业务逻辑**
   ```go
   // backend/application/space/space.go
   func (s *SpaceApplication) CreateSpace(ctx context.Context, req *space.CreateSpaceRequest) (*space.CreateSpaceResponse, error) {
       // 实现具体的业务逻辑
       spaceEntity := &entity.Space{
           Name:        req.Name,
           Description: req.Description,
           IconUrl:     req.IconUrl,
       }
       
       createdSpace, err := s.spaceRepo.Create(ctx, spaceEntity)
       if err != nil {
           return nil, err
       }
       
       return &space.CreateSpaceResponse{
           Data: space.SpaceInfo{
               SpaceId:     createdSpace.ID,
               Name:        createdSpace.Name,
               Description: createdSpace.Description,
               IconUrl:     createdSpace.IconUrl,
               CreatedAt:   createdSpace.CreatedAt.Unix(),
           },
           Code: 0,
           Msg:  "success",
       }, nil
   }
   ```

2. **在Handler中调用Application层**
   ```go
   func CreateSpace(ctx context.Context, c *app.RequestContext) {
       var req space.CreateSpaceRequest
       err := c.BindAndValidate(&req)
       if err != nil {
           c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
           return
       }
       
       resp, err := application.Space.CreateSpace(ctx, &req)
       if err != nil {
           c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
           return
       }
       
       c.JSON(http.StatusOK, resp)
   }
   ```

#### 第五步：前端调用

```typescript
// 在前端组件中使用
import { space } from '@coze-studio/api-schema';

const createSpace = async () => {
    try {
        const response = await space.CreateSpace({
            name: 'My New Space',
            description: 'A space for my projects'
        });
        
        if (response.code === 0) {
            console.log('Space created:', response.data);
        }
    } catch (error) {
        console.error('Failed to create space:', error);
    }
};
```

### 🔄 同步更新流程

当修改现有接口时：

1. **修改IDL文件** → 2. **重新生成前端代码** → 3. **重新生成后端代码** → 4. **更新业务逻辑**

```bash
# 完整更新流程
# 1. 修改IDL文件后
cd frontend/packages/arch/api-schema && npm run update

# 2. 更新后端代码
cd backend && hz update -idl ../idl/your-service.thrift

# 3. 重新构建和测试
make build_server
rush build
```

### ⚠️ 重要注意事项

- **IDL修改**：所有API变更必须先修改IDL文件
- **生成代码**：不要手动修改带有`// Code generated`注释的文件
- **业务逻辑**：只在Application层和Handler的指定位置添加业务代码
- **类型安全**：利用TypeScript和Go的类型系统，确保前后端类型一致
- **错误处理**：统一使用项目的错误处理模式
- **测试验证**：添加对应的单元测试和集成测试

## Important Notes

- **DO NOT** modify `@coze-arch/bot-api` - use `@coze-studio/api-schema` for extensions
- **Generated code** (marked with `// Code generated by hz`) should not be manually edited
- **Business logic** should be implemented in application layer services, not handlers
- **Rush commands** should be run from project root
- **Make commands** should be run from project root
- **Frontend dev server** runs on port 3000 by default
- **Backend server** runs on port 8888 by default