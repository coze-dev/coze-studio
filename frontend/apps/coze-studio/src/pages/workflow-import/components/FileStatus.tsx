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

interface FileStatusProps {
  status: WorkflowFile['status'];
}

const getFileStatusStyle = (status: WorkflowFile['status']) => {
  const baseStyle = {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
  };

  switch (status) {
    case 'pending':
      return { ...baseStyle, background: '#f3f4f6', color: '#6b7280' };
    case 'validating':
      return { ...baseStyle, background: '#fef3c7', color: '#92400e' };
    case 'valid':
      return { ...baseStyle, background: '#d1fae5', color: '#065f46' };
    case 'invalid':
      return { ...baseStyle, background: '#fee2e2', color: '#dc2626' };
    case 'importing':
      return { ...baseStyle, background: '#dbeafe', color: '#1e40af' };
    case 'success':
      return { ...baseStyle, background: '#d1fae5', color: '#065f46' };
    case 'failed':
      return { ...baseStyle, background: '#fee2e2', color: '#dc2626' };
    default:
      return baseStyle;
  }
};

const getStatusText = (status: WorkflowFile['status']) => {
  switch (status) {
    case 'pending':
      return t('file_status_pending');
    case 'validating':
      return t('file_status_validating');
    case 'valid':
      return t('file_status_valid');
    case 'invalid':
      return t('file_status_invalid');
    case 'importing':
      return t('file_status_importing');
    case 'success':
      return t('file_status_success');
    case 'failed':
      return t('file_status_failed');
    default:
      return '';
  }
};

const FileStatus: React.FC<FileStatusProps> = ({ status }) => (
  <>
    <span style={getFileStatusStyle(status)}>{getStatusText(status)}</span>
    {status === 'failed' && (
      <span
        style={{
          background: '#fee2e2',
          color: '#dc2626',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '600',
        }}
      >
        {t('file_status_needs_check')}
      </span>
    )}
  </>
);

export default FileStatus;
