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

interface ImportResultModalProps {
  visible: boolean;
  successCount: number;
  failedCount: number;
  firstWorkflowId?: string;
  spaceId?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const getModalContent = (successCount: number, failedCount: number) => {
  const totalCount = successCount + failedCount;
  const hasSuccess = successCount > 0;
  const hasFailure = failedCount > 0;

  if (hasSuccess && hasFailure) {
    return {
      title: '导入部分完成',
      message: `共导入 ${totalCount} 个文件，成功 ${successCount} 个，失败 ${failedCount} 个`,
      icon: '⚠️',
      color: '#faad14',
    };
  } else if (hasSuccess) {
    return {
      title: '导入成功',
      message: `成功导入 ${successCount} 个工作流`,
      icon: '✅',
      color: '#52c41a',
    };
  } else {
    return {
      title: '导入失败',
      message: `导入失败，共 ${failedCount} 个文件未能成功导入`,
      icon: '❌',
      color: '#ff4d4f',
    };
  }
};

const ImportResultModal: React.FC<ImportResultModalProps> = ({
  visible,
  successCount,
  failedCount,
  firstWorkflowId,
  onConfirm,
  onCancel,
}) => {
  if (!visible) {
    return null;
  }

  const { title, message, icon, color } = getModalContent(successCount, failedCount);
  const hasSuccess = successCount > 0;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          minWidth: '400px',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ fontSize: '48px', color, marginBottom: '16px' }}>
          {icon}
        </div>
        
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#1f2937',
            marginBottom: '12px',
            margin: 0,
          }}
        >
          {title}
        </h2>
        
        <p
          style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '24px',
            lineHeight: '1.5',
          }}
        >
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 20px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            关闭
          </button>
          
          {hasSuccess && firstWorkflowId && (
            <button
              onClick={onConfirm}
              style={{
                padding: '8px 20px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#3b82f6',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }}
            >
              查看工作流
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportResultModal;