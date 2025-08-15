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

import {
  type McpService,
  type McpServiceListResponse,
  type McpToolsListResponse,
  MCP_STATUS_ENUM,
} from '@/types/mcp';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Namespace class for MCP API methods
export class McpApiService {
  private static readonly BASE_URL = '/api/mcp'; // 通过代理调用，避免CORS问题

  // 获取MCP服务列表（支持分页和过滤）
  static async getMcpServiceList(options?: {
    mcpName?: string;
    mcpType?: string;
    sassWorkspaceId?: string;
  }): Promise<McpServiceListResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/MCP0017.do`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: {
            mcpName: options?.mcpName || '',
            mcpType: options?.mcpType || '',
            sassWorkspaceId: options?.sassWorkspaceId, // 使用动态传入的工作空间ID，不再硬编码
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // 🚨 关键调试：确认API返回的数据结构
      console.log('🔧 MCP0017.do API原始响应:', data);
      console.log('🔧 服务列表长度:', data.body?.serviceInfoList?.length || 0);
      if (data.body?.serviceInfoList?.length > 0) {
        console.log('🔧 第一个服务示例:', data.body.serviceInfoList[0]);
        console.log('🔧 第一个服务mcpId:', data.body.serviceInfoList[0].mcpId);
      }

      // 检查业务错误
      if (data.header?.errorCode !== '0') {
        throw new Error(
          `API Error: ${data.header?.errorMsg || 'Unknown error'}`,
        );
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch MCP services:', error);
      throw error;
    }
  }

  // 获取MCP工具列表
  static async getMcpToolsList(
    mcpId: string,
    options?: { sassWorkspaceId?: string },
  ): Promise<McpToolsListResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/MCP0013.do`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: {
            mcpId,
            sassWorkspaceId: options?.sassWorkspaceId, // 使用动态传入的工作空间ID
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.header?.errorCode !== '0') {
        throw new Error(
          `API Error: ${data.header?.errorMsg || 'Unknown error'}`,
        );
      }

      return data;
    } catch (error) {
      console.error(`Failed to fetch tools for MCP ${mcpId}:`, error);
      throw error;
    }
  }

  // 服务过滤函数 - 只展示激活的MCP服务（放宽上架条件）
  static filterAvailableMcpServices(services: McpService[]): McpService[] {
    console.log('🔧 过滤前服务数量:', services.length);
    console.log('🔧 过滤前所有服务mcpId:', services.map(s => ({ name: s.mcpName, mcpId: s.mcpId, status: s.mcpStatus })));
    
    const filtered = services.filter(
      service => service.mcpStatus === MCP_STATUS_ENUM.ACTIVE,
      // 移除上架状态过滤，因为很多服务状态为"0"但仍可用
    );
    
    console.log('🔧 过滤后服务数量:', filtered.length);
    console.log('🔧 过滤后服务mcpId:', filtered.map(s => ({ name: s.mcpName, mcpId: s.mcpId })));
    
    return filtered;
  }

  // 图标URL转换函数
  static getMcpIconUrl(iconPath: string): string {
    // 暂时使用默认图标，避免MinIO图标加载失败导致闪烁
    // TODO: 后续可以配置正确的MinIO访问地址
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBzdHJva2U9IiM2MzY2RjEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjkiIHI9IjIiIGZpbGw9IiM2MzY2RjEiLz4KPC9zdmc+'; // 使用默认MCP图标
  }
}
