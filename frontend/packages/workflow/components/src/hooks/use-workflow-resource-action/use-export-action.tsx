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
      
      console.log('Starting export:', { recordId: record.res_id, format });
      
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

      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        
        // Map HTTP status codes to user-friendly messages
        let errorKey = 'workflow_export_failed';
        switch (response.status) {
          case 403:
            errorKey = 'workflow_export_error_permission';
            break;
          case 404:
            errorKey = 'workflow_export_error_not_found';
            break;
          case 400:
            errorKey = 'workflow_export_error_invalid_format';
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorKey = 'workflow_export_error_network';
            break;
          default:
            errorKey = 'workflow_export_failed';
        }
        
        throw new Error(I18n.t(errorKey));
      }

      const result = await response.json();
      console.log('API Result:', result);
      
      if (result.code === 200 && result.data?.workflow_export) {
        const exportData = result.data.workflow_export;
        let fileContent: string;
        let fileName: string;
        let mimeType: string;

        if (format === 'yml' || format === 'yaml') {
          // 对于YAML格式，使用后端返回的序列化数据
          if (exportData.serialized_data && typeof exportData.serialized_data === 'string') {
            fileContent = exportData.serialized_data;
          } else {
            console.warn('YAML serialized_data is invalid, fallback to JSON stringify');
            console.log('serialized_data value:', exportData.serialized_data);
            fileContent = JSON.stringify(exportData, null, 2);
          }
          fileName = `${record.name || 'workflow'}_export.${format}`;
          mimeType = 'text/yaml';
        } else {
          // 对于JSON格式，使用原有逻辑
          fileContent = JSON.stringify(exportData, null, 2);
          fileName = `${record.name || 'workflow'}_export.json`;
          mimeType = 'application/json';
        }

        console.log('File content length:', fileContent.length);
        console.log('File name:', fileName);

        // 检查文件内容是否为空
        if (!fileContent || fileContent.trim() === '') {
          throw new Error(I18n.t('workflow_export_error_empty_data'));
        }

        // 创建并下载文件
        const blob = new Blob([fileContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        Toast.success(I18n.t('workflow_export_success', 'Export successful'));
        console.log('Export completed successfully');
      } else {
        console.error('Invalid API response:', result);
        throw new Error(result.msg || 'Invalid response from server');
      }
    } catch (error) {
      console.error('导出工作流失败:', error);
      let errorMessage = I18n.t('workflow_export_failed', 'Export failed');
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Toast.error(errorMessage);
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
      title={I18n.t('workflow_export_format_title', 'Select Export Format')}
      footer={null}
      onCancel={handleCancelExport}
      width={450}
      destroyOnClose={true}
    >
      <div className="py-4">
        <p className="mb-6 text-gray-700">
          {I18n.t('workflow_export_format_description', 'Please select the format for exporting your workflow:')}
        </p>
        
        <div className="space-y-3">
          <button
            className={`w-full p-4 text-left border-2 rounded-lg transition-all hover:border-blue-500 hover:bg-blue-50 ${
              selectedFormat === 'json' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => {
              console.log('JSON format selected');
              setSelectedFormat('json');
              setShowFormatModal(false);
              if (selectedRecord) {
                performExport(selectedRecord, 'json');
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">JSON</div>
                <div className="text-sm text-gray-600 mt-1">
                  {I18n.t('workflow_export_format_json_desc', 'Structured data format, widely supported')}
                </div>
              </div>
              <div className="text-2xl">📄</div>
            </div>
          </button>
          
          <button
            className={`w-full p-4 text-left border-2 rounded-lg transition-all hover:border-blue-500 hover:bg-blue-50 ${
              selectedFormat === 'yml' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => {
              console.log('YAML format selected');
              setSelectedFormat('yml');
              setShowFormatModal(false);
              if (selectedRecord) {
                performExport(selectedRecord, 'yml');
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">YAML</div>
                <div className="text-sm text-gray-600 mt-1">
                  {I18n.t('workflow_export_format_yml_desc', 'Human-readable configuration format')}
                </div>
              </div>
              <div className="text-2xl">📝</div>
            </div>
          </button>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors"
            onClick={handleCancelExport}
          >
            {I18n.t('cancel', 'Cancel')}
          </button>
        </div>
      </div>
    </Modal>
  );

  return {
    actionHandler: handleExport,
    exporting,
    exportModal,
  };
}; 