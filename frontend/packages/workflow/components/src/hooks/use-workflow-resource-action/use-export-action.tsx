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
      title={null}
      footer={null}
      onCancel={handleCancelExport}
      width={520}
      destroyOnClose={true}
      className="workflow-export-modal"
      style={{ top: '20vh' }}
    >
      <div className="px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 16L7 11L8.4 9.6L11 12.2L15.6 7.6L17 9L12 16Z" fill="currentColor"/>
              <path d="M12 2C13.1 2 14 2.9 14 4V6H10V4C10 2.9 10.9 2 12 2ZM21 9V7L20 6H4L3 7V9H4V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V9H21ZM18 9V19H6V9H18Z" fill="currentColor" fillOpacity="0.7"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {I18n.t('workflow_export_format_title', 'Select Export Format')}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            {I18n.t('workflow_export_format_description', 'Please select the format for exporting your workflow:')}
          </p>
        </div>
        
        {/* Format Options */}
        <div className="space-y-4 mb-8">
          <button
            className={`w-full p-5 text-left rounded-xl transition-all duration-200 group ${
              selectedFormat === 'json' 
                ? 'bg-blue-50 border-2 border-blue-200 shadow-sm' 
                : 'bg-gray-50 border-2 border-transparent hover:border-blue-100 hover:bg-blue-50'
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
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  selectedFormat === 'json' ? 'bg-blue-500' : 'bg-gray-400 group-hover:bg-blue-400'
                } transition-colors duration-200`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M7 2V13H10V22L17 10H13L17 2H7Z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <span className="font-semibold text-lg text-gray-900">JSON</span>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {I18n.t('recommended', 'Recommended')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {I18n.t('workflow_export_format_json_desc', 'Structured data format, widely supported')}
                </p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <span>• {I18n.t('fast_processing', 'Fast processing')}</span>
                  <span className="mx-2">•</span>
                  <span>• {I18n.t('wide_compatibility', 'Wide compatibility')}</span>
                </div>
              </div>
            </div>
          </button>
          
          <button
            className={`w-full p-5 text-left rounded-xl transition-all duration-200 group ${
              selectedFormat === 'yml' 
                ? 'bg-purple-50 border-2 border-purple-200 shadow-sm' 
                : 'bg-gray-50 border-2 border-transparent hover:border-purple-100 hover:bg-purple-50'
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
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  selectedFormat === 'yml' ? 'bg-purple-500' : 'bg-gray-400 group-hover:bg-purple-400'
                } transition-colors duration-200`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M14 2H6C4.89 2 4 2.9 4 4V20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <span className="font-semibold text-lg text-gray-900">YAML</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    {I18n.t('human_readable', 'Human Readable')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {I18n.t('workflow_export_format_yml_desc', 'Human-readable configuration format')}
                </p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <span>• {I18n.t('easy_to_read', 'Easy to read')}</span>
                  <span className="mx-2">•</span>
                  <span>• {I18n.t('configuration_friendly', 'Config friendly')}</span>
                </div>
              </div>
            </div>
          </button>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 font-medium"
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