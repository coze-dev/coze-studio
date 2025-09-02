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
import { ExportFormatModal } from './components/ExportFormatModal';

type ExportFormat = 'json' | 'yml' | 'yaml';

const HTTP_STATUS = {
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  OK: 200,
} as const;

const getErrorKeyFromStatus = (status: number): string => {
  switch (status) {
    case HTTP_STATUS.FORBIDDEN:
      return 'workflow_export_error_permission';
    case HTTP_STATUS.NOT_FOUND:
      return 'workflow_export_error_not_found';
    case HTTP_STATUS.BAD_REQUEST:
      return 'workflow_export_error_bad_request';
    case HTTP_STATUS.SERVER_ERROR:
    case HTTP_STATUS.BAD_GATEWAY:
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
    case HTTP_STATUS.GATEWAY_TIMEOUT:
      return 'workflow_export_error_network';
    default:
      return 'workflow_export_failed';
  }
};

const createFileContent = (
  exportData: Record<string, unknown>,
  format: ExportFormat,
  recordName: string,
): { content: string; fileName: string; mimeType: string } => {
  const JSON_INDENT = 2;

  if (format === 'yml' || format === 'yaml') {
    // 对于YAML格式，使用后端返回的序列化数据
    let fileContent: string;
    if (
      exportData.serialized_data &&
      typeof exportData.serialized_data === 'string'
    ) {
      fileContent = exportData.serialized_data;
    } else {
      console.warn(
        'YAML serialized_data is invalid, fallback to JSON stringify',
      );
      console.log('serialized_data value:', exportData.serialized_data);
      fileContent = JSON.stringify(exportData, null, JSON_INDENT);
    }
    return {
      content: fileContent,
      fileName: `${recordName || 'workflow'}_export.${format}`,
      mimeType: 'text/yaml',
    };
  } else {
    // 对于JSON格式，使用原有逻辑
    return {
      content: JSON.stringify(exportData, null, JSON_INDENT),
      fileName: `${recordName || 'workflow'}_export.json`,
      mimeType: 'application/json',
    };
  }
};

export const useExportAction = (props: WorkflowResourceActionProps) => {
  const [exporting, setExporting] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ResourceInfo | null>(
    null,
  );
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');

  const callExportAPI = async (record: ResourceInfo, format: ExportFormat) => {
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
      const errorText = await response.text();
      console.error('API Error:', errorText);
      const errorKey = getErrorKeyFromStatus(response.status);
      throw new Error(I18n.t(errorKey));
    }

    return response.json();
  };

  const downloadFile = (
    content: string,
    fileName: string,
    mimeType: string,
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const performExport = async (record: ResourceInfo, format: ExportFormat) => {
    if (exporting) {
      return;
    }

    try {
      setExporting(true);
      console.log('Starting export:', { recordId: record.res_id, format });

      const result = await callExportAPI(record, format);
      console.log('API Result:', result);

      if (result.code === HTTP_STATUS.OK && result.data?.workflow_export) {
        const exportData = result.data.workflow_export;
        const { content, fileName, mimeType } = createFileContent(
          exportData,
          format,
          record.name,
        );

        console.log('File content length:', content.length);
        console.log('File name:', fileName);

        if (!content || content.trim() === '') {
          throw new Error(I18n.t('workflow_export_error_empty_data'));
        }

        downloadFile(content, fileName, mimeType);
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
    if (!selectedRecord) {
      Toast.error('No record selected');
      return;
    }

    if (!selectedFormat) {
      Toast.error('Please select an export format');
      return;
    }

    setShowFormatModal(false);
    performExport(selectedRecord, selectedFormat);
    setSelectedRecord(null);
    setSelectedFormat('json');
  };

  const handleCancelExport = () => {
    setShowFormatModal(false);
    setSelectedRecord(null);
    setSelectedFormat('json'); // 重置为默认格式
  };

  const exportModal = (
    <ExportFormatModal
      visible={showFormatModal}
      onCancel={handleCancelExport}
      onConfirm={handleConfirmExport}
      selectedFormat={selectedFormat}
      setSelectedFormat={setSelectedFormat}
    />
  );

  return {
    actionHandler: handleExport,
    exporting,
    exportModal,
  };
};
