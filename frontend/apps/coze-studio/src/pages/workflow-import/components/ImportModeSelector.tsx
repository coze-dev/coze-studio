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

interface ImportModeSelectorProps {
  importMode: 'batch' | 'transaction';
  isImporting: boolean;
  onChange: (mode: 'batch' | 'transaction') => void;
}

const ImportModeSelector: React.FC<ImportModeSelectorProps> = ({
  importMode,
  isImporting,
  onChange,
}) => (
  <div style={{ marginBottom: '30px' }}>
    <label
      style={{
        display: 'block',
        marginBottom: '12px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#2d3748',
      }}
    >
      导入模式
    </label>
    <div style={{ display: 'flex', gap: '20px' }}>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <input
          type="radio"
          value="batch"
          checked={importMode === 'batch'}
          onChange={e => onChange(e.target.value as 'batch')}
          style={{ marginRight: '8px' }}
          disabled={isImporting}
        />
        <span style={{ fontSize: '14px' }}>
          <strong>批量模式</strong> - 允许部分失败，失败的文件不影响其他文件
        </span>
      </label>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <input
          type="radio"
          value="transaction"
          checked={importMode === 'transaction'}
          onChange={e => onChange(e.target.value as 'transaction')}
          style={{ marginRight: '8px' }}
          disabled={isImporting}
        />
        <span style={{ fontSize: '14px' }}>
          <strong>事务模式</strong> - 全部成功或全部失败，确保数据一致性
        </span>
      </label>
    </div>
  </div>
);

export default ImportModeSelector;
