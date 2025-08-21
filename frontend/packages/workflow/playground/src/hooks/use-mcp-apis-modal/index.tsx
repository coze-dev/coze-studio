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

import React, { useCallback, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';

import { type McpService, type McpTool } from '@/types/mcp';
import { McpApiService } from '@/services/mcp-service';

import { McpModal } from './mcp-modal';

export interface McpModalModeProps {
  closeCallback?: () => void;
  onAdd?: (mcpService: McpService, tool: McpTool) => Promise<boolean> | boolean;
  workspaceId?: string; // 动态工作空间ID
}

export const useMcpApisModal = (props?: McpModalModeProps) => {
  const { closeCallback, onAdd, workspaceId, ...restProps } = props || {};
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mcpServices, setMcpServices] = useState<McpService[]>([]);
  const [selectedMcpService, setSelectedMcpService] =
    useState<McpService | null>(null);
  const [mcpTools, setMcpTools] = useState<McpTool[]>([]);

  // 获取MCP服务列表
  const fetchMcpServices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await McpApiService.getMcpServiceList({
        sassWorkspaceId: workspaceId,
      });
      const availableServices = McpApiService.filterAvailableMcpServices(
        response.body.serviceInfoList || [],
      );
      setMcpServices(availableServices);
    } catch (err) {
      console.error('MCP服务列表获取失败:', err);

      // 显示友好的错误信息，而不是设置空数据
      setError('无法连接到MCP服务，请检查网络或联系管理员');
      setMcpServices([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  // 获取MCP工具列表
  const fetchMcpTools = useCallback(
    async (mcpId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await McpApiService.getMcpToolsList(mcpId, {
          sassWorkspaceId: workspaceId,
        });
        setMcpTools(response.body.tools);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '获取MCP工具列表失败';
        setError(errorMessage);
        Toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [workspaceId],
  );

  // 选择MCP服务
  const handleSelectMcpService = useCallback(
    (service: McpService) => {
      setSelectedMcpService(service);
      fetchMcpTools(service.mcpId);
    },
    [fetchMcpTools],
  );

  // 选择MCP工具并添加节点
  const handleSelectMcpTool = useCallback(
    async (tool: McpTool) => {
      if (!selectedMcpService) {
        return;
      }

      try {
        const result = await onAdd?.(selectedMcpService, tool);
        if (result !== false) {
          setVisible(false);
          Toast.success(
            I18n.t('MCP工具已添加: {toolName}', {
              toolName: tool.name,
            }) as string,
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '添加MCP工具失败';
        Toast.error(errorMessage);
      }
    },
    [selectedMcpService, onAdd],
  );

  const open = () => {
    setVisible(true);
    fetchMcpServices();
  };

  const close = () => {
    setVisible(false);
    setSelectedMcpService(null);
    setMcpTools([]);
    setError(null);
    closeCallback?.();
  };

  const node = visible ? (
    <McpModal
      visible={visible}
      loading={loading}
      error={error}
      mcpServices={mcpServices}
      selectedMcpService={selectedMcpService}
      mcpTools={mcpTools}
      onSelectMcpService={handleSelectMcpService}
      onSelectMcpTool={handleSelectMcpTool}
      onCancel={close}
      {...restProps}
    />
  ) : null;

  return {
    node,
    open,
    close,
    visible,
    loading,
    error,
    mcpServices,
    selectedMcpService,
    mcpTools,
    fetchMcpServices,
    handleSelectMcpService,
    handleSelectMcpTool,
  };
};
