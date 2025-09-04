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

import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { Modal, Button, LoadingButton } from '@coze-arch/coze-design';

import { useWorkflowImportModal } from './workflow-import/use-workflow-import-modal';
import ImportResultModalSection from './workflow-import/ImportResultModalSection';
import FileUploadSection from './workflow-import/FileUploadSection';
import FileListSection from './workflow-import/FileListSection';

interface WorkflowImportModalProps {
  visible: boolean;
  onCancel: () => void;
}

const MODAL_WIDTHS = {
  FORM: 800,
  RESULT: 600,
};

const WorkflowImportModal: React.FC<WorkflowImportModalProps> = ({
  visible,
  onCancel,
}) => {
  const {
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
  } = useWorkflowImportModal();

  const handleModalCancel = () => {
    handleClose();
    onCancel();
  };

  return (
    <>
      <Modal
        title={
          showImportForm
            ? I18n.t('workflow_import')
            : I18n.t('workflow_import_result')
        }
        visible={visible && (showImportForm || isImporting)}
        onCancel={handleModalCancel}
        width={showImportForm ? MODAL_WIDTHS.FORM : MODAL_WIDTHS.RESULT}
        footer={
          showImportForm ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <Button
                onClick={handleModalCancel}
                disabled={isImporting}
                style={{
                  borderColor: '#d1d5db',
                  color: '#6b7280',
                  backgroundColor: 'white',
                  fontWeight: '500',
                }}
              >
                {I18n.t('workflow_import_cancel')}
              </Button>
              <LoadingButton
                type="primary"
                loading={isImporting}
                disabled={validFileCount === 0}
                onClick={handleImport}
                style={{
                  backgroundColor:
                    isImporting || validFileCount === 0 ? '#94a3b8' : '#10b981',
                  borderColor:
                    isImporting || validFileCount === 0 ? '#94a3b8' : '#10b981',
                  fontWeight: '600',
                }}
              >
                {isImporting
                  ? I18n.t('workflow_import_importing')
                  : I18n.t('workflow_import_button_import', {
                      count: validFileCount.toString(),
                    })}
              </LoadingButton>
            </div>
          ) : null
        }
      >
        {showImportForm ? (
          <>
            <FileUploadSection
              dragActive={dragActive}
              isImporting={isImporting}
              onFilesSelected={handleFilesSelected}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
            {selectedFiles.length > 0 && (
              <FileListSection
                selectedFiles={selectedFiles}
                isImporting={isImporting}
                onFilesChange={setSelectedFiles}
              />
            )}
          </>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>⏳</div>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
              }}
            >
              {I18n.t('workflow_import_importing')}
            </h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '0' }}>
              {I18n.t('workflow_import_importing')}
            </p>
          </div>
        )}
      </Modal>

      <ImportResultModalSection
        visible={showResultModal}
        resultModalData={resultModalData}
        onClose={handleResultClose}
        onViewWorkflow={handleViewWorkflow}
      />
    </>
  );
};

export default WorkflowImportModal;
