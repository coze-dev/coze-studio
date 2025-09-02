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
      return '等待中';
    case 'validating':
      return '验证中...';
    case 'valid':
      return '✅ 有效';
    case 'invalid':
      return '❌ 无效';
    case 'importing':
      return '导入中...';
    case 'success':
      return '✅ 导入成功';
    case 'failed':
      return '❌ 导入失败';
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
        需要检查
      </span>
    )}
  </>
);

export default FileStatus;
