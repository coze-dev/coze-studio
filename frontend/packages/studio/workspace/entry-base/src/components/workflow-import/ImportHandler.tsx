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

import { I18n } from '@coze-arch/i18n';

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

interface UserInfo {
  uid?: string;
  [key: string]: unknown;
}

interface ResultData {
  successCount: number;
  failedCount: number;
  firstWorkflowId?: string;
  failedFiles?: unknown[];
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
    alert(I18n.t('workflow_import_error_missing_name'));
    return;
  }

  if (selectedFiles.length === 0) {
    alert(I18n.t('workflow_import_select_file_tip'));
    return;
  }

  setShowImportForm(false);
  setIsImporting(true);

  try {
    const workflowFiles = [];
    const validationErrors = [];

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
        const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(
          file.originalContent,
        );
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

    console.log('发送批量导入请求:', {
      workflow_files: workflowFiles,
      space_id: spaceId,
      import_mode: 'batch',
      import_format: 'mixed',
    });

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

    const successCount =
      responseData.success_count || responseData.success_list?.length || 0;
    const failedCount =
      responseData.failed_count || responseData.failed_list?.length || 0;
    const firstWorkflowId = responseData.success_list?.length
      ? responseData.success_list[0].workflow_id
      : null;

    console.log('Import results:', {
      successCount,
      failedCount,
      firstWorkflowId,
    });

    setResultModalData({
      successCount,
      failedCount,
      firstWorkflowId,
      failedFiles: responseData.failed_list || [],
    });
    setShowResultModal(true);
  } catch (error) {
    console.error('批量导入失败:', error);
    alert(
      error instanceof Error ? error.message : I18n.t('workflow_import_failed'),
    );
  } finally {
    setIsImporting(false);
  }
};
