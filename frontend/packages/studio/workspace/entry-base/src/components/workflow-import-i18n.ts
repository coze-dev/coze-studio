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
    drag_and_drop_or_click: '拖拽文件到此处或点击选择文件',
    supported_formats: '支持 JSON、YAML、ZIP 格式',
    batch_select_description:
      '支持同时选择多个工作流文件（JSON、YAML、ZIP格式），最多50个文件。ZIP文件将自动解析。',
    select_files: '选择文件',
    file_list: '文件列表',
    clear_all: '清空全部',
    workflow_name_placeholder: '工作流名称',
    import_workflow: '导入工作流',
    import_result: '导入结果',
    cancel: '取消',
    import_button_importing: '导入中...',
    import_button_import: '导入工作流 ({count}个文件)',
    delete: '删除',
    import_partial_complete: '导入部分完成',
    import_success: '导入成功',
    import_failed: '导入失败',
    import_partial_message:
      '共导入 {total} 个文件，成功 {success} 个，失败 {failed} 个',
    import_success_message: '成功导入 {count} 个工作流',
    import_failed_message: '导入失败，共 {count} 个文件未能成功导入',
    close: '关闭',
    view_workflow: '查看工作流',
    missing_workspace_id: '缺少工作空间ID',
    please_select_files: '请先选择文件',
    batch_import_failed_retry: '批量导入失败，请重试',
    importing_files_progress: '正在导入 {count} 个工作流文件...',
    failed_files_details: '失败文件详情',
    error_reason: '失败原因',
    complete: '完成',
    workflow: '工作流',
    unknown_error: '未知错误',
  },
  'en-US': {
    drag_and_drop_or_click: 'Drag files here or click to select',
    supported_formats: 'Supports JSON, YAML, ZIP formats',
    batch_select_description:
      'Support selecting multiple workflow files (JSON, YAML, ZIP formats), up to 50 files. ZIP files will be parsed automatically.',
    select_files: 'Select Files',
    file_list: 'File List',
    clear_all: 'Clear All',
    workflow_name_placeholder: 'Workflow Name',
    import_workflow: 'Import Workflow',
    import_result: 'Import Result',
    cancel: 'Cancel',
    import_button_importing: 'Importing...',
    import_button_import: 'Import Workflows ({count} files)',
    delete: 'Delete',
    import_partial_complete: 'Import Partially Complete',
    import_success: 'Import Successful',
    import_failed: 'Import Failed',
    import_partial_message:
      'Imported {total} files in total, {success} successful, {failed} failed',
    import_success_message: 'Successfully imported {count} workflows',
    import_failed_message: 'Import failed, {count} files could not be imported',
    close: 'Close',
    view_workflow: 'View Workflow',
    missing_workspace_id: 'Missing workspace ID',
    please_select_files: 'Please select files first',
    batch_import_failed_retry: 'Batch import failed, please retry',
    importing_files_progress: 'Importing {count} workflow files...',
    failed_files_details: 'Failed Files Details',
    error_reason: 'Error Reason',
    complete: 'Complete',
    workflow: 'Workflow',
    unknown_error: 'Unknown error',
  },
};

function getCurrentLocale(): Locale {
  const savedLocale = localStorage.getItem('coze-locale');
  if (savedLocale && (savedLocale === 'zh-CN' || savedLocale === 'en-US')) {
    return savedLocale as Locale;
  }

  const browserLang = navigator.language || 'en-US';
  if (browserLang.startsWith('zh')) {
    return 'zh-CN';
  }
  return 'en-US';
}

export function t(
  key: string,
  params?: Record<string, string | number>,
): string {
  const locale = getCurrentLocale();
  const messageMap = messages[locale];

  let message = messageMap[key as keyof typeof messageMap];
  if (!message) {
    message = messages['en-US'][key as keyof (typeof messages)['en-US']];
  }

  if (!message) {
    return key;
  }

  if (params) {
    return message.replace(
      /\{(\w+)\}/g,
      (match, paramKey) => params[paramKey]?.toString() || match,
    );
  }

  return message;
}
