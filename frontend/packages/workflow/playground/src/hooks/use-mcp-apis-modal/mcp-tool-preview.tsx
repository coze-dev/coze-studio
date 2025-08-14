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
import { Button, Divider, Tag, Typography } from '@coze-arch/coze-design';

import {
  McpSchemaParser,
  type McpSchemaProperty,
} from '@/utils/mcp-schema-parser';
import { type McpTool } from '@/types/mcp';

const { Text, Title } = Typography;

export interface McpToolPreviewProps {
  tool: McpTool;
  onConfirm: () => void;
  onCancel: () => void;
}

export const McpToolPreview: React.FC<McpToolPreviewProps> = ({
  tool,
  onConfirm,
  onCancel,
}) => {
  const parsedSchema = McpSchemaParser.parseToolSchema(tool.schema);

  const renderParameterItem = (param: McpSchemaProperty) => (
    <div
      key={param.name}
      style={{
        padding: '8px 0',
        borderBottom: '1px solid var(--semi-color-border-light)',
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}
      >
        <Text strong style={{ marginRight: '8px' }}>
          {param.name}
        </Text>
        <Tag size="small" color={param.required ? 'red' : 'blue'}>
          {McpSchemaParser.getTypeLabel(param)}
        </Tag>
        {param.required ? (
          <Tag size="small" color="red" style={{ marginLeft: '4px' }}>
            必需
          </Tag>
        ) : null}
      </div>
      {param.description ? (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {param.description}
        </Text>
      ) : null}
    </div>
  );

  return (
    <div
      style={{
        width: '400px',
        backgroundColor: 'var(--semi-color-bg-1)',
        border: '1px solid var(--semi-color-border)',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* 工具基本信息 */}
      <div style={{ marginBottom: '16px' }}>
        <Title heading={5} style={{ margin: '0 0 8px 0' }}>
          {tool.name}
        </Title>
        <Text type="secondary" style={{ fontSize: '14px' }}>
          {tool.description}
        </Text>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* 输入参数 */}
      <div style={{ marginBottom: '16px' }}>
        <Title heading={6} style={{ margin: '0 0 12px 0' }}>
          {I18n.t('输入参数')}
        </Title>
        {parsedSchema.inputParams.length > 0 ? (
          <div
            style={{
              backgroundColor: 'var(--semi-color-bg-2)',
              borderRadius: '6px',
              padding: '12px',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {parsedSchema.inputParams.map(renderParameterItem)}
          </div>
        ) : (
          <Text type="secondary" style={{ fontStyle: 'italic' }}>
            无输入参数
          </Text>
        )}
      </div>

      {/* 输出说明 */}
      <div style={{ marginBottom: '20px' }}>
        <Title heading={6} style={{ margin: '0 0 12px 0' }}>
          {I18n.t('输出')}
        </Title>
        <div
          style={{
            backgroundColor: 'var(--semi-color-bg-2)',
            borderRadius: '6px',
            padding: '12px',
          }}
        >
          <Text type="secondary" style={{ fontSize: '12px' }}>
            执行结果将根据工具功能返回相应的数据结构
          </Text>
        </div>
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <Button size="small" onClick={onCancel}>
          {I18n.t('取消')}
        </Button>
        <Button type="primary" size="small" onClick={onConfirm}>
          {I18n.t('添加')}
        </Button>
      </div>
    </div>
  );
};
