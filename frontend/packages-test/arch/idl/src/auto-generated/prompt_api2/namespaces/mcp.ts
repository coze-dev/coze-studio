/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as flow_devops_prompt_common from './flow_devops_prompt_common';

export type Int64 = string | number;

export interface Content {
  type?: string;
  text?: string;
}

export interface Function {
  name?: string;
  description?: string;
  input_schema?: string;
}

export interface MCPServer {
  /** 主键ID */
  id?: Int64;
  /** 空间ID */
  space_id?: Int64;
  /** 服务名称 */
  name?: string;
  /** 是否官方服务 */
  is_official?: boolean;
  /** 服务描述 */
  description?: string;
  /** 来源类型，ByteFaaS或其他 */
  source_type?: string;
  /** 标签 */
  labels?: Array<flow_devops_prompt_common.Label>;
  /** 服务的访问点列表 */
  mcp_server_access_points?: Array<MCPServerAccessPoint>;
  /** 创建人 */
  creator?: string;
  /** 创建时间 */
  create_time_ms?: Int64;
  /** 更新时间 */
  update_time_ms?: Int64;
}

export interface MCPServerAccessPoint {
  /** 主键ID */
  id?: Int64;
  /** 空间ID */
  space_id?: Int64;
  /** 关联的MCP Server ID */
  mcp_server_id?: Int64;
  /** 环境，BOE/PPE/ONLINE */
  env?: string;
  /** 泳道 */
  lane?: string;
  /** 服务模式，SSE或STDIO */
  transport_mode?: string;
  /** 接口地址 */
  server_url?: string;
  /** 工具的json schema */
  tools?: Array<Function>;
  /** 地址验证状态 */
  validation_status?: string;
  /** 最近一次地址校验时间 */
  last_validation_time_ms?: Int64;
  /** 最新操作发生时间 */
  lastest_op_time_ms?: Int64;
  /** 创建时间 */
  create_time_ms?: Int64;
  /** 更新时间 */
  update_time_ms?: Int64;
}
/* eslint-enable */
