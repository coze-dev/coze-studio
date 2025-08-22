# 工作流导出功能中文国际化配置总结

## 概述
本文档总结了为工作流导出和导入功能添加的中文国际化配置，使界面文字更加统一和本地化。

## 已添加的国际化文本

### 导出相关
- `workflow_export`: "导出工作流"
- `workflow_export_success`: "工作流导出成功"
- `workflow_export_failed`: "工作流导出失败"
- `export`: "导出"
- `export_success`: "导出成功"
- `export_failed`: "导出失败"

### 导入相关
- `workflow_import`: "导入工作流"
- `workflow_import_success`: "工作流导入成功"
- `workflow_import_failed`: "工作流导入失败"
- `workflow_import_select_file`: "选择文件"
- `workflow_import_click_upload`: "点击上传"
- `workflow_import_support_format`: "支持JSON格式，最大10MB"
- `workflow_import_preview`: "工作流预览"
- `workflow_import_name`: "名称"
- `workflow_import_description`: "描述"
- `workflow_import_nodes`: "节点"
- `workflow_import_edges`: "连线"
- `workflow_import_workflow_name`: "工作流名称"
- `workflow_import_workflow_name_placeholder`: "请输入工作流名称"
- `workflow_import_workflow_name_required`: "请输入工作流名称"
- `workflow_import_workflow_name_max_length`: "工作流名称最多50个字符"
- `workflow_import_tip`: "导入后将创建一个新的工作流，原有工作流不会被影响"
- `workflow_import_select_file_tip`: "选择文件后将显示工作流预览信息"
- `workflow_import_back_to_library`: "返回资源库"
- `workflow_import_description`: "选择之前导出的工作流JSON文件，将其导入到当前工作空间中。"
- `workflow_import_select_workflow_file`: "选择工作流文件"
- `workflow_import_usage_guide`: "使用说明"
- `workflow_import_supported_formats`: "支持的文件格式"
- `workflow_import_format_json`: "JSON格式的工作流导出文件"
- `workflow_import_format_size`: "文件大小不超过10MB"
- `workflow_import_format_complete`: "必须包含完整的工作流架构信息"
- `workflow_import_process`: "导入流程"
- `workflow_import_process_step1`: "选择要导入的JSON文件"
- `workflow_import_process_step2`: "系统自动解析并预览工作流信息"
- `workflow_import_process_step3`: "确认或修改工作流名称"
- `workflow_import_process_step4`: "点击"开始导入"完成导入"
- `import`: "导入"

## 已更新的文件

### 国际化配置文件
1. `frontend/packages/arch/resources/studio-i18n-resource/src/locales/zh-CN.json` - 添加中文文本
2. `frontend/packages/arch/resources/studio-i18n-resource/src/locales/en.json` - 添加英文文本

### 工作流导出相关文件
1. `frontend/packages/workflow/components/src/hooks/use-workflow-resource-action/use-export-action.tsx` - 导出操作逻辑
2. `frontend/packages/workflow/components/src/hooks/use-workflow-resource-action/use-workflow-resource-menu-actions.tsx` - 导出按钮菜单

### 工作流导入相关文件
1. `frontend/packages/workflow/components/src/hooks/use-workflow-resource-action/use-import-action.tsx` - 导入操作逻辑
2. `frontend/packages/workflow/components/src/hooks/use-workflow-resource-action/use-import-workflow-modal.tsx` - 导入模态框
3. `frontend/packages/workflow/components/src/workflow-modal/sider/create-workflow-btn.tsx` - 创建工作流按钮
4. `frontend/apps/coze-studio/src/pages/workflow-import.tsx` - 工作流导入页面

## 主要改进

### 1. 统一界面语言
- 将所有硬编码的中文文本替换为国际化函数调用
- 支持中英文双语显示
- 保持界面文字的一致性

### 2. 完善用户体验
- 导出成功/失败提示使用本地化文本
- 导入流程的各个步骤都有清晰的本地化说明
- 错误提示信息更加友好和准确

### 3. 代码质量提升
- 移除硬编码文本，提高代码可维护性
- 统一使用 `I18n.t()` 函数进行文本国际化
- 支持多语言环境下的动态切换

## 使用方法

### 添加新的国际化文本
1. 在 `zh-CN.json` 中添加中文文本
2. 在 `en.json` 中添加对应的英文文本
3. 在代码中使用 `I18n.t('key')` 调用

### 切换语言
系统会根据用户的语言设置自动选择对应的文本显示，无需额外配置。

## 注意事项

1. 所有新增的界面文本都应该使用国际化配置
2. 保持中英文文本的含义一致
3. 避免在代码中硬编码任何语言相关的文本
4. 定期检查和更新国际化配置的完整性

## 后续优化建议

1. 可以考虑添加更多语言支持（如繁体中文、日文等）
2. 建立国际化文本的命名规范，便于管理和维护
3. 添加国际化文本的自动检查工具，确保所有文本都已配置
4. 考虑使用 TypeScript 类型检查，确保国际化 key 的正确性 