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

import type { WorkflowFile } from '../types';
import FileStatus from './FileStatus';
import FilePreview from './FilePreview';
import FileError from './FileError';

interface FileListProps {
  selectedFiles: WorkflowFile[];
  isImporting: boolean;
  onRemoveFile: (id: string) => void;
  onUpdateWorkflowName: (id: string, name: string) => void;
  onClearAll: () => void;
}

const OPACITY_DISABLED = 0.6;

const FileItem: React.FC<{
  file: WorkflowFile;
  isImporting: boolean;
  onRemove: (id: string) => void;
  onUpdateName: (id: string, name: string) => void;
}> = ({ file, isImporting, onRemove, onUpdateName }) => (
  <div
    style={{
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      background: 'white',
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px',
          }}
        >
          <span style={{ fontWeight: '600', color: '#2d3748' }}>
            {file.fileName}
          </span>
          <FileStatus status={file.status} />
        </div>

        {file.status === 'valid' && (
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              value={file.workflowName}
              onChange={e => onUpdateName(file.id, e.target.value)}
              placeholder="工作流名称"
              disabled={isImporting}
              style={{
                width: '300px',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>
        )}

        <FilePreview preview={file.preview} />
        <FileError file={file} />
      </div>

      <button
        onClick={() => onRemove(file.id)}
        disabled={isImporting}
        style={{
          padding: '6px',
          background: 'transparent',
          border: 'none',
          fontSize: '18px',
          cursor: isImporting ? 'not-allowed' : 'pointer',
          color: '#e53e3e',
          opacity: isImporting ? OPACITY_DISABLED : 1,
        }}
      >
        ❌
      </button>
    </div>
  </div>
);

const FileList: React.FC<FileListProps> = ({
  selectedFiles,
  isImporting,
  onRemoveFile,
  onUpdateWorkflowName,
  onClearAll,
}) => {
  const validFileCount = selectedFiles.filter(f => f.status === 'valid').length;
  const failedFileCount = selectedFiles.filter(
    f => f.status === 'failed',
  ).length;

  return (
    <div style={{ marginBottom: '30px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#2d3748',
          }}
        >
          文件列表 ({selectedFiles.length}) - 有效: {validFileCount}
          {failedFileCount > 0 && (
            <span
              style={{
                color: '#dc2626',
                fontSize: '14px',
                fontWeight: '500',
                marginLeft: '10px',
              }}
            >
              失败: {failedFileCount}
            </span>
          )}
        </h3>
        <button
          onClick={onClearAll}
          disabled={isImporting}
          style={{
            padding: '8px 16px',
            background: '#e2e8f0',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: isImporting ? 'not-allowed' : 'pointer',
            opacity: isImporting ? OPACITY_DISABLED : 1,
          }}
        >
          清空全部
        </button>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {selectedFiles.map(file => (
          <FileItem
            key={file.id}
            file={file}
            isImporting={isImporting}
            onRemove={onRemoveFile}
            onUpdateName={onUpdateWorkflowName}
          />
        ))}
      </div>
    </div>
  );
};

export default FileList;
