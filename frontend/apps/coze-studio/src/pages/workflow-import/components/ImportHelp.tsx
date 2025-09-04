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

const ImportHelp: React.FC = () => (
  <div
    style={{
      marginTop: '40px',
      padding: '20px',
      background: '#f8fafc',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
    }}
  >
    <h4
      style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: '12px',
      }}
    >
      💡 使用说明
    </h4>
    <ul
      style={{
        fontSize: '14px',
        color: '#4a5568',
        lineHeight: '1.6',
        paddingLeft: '20px',
      }}
    >
      <li style={{ marginBottom: '6px' }}>
        <strong>支持格式：</strong>
        支持JSON、YAML和ZIP格式的工作流文件（.json、.yml、.yaml、.zip）。ZIP文件将自动解析和转换。
      </li>
      <li style={{ marginBottom: '6px' }}>
        <strong>文件限制：</strong>单次最多支持50个文件
      </li>
      <li style={{ marginBottom: '6px' }}>
        <strong>ZIP文件处理：</strong>
        支持直接导入COZE官方导出的ZIP文件，系统将自动解析和转换为开源格式
      </li>
      <li style={{ marginBottom: '6px' }}>
        <strong>名称规则：</strong>
        工作流名称必须以字母开头，支持单个字母，只能包含字母、数字和下划线
      </li>
      <li style={{ marginBottom: '6px' }}>
        <strong>批量模式：</strong>允许部分文件导入失败，不影响其他文件
      </li>
      <li>
        <strong>事务模式：</strong>要求所有文件都成功导入，否则全部回滚
      </li>
    </ul>
  </div>
);

export default ImportHelp;
