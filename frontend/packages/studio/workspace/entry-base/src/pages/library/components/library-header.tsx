/* eslint-disable @coze-arch/max-line-per-function */
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
// import { ResType } from '@coze-arch/idl/plugin_develop';
import { IconCozPlus, IconCozImport } from '@coze-arch/coze-design/icons';
import { Button, Upload, Toast, Menu, MenuItem } from '@coze-arch/coze-design';

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
  try {
    const exportedData = JSON.parse(content);

    // 打印调试信息，帮助了解文件结构
    console.log('Parsed JSON structure:', exportedData);
    console.log('Keys:', Object.keys(exportedData));

    // 格式1: 后端API响应格式 - 有data字段包含export_package
    if (exportedData.data && exportedData.data.export_package) {
      console.log('Format 1: API response with data.export_package');
      return JSON.parse(exportedData.data.export_package);
    }

    // 格式2: 直接的工作流导出包格式 - 包含version和workflows字段
    if (exportedData.version && exportedData.workflows) {
      console.log('Format 2: Direct export package with version and workflows');
      return exportedData;
    }

    // 格式3: 包含export_package字段的直接格式
    if (exportedData.export_package) {
      console.log('Format 3: Direct export_package field');
      if (typeof exportedData.export_package === 'string') {
        return JSON.parse(exportedData.export_package);
      } else {
        return exportedData.export_package;
      }
    }

    // 格式4: 检查是否是有效的工作流包（包含基本字段）
    if (
      exportedData &&
      typeof exportedData === 'object' &&
      (exportedData.workflows || exportedData.data || exportedData.version)
    ) {
      console.log('Format 4: Assuming valid workflow package structure');
      return exportedData;
    }

    // 所有格式都不匹配，显示详细错误信息
    const errorDetails = {
      hasData: !!exportedData.data,
      hasVersion: !!exportedData.version,
      hasWorkflows: !!exportedData.workflows,
      hasExportPackage: !!exportedData.export_package,
      keys: Object.keys(exportedData),
      sampleData: JSON.stringify(exportedData).substring(0, 200) + '...',
    };

    console.error('Invalid import file format. Details:', errorDetails);
    throw new Error(
      `无效的导入文件格式。文件结构: ${JSON.stringify(errorDetails, null, 2)}`,
    );
  } catch (parseError) {
    if (parseError instanceof SyntaxError) {
      throw new Error('文件不是有效的JSON格式');
    }
    throw parseError;
  }
};

