/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

type Locale = 'zh-CN' | 'en-US';

const messages = {
  'zh-CN': {
    no_valid_files_to_import: '没有有效的文件可以导入',
    file_name_error: '文件 "{fileName}": {error}',
    workflow_name_duplicate: '工作流名称重复: "{workflowName}"',
    batch_import_files: '批量导入文件:',
    batch_import_failed_http: '批量导入失败，HTTP状态码: {status}',
    invalid_response_format: '服务器返回了无效的响应格式，请检查API接口',
    batch_import_api_response: '批量导入API响应:',
    batch_import_failed: '批量导入失败',
    import_workflow: '导入工作流',
    cancel: '取消',
    import_count: '导入 ({count})',
    upload_files: '上传文件',
    drag_files_here: '拖拽文件到此处',
    or: '或',
    click_to_select: '点击选择文件',
    supported_formats: '支持 JSON、YAML、ZIP 格式',
    // Main import page
    drag_and_drop_or_click: '拖拽文件到此处或点击选择文件',
    batch_select_description:
      '支持同时选择多个工作流文件（JSON、YAML、ZIP格式），最多50个文件。ZIP文件将自动解析。',
    select_files: '选择文件',
    // File list
    file_list: '文件列表',
    valid_files: '有效',
    failed_files: '失败',
    clear_all: '清空全部',
    workflow_name_placeholder: '工作流名称',
    // Result modal
    import_result: '导入结果',
    import_partial_complete: '导入部分完成',
    import_success: '导入成功',
    import_failed: '导入失败',
    import_partial_message:
      '共导入 {total} 个文件，成功 {success} 个，失败 {failed} 个',
    import_success_message: '成功导入 {count} 个工作流',
    import_failed_message: '导入失败，共 {count} 个文件未能成功导入',
    close: '关闭',
    complete: '完成',
    view_workflow: '查看工作流',
    // Validation messages
    workflow_name_empty: '工作流名称不能为空',
    workflow_name_must_start_letter: '工作流名称必须以字母开头',
    workflow_name_invalid_chars: '工作流名称只能包含字母、数字和下划线',
    workflow_name_length_invalid: '工作流名称长度应在2-100个字符之间',
    // File status messages
    file_status_pending: '等待中',
    file_status_validating: '验证中...',
    file_status_valid: '✅ 有效',
    file_status_invalid: '❌ 无效',
    file_status_importing: '导入中...',
    file_status_success: '✅ 导入成功',
    file_status_failed: '❌ 导入失败',
    file_status_needs_check: '需要检查',
    // File error messages
    file_error_import_failed: '导入失败',
    file_error_invalid_file: '文件无效',
    file_error_unknown: '未知错误，请检查文件格式和内容',
    file_error_suggestion:
      '💡 建议：请检查文件内容格式，或查看后端日志获取详细信息',
    // File preview messages
    file_preview_name: '名称',
    file_preview_nodes: '节点',
    file_preview_connections: '连接',
    file_preview_version: '版本',
    file_preview_description: '描述',
    // Import buttons messages
    import_button_cancel: '❌ 取消',
    import_button_importing: '导入中...',
    import_button_import: '📦 导入工作流 ({count}个文件)',
    // Common buttons
    delete: '删除',
    // Alert messages
    missing_workspace_id: '缺少工作空间ID',
    please_select_files: '请先选择文件',
    batch_import_failed_retry: '批量导入失败，请重试',
    failed_files_details: '失败文件详情',
    show_failed_files: '查看失败详情',
    hide_failed_files: '隐藏失败详情',
    error_reason: '失败原因',
    workflow: '工作流',
    unknown_error: '未知错误',
  },
  'en-US': {
    no_valid_files_to_import: 'No valid files to import',
    file_name_error: 'File "{fileName}": {error}',
    workflow_name_duplicate: 'Duplicate workflow name: "{workflowName}"',
    batch_import_files: 'Batch import files:',
    batch_import_failed_http: 'Batch import failed, HTTP status code: {status}',
    invalid_response_format:
      'Server returned invalid response format, please check API interface',
    batch_import_api_response: 'Batch import API response:',
    batch_import_failed: 'Batch import failed',
    import_workflow: 'Import Workflow',
    cancel: 'Cancel',
    import_count: 'Import ({count})',
    upload_files: 'Upload Files',
    drag_files_here: 'Drag files here',
    or: 'or',
    click_to_select: 'Click to select files',
    supported_formats: 'Supports JSON, YAML, ZIP formats',
    // Main import page
    drag_and_drop_or_click: 'Drag files here or click to select',
    batch_select_description:
      'Support selecting multiple workflow files (JSON, YAML, ZIP formats), up to 50 files. ZIP files will be parsed automatically.',
    select_files: 'Select Files',
    // File list
    file_list: 'File List',
    valid_files: 'Valid',
    failed_files: 'Failed',
    clear_all: 'Clear All',
    workflow_name_placeholder: 'Workflow Name',
    // Result modal
    import_result: 'Import Result',
    import_partial_complete: 'Import Partially Complete',
    import_success: 'Import Successful',
    import_failed: 'Import Failed',
    import_partial_message:
      'Imported {total} files in total, {success} successful, {failed} failed',
    import_success_message: 'Successfully imported {count} workflows',
    import_failed_message: 'Import failed, {count} files could not be imported',
    close: 'Close',
    complete: 'Complete',
    view_workflow: 'View Workflow',
    // Validation messages
    workflow_name_empty: 'Workflow name cannot be empty',
    workflow_name_must_start_letter: 'Workflow name must start with a letter',
    workflow_name_invalid_chars:
      'Workflow name can only contain letters, numbers and underscores',
    workflow_name_length_invalid:
      'Workflow name length should be between 2-100 characters',
    // File status messages
    file_status_pending: 'Pending',
    file_status_validating: 'Validating...',
    file_status_valid: '✅ Valid',
    file_status_invalid: '❌ Invalid',
    file_status_importing: 'Importing...',
    file_status_success: '✅ Import Successful',
    file_status_failed: '❌ Import Failed',
    file_status_needs_check: 'Needs Check',
    // File error messages
    file_error_import_failed: 'Import Failed',
    file_error_invalid_file: 'Invalid File',
    file_error_unknown: 'Unknown error, please check file format and content',
    file_error_suggestion:
      '💡 Suggestion: Please check file content format, or view backend logs for detailed information',
    // File preview messages
    file_preview_name: 'Name',
    file_preview_nodes: 'Nodes',
    file_preview_connections: 'Connections',
    file_preview_version: 'Version',
    file_preview_description: 'Description',
    // Import buttons messages
    import_button_cancel: '❌ Cancel',
    import_button_importing: 'Importing...',
    import_button_import: '📦 Import Workflows ({count} files)',
    // Common buttons
    delete: 'Delete',
    // Alert messages
    missing_workspace_id: 'Missing workspace ID',
    please_select_files: 'Please select files first',
    batch_import_failed_retry: 'Batch import failed, please retry',
    failed_files_details: 'Failed Files Details',
    show_failed_files: 'Show Failed Details',
    hide_failed_files: 'Hide Failed Details',
    error_reason: 'Error Reason',
    workflow: 'Workflow',
    unknown_error: 'Unknown error',
  },
};

