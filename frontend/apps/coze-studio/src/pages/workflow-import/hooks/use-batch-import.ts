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
    return ['没有有效的文件可以导入'];
  }

  const nameErrors: string[] = [];
  const nameSet = new Set<string>();

  validFiles.forEach(file => {
    const error = validateWorkflowName(file.workflowName);
    if (error) {
      nameErrors.push(`文件 "${file.fileName}": ${error}`);
    }

    if (nameSet.has(file.workflowName)) {
      nameErrors.push(`工作流名称重复: "${file.workflowName}"`);
    }
    nameSet.add(file.workflowName);
  });

  return nameErrors;
};

export const callBatchImportAPI = async (
  validFiles: WorkflowFile[],
  spaceId: string,
  importMode: 'batch' | 'transaction',
): Promise<ImportResults> => {
  const workflowFiles = validFiles.map(file => {
    // 对于ZIP文件，使用处理后的workflowData中的data字段
    if (file.fileName.toLowerCase().endsWith('.zip')) {
      const workflowData = JSON.parse(file.workflowData);
      return {
        file_name: file.fileName,
        workflow_data: workflowData.data, // ZIP文件的base64数据
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
    '批量导入文件:',
    workflowFiles.map(f => ({
      name: f.file_name,
      workflow_name: f.workflow_name,
    })),
  );

  const response = await fetch('/api/workflow_api/batch_import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workflow_files: workflowFiles,
      space_id: spaceId,
      creator_id: 'current_user',
      import_format: 'mixed',
      import_mode: importMode,
      LogID: '',
      Caller: '',
      Addr: '',
      Client: '',
    }),
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (parseError) {
      console.warn('Failed to parse error response:', parseError);
      throw new Error(`批量导入失败，HTTP状态码: ${response.status}`);
    }
    throw new Error(errorData.message || '批量导入失败');
  }

  let result;
  try {
    result = await response.json();
  } catch (parseError) {
    console.warn('Failed to parse API response:', parseError);
    throw new Error('服务器返回了无效的响应格式，请检查API接口');
  }

  console.log('批量导入API响应:', result);
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
