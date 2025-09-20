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

import { useState } from 'react';

import { Toast } from '@coze-arch/coze-design';

import { type WorkflowResourceActionProps } from './type';
import {
  parseFileContent,
  validateWorkflowData,
  handleSuccessResult,
  handleFailureResult,
  type ImportResponse,
} from './import-utils';

export interface ExtendedWorkflowResourceActionProps
  extends WorkflowResourceActionProps {
  goWorkflowDetail?: (workflowId: string, spaceId?: string) => void;
}

export const useImportAction = (props: ExtendedWorkflowResourceActionProps) => {
  const [importing, setImporting] = useState(false);

  const callImportAPI = async (
    file: File,
    workflowData: Record<string, unknown>,
    fileContent: string,
  ): Promise<ImportResponse> => {
    const response = await fetch('/api/workflow_api/batch_import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_files: [
          {
            file_name: file.name,
            workflow_data: fileContent,
            workflow_name: workflowData.name || `Imported_${Date.now()}`,
          },
        ],
        space_id: props.spaceId || '',
        creator_id: props.userId || '',
        import_format: 'mixed',
        import_mode: 'batch',
      }),
    });

    if (!response.ok) {
      throw new Error('Import request failed');
    }

    return response.json();
  };

  const processImportResult = (result: ImportResponse): void => {
    const responseData = result.data || {};
    const successCount =
      responseData.success_count || responseData.success_list?.length || 0;

    if (successCount > 0) {
      handleSuccessResult({
        responseData,
        goWorkflowDetail: props.goWorkflowDetail,
        refreshPage: props.refreshPage,
        spaceId: props.spaceId,
      });
    } else {
      handleFailureResult(responseData, result);
    }
  };

  const handleImport = async (fileOrRecord: File | unknown) => {
    if (importing) {
      return;
    }

    try {
      setImporting(true);

      // 如果是从菜单触发的, 需要创建文件输入
      if (!(fileOrRecord instanceof File)) {
        // 创建隐藏的文件输入元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.yml,.yaml';
        input.onchange = async e => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            await processFileImport(file);
          }
        };
        input.click();
        return;
      }

      await processFileImport(fileOrRecord);
    } catch (error) {
      console.error('Import workflow failed:', error);
      Toast.error(
        error instanceof Error ? error.message : 'Workflow import failed',
      );
    } finally {
      setImporting(false);
    }
  };

  const processFileImport = async (file: File) => {
    const fileContent = await file.text();
    const fileName = file.name.toLowerCase();
    const isYamlFile = fileName.endsWith('.yml') || fileName.endsWith('.yaml');

    let workflowData: Record<string, unknown>;
    try {
      workflowData = parseFileContent(fileContent, isYamlFile);
    } catch (error) {
      console.error('Failed to parse workflow file:', error);
      throw new Error('Failed to parse workflow file');
    }

    validateWorkflowData(workflowData);

    const result = await callImportAPI(file, workflowData, fileContent);
    processImportResult(result);
  };

  return {
    actionHandler: handleImport,
    importing,
    importModal: null, // 如果需要模态框, 这里应该返回相应的组件
  };
};
