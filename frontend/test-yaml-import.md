# YAML批量导入功能测试说明

## 修复内容

### 1. 前端修复
- **批量导入页面** (`workflow-batch-import.tsx`)
  - 添加了 `originalContent` 字段来保存原始文件内容
  - 修复了YAML文件的数据传递方式
  - 添加了 `creator_id` 参数
  - 添加了 `import_format: 'mixed'` 参数

- **简单导入页面** (`workflow-import-simple.tsx`)
  - 同样添加了 `originalContent` 字段
  - 修复了批量导入API调用
  - 添加了必要的参数

### 2. 后端修复
- **批量导入逻辑** (`workflow.go`)
  - 修改了 `preValidateWorkflowFiles` 函数，支持每个文件单独指定格式
  - 修改了 `importSingleWorkflow` 函数，根据文件名自动检测格式
  - 支持 `mixed` 格式，允许混合格式导入
  - 移除了对统一格式的依赖

## 测试步骤

### 1. 准备测试文件
创建以下测试文件：

**test-workflow.yml:**
```yaml
name: "测试工作流"
description: "这是一个测试工作流"
version: "v1.0"
schema:
  nodes:
    - id: "node1"
      type: "start"
      position: { x: 100, y: 100 }
      data: { label: "开始" }
    - id: "node2"
      type: "process"
      position: { x: 300, y: 100 }
      data: { label: "处理" }
  edges:
    - id: "edge1"
      source: "node1"
      target: "node2"
      type: "default"
```

**test-workflow.json:**
```json
{
  "name": "测试工作流JSON",
  "description": "这是一个JSON格式的测试工作流",
  "version": "v1.0",
  "schema": {
    "nodes": [
      {
        "id": "node1",
        "type": "start",
        "position": { "x": 100, "y": 100 },
        "data": { "label": "开始" }
      }
    ],
    "edges": []
  }
}
```

### 2. 测试批量导入
1. 打开批量导入页面
2. 同时上传 `.yml` 和 `.json` 文件
3. 验证文件状态显示为"✅ 有效"
4. 点击"批量导入"按钮
5. 检查控制台日志，确认API调用成功
6. 验证导入结果

### 3. 检查要点
- [ ] YAML文件能正确解析和验证
- [ ] JSON文件能正确解析和验证
- [ ] 混合格式文件能同时导入
- [ ] 每个文件都使用正确的格式解析
- [ ] API调用包含所有必要参数
- [ ] 后端能正确处理不同格式的文件

## 预期结果

修复后，YAML文件的批量导入应该能正常工作：
1. 文件上传后状态显示为"✅ 有效"
2. 批量导入API调用成功
3. 后端能正确解析YAML格式
4. 导入完成后显示成功结果

## 注意事项

- 确保后端服务正在运行
- 检查网络请求是否包含所有必要参数
- 验证文件格式检测逻辑是否正确
- 确认错误处理是否友好 