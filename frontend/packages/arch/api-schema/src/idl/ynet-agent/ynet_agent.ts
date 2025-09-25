import { createAPI } from './../../api/config';
/** HiAgent 智能体信息 */
export interface HiAgentInfo {
  /** 智能体ID */
  agent_id: string,
  /** 智能体名称 */
  name: string,
  /** 描述 */
  description?: string,
  /** 图标URL */
  icon_url?: string,
  /** API端点 */
  endpoint: string,
  /** 认证类型：bearer, api_key */
  auth_type: string,
  /** API密钥（创建时使用，查询时不返回） */
  api_key?: string,
  /** 状态：0-禁用，1-启用 */
  status: number,
  /** 创建时间 */
  created_at: number,
  /** 更新时间 */
  updated_at: number,
  /** 额外元数据 */
  meta?: {
    [key: string | number]: string
  },
}
/** 创建 HiAgent 请求 */
export interface CreateHiAgentRequest {
  space_id: string,
  name: string,
  description?: string,
  icon_url?: string,
  endpoint: string,
  auth_type: string,
  api_key?: string,
  meta?: {
    [key: string | number]: string
  },
}
export interface CreateHiAgentResponse {
  code: number,
  msg: string,
  data: HiAgentInfo,
}
/** 更新 HiAgent 请求 */
export interface UpdateHiAgentRequest {
  space_id: string,
  agent_id: string,
  name?: string,
  description?: string,
  icon_url?: string,
  endpoint?: string,
  auth_type?: string,
  api_key?: string,
  status?: number,
  meta?: {
    [key: string | number]: string
  },
}
export interface UpdateHiAgentResponse {
  code: number,
  msg: string,
  data: HiAgentInfo,
}
/** 删除 HiAgent 请求 */
export interface DeleteHiAgentRequest {
  space_id: string,
  agent_id: string,
}
export interface DeleteHiAgentResponse {
  code: number,
  msg: string,
}
/** 获取 HiAgent 详情请求 */
export interface GetHiAgentRequest {
  space_id: string,
  agent_id: string,
}
export interface GetHiAgentResponse {
  code: number,
  msg: string,
  data: HiAgentInfo,
}
/** 获取 HiAgent 列表请求 */
export interface GetHiAgentListRequest {
  space_id: string,
  /** 页面大小，默认20 */
  page_size?: number,
  /** 分页token */
  page_token?: string,
  /** 搜索关键词 */
  filter?: string,
  /** 排序字段：created_at, name, status */
  sort_by?: string,
}
export interface GetHiAgentListResponse {
  code: number,
  msg: string,
  agents: HiAgentInfo[],
  total: number,
  next_page_token?: string,
}
/** 测试 HiAgent 连接请求 */
export interface TestHiAgentConnectionRequest {
  endpoint: string,
  auth_type: string,
  api_key?: string,
}
export interface TestHiAgentConnectionResponse {
  code: number,
  msg: string,
  is_connected?: boolean,
  test_message?: string,
}
/** 智能体版本回滚请求 */
export interface RevertDraftBotRequest {
  /** 空间ID */
  space_id: string,
  /** 智能体ID */
  bot_id: string,
  /** 要回滚到的版本号 */
  version: string,
}
/** 智能体版本回滚响应 */
export interface RevertDraftBotResponse {
  /** 响应码 */
  code: number,
  /** 响应消息 */
  msg: string,
  /** 回滚后的数据 */
  data?: RevertDraftBotData,
}
/** 回滚成功后的数据 */
export interface RevertDraftBotData {
  /** 智能体ID */
  bot_id: string,
  /** 回滚到的版本号 */
  version: string,
  /** 更新时间戳 */
  updated_at: number,
  /** 回滚操作的描述信息 */
  message?: string,
}
/** HiAgent CRUD 接口 */
export const CreateHiAgent = /*#__PURE__*/createAPI<CreateHiAgentRequest, CreateHiAgentResponse>({
  "url": "/api/space/{space_id}/hi-agents",
  "method": "POST",
  "name": "CreateHiAgent",
  "reqType": "CreateHiAgentRequest",
  "reqMapping": {
    "body": ["space_id", "name", "description", "icon_url", "endpoint", "auth_type", "api_key", "meta"]
  },
  "resType": "CreateHiAgentResponse",
  "schemaRoot": "api://schemas/idl_ynet-agent_ynet_agent",
  "service": "ynet_agent"
});
export const UpdateHiAgent = /*#__PURE__*/createAPI<UpdateHiAgentRequest, UpdateHiAgentResponse>({
  "url": "/api/space/{space_id}/hi-agents/{agent_id}",
  "method": "PUT",
  "name": "UpdateHiAgent",
  "reqType": "UpdateHiAgentRequest",
  "reqMapping": {
    "body": ["space_id", "agent_id", "name", "description", "icon_url", "endpoint", "auth_type", "api_key", "status", "meta"]
  },
  "resType": "UpdateHiAgentResponse",
  "schemaRoot": "api://schemas/idl_ynet-agent_ynet_agent",
  "service": "ynet_agent"
});
export const DeleteHiAgent = /*#__PURE__*/createAPI<DeleteHiAgentRequest, DeleteHiAgentResponse>({
  "url": "/api/space/{space_id}/hi-agents/{agent_id}",
  "method": "DELETE",
  "name": "DeleteHiAgent",
  "reqType": "DeleteHiAgentRequest",
  "reqMapping": {
    "path": ["space_id", "agent_id"]
  },
  "resType": "DeleteHiAgentResponse",
  "schemaRoot": "api://schemas/idl_ynet-agent_ynet_agent",
  "service": "ynet_agent"
});
export const GetHiAgent = /*#__PURE__*/createAPI<GetHiAgentRequest, GetHiAgentResponse>({
  "url": "/api/space/{space_id}/hi-agents/{agent_id}",
  "method": "GET",
  "name": "GetHiAgent",
  "reqType": "GetHiAgentRequest",
  "reqMapping": {
    "path": ["space_id", "agent_id"]
  },
  "resType": "GetHiAgentResponse",
  "schemaRoot": "api://schemas/idl_ynet-agent_ynet_agent",
  "service": "ynet_agent"
});
export const GetHiAgentList = /*#__PURE__*/createAPI<GetHiAgentListRequest, GetHiAgentListResponse>({
  "url": "/api/space/{space_id}/hi-agents",
  "method": "GET",
  "name": "GetHiAgentList",
  "reqType": "GetHiAgentListRequest",
  "reqMapping": {
    "query": ["space_id", "page_size", "page_token", "filter", "sort_by"]
  },
  "resType": "GetHiAgentListResponse",
  "schemaRoot": "api://schemas/idl_ynet-agent_ynet_agent",
  "service": "ynet_agent"
});
/** 测试连接 */
export const TestHiAgentConnection = /*#__PURE__*/createAPI<TestHiAgentConnectionRequest, TestHiAgentConnectionResponse>({
  "url": "/api/hi-agents/test-connection",
  "method": "POST",
  "name": "TestHiAgentConnection",
  "reqType": "TestHiAgentConnectionRequest",
  "reqMapping": {
    "body": ["endpoint", "auth_type", "api_key"]
  },
  "resType": "TestHiAgentConnectionResponse",
  "schemaRoot": "api://schemas/idl_ynet-agent_ynet_agent",
  "service": "ynet_agent"
});
/** 智能体版本回滚接口（保持原有功能） */
export const RevertDraftBot = /*#__PURE__*/createAPI<RevertDraftBotRequest, RevertDraftBotResponse>({
  "url": "/api/ynet-agent/revert-draft-bot",
  "method": "POST",
  "name": "RevertDraftBot",
  "reqType": "RevertDraftBotRequest",
  "reqMapping": {
    "body": ["space_id", "bot_id", "version"]
  },
  "resType": "RevertDraftBotResponse",
  "schemaRoot": "api://schemas/idl_ynet-agent_ynet_agent",
  "service": "ynet_agent"
});