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

import { type WorkflowResourceActionProps } from './type';

export const useImportAction = (props: WorkflowResourceActionProps) => {
  const [importing, setImporting] = useState(false);

  const handleImport = async (file: File) => {
    if (importing) return;

    try {
      setImporting(true);
      
      // 读取文件内容
      const fileContent = await file.text();
      
      // 解析JSON数据
      let workflowData;
      try {
        workflowData = JSON.parse(fileContent);
      } catch (error) {
        throw new Error(I18n.t('workflow_import_failed'));
      }

      // 验证工作流数据结构
      if (!workflowData.name || !workflowData.schema) {
        throw new Error(I18n.t('workflow_import_failed'));
      }

      // 调用导入API
      const response = await fetch('/api/workflow_api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow_data: fileContent,
          workflow_name: workflowData.name,
          space_id: props.spaceId || '',
          creator_id: props.userId || '',
          import_format: 'json',
        }),
      });

      if (!response.ok) {
        throw new Error(I18n.t('workflow_import_failed'));
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