const validatePackage = async (
  importPackage: Record<string, unknown>,
  validateImportPackage: (pkg: Record<string, unknown>) => Promise<unknown>,
): Promise<void> => {
  const validationResult = await validateImportPackage(importPackage);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Validation result has dynamic structure
  const result = validationResult as any;

  // 添加详细的调试日志
  console.log('Validation result:', result);

  let isValid = false;
  let validationMessage = '';

  // 检查不同的验证结果路径
  if (result?.is_valid) {
    isValid = true;
  } else if (result?.data?.is_valid) {
    isValid = true;
  } else if (result?.data?.validation_result) {
    try {
      const parsedResult = JSON.parse(result.data.validation_result);
      isValid = parsedResult.is_valid;
      if (!isValid && parsedResult.message) {
        validationMessage = parsedResult.message;
      }
    } catch (e) {
      console.error('Failed to parse validation_result:', e);
      validationMessage = 'Invalid validation result format';
    }
  }

  // 提取验证失败的具体原因
  if (!isValid) {
    const errorMessage =
      validationMessage ||
      result?.message ||
      result?.data?.message ||
      result?.error ||
      'Import file validation failed';
    console.error('Validation failed:', {
      result,
      isValid,
      errorMessage,
      importPackage,
    });
    throw new Error(errorMessage);
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

  // 暂时禁用验证，因为后端API还未实现
  // await validatePackage(importPackage, validateImportPackage);

  await importWorkflow({
    importPackage,
    conflictResolution: 'rename',
    shouldModifyWorkflowName: true,
  });
};

export const LibraryHeader: React.FC<{
  entityConfigs: LibraryEntityConfig[];
  spaceId: string;
  sourceType: number;
  onRefresh?: () => void;
}> = ({ entityConfigs, spaceId, sourceType, onRefresh }) => {
  const menuConfig = entityConfigs.find(
    item => item.typeFilter?.value === sourceType,
  );
  const currentEntityFilter = entityConfigs.find(
    item => item.typeFilter?.value === sourceType,
  )?.typeFilter;
  const currentEntityTitle =
    currentEntityFilter?.filterName || currentEntityFilter?.label || '资源库';

  const { importWorkflow, validateImportPackage } = useWorkflowImportExport({
    spaceId,
    onSuccess: () => {
      Toast.success('Workflow imported successfully');
      // 添加小延迟确保后端数据已完全写入
      setTimeout(() => {
        onRefresh?.();
      }, 100);
    },
    onError: (error: Error) => {
      Toast.error(`Import failed: ${error.message}`);
    },
  });

  const handleImportWorkflow = async (file: File) => {
    try {
      await processImportFile(file, validateImportPackage, importWorkflow);
    } catch (error: unknown) {
      console.error('Failed to import workflow:', error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Toast.error(`Import failed: ${errorMessage}`);
    }
  };

  // 判断是否应该显示导入按钮
  // 只有工作流(2)页面显示导入按钮
  const shouldShowImportButton = sourceType === 2;
  
  // 判断是否应该显示对话流选项
  // 只有工作流(2)页面显示对话流选项
  const shouldShowChatflowOption = sourceType === 2;

  return (
    <div className="flex items-center justify-between mb-[16px]">
      <div className="font-[500] text-[20px]">{currentEntityTitle}</div>
      <div className="flex items-center gap-2">
        {shouldShowImportButton && (
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
              {I18n.t('import')}
            </Button>
          </Upload>
        )}
        <Menu
          key="create"
          position="bottomRight"
          className="w-120px mt-4px mb-4px"
          render={
            <Menu.SubMenu mode="menu">
              <MenuItem
                onClick={(
                  value: string,
                  event: React.MouseEvent<HTMLLIElement>,
                ) => {
                  if ('onCreate' in (menuConfig || {})) {
                    (menuConfig as any)?.onCreate?.();
                  }
                  event?.stopPropagation();
                }}
              >
                {I18n.t('wf_chatflow_100') +
                  (menuConfig?.typeFilter?.filterName ||
                    menuConfig?.typeFilter?.label)}
              </MenuItem>
              {shouldShowChatflowOption && (
                <MenuItem
                  onClick={(
                    value: string,
                    event: React.MouseEvent<HTMLLIElement>,
                  ) => {
                    if ('onCreate' in (menuConfig || {})) {
                      (menuConfig as any)?.onCreate?.(true);
                    }
                    event?.stopPropagation();
                  }}
                >
                  {I18n.t('wf_chatflow_100') + I18n.t('wf_chatflow_76')}
                </MenuItem>
              )}
            </Menu.SubMenu>
          }
        >
          <Button
            theme="solid"
            type="primary"
            icon={<IconCozPlus />}
            data-testid="workspace.library.header.create"
          >
            {I18n.t('wf_chatflow_100')}
          </Button>
        </Menu>
        {/* <Button
          theme="solid"
          type="primary"
          icon={<IconCozPlus />}
          data-testid="workspace.library.header.create"
          onClick={() => {
            menuConfig?.onCreate?.();
          }}
        >
          {I18n.t('wf_chatflow_100') +
            (menuConfig?.typeFilter?.filterName ||
              menuConfig?.typeFilter?.label)}
        </Button>
        {sourceType === ResType.Workflow && (
          <Button
            theme="solid"
            type="primary"
            icon={<IconCozPlus />}
            data-testid="workspace.library.header.create"
            onClick={() => {
              menuConfig?.onCreate?.(true);
            }}
          >
            {I18n.t('wf_chatflow_100') + I18n.t('wf_chatflow_76')}
          </Button>
        )} */}
        {/* <Menu
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
        </Menu> */}
      </div>
    </div>
  );
};
