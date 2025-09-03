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

import { validateWorkflowName } from '../utils';
import { t } from '../utils/i18n';
import type { WorkflowFile, ImportProgress, ImportResults } from '../types';

export interface BatchImportParams {
  selectedFiles: WorkflowFile[];
  spaceId: string;
  importMode: 'batch' | 'transaction';
  setImportProgress: (progress: ImportProgress | null) => void;
  setSelectedFiles: React.Dispatch<React.SetStateAction<WorkflowFile[]>>;
  setImportResults: (results: ImportResults | null) => void;
}

export const validateFiles = (selectedFiles: WorkflowFile[]): string[] => {
  const validFiles = selectedFiles.filter(f => f.status === 'valid');
  if (validFiles.length === 0) {
    return [t('no_valid_files_to_import')];
  }

  const nameErrors: string[] = [];
  const nameSet = new Set<string>();

  validFiles.forEach(file => {
    const error = validateWorkflowName(file.workflowName);
    if (error) {
      nameErrors.push(t('file_name_error', { fileName: file.fileName, error }));
    }

    if (nameSet.has(file.workflowName)) {
      nameErrors.push(t('workflow_name_duplicate', { workflowName: file.workflowName }));
    }
    nameSet.add(file.workflowName);
  });

  return nameErrors;
};

export const callBatchImportAPI = async (
  validFiles: WorkflowFile[],
  spaceId: string,
  importMode: 'batch' | 'transaction',
  creatorId?: string,
): Promise<ImportResults> => {
  const workflowFiles = validFiles.map(file => {
    console.log('Processing file:', {
      fileName: file.fileName,
      isZip: file.fileName.toLowerCase().endsWith('.zip'),
      hasOriginalContent: !!file.originalContent,
      originalContentLength: file.originalContent?.length || 0,
      isValidBase64: file.originalContent ? /^[A-Za-z0-9+/]*={0,2}$/.test(file.originalContent) : false,
      contentPreview: file.originalContent?.substring(0, 50) || 'no content'
    });

    // 对于ZIP文件，验证base64格式
    if (file.fileName.toLowerCase().endsWith('.zip')) {
      if (!file.originalContent) {
        console.error('ZIP file has no originalContent:', file.fileName);
        throw new Error(`ZIP文件 "${file.fileName}" 缺少内容数据`);
      }
      
      // 验证是否为有效的base64
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(file.originalContent)) {
        console.error('ZIP file has invalid base64 content:', file.fileName);
        throw new Error(`ZIP文件 "${file.fileName}" 包含无效的base64数据`);
      }

      return {
        file_name: file.fileName,
        workflow_data: file.originalContent, // ZIP文件的base64数据
        workflow_name: file.workflowName,
      };
    }

    // 对于其他文件类型，使用原始内容
    return {
      file_name: file.fileName,
      workflow_data: file.originalContent,
      workflow_name: file.workflowName,
    };
  });

  console.log(
    t('batch_import_files'),
    workflowFiles.map(f => ({
      name: f.file_name,
      workflow_name: f.workflow_name,
      has_workflow_data: !!f.workflow_data,
      workflow_data_length: f.workflow_data?.length || 0,
    })),
  );

  // 验证数据完整性
  for (let i = 0; i < workflowFiles.length; i++) {
    const file = workflowFiles[i];
    if (!file.file_name) {
      console.error(`Missing file_name for file ${i}:`, file);
    }
    if (!file.workflow_name) {
      console.error(`Missing workflow_name for file ${i}:`, file);
    }
    if (!file.workflow_data) {
      console.error(`Missing workflow_data for file ${i}:`, file);
    }
  }

  const response = await fetch('/api/workflow_api/batch_import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workflow_files: workflowFiles,
      space_id: spaceId,
      creator_id: creatorId || spaceId, // 使用传入的creator_id，fallback到space_id
      import_format: 'mixed',
      import_mode: importMode,
    }),
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (parseError) {
      console.warn('Failed to parse error response:', parseError);
      throw new Error(t('batch_import_failed_http', { status: response.status }));
    }
    throw new Error(errorData.message || t('batch_import_failed'));
  }

  let result;
  try {
    result = await response.json();
  } catch (parseError) {
    console.warn('Failed to parse API response:', parseError);
    throw new Error(t('invalid_response_format'));
  }

  console.log(t('batch_import_api_response'), result);
  return result.data || result || {};
};

export const updateFileStatuses = (
  selectedFiles: WorkflowFile[],
  responseData: ImportResults,
  setSelectedFiles: React.Dispatch<React.SetStateAction<WorkflowFile[]>>,
): void => {
  setSelectedFiles(prev =>
    prev.map(file => {
      const successResult = responseData.success_list?.find(
        s => s.file_name === file.fileName,
      );
      const failedResult = responseData.failed_list?.find(
        f => f.file_name === file.fileName,
      );

      if (successResult) {
        return { ...file, status: 'success' as const };
      } else if (failedResult) {
        return {
          ...file,
          status: 'failed' as const,
          error: failedResult.error_message,
        };
      }
      return file;
    }),
  );
};
