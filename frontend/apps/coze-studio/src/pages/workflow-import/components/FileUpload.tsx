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

interface FileUploadProps {
  dragActive: boolean;
  isImporting: boolean;
  onFilesSelected: (files: FileList) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  dragActive,
  isImporting,
  onFilesSelected,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFilesSelected(files);
    }
  };

  return (
  <div style={{ marginBottom: '30px' }}>
    <div
      style={{
        border: `2px dashed ${dragActive ? '#667eea' : '#e2e8f0'}`,
        borderRadius: '12px',
        padding: '40px 20px',
        textAlign: 'center',
        background: dragActive ? '#f0f4ff' : '#fafbfc',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        transform: dragActive ? 'scale(1.02)' : 'scale(1)',
      }}
      onClick={() => document.getElementById('file-input')?.click()}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
      <h3
        style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#2d3748',
          marginBottom: '8px',
        }}
      >
        {I18n.t('workflow_import_drag_and_drop')}
      </h3>
      <p
        style={{
          fontSize: '12px',
          color: '#9ca3af',
          marginBottom: '16px',
        }}
      >
        {I18n.t('workflow_import_batch_description')}
      </p>
      <input
        id="file-input"
        type="file"
        multiple
        accept=".json,.yml,.yaml,.zip"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={isImporting}
      />
      <div
        style={{
          display: 'inline-block',
          padding: '12px 24px',
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
  </div>
  );
};

export default FileUpload;
