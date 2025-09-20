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

import { useNavigate, useParams } from 'react-router-dom';
import React, { useState } from 'react';

import { createDragHandlers } from './workflow-import/utils/drag-handlers';
import { createImportHandlers } from './workflow-import/utils/component-handlers';
import { useImportHandler } from './workflow-import/hooks/use-import-handler';
import { useFileProcessor } from './workflow-import/hooks/use-file-processor';
import ImportResultModal from './workflow-import/components/ImportResultModal';
import ImportForm from './workflow-import/components/ImportForm';

interface WorkflowImportProps {
  visible: boolean;
  onCancel: () => void;
}

const WorkflowImport: React.FC<WorkflowImportProps> = ({
  visible,
  onCancel,
}) => {
  const navigate = useNavigate();
  const { space_id } = useParams<{ space_id: string }>();

  const {
    selectedFiles,
    addFiles,
    removeFile,
    updateWorkflowName,
    clearAllFiles,
    setSelectedFiles,
  } = useFileProcessor();

  const {
    isImporting,
    showResultModal,
    resultModalData,
    setShowResultModal,
    navigateToWorkflow,
    handleBatchImport,
  } = useImportHandler();

  const [dragActive, setDragActive] = useState(false);

  const dragHandlers = createDragHandlers(setDragActive, addFiles);
  const importHandlers = createImportHandlers({
    navigate,
    spaceId: space_id,
    addFiles,
    selectedFiles,
    importMode: 'batch',
    setSelectedFiles,
    handleBatchImport,
    resultModalData,
    navigateToWorkflow,
    setShowResultModal,
  });

  const validFileCount = selectedFiles.filter(f => f.status === 'valid').length;

  const handleImport = () => {
    if (!space_id) {
      alert('Missing workspace ID');
      return;
    }

    handleBatchImport({
      selectedFiles,
      spaceId: space_id,
      importMode: 'batch',
      setSelectedFiles,
    });
  };

  const handleResultCancel = () => {
    setShowResultModal(false);
    onCancel();
  };

  const handleViewWorkflow = () => {
    if (resultModalData.firstWorkflowId && space_id) {
      navigate(
        `/work_flow?workflow_id=${resultModalData.firstWorkflowId}&space_id=${space_id}`,
      );
      setShowResultModal(false);
      onCancel();
    }
  };

  return (
    <>
      <ImportResultModal
        visible={showResultModal}
        resultModalData={resultModalData}
        onCancel={handleResultCancel}
        onViewWorkflow={handleViewWorkflow}
      />

      <ImportForm
        visible={visible && !showResultModal}
        selectedFiles={selectedFiles}
        isImporting={isImporting}
        validFileCount={validFileCount}
        dragActive={dragActive}
        dragHandlers={dragHandlers}
        importHandlers={importHandlers}
        onCancel={onCancel}
        onImport={handleImport}
        onRemoveFile={removeFile}
        onUpdateWorkflowName={updateWorkflowName}
        onClearAll={clearAllFiles}
      />
    </>
  );
};

export default WorkflowImport;
export type { WorkflowImportProps };
