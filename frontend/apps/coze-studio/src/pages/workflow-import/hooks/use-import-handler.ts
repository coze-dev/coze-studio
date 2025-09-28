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
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { useUserInfo } from '@coze-foundation/account-adapter';

import { t } from '../utils/i18n';
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

interface ImportResultModalData {
  successCount: number;
  failedCount: number;
  firstWorkflowId?: string;
  failedFiles?: Array<{
    file_name: string;
    workflow_name: string;
    error_code: string;
    error_message: string;
    fail_reason?: string;
  }>;
}

export const useImportHandler = () => {
  const navigate = useNavigate();
  const userInfo = useUserInfo();
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
    failedFiles?: Array<{
      file_name: string;
      workflow_name: string;
      error_code: string;
      error_message: string;
      fail_reason?: string;
    }>;
  }>({ successCount: 0, failedCount: 0 });
  const showImportResultModal = (data: ImportResultModalData) => {
    setResultModalData(data);
    setShowResultModal(true);
  };
  const navigateToWorkflow = (workflowId: string, spaceId: string) => {
    navigate(`/work_flow?workflow_id=${workflowId}&space_id=${spaceId}`);
  };
  const validateImportRequest = (params: ImportHandlerParams): boolean => {
    if (!params.spaceId) {
      alert(t('missing_workspace_id') || '缺少工作空间ID，请重新进入页面');
      return false;
    }
    if (params.selectedFiles.length === 0) {
      alert(t('please_select_files') || 'Please select files first');
      return false;
    }
    const nameErrors = validateFiles(params.selectedFiles);
    if (nameErrors.length > 0) {
      alert(
        `${t('name_validation_failed') || '名称验证失败'}:\n${nameErrors.join('\n')}`,
      );
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
        (responseData as ImportResults & { total_count?: number })
          .total_count ||
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
        showImportResultModal({
          successCount,
          failedCount,
          firstWorkflowId: firstWorkflowId || undefined,
          failedFiles: responseData.failed_list,
        });
      }, DELAY_TIME_MS);
    } else if (failedCount > 0) {
      // 如果没有成功的文件但有失败的文件，也显示结果模态框
      setTimeout(() => {
        showImportResultModal({
          successCount,
          failedCount,
          firstWorkflowId: undefined,
          failedFiles: responseData.failed_list,
        });
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
      const responseData = await callBatchImportAPI({
        validFiles,
        spaceId: params.spaceId,
        importMode: params.importMode,
        creatorId: (userInfo as { uid?: string })?.uid,
      });
      processImportResult(responseData, params);
    } catch (error) {
      console.error(t('batch_import_failed') || '批量导入失败:', error);
      alert(
        error instanceof Error
          ? error.message
          : t('batch_import_failed_retry') || '批量导入失败，请重试',
      );
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
    navigateToWorkflow,
    handleBatchImport,
  };
};
