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

interface FailedFile {
  file_name: string;
  workflow_name: string;
  error_code: string;
  error_message: string;
  fail_reason?: string;
}

interface ResultModalData {
  successCount: number;
  failedCount: number;
  firstWorkflowId?: string;
  failedFiles?: FailedFile[];
}

interface ImportResultModalSectionProps {
  visible: boolean;
  resultModalData: ResultModalData;
  onClose: () => void;
  onViewWorkflow: () => void;
}

const ResultIcon: React.FC<{ successCount: number; failedCount: number }> = ({
  successCount,
  failedCount,
}) => {
  const getIcon = () => {
    if (successCount > 0 && failedCount > 0) {
      return '⚠️';
    }
    if (successCount > 0) {
      return '✅';
    }
    return '❌';
  };

  return (
    <div
      style={{
        textAlign: 'center',
        fontSize: '48px',
        marginBottom: '16px',
        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
      }}
    >
      {getIcon()}
    </div>
  );
};

const ResultTitle: React.FC<{ successCount: number; failedCount: number }> = ({
  successCount,
  failedCount,
}) => {
  const getTitle = () => {
    if (successCount > 0 && failedCount > 0) {
      return I18n.t('workflow_import_partial_complete');
    }
    if (successCount > 0) {
      return I18n.t('workflow_import_success');
    }
    return I18n.t('workflow_import_failed');
  };

  return (
    <h2
      style={{
        fontSize: '20px',
        fontWeight: 700,
        color: '#1f2937',
        marginBottom: '12px',
        margin: 0,
        textAlign: 'center',
      }}
    >
      {getTitle()}
    </h2>
  );
};

const ResultMessage: React.FC<{
  successCount: number;
  failedCount: number;
  totalCount: number;
}> = ({ successCount, failedCount, totalCount }) => {
  const getMessage = () => {
    if (successCount > 0 && failedCount > 0) {
      return I18n.t('workflow_import_partial_message', {
        total: totalCount.toString(),
        success: successCount.toString(),
        failed: failedCount.toString(),
      });
    }
    if (successCount > 0) {
      return I18n.t('workflow_import_success_message', {
        count: successCount.toString(),
      });
    }
    return I18n.t('workflow_import_failed_message', {
      count: failedCount.toString(),
    });
  };

  return (
    <p
      style={{
        fontSize: '16px',
        color: '#6b7280',
        marginBottom: failedCount > 0 ? '16px' : '0',
        lineHeight: '1.6',
        textAlign: 'center',
      }}
    >
      {getMessage()}
    </p>
  );
};

const FailedFilesSection: React.FC<{
  failedCount: number;
  failedFiles?: FailedFile[];
}> = ({ failedCount, failedFiles }) => {
  if (failedCount === 0 || !failedFiles || failedFiles.length === 0) {
    return null;
  }

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: 'white',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            borderBottom: '1px solid #fecaca',
            fontSize: '14px',
            fontWeight: 600,
            color: '#dc2626',
          }}
        >
          {I18n.t('workflow_import_failed_files_details')} ({failedCount})
        </div>
        <div
          style={{
            maxHeight: '150px',
            overflowY: 'auto',
          }}
        >
          {failedFiles.map((file, index) => (
            <div
              key={index}
              style={{
                padding: '12px 16px',
                borderBottom:
                  index < failedFiles.length - 1 ? '1px solid #f3f4f6' : 'none',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '4px',
                }}
              >
                {file.file_name}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '6px',
                }}
              >
                {I18n.t('workflow_import_workflow_name')}: {file.workflow_name}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#dc2626',
                  lineHeight: '1.4',
                }}
              >
                <strong>{I18n.t('workflow_import_error_reason')}:</strong>{' '}
                {file.error_message ||
                  file.fail_reason ||
                  I18n.t('workflow_import_unknown_error')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ActionButtons: React.FC<{
  hasSuccess: boolean;
  firstWorkflowId?: string;
  onClose: () => void;
  onViewWorkflow: () => void;
}> = ({ hasSuccess, firstWorkflowId, onClose, onViewWorkflow }) => (
  <div
    style={{
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      backgroundColor: 'white',
      padding: '20px 32px',
      borderRadius: '0 0 12px 12px',
      width: '600px',
      boxSizing: 'border-box',
    }}
  >
    <button
      onClick={onClose}
      style={{
        padding: '8px 16px',
        border: '2px solid #d1d5db',
        borderRadius: '6px',
        backgroundColor: 'white',
        color: '#374151',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = '#f9fafb';
        e.currentTarget.style.borderColor = '#9ca3af';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = 'white';
        e.currentTarget.style.borderColor = '#d1d5db';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
      }}
    >
      {hasSuccess
        ? I18n.t('workflow_import_complete')
        : I18n.t('workflow_import_close')}
    </button>

    {hasSuccess && firstWorkflowId ? (
      <button
        onClick={onViewWorkflow}
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '6px',
          backgroundColor: '#10b981',
          color: 'white',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = '#059669';
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          e.currentTarget.style.boxShadow =
            '0 8px 24px rgba(16, 185, 129, 0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = '#10b981';
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow =
            '0 4px 16px rgba(16, 185, 129, 0.3)';
        }}
      >
        {I18n.t('workflow_import_view_workflow')}
      </button>
    ) : null}
  </div>
);

const ImportResultModalSection: React.FC<ImportResultModalSectionProps> = ({
  visible,
  resultModalData,
  onClose,
  onViewWorkflow,
}) => {
  if (!visible) {
    return null;
  }

  const { successCount, failedCount, firstWorkflowId, failedFiles } =
    resultModalData;
  const totalCount = successCount + failedCount;
  const hasSuccess = successCount > 0;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        overflow: 'hidden',
        paddingTop: '20px',
        paddingBottom: '20px',
        boxSizing: 'border-box',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: 'auto',
          backgroundColor: 'transparent',
          borderRadius: '12px',
          padding: '0',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          maxHeight: 'none',
          overflow: 'visible',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            textAlign: 'left',
            marginBottom: '0',
            color: '#1f2937',
            fontSize: '24px',
            fontWeight: '600',
            backgroundColor: 'white',
            padding: '20px 32px',
            borderRadius: '12px 12px 0 0',
            width: '600px',
            boxSizing: 'border-box',
          }}
        >
          {I18n.t('workflow_import_result')}
        </div>

        <div
          style={{
            width: '600px',
            backgroundColor: 'white',
            borderRadius: '0',
            padding: '24px 32px',
            marginBottom: '0',
            marginTop: '0',
            boxSizing: 'border-box',
            textAlign: 'center',
            boxShadow:
              'inset 0 1px 3px rgba(0, 0, 0, 0.1), inset 0 -1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <ResultIcon successCount={successCount} failedCount={failedCount} />
          <ResultTitle successCount={successCount} failedCount={failedCount} />
          <ResultMessage
            successCount={successCount}
            failedCount={failedCount}
            totalCount={totalCount}
          />
          <FailedFilesSection
            failedCount={failedCount}
            failedFiles={failedFiles}
          />
        </div>

        <ActionButtons
          hasSuccess={hasSuccess}
          firstWorkflowId={firstWorkflowId}
          onClose={onClose}
          onViewWorkflow={onViewWorkflow}
        />
      </div>
    </div>
  );
};

export default ImportResultModalSection;
