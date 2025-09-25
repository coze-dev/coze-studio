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

type ExportFormat = 'json' | 'yml' | 'yaml';

interface FormatOptionProps {
  format: ExportFormat;
  selectedFormat: ExportFormat;
  onSelect: (format: ExportFormat) => void;
  title: string;
  description: string;
  badge: string;
  icon: React.ReactNode;
}

export const FormatOption: React.FC<FormatOptionProps> = ({
  format,
  selectedFormat,
  onSelect,
  title,
  description,
  badge,
  icon,
}) => (
  <div
    onClick={() => onSelect(format)}
    style={{
      flex: 1,
      padding: '20px 16px',
      border:
        selectedFormat === format ? '2px solid #3b82f6' : '2px solid #e2e8f0',
      borderRadius: '12px',
      cursor: 'pointer',
      background:
        selectedFormat === format
          ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
          : 'white',
      transition: 'all 0.3s ease',
      position: 'relative',
      boxShadow:
        selectedFormat === format
          ? '0 4px 16px rgba(59, 130, 246, 0.15)'
          : '0 2px 8px rgba(0, 0, 0, 0.04)',
      transform:
        selectedFormat === format ? 'translateY(-2px)' : 'translateY(0)',
    }}
    onMouseEnter={e => {
      if (selectedFormat !== format) {
        e.currentTarget.style.borderColor = '#94a3b8';
        e.currentTarget.style.background = '#f8fafc';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
      }
    }}
    onMouseLeave={e => {
      if (selectedFormat !== format) {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.background = 'white';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
      }
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: '48px',
          height: '48px',
          background:
            selectedFormat === format
              ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
              : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px auto',
          transition: 'all 0.3s ease',
          boxShadow:
            selectedFormat === format
              ? '0 4px 12px rgba(59, 130, 246, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: selectedFormat === format ? '#1e40af' : '#374151',
          marginBottom: '4px',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: '12px',
          color: selectedFormat === format ? '#3b82f6' : '#6b7280',
          lineHeight: '1.4',
          marginBottom: '8px',
        }}
      >
        {description}
      </div>
      <div
        style={{
          display: 'inline-block',
          background:
            selectedFormat === format
              ? badge === '推荐'
                ? '#10b981'
                : '#3b82f6'
              : '#f3f4f6',
          color: selectedFormat === format ? 'white' : '#6b7280',
          padding: '4px 12px',
          borderRadius: '16px',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.02em',
          transition: 'all 0.3s ease',
        }}
      >
        {badge}
      </div>
    </div>
  </div>
);
