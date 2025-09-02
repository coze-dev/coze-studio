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

import type { WorkflowFile, ImportProgress, ImportResults } from '../types';
import {
  validateFiles,
  callBatchImportAPI,
  updateFileStatuses,
} from './use-batch-import';

const DELAY_TIME_MS = 1000;

interface ImportHandlerParams {
  selectedFiles: WorkflowFile[];
  spaceId: string;
  importMode: 'batch' | 'transaction';
  setSelectedFiles: React.Dispatch<React.SetStateAction<WorkflowFile[]>>;
}

export const useImportHandler = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(
    null,
  );
  const [importResults, setImportResults] = useState<ImportResults | null>(
    null,
  );
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalData, setResultModalData] = useState<{
    successCount: number;
    failedCount: number;
    firstWorkflowId?: string;
  }>({ successCount: 0, failedCount: 0 });

  const showImportResultModal = (
    successCount: number,
    failedCount: number,
    firstWorkflowId?: string,
  ) => {
    setResultModalData({ successCount, failedCount, firstWorkflowId });
    setShowResultModal(true);
  };

  const validateImportRequest = (params: ImportHandlerParams): boolean => {
    if (!params.spaceId) {
      alert('缺少工作空间ID，请重新进入页面');
      return false;
    }

    if (params.selectedFiles.length === 0) {
      alert('请先选择文件');
      return false;
    }

    const nameErrors = validateFiles(params.selectedFiles);
    if (nameErrors.length > 0) {
      alert(`名称验证失败:\n${nameErrors.join('\n')}`);
      return false;
    }

    return true;
  };

  const processImportResult = (
    responseData: ImportResults,
    params: ImportHandlerParams,
  ) => {
    setImportResults(responseData);
    updateFileStatuses(
      params.selectedFiles,
      responseData,
      params.setSelectedFiles,
    );

    const successCount =
      responseData.success_count || responseData.success_list?.length || 0;
    const failedCount =
      responseData.failed_count || responseData.failed_list?.length || 0;

    setImportProgress({
      totalCount:
        responseData.total_count ||
        params.selectedFiles.filter(f => f.status === 'valid').length,
      successCount,
      failedCount,
      currentProcessing: '',
    });

    if (successCount > 0) {
      const firstWorkflowId = responseData.success_list?.length
        ? responseData.success_list[0].workflow_id
        : null;

      setTimeout(() => {
        showImportResultModal(successCount, failedCount, firstWorkflowId);
      }, DELAY_TIME_MS);
    }
  };

  const handleBatchImport = async (params: ImportHandlerParams) => {
    if (!validateImportRequest(params)) {
      return;
    }

    const validFiles = params.selectedFiles.filter(f => f.status === 'valid');
    setIsImporting(true);
    setImportProgress({
      totalCount: validFiles.length,
      successCount: 0,
      failedCount: 0,
      currentProcessing: validFiles[0]?.fileName || '',
    });

    try {
      const responseData = await callBatchImportAPI(
        validFiles,
        params.spaceId,
        params.importMode,
      );
      processImportResult(responseData, params);
    } catch (error) {
      console.error('批量导入失败:', error);
      alert(error instanceof Error ? error.message : '批量导入失败，请重试');
    } finally {
      setIsImporting(false);
    }
  };

  return {
    isImporting,
    importProgress,
    importResults,
    showResultModal,
    resultModalData,
    setShowResultModal,
    showImportResultModal,
    handleBatchImport,
  };
};
