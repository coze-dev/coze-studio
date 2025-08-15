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
import { type ResourceInfo } from '@coze-arch/bot-api/plugin_develop';

import { type WorkflowResourceActionProps } from './type';

export const useExportAction = (props: WorkflowResourceActionProps) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (record: ResourceInfo) => {
    if (exporting) return;

    try {
      setExporting(true);
      
      // 调用导出API
      const response = await fetch('/api/workflow_api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow_id: record.res_id,
          include_dependencies: true,
          export_format: 'json',
        }),
      });

      if (!response.ok) {
        throw new Error('导出失败');
      }

      const result = await response.json();
      
      if (result.code === 200 && result.data?.workflow_export) {
        // 创建并下载文件
        const exportData = result.data.workflow_export;
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json',
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${record.name}_workflow_export.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        Toast.success(I18n.t('workflow_export_success'));
      } else {
        throw new Error(result.msg || I18n.t('workflow_export_failed'));
      }
    } catch (error) {
      console.error('导出工作流失败:', error);
      Toast.error(I18n.t('workflow_export_failed'));
    } finally {
      setExporting(false);
    }
  };

  return {
    actionHandler: handleExport,
    exporting,
  };
}; 