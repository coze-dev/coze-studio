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

// MCP服务列表请求
export interface McpServiceListRequest {
  body: {
    mcpName?: string; // 名称 (可选)
    mcpType?: string; // 类型id (可选)
    sassWorkspaceId: string; // 工作空间ID (必须)
  };
}

// MCP服务信息
export interface McpService {
  createTime: string;
  createUserId: string;
  createUserName: string;
  mcpConfig: string; // JSON字符串配置
  mcpDesc: string; // MCP描述
  mcpIcon: string; // 图标路径
  mcpId: string; // MCP服务ID
  mcpInstallMethod: string; // 安装方法
  mcpName: string; // MCP名称
  mcpShelf: string; // 上架状态
  mcpStatus: string; // 状态
  mcpType: string; // 类型ID
  serviceUrl: string; // 服务URL
  typeName: string; // 类型名称
  updateTime: string;
  updateUserId: string;
}

// MCP服务列表响应
export interface McpServiceListResponse {
  header: {
    iCIFID: null;
    eCIFID: null;
    errorCode: string;
    errorMsg: string;
    encry: null;
    transCode: null;
    channel: null;
    channelDate: null;
    channelTime: null;
    channelFlow: null;
    type: null;
    transId: null;
  };
  body: {
    currentPage: number;
    serviceInfoList: McpService[];
    turnPageShowNum: number;
    turnPageTotalNum: number;
    turnPageTotalPage: number;
  };
}

// MCP工具列表请求
export interface McpToolsListRequest {
  body: {
    mcpId: string; // 服务id (必须)
    sassWorkspaceId: string; // 工作空间ID (必须)
  };
}

// MCP工具信息
export interface McpTool {
  schema: string; // JSON Schema字符串
  name: string; // 工具名称，如"read_file"
  description: string; // 工具描述
}

// MCP工具列表响应
export interface McpToolsListResponse {
  header: {
    iCIFID: null;
    eCIFID: null;
    errorCode: string;
    errorMsg: string;
    encry: null;
    transCode: null;
    channel: null;
    channelDate: null;
    channelTime: null;
    channelFlow: null;
    type: null;
    transId: null;
  };
  body: {
    tools: McpTool[];
  };
}

// MCP状态枚举
export const MCP_STATUS_ENUM = {
  ACTIVE: '1', // 激活状态
  INACTIVE: '0', // 非激活状态
} as const;

export const MCP_SHELF_ENUM = {
  ON_SHELF: '1', // 已上架
  OFF_SHELF: '0', // 已下架
} as const;
