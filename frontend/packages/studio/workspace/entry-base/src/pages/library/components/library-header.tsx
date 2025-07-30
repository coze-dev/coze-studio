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

import React from 'react';

import { useWorkflowImportExport } from '@coze-workflow/components';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlus, IconCozImport } from '@coze-arch/coze-design/icons';
import { Button, Menu, Upload, Toast } from '@coze-arch/coze-design';

import { type LibraryEntityConfig } from '../types';

const findFileRecursive = (obj: unknown, path = ''): File | null => {
  if (obj instanceof File) {
    console.log(`Found File object at path: ${path}`);
    return obj;
  }

  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const currentPath = path ? `${path}.${key}` : key;
        const result = findFileRecursive(
          (obj as Record<string, unknown>)[key],
          currentPath,
        );
        if (result) {
          return result;
        }
      }
    }
  }

  return null;
};

const extractFileFromWrapper = (fileOrWrapper: unknown): File | null => {
  if (!fileOrWrapper) {
    return null;
  }
  if (fileOrWrapper instanceof File) {
    return fileOrWrapper;
  }

  if (typeof fileOrWrapper === 'object') {
    const wrapper = fileOrWrapper as Record<string, unknown>;
    const fileProperties = ['file', 'originFileObj', 'raw'];

    for (const prop of fileProperties) {
      const potentialFile = wrapper[prop];
      if (potentialFile instanceof File) {
        return potentialFile;
      }
    }

    return findFileRecursive(fileOrWrapper);
  }

  return null;
};

const readFileContent = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('文件内容为空'));
      } else {
        resolve(result);
      }
    };
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    reader.readAsText(file);
  });

const parseImportPackage = (content: string): Record<string, unknown> => {
  const exportedData = JSON.parse(content);

  if (exportedData.data && exportedData.data.export_package) {
    return JSON.parse(exportedData.data.export_package);
  } else if (exportedData.version && exportedData.workflows) {
    return exportedData;
  } else {
    throw new Error('无效的导入文件格式');
  }
};

const validatePackage = async (
  importPackage: Record<string, unknown>,
  validateImportPackage: (pkg: Record<string, unknown>) => Promise<unknown>,
): Promise<void> => {
  const validationResult = await validateImportPackage(importPackage);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Validation result has dynamic structure
  const result = validationResult as any;
  const isValid =
    result?.is_valid ||
    result?.data?.is_valid ||
    (result?.data?.validation_result &&
      JSON.parse(result.data.validation_result).is_valid);

  if (!isValid) {
    throw new Error('Import file validation failed');
  }
};

interface ImportWorkflowOptions {
  importPackage: Record<string, unknown>;
  conflictResolution: 'rename' | 'overwrite' | 'skip';
  shouldModifyWorkflowName: boolean;
}

const processImportFile = async (
  file: File,
  validateImportPackage: (pkg: Record<string, unknown>) => Promise<unknown>,
  importWorkflow: (
    options: ImportWorkflowOptions,
  ) => Promise<Record<string, unknown>>,
) => {
  if (!file || !(file instanceof File) || !file.name.endsWith('.json')) {
    throw new Error('请选择有效的JSON文件');
  }

  const content = await readFileContent(file);
  const importPackage = parseImportPackage(content);
  await validatePackage(importPackage, validateImportPackage);

  await importWorkflow({
    importPackage,
    conflictResolution: 'rename',
    shouldModifyWorkflowName: true,
  });
};

export const LibraryHeader: React.FC<{
  entityConfigs: LibraryEntityConfig[];
  spaceId: string;
  onRefresh?: () => void;
}> = ({ entityConfigs, spaceId, onRefresh }) => {
  const { importWorkflow, validateImportPackage } = useWorkflowImportExport({
    spaceId,
    onSuccess: () => {
      Toast.success('Workflow imported successfully');
      onRefresh?.();
    },
    onError: error => {
      Toast.error(`Import failed: ${error.message}`);
    },
  });

  const handleImportWorkflow = async (file: File) => {
    try {
      await processImportFile(file, validateImportPackage, importWorkflow);
      Toast.success('Workflow imported successfully');
    } catch (error: unknown) {
      console.error('Failed to import workflow:', error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Toast.error(`Import failed: ${errorMessage}`);
    }
  };

  return (
    <div className="flex items-center justify-between mb-[16px]">
      <div className="font-[500] text-[20px]">
        {I18n.t('navigation_workspace_library')}
      </div>
      <div className="flex items-center gap-2">
        <Upload
          accept=".json"
          action=""
          showUploadList={false}
          beforeUpload={fileOrWrapper => {
            try {
              const actualFile = extractFileFromWrapper(fileOrWrapper);

              if (!actualFile) {
                Toast.error('文件结构无效，请重新选择');
                return false;
              }

              console.log('Final extracted file:', {
                actualFile,
                fileName: actualFile.name,
                fileSize: actualFile.size,
              });

              if (actualFile instanceof File) {
                void handleImportWorkflow(actualFile);
              } else {
                console.error(
                  'Extracted file is not a File object:',
                  actualFile,
                );
                Toast.error('提取的文件对象无效');
              }
            } catch (error) {
              console.error('Error in beforeUpload:', error);
              Toast.error(`文件处理出错：${(error as Error).message}`);
            }

            return false;
          }}
        >
          <Button
            theme="borderless"
            type="secondary"
            icon={<IconCozImport />}
            data-testid="workspace.library.header.import"
          >
            Import
          </Button>
        </Upload>
        <Menu
          position="bottomRight"
          className="w-120px mt-4px mb-4px"
          render={
            <Menu.SubMenu mode="menu">
              {entityConfigs.map((config, index) => (
                <React.Fragment key={config.target?.join('-') || index}>
                  {config.renderCreateMenu?.() ?? null}
                </React.Fragment>
              ))}
            </Menu.SubMenu>
          }
        >
          <Button
            theme="solid"
            type="primary"
            icon={<IconCozPlus />}
            data-testid="workspace.library.header.create"
          >
            {I18n.t('library_resource')}
          </Button>
        </Menu>
      </div>
    </div>
  );
};
