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
import { Toast, Modal, Radio } from '@coze-arch/coze-design';
import { type ResourceInfo } from '@coze-arch/bot-api/plugin_develop';

import { type WorkflowResourceActionProps } from './type';

type ExportFormat = 'json' | 'yml' | 'yaml';

export const useExportAction = (props: WorkflowResourceActionProps) => {
  const [exporting, setExporting] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ResourceInfo | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');

  const performExport = async (record: ResourceInfo, format: ExportFormat) => {
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
          export_format: format,
        }),
      });

      if (!response.ok) {
        throw new Error(I18n.t('workflow_export_failed'));
      }

      const result = await response.json();
      
      if (result.code === 200 && result.data?.workflow_export) {
        const exportData = result.data.workflow_export;
        let fileContent: string;
        let fileName: string;
        let mimeType: string;

        if (format === 'yml' || format === 'yaml') {
          // 对于YAML格式，使用后端返回的序列化数据
          fileContent = exportData.serialized_data || '';
          fileName = `${record.name}_workflow_export.${format}`;
          mimeType = 'text/yaml';
        } else {
          // 对于JSON格式，使用原有逻辑
          fileContent = JSON.stringify(exportData, null, 2);
          fileName = `${record.name}_workflow_export.json`;
          mimeType = 'application/json';
        }

        // 创建并下载文件
        const blob = new Blob([fileContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
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

  const handleExport = (record: ResourceInfo) => {
    setSelectedRecord(record);
    setShowFormatModal(true);
  };

  const handleConfirmExport = async () => {
    if (!selectedRecord) return;
    setShowFormatModal(false);
    await performExport(selectedRecord, selectedFormat);
    setSelectedRecord(null);
  };

  const handleCancelExport = () => {
    setShowFormatModal(false);
    setSelectedRecord(null);
  };

  const exportModal = (
    <Modal
      visible={showFormatModal}
      title={I18n.t('workflow_export_format_title', '选择导出格式')}
      onOk={handleConfirmExport}
      onCancel={handleCancelExport}
      confirmLoading={exporting}
      width={400}
    >
      <div className="mb-4">
        <p className="mb-3">{I18n.t('workflow_export_format_description', '请选择工作流导出格式：')}</p>
        <Radio.Group
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
        >
          <Radio value="json" className="mb-2">
            JSON {I18n.t('workflow_export_format_json_desc', '(结构化数据格式)')}
          </Radio>
          <Radio value="yml">
            YAML {I18n.t('workflow_export_format_yml_desc', '(可读性更好的配置格式)')}
          </Radio>
        </Radio.Group>
      </div>
    </Modal>
  );

  return {
    actionHandler: handleExport,
    exporting,
    exportModal,
  };
}; 