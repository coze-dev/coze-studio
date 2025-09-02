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

import { useImportHandler } from './workflow-import/hooks/use-import-handler';
import { useFileProcessor } from './workflow-import/hooks/use-file-processor';
import { createDragHandlers } from './workflow-import/utils/drag-handlers';
import { createImportHandlers } from './workflow-import/utils/component-handlers';
import ImportModeSelector from './workflow-import/components/ImportModeSelector';
import ImportHelp from './workflow-import/components/ImportHelp';
import ImportHeader from './workflow-import/components/ImportHeader';
import ImportButtons from './workflow-import/components/ImportButtons';
import ImportResultModal from './workflow-import/components/ImportResultModal';
import FileUpload from './workflow-import/components/FileUpload';
import FileList from './workflow-import/components/FileList';

const WorkflowImport: React.FC = () => {
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

  const [importMode, setImportMode] = useState<'batch' | 'transaction'>('batch');
  const [dragActive, setDragActive] = useState(false);

  const dragHandlers = createDragHandlers(setDragActive, addFiles);
  const importHandlers = createImportHandlers({
    navigate,
    spaceId: space_id,
    addFiles,
    selectedFiles,
    importMode,
    setSelectedFiles,
    handleBatchImport,
    resultModalData,
    navigateToWorkflow,
    setShowResultModal,
  });

  const validFileCount = selectedFiles.filter(f => f.status === 'valid').length;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        }}
      >
        <ImportHeader onGoBack={importHandlers.handleGoBack} />

        <ImportModeSelector
          importMode={importMode}
          isImporting={isImporting}
          onChange={setImportMode}
        />

        <FileUpload
          dragActive={dragActive}
          isImporting={isImporting}
          onFileSelect={importHandlers.handleFileSelect}
          onDragEnter={dragHandlers.handleDragEnter}
          onDragLeave={dragHandlers.handleDragLeave}
          onDragOver={dragHandlers.handleDragOver}
          onDrop={dragHandlers.handleDrop}
        />

        {selectedFiles.length > 0 && (
          <FileList
            selectedFiles={selectedFiles}
            isImporting={isImporting}
            onRemoveFile={removeFile}
            onUpdateWorkflowName={updateWorkflowName}
            onClearAll={clearAllFiles}
          />
        )}

        <ImportButtons
          isImporting={isImporting}
          validFileCount={validFileCount}
          onGoBack={importHandlers.handleGoBack}
          onImport={importHandlers.handleImport}
        />

        <ImportHelp />
      </div>

      <ImportResultModal
        visible={showResultModal}
        successCount={resultModalData.successCount}
        failedCount={resultModalData.failedCount}
        firstWorkflowId={resultModalData.firstWorkflowId}
        spaceId={space_id}
        onConfirm={importHandlers.handleConfirmResult}
        onCancel={importHandlers.handleCancelResult}
      />

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default WorkflowImport;
