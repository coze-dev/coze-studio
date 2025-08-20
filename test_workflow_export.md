# 工作流导出功能测试指南

## 功能概述

本次修复实现了完整的工作流导出功能，允许用户在前端个人空间的资源库中导出工作流为JSON格式。

## 修改的文件清单

### 后端文件

1. **IDL定义**
   - `idl/workflow/workflow_svc.thrift` - 添加了导出服务接口定义
   - `idl/workflow/workflow.thrift` - 添加了导出相关的数据结构
   - `idl/resource/resource_common.thrift` - 添加了Export操作键

2. **API模型**
   - `backend/api/model/workflow/export.go` - 定义了导出请求和响应结构体

3. **API处理器**
   - `backend/api/handler/coze/workflow_service.go` - 添加了ExportWorkflow处理函数

4. **路由配置**
   - `backend/api/router/coze/api.go` - 添加了`/api/workflow_api/export`路由

5. **应用层服务**
   - `backend/application/workflow/workflow.go` - 实现了ExportWorkflow方法和依赖获取逻辑

6. **资源权限配置**
   - `backend/application/search/resource_pack.go` - 为工作流资源添加了导出操作权限
   - `backend/api/model/resource/common/resource_common.go` - 添加了ActionKey_Export常量

### 前端文件

1. **导出功能实现**
   - `frontend/packages/workflow/components/src/hooks/use-workflow-resource-action/use-export-action.tsx` - 导出功能的核心实现

2. **资源操作集成**
   - `frontend/packages/workflow/components/src/hooks/use-workflow-resource-action/use-workflow-resource-menu-actions.tsx` - 将导出操作集成到工作流资源菜单中

## 功能特性

### 1. 导出格式
- 支持JSON格式导出
- 包含完整的工作流结构信息

### 2. 导出内容
- 工作流基本信息（ID、名称、描述、版本等）
- 工作流Schema数据
- 节点和连接信息
- 元数据信息
- 可选的依赖资源信息

### 3. 用户界面
- 在工作流资源的操作菜单中添加"导出"按钮
- 导出过程中显示加载状态
- 导出完成后自动下载JSON文件
- 提供成功/失败的用户反馈

## 测试步骤

### 1. 后端API测试

使用curl或Postman测试导出API：

```bash
curl -X POST http://localhost:8080/api/workflow_api/export \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id": "123456789",
    "include_dependencies": true,
    "export_format": "json"
  }'
```

预期响应：
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "workflow_export": {
      "workflow_id": "123456789",
      "name": "示例工作流",
      "description": "工作流描述",
      "version": "1.0.0",
      "create_time": 1642147200,
      "update_time": 1642147200,
      "schema": {...},
      "nodes": [...],
      "edges": [...],
      "metadata": {...},
      "dependencies": [...]
    }
  }
}
```

### 2. 前端功能测试

1. 登录系统并进入个人空间的资源库
2. 找到类型为"工作流"的资源
3. 点击资源的操作菜单（三个点图标）
4. 确认菜单中显示"导出"选项
5. 点击"导出"按钮
6. 验证：
   - 按钮显示加载状态
   - 导出完成后自动下载JSON文件
   - 显示成功提示消息
   - 文件名格式：`{工作流名称}_workflow_export.json`

### 3. 导出文件验证

下载的JSON文件应包含以下结构：
```json
{
  "workflow_id": "工作流ID",
  "name": "工作流名称",
  "description": "工作流描述",
  "version": "版本号",
  "create_time": "创建时间戳",
  "update_time": "更新时间戳",
  "schema": {
    // 完整的工作流Schema数据
  },
  "nodes": [
    // 节点列表
  ],
  "edges": [
    // 连接列表
  ],
  "metadata": {
    // 元数据信息
  },
  "dependencies": [
    // 依赖资源（如果启用）
  ]
}
```

## 错误处理测试

### 1. 无效的工作流ID
```bash
curl -X POST http://localhost:8080/api/workflow_api/export \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id": "invalid_id",
    "include_dependencies": true,
    "export_format": "json"
  }'
```

### 2. 不支持的导出格式
```bash
curl -X POST http://localhost:8080/api/workflow_api/export \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id": "123456789",
    "include_dependencies": true,
    "export_format": "xml"
  }'
```

### 3. 缺少必需参数
```bash
curl -X POST http://localhost:8080/api/workflow_api/export \
  -H "Content-Type: application/json" \
  -d '{
    "include_dependencies": true
  }'
```

## 性能考虑

1. **大型工作流**：对于包含大量节点的工作流，导出过程可能需要较长时间
2. **依赖资源**：启用依赖资源导出会增加处理时间和文件大小
3. **并发限制**：避免同时导出大量工作流

## 兼容性说明

- 前端：支持现代浏览器（Chrome 80+, Firefox 75+, Safari 13+）
- 后端：与现有工作流系统完全兼容
- 数据格式：生成的JSON格式向后兼容

## 故障排除

### 常见问题

1. **导出按钮不显示**
   - 检查用户是否有工作流的访问权限
   - 确认工作流类型正确（ResType.Workflow）

2. **导出失败**
   - 检查网络连接
   - 验证工作流ID是否有效
   - 查看浏览器控制台错误信息

3. **文件下载失败**
   - 检查浏览器下载设置
   - 确认没有弹窗拦截器阻止下载

### 日志查看

后端日志关键字：
- `ExportWorkflow`
- `workflow export`
- `export failed`

前端控制台关键字：
- `导出工作流失败`
- `workflow export`
- `export action`

## 总结

工作流导出功能已完全实现并集成到系统中。该功能提供了：

1. ✅ 完整的后端API支持
2. ✅ 用户友好的前端界面
3. ✅ 灵活的导出选项
4. ✅ 完善的错误处理
5. ✅ 适当的权限控制

用户现在可以方便地在个人空间的资源库中导出工作流，获得包含完整结构信息的JSON文件。