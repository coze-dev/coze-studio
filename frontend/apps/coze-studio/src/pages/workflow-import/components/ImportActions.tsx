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

interface ImportActionsProps {
  validFileCount: number;
  isImporting: boolean;
  onImport: () => void;
}

const OPACITY_DISABLED = 0.6;

const ImportActions: React.FC<ImportActionsProps> = ({
  validFileCount,
  isImporting,
  onImport,
}) => (
  <div style={{ textAlign: 'center', marginTop: '30px' }}>
    <button
      onClick={onImport}
      disabled={validFileCount === 0 || isImporting}
      style={{
        padding: '16px 40px',
        background:
          validFileCount > 0 && !isImporting
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : '#e2e8f0',
        color: validFileCount > 0 && !isImporting ? 'white' : '#a0aec0',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: validFileCount > 0 && !isImporting ? 'pointer' : 'not-allowed',
        boxShadow:
          validFileCount > 0 && !isImporting
            ? '0 8px 24px rgba(102, 126, 234, 0.3)'
            : 'none',
        transition: 'all 0.3s ease',
        opacity: validFileCount > 0 && !isImporting ? 1 : OPACITY_DISABLED,
        minWidth: '200px',
      }}
      onMouseEnter={e => {
        if (validFileCount > 0 && !isImporting) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow =
            '0 12px 32px rgba(102, 126, 234, 0.4)';
        }
      }}
      onMouseLeave={e => {
        if (validFileCount > 0 && !isImporting) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow =
            '0 8px 24px rgba(102, 126, 234, 0.3)';
        }
      }}
    >
      {isImporting ? '🔄 导入中...' : `🚀 开始导入 (${validFileCount})`}
    </button>
  </div>
);

export default ImportActions;
