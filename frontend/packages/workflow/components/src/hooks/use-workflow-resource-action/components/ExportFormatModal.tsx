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
import { Modal } from '@coze-arch/coze-design';

import { FormatOption } from './FormatOption';

type ExportFormat = 'json' | 'yml' | 'yaml';

interface ExportFormatModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  selectedFormat: ExportFormat;
  setSelectedFormat: (format: ExportFormat) => void;
}

const ModalHeader = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '24px',
    }}
  >
    <div
      style={{
        width: '48px',
        height: '48px',
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.2)',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M8 11L11 14L16 9"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: '-2px',
          right: '-2px',
          width: '16px',
          height: '16px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid white',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
        }}
      >
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 13L10 16L17 9"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
    <h3
      style={{
        margin: 0,
        fontSize: '18px',
        fontWeight: 600,
        color: '#1e293b',
        letterSpacing: '-0.02em',
      }}
    >
      {I18n.t('workflow_export_format_title')}
    </h3>
  </div>
);

const ModalFooter = ({
  onCancel,
  onConfirm,
  selectedFormat,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  selectedFormat: ExportFormat;
}) => (
  <div
    style={{
      display: 'flex',
      gap: '12px',
      paddingTop: '20px',
      borderTop: '1px solid #f1f5f9',
    }}
  >
    <button
      type="button"
      onClick={onCancel}
      style={{
        flex: 1,
        padding: '12px 24px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        background: 'white',
        color: '#6b7280',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#9ca3af';
        e.currentTarget.style.color = '#374151';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#d1d5db';
        e.currentTarget.style.color = '#6b7280';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {I18n.t('Cancel')}
    </button>
    <button
      type="button"
      onClick={onConfirm}
      disabled={!selectedFormat}
      style={{
        flex: 1,
        padding: '12px 24px',
        border: 'none',
        borderRadius: '8px',
        background: selectedFormat
          ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
          : '#e5e7eb',
        color: selectedFormat ? 'white' : '#9ca3af',
        fontSize: '14px',
        fontWeight: 600,
        cursor: selectedFormat ? 'pointer' : 'not-allowed',
        transition: 'all 0.2s ease',
        boxShadow: selectedFormat
          ? '0 4px 12px rgba(59, 130, 246, 0.2)'
          : 'none',
      }}
      onMouseEnter={e => {
        if (selectedFormat) {
          e.currentTarget.style.background =
            'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow =
            '0 6px 16px rgba(59, 130, 246, 0.3)';
        }
      }}
      onMouseLeave={e => {
        if (selectedFormat) {
          e.currentTarget.style.background =
            'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow =
            '0 4px 12px rgba(59, 130, 246, 0.2)';
        }
      }}
    >
      {I18n.t('workflow_export_confirm')}
    </button>
  </div>
);

export const ExportFormatModal: React.FC<ExportFormatModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  selectedFormat,
  setSelectedFormat,
}) => (
  <Modal
    visible={visible}
    title={null}
    footer={null}
    onCancel={onCancel}
    width={480}
    centered
    maskClosable={false}
    bodyStyle={{
      padding: 0,
      background: 'linear-gradient(135deg, #f8faff 0%, #e8f2ff 100%)',
      borderRadius: '16px',
    }}
  >
    <div
      style={{
        padding: '24px',
        background: 'white',
        borderRadius: '16px',
        margin: '4px',
        boxShadow: '0 4px 24px rgba(59, 130, 246, 0.08)',
      }}
    >
      <ModalHeader />

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <FormatOption
            format="json"
            selectedFormat={selectedFormat}
            onSelect={setSelectedFormat}
            title="JSON"
            description={I18n.t('workflow_export_format_json_desc')}
            badge={I18n.t('workflow_export_format_json_badge')}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 8L3 12L7 16M17 8L21 12L17 16M14 4L10 20"
                  stroke={selectedFormat === 'json' ? 'white' : '#6b7280'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
          <FormatOption
            format="yml"
            selectedFormat={selectedFormat}
            onSelect={setSelectedFormat}
            title="YAML"
            description={I18n.t('workflow_export_format_yaml_desc')}
            badge={I18n.t('workflow_export_format_yaml_badge')}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 2H6C4.89 2 4 2.9 4 4V20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
                  fill={selectedFormat === 'yml' ? 'white' : '#6b7280'}
                />
                <path
                  d="M14 2V8H20"
                  stroke={selectedFormat === 'yml' ? '#3b82f6' : '#9ca3af'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 12H12M8 16H16"
                  stroke={selectedFormat === 'yml' ? '#3b82f6' : '#9ca3af'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
        </div>
      </div>

      <ModalFooter
        onCancel={onCancel}
        onConfirm={onConfirm}
        selectedFormat={selectedFormat}
      />
    </div>
  </Modal>
);
