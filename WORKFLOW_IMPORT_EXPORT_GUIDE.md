# 工作流导入导出功能说明文档

## 概述

本文档详细说明了 Coze Studio 工作流导入导出功能的实现和使用方法。该功能允许用户将工作流导出为 JSON 文件，以及从 JSON 文件导入工作流到系统中。

## 功能特性

### 工作流导出
- 支持将现有工作流导出为 JSON 格式
- 包含完整的工作流结构（节点、连接、配置等）
- 支持自定义导出文件名
- 导出成功后提供用户反馈

### 工作流导入
- 支持从 JSON 文件导入工作流
- 自动验证文件格式和完整性
- 提供工作流预览功能
- 支持自定义工作流名称
- 完整的导入流程指导

## 技术实现

### 前端架构
- **React 组件**: 使用 Ant Design 组件库构建用户界面
- **国际化支持**: 完整的中英文双语支持
- **状态管理**: React Hooks 管理组件状态
- **文件处理**: 使用 File API 处理文件上传和下载

### 核心组件

#### 1. 导出功能组件
- **文件位置**: `frontend/packages/workflow/components/src/hooks/use-workflow-resource-action/use-export-action.tsx`
- **主要功能**: 处理工作流导出逻辑
- **API 调用**: 调用后端导出接口
- **用户反馈**: 成功/失败提示

#### 2. 导入功能组件
- **文件位置**: `frontend/packages/workflow/components/src/hooks/use-workflow-resource-action/use-import-workflow-modal.tsx`
- **主要功能**: 导入工作流的模态对话框
- **文件验证**: 验证上传文件的格式和内容
- **预览功能**: 显示工作流基本信息

#### 3. 导入逻辑组件
- **文件位置**: `frontend/packages/workflow/components/src/hooks/use-workflow-resource-action/use-import-action.tsx`
- **主要功能**: 核心导入逻辑实现
- **数据验证**: 验证工作流数据的完整性
- **错误处理**: 处理各种导入错误情况

#### 4. 导入页面
- **文件位置**: `frontend/apps/coze-studio/src/pages/workflow-import.tsx`
- **主要功能**: 专门的导入页面
- **使用指南**: 提供详细的导入步骤说明
- **格式支持**: 说明支持的文件格式和大小限制

### 国际化支持

#### 中文语言包
- **文件位置**: `frontend/packages/arch/resources/studio-i18n-resource/src/locales/zh-CN.json`
- **新增键值**: 40+ 个工作流导入导出相关的翻译键
- **覆盖范围**: 按钮文本、提示信息、错误消息、帮助文档等

#### 英文语言包
- **文件位置**: `frontend/packages/arch/resources/studio-i18n-resource/src/locales/en.json`
- **对应翻译**: 所有中文键值的英文对应版本
- **保持同步**: 与中文版本保持一致的键值结构

## 使用方法

### 导出工作流

1. **进入工作流库**
   - 导航到工作流管理页面
   - 找到需要导出的工作流

2. **执行导出**
   - 点击工作流操作菜单
   - 选择"导出"选项
   - 系统自动下载 JSON 文件

3. **导出结果**
   - 成功：显示"导出成功"提示
   - 失败：显示具体错误信息

### 导入工作流

1. **打开导入页面**
   - 从工作流库页面点击"导入工作流"
   - 或直接访问导入页面

2. **选择文件**
   - 点击上传区域选择 JSON 文件
   - 系统自动验证文件格式

3. **预览工作流**
   - 查看工作流基本信息
   - 确认节点数量和连接关系

4. **设置名称**
   - 输入新的工作流名称
   - 系统验证名称有效性

5. **完成导入**
   - 点击"开始导入"按钮
   - 等待导入完成

## 支持的文件格式

### JSON 格式要求
- **文件扩展名**: `.json`
- **编码格式**: UTF-8
- **数据结构**: 标准工作流 JSON 格式
- **文件大小**: 建议不超过 10MB

### 数据完整性要求
- 工作流基本信息（名称、描述）
- 节点配置和参数
- 节点间连接关系
- 工作流配置和设置

## 错误处理

### 常见错误类型

1. **文件格式错误**
   - 非 JSON 格式文件
   - 文件损坏或无法读取

2. **数据不完整**
   - 缺少必要的节点信息
   - 连接关系数据缺失

3. **导入失败**
   - 后端处理错误
   - 数据库操作失败

### 错误提示
- 所有错误信息都支持国际化
- 提供具体的错误原因说明
- 建议解决方案和操作步骤

## 用户界面

### 设计原则
- **简洁明了**: 界面简洁，操作直观
- **响应式设计**: 支持不同屏幕尺寸
- **一致性**: 与系统整体设计风格保持一致

### 交互体验
- **即时反馈**: 操作结果即时显示
- **进度提示**: 长时间操作显示进度
- **帮助信息**: 提供详细的使用说明

## 开发说明

### 代码结构
```
frontend/packages/workflow/components/src/hooks/use-workflow-resource-action/
├── use-export-action.tsx          # 导出功能
├── use-import-action.tsx          # 导入逻辑
├── use-import-workflow-modal.tsx  # 导入模态框
└── use-workflow-resource-menu-actions.tsx  # 菜单操作
```

### 关键函数

#### 导出功能
```typescript
const exportAction = async (record: WorkflowResource) => {
  try {
    const result = await exportWorkflow(record.id);
    if (result.success) {
      Toast.success(I18n.t('workflow_export_success'));
      // 处理文件下载
    } else {
      throw new Error(result.msg || I18n.t('workflow_export_failed'));
    }
  } catch (error) {
    Toast.error(I18n.t('workflow_export_failed'));
  }
};
```

#### 导入功能
```typescript
const handleImport = async () => {
  try {
    await importWorkflow(selectedFile, workflowName);
    Toast.success(I18n.t('workflow_import_success'));
    // 处理导入成功后的操作
  } catch (error) {
    Toast.error(error instanceof Error ? error.message : I18n.t('workflow_import_failed'));
  }
};
```

### 国际化实现
```typescript
// 使用 I18n.t() 函数获取本地化文本
<Button>{I18n.t('import')}</Button>
<Title>{I18n.t('workflow_import')}</Title>
<Text>{I18n.t('workflow_import_description')}</Text>
```

## 测试验证

### 功能测试
- [x] 工作流导出功能
- [x] 工作流导入功能
- [x] 文件格式验证
- [x] 错误处理机制
- [x] 国际化显示

### 兼容性测试
- [x] 不同浏览器支持
- [x] 不同文件大小处理
- [x] 各种错误情况处理

## 维护说明

### 定期检查
- 监控导入导出功能的稳定性
- 检查国际化文件的完整性
- 验证错误处理的准确性

### 更新维护
- 及时更新国际化文本
- 优化用户界面和交互体验
- 完善错误处理和提示信息

## 总结

工作流导入导出功能为 Coze Studio 提供了完整的工作流数据迁移能力，支持用户在不同环境间共享和备份工作流。该功能具有以下特点：

1. **功能完整**: 支持导入和导出两个方向
2. **用户友好**: 界面简洁，操作直观
3. **国际化支持**: 完整的中英文双语支持
4. **错误处理**: 完善的错误提示和处理机制
5. **扩展性强**: 模块化设计，易于维护和扩展

通过该功能，用户可以更加灵活地管理工作流，提高工作效率，同时为工作流的版本控制和团队协作提供了有力支持。 