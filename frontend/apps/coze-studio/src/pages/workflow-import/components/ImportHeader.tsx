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

interface ImportHeaderProps {
  onGoBack: () => void;
}

const ImportHeader: React.FC<ImportHeaderProps> = ({ onGoBack }) => (
  <>
    <div style={{ marginBottom: '40px', textAlign: 'center' }}>
      <h1
        style={{
          fontSize: '28px',
          fontWeight: '800',
          color: '#1a202c',
          marginBottom: '12px',
        }}
      >
        📦 工作流导入
      </h1>
      <p
        style={{
          fontSize: '16px',
          color: '#718096',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6',
        }}
      >
        支持批量导入多个工作流文件，支持 JSON、YAML 格式
      </p>
    </div>

    <div style={{ marginBottom: '30px', textAlign: 'right' }}>
      <button
        onClick={onGoBack}
        style={{
          padding: '10px 20px',
          background: '#e2e8f0',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          color: '#4a5568',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#cbd5e0';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#e2e8f0';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        ← 返回资源库
      </button>
    </div>
  </>
);

export default ImportHeader;
