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
import { Button, LoadingButton } from '@coze-arch/coze-design';

import FileUpload from './FileUpload';
import FileList from './FileList';
import type { WorkflowFile } from '../types';

interface DragHandlers {
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
}

interface ImportHandlers {
  handleFileSelect: (files: FileList) => void;
}

interface ImportFormProps {
  visible: boolean;
  selectedFiles: WorkflowFile[];
  isImporting: boolean;
  validFileCount: number;
  dragActive: boolean;
  dragHandlers: DragHandlers;
  importHandlers: ImportHandlers;
  onCancel: () => void;
  onImport: () => void;
  onRemoveFile: (id: string) => void;
  onUpdateWorkflowName: (id: string, name: string) => void;
  onClearAll: () => void;
}

const ImportModalOverlay: React.FC<{
  children: React.ReactNode;
  onCancel: () => void;
  isImporting: boolean;
}> = ({ children, onCancel, isImporting }) => (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      overflow: 'hidden',
      paddingTop: '0',
      paddingBottom: '0',
      boxSizing: 'border-box',
    }}
    onClick={e => {
      if (e.target === e.currentTarget && !isImporting) {
        onCancel();
      }
    }}
  >
    {children}
  </div>
);

const ImportModalContent: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <div
    style={{
      width: '800px',
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      maxHeight: '80vh',
      overflow: 'visible',
      boxSizing: 'border-box',
    }}
    onClick={e => e.stopPropagation()}
  >
    {children}
  </div>
);

const ImportButtons: React.FC<{
  isImporting: boolean;
  validFileCount: number;
  onCancel: () => void;
  onImport: () => void;
}> = ({ isImporting, validFileCount, onCancel, onImport }) => (
  <div
    style={{
      marginTop: '32px',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '16px',
    }}
  >
    <Button
      onClick={onCancel}
      disabled={isImporting}
      style={{
        borderColor: '#d1d5db',
        color: '#6b7280',
        backgroundColor: 'white',
        fontWeight: '500',
      }}
      onMouseEnter={e => {
        if (!isImporting) {
          e.currentTarget.style.borderColor = '#9ca3af';
          e.currentTarget.style.color = '#374151';
        }
      }}
      onMouseLeave={e => {
        if (!isImporting) {
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.color = '#6b7280';
        }
      }}
    >
      {I18n.t('workflow_import_cancel')}
    </Button>

    <LoadingButton
      type="primary"
      loading={isImporting}
      disabled={validFileCount === 0}
      onClick={onImport}
      style={{
        backgroundColor:
          isImporting || validFileCount === 0 ? '#94a3b8' : '#10b981',
        borderColor:
          isImporting || validFileCount === 0 ? '#94a3b8' : '#10b981',
        fontWeight: '600',
        boxShadow:
          isImporting || validFileCount === 0
            ? 'none'
            : '0 2px 8px rgba(16, 185, 129, 0.25)',
      }}
      onMouseEnter={e => {
        if (!isImporting && validFileCount > 0) {
          e.currentTarget.style.backgroundColor = '#059669';
          e.currentTarget.style.borderColor = '#059669';
          e.currentTarget.style.boxShadow =
            '0 4px 12px rgba(16, 185, 129, 0.35)';
        }
      }}
      onMouseLeave={e => {
        if (!isImporting && validFileCount > 0) {
          e.currentTarget.style.backgroundColor = '#10b981';
          e.currentTarget.style.borderColor = '#10b981';
          e.currentTarget.style.boxShadow =
            '0 2px 8px rgba(16, 185, 129, 0.25)';
        }
      }}
    >
      {isImporting
        ? I18n.t('workflow_import_importing')
        : I18n.t('workflow_import_button_import', {
            count: validFileCount.toString(),
          })}
    </LoadingButton>
  </div>
);

const ImportForm: React.FC<ImportFormProps> = ({
  visible,
  selectedFiles,
  isImporting,
  validFileCount,
  dragActive,
  dragHandlers,
  importHandlers,
  onCancel,
  onImport,
  onRemoveFile,
  onUpdateWorkflowName,
  onClearAll,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <ImportModalOverlay onCancel={onCancel} isImporting={isImporting}>
      <ImportModalContent>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '600',
              margin: 0,
              color: '#2d3748',
            }}
          >
            {I18n.t('workflow_import')}
          </h2>
        </div>

        <FileUpload
          dragActive={dragActive}
          isImporting={isImporting}
          onFilesSelected={importHandlers.handleFileSelect}
          onDragEnter={dragHandlers.handleDragEnter}
          onDragLeave={dragHandlers.handleDragLeave}
          onDragOver={dragHandlers.handleDragOver}
          onDrop={dragHandlers.handleDrop}
        />

        {selectedFiles.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <FileList
              selectedFiles={selectedFiles}
              isImporting={isImporting}
              onRemoveFile={onRemoveFile}
              onUpdateWorkflowName={onUpdateWorkflowName}
              onClearAll={onClearAll}
            />
          </div>
        )}

        <ImportButtons
          isImporting={isImporting}
          validFileCount={validFileCount}
          onCancel={onCancel}
          onImport={onImport}
        />
      </ImportModalContent>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </ImportModalOverlay>
  );
};

export default ImportForm;
