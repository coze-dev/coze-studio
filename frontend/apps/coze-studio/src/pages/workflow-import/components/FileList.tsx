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

import React, { useState, useCallback } from 'react';

import { I18n } from '@coze-arch/i18n';

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
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 50;

const validateWorkflowName = (
  name: string,
): { isValid: boolean; message?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: '工作流名称不能为空' };
  }

  const trimmedName = name.trim();
  if (trimmedName.length < MIN_NAME_LENGTH) {
    return {
      isValid: false,
      message: `工作流名称至少需要${MIN_NAME_LENGTH}个字符`,
    };
  }

  if (trimmedName.length > MAX_NAME_LENGTH) {
    return {
      isValid: false,
      message: `工作流名称不能超过${MAX_NAME_LENGTH}个字符`,
    };
  }

  if (!/^[a-zA-Z0-9\u4e00-\u9fa5_\-\s]+$/.test(trimmedName)) {
    return {
      isValid: false,
      message: '工作流名称只能包含中文、英文、数字、下划线、短横线和空格',
    };
  }

  return { isValid: true };
};

const WorkflowNameInput: React.FC<{
  file: WorkflowFile;
  isImporting: boolean;
  onUpdateName: (id: string, name: string) => void;
}> = ({ file, isImporting, onUpdateName }) => {
  const [nameError, setNameError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleNameChange = useCallback(
    (value: string) => {
      onUpdateName(file.id, value);

      if (value.trim().length > 0) {
        const validation = validateWorkflowName(value);
        setNameError(validation.isValid ? null : validation.message || null);
      } else {
        setNameError(null);
      }
    },
    [file.id, onUpdateName],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (file.workflowName.trim().length > 0) {
      const validation = validateWorkflowName(file.workflowName);
      setNameError(validation.isValid ? null : validation.message || null);
    }
  }, [file.workflowName]);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
      <label
        style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          lineHeight: '34px',
          minWidth: '80px',
        }}
      >
        工作流名称：
      </label>
      <div style={{ flex: 1 }}>
        <input
          type="text"
          value={file.workflowName}
          onChange={e => handleNameChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={I18n.t('workflow_import_workflow_name_placeholder')}
          disabled={isImporting}
          style={{
            width: '250px',
            padding: '8px 12px',
            border: `1px solid ${
              nameError ? '#ef4444' : isFocused ? '#3b82f6' : '#e2e8f0'
            }`,
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s ease',
          }}
        />
      </div>
      <div style={{ minWidth: '200px', paddingLeft: '8px' }}>
        {nameError ? (
          <div
            style={{
              fontSize: '12px',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>⚠️</span>
            {nameError}
          </div>
        ) : null}
      </div>
    </div>
  );
};

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
            <WorkflowNameInput
              file={file}
              isImporting={isImporting}
              onUpdateName={onUpdateName}
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
