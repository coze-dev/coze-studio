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

import { useParams, useNavigate } from 'react-router-dom';
import type React from 'react';
import { useState, useCallback } from 'react';

import { useUserInfo } from '@coze-foundation/account-adapter';

import { handleBatchImport } from './ImportHandler';
import { processFiles } from './FileProcessor';

interface WorkflowFile {
  id: string;
  fileName: string;
  workflowName: string;
  originalContent: string;
  workflowData: string;
  status:
    | 'pending'
    | 'validating'
    | 'valid'
    | 'invalid'
    | 'importing'
    | 'success'
    | 'failed';
  error?: string;
}

export const useWorkflowImportModal = () => {
  const { space_id } = useParams<{ space_id: string }>();
  const navigate = useNavigate();
  const userInfo = useUserInfo();

  const [selectedFiles, setSelectedFiles] = useState<WorkflowFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showImportForm, setShowImportForm] = useState(true);
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

  const handleFilesSelected = useCallback((files: FileList) => {
    processFiles(files, setSelectedFiles);
  }, []);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      handleFilesSelected(files);
    }
  };

  const handleImport = async () => {
    if (!space_id) {
      return;
    }

    await handleBatchImport({
      selectedFiles,
      spaceId: space_id,
      userInfo,
      setShowImportForm,
      setIsImporting,
      setResultModalData,
      setShowResultModal,
    });
  };

  const handleClose = () => {
    if (!isImporting) {
      setSelectedFiles([]);
      setShowImportForm(true);
      setShowResultModal(false);
    }
  };

  const handleViewWorkflow = () => {
    if (resultModalData.firstWorkflowId && space_id) {
      navigate(
        `/work_flow?workflow_id=${resultModalData.firstWorkflowId}&space_id=${space_id}`,
      );
      setShowResultModal(false);
      handleClose();
    }
  };

  const handleResultClose = () => {
    setShowResultModal(false);
    handleClose();
  };

  const validFileCount = selectedFiles.filter(f => f.status === 'valid').length;

  return {
    selectedFiles,
    setSelectedFiles,
    dragActive,
    isImporting,
    showResultModal,
    showImportForm,
    resultModalData,
    validFileCount,
    handleFilesSelected,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleImport,
    handleClose,
    handleViewWorkflow,
    handleResultClose,
  };
};
