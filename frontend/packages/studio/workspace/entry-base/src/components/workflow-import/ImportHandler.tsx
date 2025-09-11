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

import type { UserInfo } from '@coze-foundation/account-adapter';

interface WorkflowFile {
  id: string;
  fileName: string;
  workflowName: string;
  originalContent: string;
  workflowData: string;
  status:
    | 'pending'
    | 'validating'
    | 'valid'
    | 'invalid'
    | 'importing'
    | 'success'
    | 'failed';
  error?: string;
}

interface ResultData {
  successCount: number;
  failedCount: number;
  firstWorkflowId?: string;
  failedFiles?: Array<{
    file_name: string;
    workflow_name: string;
    error_code: string;
    error_message: string;
    fail_reason?: string;
  }>;
}

interface ImportParams {
  selectedFiles: WorkflowFile[];
  spaceId: string;
  userInfo: UserInfo;
  setShowImportForm: (show: boolean) => void;
  setIsImporting: (importing: boolean) => void;
  setResultModalData: (data: ResultData) => void;
  setShowResultModal: (show: boolean) => void;
}

const PREVIEW_LENGTH = 50;

// 处理导入响应
const processImportResponse = (responseData: {
  success_count?: number;
  failed_count?: number;
  first_workflow_id?: string;
  failed_list?: Array<{
    file_name: string;
    workflow_name: string;
    error_code?: number;
    error_message?: string;
    fail_reason?: string;
  }>;
}) => {
  const successCount = responseData.success_count || 0;
  const failedCount = responseData.failed_count || 0;
  const firstWorkflowId = responseData.first_workflow_id;

  return { successCount, failedCount, firstWorkflowId };
};

// 转换失败文件数据格式
const formatFailedFiles = (
  failedList: Array<{
    file_name: string;
    workflow_name: string;
    error_code?: number;
    error_message?: string;
    fail_reason?: string;
  }>,
) =>
  failedList.map(item => ({
    file_name: item.file_name,
    workflow_name: item.workflow_name,
    error_code: item.error_code?.toString() || 'unknown_error',
    error_message: item.error_message || '',
    fail_reason: item.fail_reason || '',
  }));

// 生成成功结果数据
const createSuccessResultData = (params: {
  successCount: number;
  failedCount: number;
  firstWorkflowId: string | undefined;
  failedFiles: Array<{
    file_name: string;
    workflow_name: string;
    error_code: string;
    error_message: string;
    fail_reason: string;
  }>;
}) => params;

// 生成错误情况下的结果数据
const createErrorResultData = (
  selectedFiles: Array<{ fileName: string; workflowName: string }>,
  error: unknown,
) => ({
  successCount: 0,
  failedCount: selectedFiles.length,
  firstWorkflowId: undefined,
  failedFiles: selectedFiles.map(file => ({
    file_name: file.fileName,
    workflow_name: file.workflowName,
    error_code: 'network_error',
    error_message: error instanceof Error ? error.message : 'Import failed',
    fail_reason: 'network_error',
  })),
});

// API请求处理辅助函数
const processImportRequest = async (
  workflowFiles: Array<{
    file_name: string;
    workflow_data: string;
    workflow_name: string;
  }>,
  spaceId: string,
  userInfo: { uid?: string },
) => {
  console.log('发送批量导入请求:', {
    workflow_files: workflowFiles,
    space_id: spaceId,
    import_mode: 'batch',
    import_format: 'mixed',
  });

  console.log(`开始批量导入 ${workflowFiles.length} 个文件...`);

  const response = await fetch('/api/workflow_api/batch_import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workflow_files: workflowFiles,
      space_id: spaceId,
      creator_id: userInfo?.uid || spaceId,
      import_mode: 'batch',
      import_format: 'mixed',
    }),
  });

  console.log('Response status:', response.status);
  console.log('Response headers:', response.headers);

  if (!response.ok) {
    let errorMessage = `导入失败，HTTP状态码: ${response.status}`;
    try {
      const errorData = await response.json();
      console.log('Error response data:', errorData);
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (parseError) {
      console.log('Failed to parse error response:', parseError);
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log('Success response:', result);

  const responseData = result.data || result || {};

  const { successCount, failedCount, firstWorkflowId } =
    processImportResponse(responseData);
  const actualFirstWorkflowId = responseData.success_list?.length
    ? responseData.success_list[0].workflow_id
    : firstWorkflowId;

  console.log('Import results:', {
    successCount,
    failedCount,
    firstWorkflowId: actualFirstWorkflowId,
  });

  const failedFiles = formatFailedFiles(responseData.failed_list || []);

  return {
    successCount,
    failedCount,
    firstWorkflowId: actualFirstWorkflowId,
    failedFiles,
  };
};

// 文件验证辅助函数
const validateSelectedFiles = (
  selectedFiles: Array<{
    fileName: string;
    workflowName: string;
    originalContent: string;
  }>,
) => {
  const workflowFiles: Array<{
    file_name: string;
    workflow_data: string;
    workflow_name: string;
  }> = [];
  const validationErrors: string[] = [];

  for (let i = 0; i < selectedFiles.length; i++) {
    const file = selectedFiles[i];

    if (!file.fileName) {
      validationErrors.push(`文件 ${i + 1} 缺少文件名`);
      continue;
    }
    if (!file.workflowName) {
      validationErrors.push(`文件 "${file.fileName}" 缺少工作流名称`);
      continue;
    }
    if (!file.originalContent) {
      validationErrors.push(`文件 "${file.fileName}" 缺少工作流数据`);
      continue;
    }

    if (file.fileName.toLowerCase().endsWith('.zip')) {
      const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(file.originalContent);
      console.log(`ZIP file validation for ${file.fileName}:`, {
        dataLength: file.originalContent.length,
        isValidBase64,
        dataPreview: file.originalContent.substring(0, PREVIEW_LENGTH),
      });

      if (!isValidBase64) {
        validationErrors.push(
          `ZIP文件 "${file.fileName}" 包含无效的base64数据`,
        );
        continue;
      }
    }

    workflowFiles.push({
      file_name: file.fileName,
      workflow_data: file.originalContent,
      workflow_name: file.workflowName,
    });
  }

  if (validationErrors.length > 0) {
    console.warn('文件验证警告:', validationErrors);
  }

  if (workflowFiles.length === 0) {
    throw new Error('没有有效的文件可以导入');
  }

  return workflowFiles;
};

export const handleBatchImport = async (params: ImportParams) => {
  const {
    selectedFiles,
    spaceId,
    userInfo,
    setShowImportForm,
    setIsImporting,
    setResultModalData,
    setShowResultModal,
  } = params;

  if (!spaceId) {
    alert('Missing space ID for import');
    return;
  }

  if (selectedFiles.length === 0) {
    alert('Please select files to import');
    return;
  }

  setShowImportForm(false);
  setIsImporting(true);

  try {
    const workflowFiles = validateSelectedFiles(selectedFiles);

    const { successCount, failedCount, firstWorkflowId, failedFiles } =
      await processImportRequest(workflowFiles, spaceId, {
        uid: userInfo?.user_id_str,
      });
    setResultModalData(
      createSuccessResultData({
        successCount,
        failedCount,
        firstWorkflowId,
        failedFiles,
      }),
    );
    setShowResultModal(true);
  } catch (error) {
    console.error('批量导入失败:', error);

    // 即使出错也要显示结果弹窗
    setResultModalData(createErrorResultData(selectedFiles, error));
    setShowResultModal(true);
  } finally {
    setIsImporting(false);
  }
};
