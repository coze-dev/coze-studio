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

import { t } from '../utils/i18n';
import type { WorkflowFile } from '../types';

interface FileErrorProps {
  file: WorkflowFile;
}

const FileError: React.FC<FileErrorProps> = ({ file }) => {
  if (!file.error && file.status !== 'failed' && file.status !== 'invalid') {
    return null;
  }

  return (
    <div
      style={{
        background: file.status === 'failed' ? '#fef2f2' : '#fed7d7',
        border: `1px solid ${file.status === 'failed' ? '#fecaca' : '#feb2b2'}`,
        color: '#c53030',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '14px',
        marginTop: '8px',
        lineHeight: '1.4',
      }}
    >
      <div
        style={{
          fontWeight: '600',
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        🚨 {file.status === 'failed' ? t('file_error_import_failed') : t('file_error_invalid_file')}
      </div>
      <div>{file.error || t('file_error_unknown')}</div>
      {file.status === 'failed' && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px',
            background: '#fee2e2',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          {t('file_error_suggestion')}
        </div>
      )}
    </div>
  );
};

export default FileError;
