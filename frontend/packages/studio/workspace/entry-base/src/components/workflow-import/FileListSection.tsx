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
import { Button } from '@coze-arch/coze-design';

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

interface FileListSectionProps {
  selectedFiles: WorkflowFile[];
  isImporting: boolean;
  onFilesChange: (files: WorkflowFile[]) => void;
}

const validateWorkflowName = (
  name: string,
): { isValid: boolean; message?: string } => {
  const MIN_NAME_LENGTH = 2;
  const MAX_NAME_LENGTH = 50;

  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      message:
        I18n.t('workflow_import_workflow_name_required') ||
        'Workflow name cannot be empty',
    };
  }

  const trimmedName = name.trim();
  if (trimmedName.length < MIN_NAME_LENGTH) {
    return {
      isValid: false,
      message:
        I18n.t('workflow_import_workflow_name_min_length') ||
        `Workflow name must be at least ${MIN_NAME_LENGTH} characters`,
    };
  }

  if (trimmedName.length > MAX_NAME_LENGTH) {
    return {
      isValid: false,
      message:
        I18n.t('workflow_import_workflow_name_max_length') ||
        `Workflow name cannot exceed ${MAX_NAME_LENGTH} characters`,
    };
  }

  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(trimmedName)) {
    return {
      isValid: false,
      message:
        I18n.t('workflow_name_invalid_chars') ||
        'Workflow name must start with a letter and can only contain letters, numbers and underscores',
    };
  }

  return { isValid: true };
};

const FileItem: React.FC<{
  file: WorkflowFile;
  isImporting: boolean;
  selectedFiles: WorkflowFile[];
  onFilesChange: (files: WorkflowFile[]) => void;
}> = ({ file, isImporting, selectedFiles, onFilesChange }) => {
  const [nameError, setNameError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleNameChange = useCallback(
    (value: string) => {
      onFilesChange(
        selectedFiles.map(f =>
          f.id === file.id ? { ...f, workflowName: value } : f,
        ),
      );

      // 总是执行验证，显示相应的错误消息
      const validation = validateWorkflowName(value);
      setNameError(validation.isValid ? null : validation.message || null);
    },
    [file.id, selectedFiles, onFilesChange],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // 总是执行验证，确保错误提示正确显示
    const validation = validateWorkflowName(file.workflowName);
    setNameError(validation.isValid ? null : validation.message || null);
  }, [file.workflowName]);

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '8px',
        backgroundColor: '#fafbfc',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '500', marginBottom: '8px' }}>
            {file.fileName}
          </div>
          <div
            style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}
          >
            <label
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                lineHeight: '28px',
                minWidth: '80px',
              }}
            >
              {I18n.t('workflow_import_workflow_name')}:
            </label>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                value={file.workflowName}
                onChange={e => handleNameChange(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={I18n.t(
                  'workflow_import_workflow_name_placeholder',
                )}
                disabled={isImporting}
                style={{
                  width: '200px',
                  padding: '6px 8px',
                  border: `1px solid ${
                    nameError ? '#ef4444' : isFocused ? '#3b82f6' : '#d1d5db'
                  }`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
              />
            </div>
            <div style={{ minWidth: '180px', paddingLeft: '8px' }}>
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
        </div>
        <Button
          onClick={() =>
            onFilesChange(selectedFiles.filter(f => f.id !== file.id))
          }
          disabled={isImporting}
          size="small"
          style={{
            borderColor: '#ef4444',
            borderWidth: '1.5px',
            color: '#ef4444',
            backgroundColor: 'white',
            fontWeight: '500',
            boxShadow: '0 1px 2px rgba(239, 68, 68, 0.1)',
          }}
        >
          {I18n.t('workflow_import_delete')}
        </Button>
      </div>
    </div>
  );
};

const FileListSection: React.FC<FileListSectionProps> = ({
  selectedFiles,
  isImporting,
  onFilesChange,
}) => (
  <div style={{ marginBottom: '24px' }}>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}
    >
      <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
        {I18n.t('workflow_import_file_list')} ({selectedFiles.length})
      </h3>
      <Button
        onClick={() => onFilesChange([])}
        disabled={isImporting}
        size="small"
        style={{
          borderColor: '#ef4444',
          borderWidth: '1.5px',
          color: '#ef4444',
          backgroundColor: 'white',
          fontWeight: '500',
          boxShadow: '0 1px 2px rgba(239, 68, 68, 0.1)',
        }}
      >
        {I18n.t('workflow_import_clear_all')}
      </Button>
    </div>

    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
      {selectedFiles.map(file => (
        <FileItem
          key={file.id}
          file={file}
          isImporting={isImporting}
          selectedFiles={selectedFiles}
          onFilesChange={onFilesChange}
        />
      ))}
    </div>
  </div>
);

export default FileListSection;