// Get current locale from browser language or localStorage
function getCurrentLocale(): Locale {
  // Check localStorage first
  const savedLocale = localStorage.getItem('coze-locale');
  if (savedLocale && (savedLocale === 'zh-CN' || savedLocale === 'en-US')) {
    return savedLocale as Locale;
  }

  // Fallback to browser language
  const browserLang = navigator.language || 'en-US';
  if (browserLang.startsWith('zh')) {
    return 'zh-CN';
  }
  return 'en-US';
}

// Translate function with parameter replacement
export function t(
  key: string,
  params?: Record<string, string | number>,
): string {
  const locale = getCurrentLocale();
  const messageMap = messages[locale];

  let message = messageMap[key as keyof typeof messageMap];
  if (!message) {
    // Fallback to English if key not found in current locale
    message = messages['en-US'][key as keyof (typeof messages)['en-US']];
  }

  if (!message) {
    // Return key itself if not found in any locale
    return key;
  }

  // Replace parameters if provided
  if (params) {
    return message.replace(
      /\{(\w+)\}/g,
      (match, paramKey) => params[paramKey]?.toString() || match,
    );
  }

  return message;
}

// Export current locale for conditional logic
export function getCurrentLanguage(): Locale {
  return getCurrentLocale();
}

// Set locale and persist to localStorage
export function setLocale(locale: Locale): void {
  localStorage.setItem('coze-locale', locale);
  // Trigger a custom event to notify components about locale change
  window.dispatchEvent(new CustomEvent('locale-changed', { detail: locale }));
}
