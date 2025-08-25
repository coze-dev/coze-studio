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

  console.log('useExportAction hook initialized', { exporting, showFormatModal, selectedFormat });

  const performExport = async (record: ResourceInfo, format: ExportFormat) => {
    if (exporting) return;

    try {
      setExporting(true);
      
      console.log('Starting export:', { recordId: record.res_id, format });
      
      if (format === 'yml' || format === 'yaml') {
        // 临时跳过API调用，直接测试YAML内容
        console.log('Testing YAML export without API call');
        
        const testYamlContent = `workflow_id: "${record.res_id}"
name: "${record.name || 'test-workflow'}"
description: "Test YAML export"
export_format: "${format}"
version: "1.0.0"
create_time: ${Date.now()}
nodes: []
edges: []
metadata:
  test: true
`;
        
        const fileName = `${record.name || 'workflow'}_export.${format}`;
        
        console.log('Test YAML content:', testYamlContent);
        console.log('File name:', fileName);
        
        // 创建并下载文件
        const blob = new Blob([testYamlContent], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('Test YAML export completed');
        return;
      }
      
      // 对于JSON格式，继续使用API调用
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
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.code === 200 && result.data?.workflow_export) {
        const exportData = result.data.workflow_export;
        const fileContent = JSON.stringify(exportData, null, 2);
        const fileName = `${record.name || 'workflow'}_export.json`;

        const blob = new Blob([fileContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleExport = (record: ResourceInfo) => {
    console.log('handleExport called with record:', record);
    setSelectedRecord(record);
    setShowFormatModal(true);
  };

  const handleConfirmExport = () => {
    try {
      console.log('handleConfirmExport called', { 
        selectedRecord: selectedRecord?.res_id, 
        selectedFormat 
      });
      
      if (!selectedRecord) {
        console.error('No selected record');
        Toast.error('No record selected');
        return;
      }
      
      // 立即关闭Modal
      setShowFormatModal(false);
      
      // 立即开始导出（不等待结果）
      performExport(selectedRecord, selectedFormat);
      
      // 清理状态
      setSelectedRecord(null);
    } catch (error) {
      console.error('Error in handleConfirmExport:', error);
      Toast.error('Failed to start export');
    }
  };

  const handleCancelExport = () => {
    setShowFormatModal(false);
    setSelectedRecord(null);
  };

  console.log('Rendering exportModal', { showFormatModal, selectedRecord, selectedFormat });

  const exportModal = (
    <Modal
      visible={showFormatModal}
      title="选择导出格式"
      onOk={() => {
        console.log('Modal onOk event triggered');
        handleConfirmExport();
      }}
      onCancel={() => {
        console.log('Modal onCancel event triggered');
        handleCancelExport();
      }}
      confirmLoading={false}
      width={400}
      okText="确认"
      cancelText="取消"
      destroyOnClose={true}
    >
      <div className="mb-4">
        <p className="mb-3">请选择工作流导出格式：</p>
        <p className="mb-2 text-sm text-gray-500">当前选择: {selectedFormat}</p>
        <Radio.Group
          value={selectedFormat}
          onChange={(value) => {
            console.log('Format changed to:', value);
            setSelectedFormat(value as ExportFormat);
          }}
        >
          <div className="mb-2">
            <Radio value="json">
              JSON (结构化数据格式)
            </Radio>
          </div>
          <div>
            <Radio value="yml">
              YAML (可读性更好的配置格式)
            </Radio>
          </div>
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