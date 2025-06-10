/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';
import * as mcp from './mcp';

export type Int64 = string | number;

export interface CreateMCPServerAccessPointRequest {
  /** MCP Server ID */
  mcp_server_id?: Int64;
  /** 空间ID */
  space_id?: Int64;
  env?: string;
  lane?: string;
  /** 服务运行模式 */
  transport_mode?: string;
  server_url?: string;
  base?: base.Base;
}

export interface CreateMCPServerAccessPointResponse {
  mcp_server_access_point?: mcp.MCPServerAccessPoint;
  code?: number;
  msg?: string;
  base_resp?: base.BaseResp;
}

export interface CreateMCPServerRequest {
  /** 空间ID */
  space_id?: Int64;
  /** MCP Server 的名称 */
  name?: string;
  /** 服务描述 */
  description?: string;
  /** Source类型 */
  source_type?: string;
  /** 标签 */
  labels?: Array<Int64>;
  base?: base.Base;
}

export interface CreateMCPServerResponse {
  mcp_server?: mcp.MCPServer;
  code?: number;
  msg?: string;
  base_resp?: base.BaseResp;
}

export interface DebugMCPServerToolsRequest {
  /** 空间ID */
  space_id?: Int64;
  /** MCP Server ID */
  mcp_server_id?: Int64;
  /** 接入点的ID */
  access_point_id?: Int64;
  /** 调试的工具名称 */
  tool_name?: string;
  /** 工具运行时需要的输入参数 */
  parameters?: string;
  base?: base.Base;
}

export interface DebugMCPServerToolsResponse {
  /** 工具运行后的返回数据 */
  contents?: Array<mcp.Content>;
  code?: number;
  msg?: string;
  base_resp?: base.BaseResp;
}

export interface DeleteMCPServerAccessPointRequest {
  /** 接入点的ID */
  access_point_id?: Int64;
  /** MCP Server 主键ID */
  mcp_server_id?: Int64;
  space_id?: Int64;
  base?: base.Base;
}

export interface DeleteMCPServerAccessPointResponse {
  code?: number;
  msg?: string;
  base_resp?: base.BaseResp;
}

export interface DeleteMCPServerRequest {
  /** MCP Server 的主键 ID */
  mcp_server_id?: Int64;
  /** 空间ID */
  space_id?: Int64;
  base?: base.Base;
}

export interface DeleteMCPServerResponse {
  code?: number;
  msg?: string;
  base_resp?: base.BaseResp;
}

export interface GetMCPServerAccessPointRequest {
  /** 接入点的ID */
  access_point_id?: Int64;
  /** MCP Server 主键ID */
  mcp_server_id?: Int64;
  space_id?: Int64;
  base?: base.Base;
}

export interface GetMCPServerAccessPointResponse {
  mcp_server_access_point?: mcp.MCPServerAccessPoint;
  code?: number;
  msg?: string;
  base_resp?: base.BaseResp;
}

export interface GetMCPServerRequest {
  /** MCP Server 主键ID */
  mcp_server_id?: Int64;
  /** 空间ID */
  space_id?: Int64;
  base?: base.Base;
}

export interface GetMCPServerResponse {
  /** MCPServer详情 */
  mcp_server?: mcp.MCPServer;
  code?: number;
  msg?: string;
  base_resp?: base.BaseResp;
}

export interface ListMCPServerRequest {
  /** 空间 ID */
  space_id?: Int64;
  /** 分页页码 */
  page?: number;
  /** 每页获取条目数 */
  page_size?: number;
  /** 名称模糊匹配过滤 */
  name_keyword?: string;
  /** 来源类型过滤 (ByteFaaS 或 Others) */
  source_type?: string;
  /** 标签 */
  labels?: Array<Int64>;
  /** 创建人列表筛选 */
  creator_list?: Array<string>;
  base?: base.Base;
}

export interface ListMCPServerResponse {
  /** MCP Servers 列表 */
  mcp_servers?: Array<mcp.MCPServer>;
  /** 总条目数 */
  total?: number;
  code?: number;
  msg?: string;
  base_resp?: base.BaseResp;
}

export interface ListOfficialMCPServerRequest {
  /** 分页页码 */
  page?: number;
  /** 每页获取条目数 */
  page_size?: number;
  /** 名称模糊匹配过滤 */
  name_keyword?: string;
  /** 来源类型过滤 (ByteFaaS 或 Others) */
  source_type?: string;
  /** 标签 */
  labels?: Array<Int64>;
  base?: base.Base;
}

export interface ListOfficialMCPServerResponse {
  /** MCP Servers 列表 */
  mcp_servers?: Array<mcp.MCPServer>;
  /** 总条目数 */
  total?: number;
  code?: number;
  msg?: string;
  base_resp?: base.BaseResp;
}

export interface UpdateMCPServerAccessPointRequest {
  /** 接入点的ID */
  access_point_id?: Int64;
  /** MCP Server ID */
  mcp_server_id?: Int64;
  space_id?: Int64;
  env?: string;
  lane?: string;
  /** 服务模式（如 SSE 或 STDIO） */
  transport_mode?: string;
  server_url?: string;
  base?: base.Base;
}

export interface UpdateMCPServerAccessPointResponse {
  mcp_server_access_point?: mcp.MCPServerAccessPoint;
  code?: number;
  msg?: string;
  base_resp?: base.BaseResp;
}

export interface UpdateMCPServerRequest {
  /** MCP Server 的主键 ID */
  mcp_server_id?: Int64;
  /** 空间ID */
  space_id?: Int64;
  /** MCP Server 的名称 */
  name?: string;
  /** 详细描述 */
  description?: string;
  /** 来源类型（如 ByteFaaS 或 Others） */
  source_type?: string;
  /** 标签 */
  labels?: Array<Int64>;
  base?: base.Base;
}

export interface UpdateMCPServerResponse {
  /** 更新后的 MCP Server 对象 */
  mcp_server?: mcp.MCPServer;
  code?: number;
  msg?: string;
  base_resp?: base.BaseResp;
}
/* eslint-enable */
