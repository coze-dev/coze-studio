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

interface FileUploadSectionProps {
  dragActive: boolean;
  isImporting: boolean;
  onFilesSelected: (files: FileList) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

const DISABLED_OPACITY = 0.6;

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  dragActive,
  isImporting,
  onFilesSelected,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}) => (
  <div
    style={{
      border: `2px dashed ${dragActive ? '#667eea' : '#cbd5e0'}`,
      borderRadius: '12px',
      padding: '48px 24px',
      textAlign: 'center',
      backgroundColor: dragActive ? '#f0f4ff' : '#f9fafb',
      transition: 'all 0.3s ease',
      cursor: isImporting ? 'not-allowed' : 'pointer',
      opacity: isImporting ? DISABLED_OPACITY : 1,
      marginBottom: '24px',
    }}
    onDragEnter={onDragEnter}
    onDragLeave={onDragLeave}
    onDragOver={onDragOver}
    onDrop={onDrop}
    onClick={() =>
      !isImporting && document.getElementById('file-input')?.click()
    }
  >
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
    <h3
      style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: '8px',
      }}
    >
      {I18n.t('workflow_import_drag_and_drop')}
    </h3>
    <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '16px' }}>
      {I18n.t('workflow_import_batch_description')}
    </p>
    <input
      id="file-input"
      type="file"
      multiple
      accept=".json,.yml,.yaml,.zip"
      onChange={e => {
        const { files } = e.target;
        if (files && files.length > 0) {
          onFilesSelected(files);
        }
      }}
      style={{ display: 'none' }}
      disabled={isImporting}
    />
    <div
      style={{
        display: 'inline-block',
        padding: '10px 24px',
        background: '#667eea',
        color: 'white',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
      }}
    >
      {I18n.t('workflow_import_select_file')}
    </div>
  </div>
);

export default FileUploadSection;
