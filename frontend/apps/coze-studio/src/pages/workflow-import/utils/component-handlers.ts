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

import type React from 'react';

import type { WorkflowFile } from '../types';

export interface ImportHandlers {
  handleGoBack: () => void;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleImport: () => void;
  handleConfirmResult: () => void;
  handleCancelResult: () => void;
}

export interface ImportHandlerParams {
  navigate: (path: string) => void;
  spaceId: string | undefined;
  addFiles: (files: File[]) => void;
  selectedFiles: WorkflowFile[];
  importMode: 'batch' | 'transaction';
  setSelectedFiles: React.Dispatch<React.SetStateAction<WorkflowFile[]>>;
  handleBatchImport: (params: {
    selectedFiles: WorkflowFile[];
    spaceId: string;
    importMode: 'batch' | 'transaction';
    setSelectedFiles: React.Dispatch<React.SetStateAction<WorkflowFile[]>>;
  }) => void;
  resultModalData: { firstWorkflowId?: string };
  navigateToWorkflow: (workflowId: string, spaceId: string) => void;
  setShowResultModal: (show: boolean) => void;
}

export const createImportHandlers = (
  params: ImportHandlerParams,
): ImportHandlers => ({
  handleGoBack: () => {
    params.navigate(`/space/${params.spaceId}/library`);
  },

  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    params.addFiles(files);
  },

  handleImport: () => {
    if (!params.spaceId) {
      return;
    }
    params.handleBatchImport({
      selectedFiles: params.selectedFiles,
      spaceId: params.spaceId,
      importMode: params.importMode,
      setSelectedFiles: params.setSelectedFiles,
    });
  },

  handleConfirmResult: () => {
    if (params.resultModalData.firstWorkflowId && params.spaceId) {
      params.navigateToWorkflow(params.resultModalData.firstWorkflowId, params.spaceId);
    }
    params.setShowResultModal(false);
  },

  handleCancelResult: () => {
    params.setShowResultModal(false);
  },
});