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

interface ImportButtonsProps {
  isImporting: boolean;
  validFileCount: number;
  onGoBack: () => void;
  onImport: () => void;
}

const OPACITY_DISABLED = 0.6;

const ImportButtons: React.FC<ImportButtonsProps> = ({
  isImporting,
  validFileCount,
  onGoBack,
  onImport,
}) => (
  <div
    style={{
      display: 'flex',
      gap: '16px',
      justifyContent: 'center',
      marginTop: '30px',
    }}
  >
    <button
      onClick={onGoBack}
      disabled={isImporting}
      style={{
        padding: '16px 32px',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        background: 'white',
        color: '#4a5568',
        cursor: isImporting ? 'not-allowed' : 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        opacity: isImporting ? OPACITY_DISABLED : 1,
      }}
    >
      ❌ 取消
    </button>

    <button
      onClick={onImport}
      disabled={isImporting || validFileCount === 0}
      style={{
        padding: '16px 32px',
        border: 'none',
        borderRadius: '12px',
        background:
          isImporting || validFileCount === 0
            ? '#a0a0a0'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        cursor: isImporting || validFileCount === 0 ? 'not-allowed' : 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        transform: isImporting ? 'scale(0.98)' : 'scale(1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {isImporting ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              animation: 'spin 1s linear infinite',
              display: 'inline-block',
              fontSize: '18px',
            }}
          >
            ⏳
          </span>
          导入中...
        </span>
      ) : (
        `📦 导入工作流 (${validFileCount}个文件)`
      )}
    </button>
  </div>
);

export default ImportButtons;
