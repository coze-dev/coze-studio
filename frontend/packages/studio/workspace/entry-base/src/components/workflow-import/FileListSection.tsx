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
        <div
          key={file.id}
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
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                {file.fileName}
              </div>
              <input
                type="text"
                value={file.workflowName}
                onChange={e => {
                  onFilesChange(
                    selectedFiles.map(f =>
                      f.id === file.id
                        ? { ...f, workflowName: e.target.value }
                        : f,
                    ),
                  );
                }}
                placeholder={I18n.t(
                  'workflow_import_workflow_name_placeholder',
                )}
                disabled={isImporting}
                style={{
                  width: '300px',
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
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
      ))}
    </div>
  </div>
);

export default FileListSection;
