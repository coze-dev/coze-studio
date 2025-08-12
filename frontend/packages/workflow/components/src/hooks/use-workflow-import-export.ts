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

import { useCallback } from 'react';

import { type ResourceInfo } from '@coze-arch/bot-api/plugin_develop';

export interface ExportWorkflowOptions {
  workflowIds: string[];
  spaceId: string;
  includeDependencies?: boolean;
  includeVersions?: boolean;
}

export interface ImportWorkflowOptions {
  importPackage: Record<string, unknown>; // TODO: 使用具体的类型定义
  targetSpaceId?: string;
  targetAppId?: string;
  conflictResolution?: 'skip' | 'overwrite' | 'rename';
  shouldModifyWorkflowName?: boolean;
}

export interface WorkflowImportExportHook {
  exportWorkflow: (options: ExportWorkflowOptions) => Promise<void>;
  importWorkflow: (
    options: ImportWorkflowOptions,
  ) => Promise<Record<string, unknown>>;
  validateImportPackage: (
    importPackage: Record<string, unknown>,
  ) => Promise<Record<string, unknown>>;
}

export const useWorkflowImportExport = (props: {
  spaceId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}): WorkflowImportExportHook => {
  const { spaceId, onSuccess, onError } = props;

  const exportWorkflow = useCallback(
    async (options: ExportWorkflowOptions) => {
      try {
        // TODO: 替换为实际的API调用
        const response = await fetch('/api/workflow_api/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workflow_ids: options.workflowIds,
            space_id: options.spaceId,
            include_dependencies: options.includeDependencies ?? true,
            include_versions: options.includeVersions ?? false,
          }),
        });

        if (!response.ok) {
          throw new Error(`Export failed: ${response.statusText}`);
        }

        const data = await response.json();

        // 下载导出文件
        downloadJsonFile(data, `workflow-export-${Date.now()}.json`);

        onSuccess?.();
      } catch (error) {
        console.error('Export workflow failed:', error);
        onError?.(error);
      }
    },
    [onSuccess, onError],
  );

  const importWorkflow = useCallback(
    async (options: ImportWorkflowOptions) => {
      try {
        const result = await performWorkflowImport(options, spaceId);
        onSuccess?.();
        return result;
      } catch (error) {
        console.error('Import workflow failed:', error);
        onError?.(error);
        throw error;
      }
    },
    [spaceId, onSuccess, onError],
  );

  const validateImportPackage = useCallback(
    async (importPackage: Record<string, unknown>) => {
      try {
        return await performImportValidation(importPackage, spaceId);
      } catch (error) {
        console.error('Validate import package failed:', error);
        throw error;
      }
    },
    [spaceId],
  );

  return {
    exportWorkflow,
    importWorkflow,
    validateImportPackage,
  };
};

// Helper function to download JSON data as file
const downloadJsonFile = (data: unknown, filename: string) => {
  const JSON_INDENT_SPACES = 2;
  const blob = new Blob(
    [JSON.stringify(data, /* replacer */ null, JSON_INDENT_SPACES)],
    {
      type: 'application/json',
    },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Helper function for workflow import API call
const performWorkflowImport = async (
  options: ImportWorkflowOptions,
  spaceId: string,
) => {
  console.log('发送导入请求，参数:', options);

  const requestBody = {
    space_id: options.targetSpaceId ?? spaceId,
    import_package: JSON.stringify(options.importPackage),
    target_app_id: options.targetAppId,
    conflict_resolution: options.conflictResolution ?? 'rename',
    should_modify_workflow_name: options.shouldModifyWorkflowName ?? true,
  };

  console.log('请求体:', requestBody);

  const response = await fetch('/api/workflow_api/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('导入响应状态:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('导入失败响应:', errorText);
    throw new Error(`Import failed: ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  console.log('导入成功结果:', result);
  return result;
};

// Helper function for import package validation API call
const performImportValidation = async (
  importPackage: Record<string, unknown>,
  spaceId: string,
) => {
  console.log('发送验证请求，导入包:', importPackage);

  const requestBody = {
    import_package: JSON.stringify(importPackage),
    target_space_id: spaceId,
  };

  console.log('验证请求体:', requestBody);

  const response = await fetch('/api/workflow_api/validate_import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('验证响应状态:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('验证失败响应:', errorText);
    throw new Error(`Validation failed: ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  console.log('验证结果:', result);
  return result;
};

// Helper function to extract workflow from ResourceInfo
export const extractWorkflowIdFromResource = (resource: ResourceInfo): string =>
  resource.res_id || '';
