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
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import * as yaml from 'js-yaml';

import { type WorkflowResourceActionProps } from './type';

export const useImportAction = (props: WorkflowResourceActionProps) => {
  const [importing, setImporting] = useState(false);

  const handleImport = async (file: File) => {
    if (importing) return;

    try {
      setImporting(true);
      
      // 读取文件内容
      const fileContent = await file.text();
      
      // 确定文件格式
      const fileName = file.name.toLowerCase();
      const isYamlFile = fileName.endsWith('.yml') || fileName.endsWith('.yaml');
      const importFormat = isYamlFile ? (fileName.endsWith('.yml') ? 'yml' : 'yaml') : 'json';
      
      // 解析数据
      let workflowData;
      try {
        if (isYamlFile) {
          workflowData = yaml.load(fileContent) as any;
        } else {
          workflowData = JSON.parse(fileContent);
        }
      } catch (error) {
        console.error('Failed to parse workflow file:', error);
        throw new Error(I18n.t('workflow_import_error_parse_failed'));
      }

      // 验证工作流数据结构
      if (!workflowData || typeof workflowData !== 'object') {
        throw new Error(I18n.t('workflow_import_error_invalid_structure'));
      }
      
      // 检查必要字段
      if (!workflowData.name && !workflowData.workflow_id) {
        throw new Error(I18n.t('workflow_import_error_missing_name'));
      }

      // 调用导入API
      const response = await fetch('/api/workflow_api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow_data: fileContent,
          workflow_name: workflowData.name || `Imported_${Date.now()}`,
          space_id: props.spaceId || '',
          creator_id: props.userId || '',
          import_format: importFormat,
        }),
      });

      if (!response.ok) {
        // Map HTTP status codes to user-friendly messages
        let errorKey = 'workflow_import_failed';
        switch (response.status) {
          case 403:
            errorKey = 'workflow_import_error_permission';
            break;
          case 400:
            errorKey = 'workflow_import_error_invalid_file';
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorKey = 'workflow_import_error_network';
            break;
          default:
            errorKey = 'workflow_import_failed';
        }
        
        throw new Error(I18n.t(errorKey));
      }

      const result = await response.json();
      
      if (result.code === 200 && result.data?.workflow_id) {
        Toast.success(I18n.t('workflow_import_success'));
        
        // 刷新页面或跳转到新工作流
        if (props.refreshPage) {
          props.refreshPage();
        }
        
        // 可选：跳转到新创建的工作流
        if (props.goWorkflowDetail) {
          props.goWorkflowDetail(result.data.workflow_id, props.spaceId);
        }
      } else {
        throw new Error(result.msg || I18n.t('workflow_import_failed'));
      }
    } catch (error) {
      console.error('导入工作流失败:', error);
      Toast.error(error instanceof Error ? error.message : I18n.t('workflow_import_failed'));
    } finally {
      setImporting(false);
    }
  };

  return {
    actionHandler: handleImport,
    importing,
  };
}; 