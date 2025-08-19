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

import React, { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Button, Empty, Modal, Spin } from '@coze-arch/coze-design';

import { type McpService, type McpTool } from '@/types/mcp';
import { McpApiService } from '@/services/mcp-service';

import { McpToolPreview } from './mcp-tool-preview';

export interface McpModalProps {
  visible: boolean;
  loading: boolean;
  error: string | null;
  mcpServices: McpService[];
  selectedMcpService: McpService | null;
  mcpTools: McpTool[];
  onSelectMcpService: (service: McpService) => void;
  onSelectMcpTool: (tool: McpTool) => void;
  onCancel: () => void;
}

export const McpModal: React.FC<McpModalProps> = ({
  visible,
  loading,
  error,
  mcpServices,
  selectedMcpService,
  mcpTools,
  onSelectMcpService,
  onSelectMcpTool,
  onCancel,
}) => {
  const [previewTool, setPreviewTool] = useState<McpTool | null>(null);
  const renderServiceCard = (service: McpService) => (
    <div
      key={service.mcpId}
      className="mcp-service-card"
      onClick={() => onSelectMcpService(service)}
      style={{
        border: '1px solid var(--semi-color-border)',
        borderRadius: '8px',
        padding: '16px',
        margin: '8px',
        cursor: 'pointer',
        backgroundColor:
          selectedMcpService?.mcpId === service.mcpId
            ? 'var(--semi-color-primary-light-default)'
            : 'var(--semi-color-bg-2)',
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}
      >
        <img
          src={McpApiService.getMcpIconUrl(service.mcpIcon)}
          alt={service.mcpName}
          style={{ width: '24px', height: '24px', marginRight: '8px' }}
          onError={e => {
            (e.target as HTMLImageElement).src = '/default-mcp-icon.png';
          }}
        />
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
          {service.mcpName}
        </h4>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: '12px',
          color: 'var(--semi-color-text-1)',
        }}
      >
        {service.mcpDesc || '暂无描述'}
      </p>
      <div
        style={{
          marginTop: '8px',
          fontSize: '10px',
          color: 'var(--semi-color-text-2)',
        }}
      >
        <div>ID: {service.mcpId}</div>
        <div>类型: {service.typeName} | 创建者: {service.createUserName}</div>
      </div>
    </div>
  );

  const renderToolCard = (tool: McpTool) => (
    <div
      key={tool.name}
      className="mcp-tool-card"
      onClick={() => setPreviewTool(tool)}
      style={{
        border: '1px solid var(--semi-color-border)',
        borderRadius: '8px',
        padding: '12px',
        margin: '8px',
        cursor: 'pointer',
        backgroundColor: 'var(--semi-color-bg-1)',
      }}
    >
      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
        {tool.name}
      </h4>
      <p
        style={{
          margin: 0,
          fontSize: '12px',
          color: 'var(--semi-color-text-1)',
        }}
      >
        {tool.description}
      </p>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div
            style={{ color: 'var(--semi-color-danger)', marginBottom: '16px' }}
          >
            MCP服务暂时不可用
          </div>
          <div
            style={{
              fontSize: '14px',
              color: 'var(--semi-color-text-2)',
              marginBottom: '20px',
            }}
          >
            请检查网络连接或稍后重试
          </div>
          <Button onClick={() => window.location.reload()}>重试</Button>
          <div
            style={{
              marginTop: '20px',
              fontSize: '12px',
              color: 'var(--semi-color-text-3)',
            }}
          >
            技术详情: {error}
          </div>
        </div>
      );
    }

    if (!selectedMcpService) {
      // 显示MCP服务列表
      if (mcpServices.length === 0) {
        return (
          <Empty
            title="暂无MCP服务"
            description="没有找到可用的MCP服务"
            style={{ padding: '40px' }}
          />
        );
      }

      return (
        <div>
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid var(--semi-color-border)',
            }}
          >
            <h3 style={{ margin: 0 }}>选择MCP服务</h3>
          </div>
          <div style={{ maxHeight: '400px', overflow: 'auto', padding: '8px' }}>
            {mcpServices.map(renderServiceCard)}
          </div>
        </div>
      );
    }

    // 显示选中服务的工具列表
    return (
      <div>
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--semi-color-border)',
          }}
        >
          <Button
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Need to pass null to reset selection
            onClick={() => onSelectMcpService(null as any)}
            style={{ marginRight: '12px' }}
            size="small"
          >
            ← 返回
          </Button>
          <span style={{ fontSize: '16px', fontWeight: 600 }}>
            {selectedMcpService.mcpName} 的工具
          </span>
        </div>
        <div style={{ maxHeight: '400px', overflow: 'auto', padding: '8px' }}>
          {mcpTools.length === 0 ? (
            <Empty
              title="暂无工具"
              description="该MCP服务暂无可用工具"
              style={{ padding: '40px' }}
            />
          ) : (
            mcpTools.map(renderToolCard)
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Modal
        title={I18n.t('选择MCP工具')}
        visible={visible}
        onCancel={onCancel}
        footer={null}
        width={600}
        style={{ maxHeight: '80vh' }}
      >
        {renderContent()}
      </Modal>

      {/* 工具参数预览浮窗 */}
      {previewTool ? (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
          onClick={e => {
            if (e.target === e.currentTarget) {
              setPreviewTool(null);
            }
          }}
        >
          <McpToolPreview
            tool={previewTool}
            onConfirm={() => {
              onSelectMcpTool(previewTool);
              setPreviewTool(null);
            }}
            onCancel={() => setPreviewTool(null)}
          />
        </div>
      ) : null}
    </>
  );
};
