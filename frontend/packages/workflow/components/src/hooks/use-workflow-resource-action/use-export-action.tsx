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
      
      if (!selectedFormat) {
        console.error('No format selected');
        Toast.error('Please select an export format');
        return;
      }
      
      // 立即关闭Modal
      setShowFormatModal(false);
      
      // 立即开始导出（不等待结果）
      performExport(selectedRecord, selectedFormat);
      
      // 清理状态
      setSelectedRecord(null);
      setSelectedFormat('json'); // 重置为默认格式
    } catch (error) {
      console.error('Error in handleConfirmExport:', error);
      Toast.error('Failed to start export');
    }
  };

  const handleCancelExport = () => {
    setShowFormatModal(false);
    setSelectedRecord(null);
    setSelectedFormat('json'); // 重置为默认格式
  };

  console.log('Rendering exportModal', { showFormatModal, selectedRecord, selectedFormat });

  const exportModal = (
    <Modal
      visible={showFormatModal}
      title={null}
      footer={null}
      onCancel={handleCancelExport}
      width={240}
      destroyOnClose={true}
      className="workflow-export-modal"
      style={{ top: '20vh' }}
    >
      <div className="px-4 py-5">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M14 2H6C4.89 2 4 2.9 4 4V20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="currentColor"/>
              <path d="M9 13V15H15V13H9ZM9 16V18H13V16H9Z" fill="currentColor" fillOpacity="0.8"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            {I18n.t('workflow_export_format_title', 'Export Format')}
          </h2>
          <p className="text-gray-500 text-xs leading-relaxed">
            {I18n.t('workflow_export_format_description', 'Choose your preferred format')}
          </p>
        </div>
        
        {/* Format Options */}
        <div className="space-y-2 mb-5">
          <button
            className={`relative w-full p-3 text-left rounded-lg transition-all duration-300 group ${
              selectedFormat === 'json' 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 shadow-sm' 
                : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm'
            }`}
            onClick={() => {
              console.log('JSON format selected');
              setSelectedFormat('json');
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center mr-3 ${
                  selectedFormat === 'json' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-blue-400 group-hover:to-blue-500'
                } transition-all duration-300`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M5 3H7V5H9V7H7V9H5V7H3V5H5V3ZM11 3H19C19.6 3 20 3.4 20 4V6C20 6.6 19.6 7 19 7H11V3ZM11 9H19C19.6 9 20 9.4 20 10V12C20 12.6 19.6 13 19 13H11V9ZM11 15H19C19.6 15 20 15.4 20 16V18C20 18.6 19.6 19 19 19H11V15Z" fill="currentColor"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="font-semibold text-sm text-gray-800">JSON</span>
                    <span className="ml-2 px-1.5 py-0.5 bg-green-500 text-white text-xs font-medium rounded">
                      {I18n.t('recommended', 'REC')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {I18n.t('workflow_export_format_json_desc', 'Standard format')}
                  </p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedFormat === 'json' 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300 group-hover:border-blue-400'
              } transition-all duration-300`}>
                {selectedFormat === 'json' && (
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                )}
              </div>
            </div>
          </button>
          
          <button
            className={`relative w-full p-3 text-left rounded-lg transition-all duration-300 group ${
              selectedFormat === 'yml' 
                ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-400 shadow-sm' 
                : 'bg-white border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:shadow-sm'
            }`}
            onClick={() => {
              console.log('YAML format selected');
              setSelectedFormat('yml');
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center mr-3 ${
                  selectedFormat === 'yml' 
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                    : 'bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-purple-400 group-hover:to-purple-500'
                } transition-all duration-300`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M14 2H6C4.89 2 4 2.9 4 4V20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="currentColor"/>
                    <path d="M8 12H10V14H8V12ZM8 15H14V17H8V15ZM8 9H16V11H8V9Z" fill="currentColor" fillOpacity="0.7"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="font-semibold text-sm text-gray-800">YAML</span>
                    <span className="ml-2 px-1.5 py-0.5 bg-purple-500 text-white text-xs font-medium rounded">
                      {I18n.t('human_readable', 'READABLE')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {I18n.t('workflow_export_format_yml_desc', 'Human readable')}
                  </p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedFormat === 'yml' 
                  ? 'border-purple-500 bg-purple-500' 
                  : 'border-gray-300 group-hover:border-purple-400'
              } transition-all duration-300`}>
                {selectedFormat === 'yml' && (
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                )}
              </div>
            </div>
          </button>
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <button
            className="px-4 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-200 font-medium text-xs"
            onClick={handleCancelExport}
          >
            {I18n.t('cancel', 'Cancel')}
          </button>
          <button
            className={`px-4 py-1.5 rounded-md transition-all duration-200 font-medium text-xs ${
              selectedFormat 
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleConfirmExport}
            disabled={!selectedFormat}
          >
            {I18n.t('confirm', '确认')}
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