import * as base from './../base';
export { base };
import { createAPI } from './../../api/config';
/** 获取应用每日消息统计请求 */
export interface GetAppDailyMessagesRequest {
  agent_id: string,
  /** Unix时间戳（毫秒） */
  start_time: number,
  /** Unix时间戳（毫秒） */
  end_time: number,
}
/** 消息统计数据 */
export interface MessageStatData {
  agent_id: string,
  /** 日期格式: "2025-08-20" 或 "2025-08-20 15" */
  date: string,
  /** 消息数量 */
  count: number,
}
/** 获取应用每日消息统计响应 */
export interface GetAppDailyMessagesResponse {
  code: number,
  msg: string,
  data: MessageStatData[],
}
/** 获取应用每日活跃用户统计请求 */
export interface GetAppDailyActiveUsersRequest {
  agent_id: string,
  /** Unix时间戳（毫秒） */
  start_time: number,
  /** Unix时间戳（毫秒） */
  end_time: number,
}
/** 活跃用户统计数据 */
export interface ActiveUsersStatData {
  agent_id: string,
  /** 日期格式: "2025-08-20" 或 "2025-08-20 15" */
  date: string,
  /** 活跃用户数 */
  count: number,
}
/** 获取应用每日活跃用户统计响应 */
export interface GetAppDailyActiveUsersResponse {
  code: number,
  msg: string,
  data: ActiveUsersStatData[],
}
/** 获取应用平均会话互动数 */
export interface GetAppAverageSessionInteractionsRequest {
  agent_id: string,
  /** Unix时间戳（毫秒） */
  start_time: number,
  /** Unix时间戳（毫秒） */
  end_time: number,
}
/** 平均会话次数统计 */
export interface AverageSessionInteractionsData {
  agent_id: string,
  /** 日期格式: "2025-08-20" 或 "2025-08-20 15" */
  date: string,
  /** 平均互动次数（浮点数） */
  count: number,
}
/** 获取平均会话次数统计响应 */
export interface GetAppAverageSessionInteractionsResponse {
  code: number,
  msg: string,
  data: AverageSessionInteractionsData[],
}
/** 获取应用Token统计请求 */
export interface GetAppTokensRequest {
  agent_id: string,
  /** Unix时间戳（毫秒） */
  start_time: number,
  /** Unix时间戳（毫秒） */
  end_time: number,
}
/** Token统计数据 */
export interface TokenStatData {
  agent_id: string,
  /** 日期格式 */
  date: string,
  /** 输入Token数 */
  input_tokens: number,
  /** 输出Token数 */
  output_tokens: number,
  /** 总Token数 */
  total_tokens: number,
}
/** 获取应用Token统计响应 */
export interface GetAppTokensResponse {
  code: number,
  msg: string,
  data: TokenStatData[],
}
/** 获取应用Token每秒吞吐量请求 */
export interface GetAppTokensPerSecondRequest {
  agent_id: string,
  /** Unix时间戳（毫秒） */
  start_time: number,
  /** Unix时间戳（毫秒） */
  end_time: number,
}
/** Token每秒吞吐量数据 */
export interface TokensPerSecondData {
  agent_id: string,
  /** 日期格式 */
  date: string,
  /** 每秒Token数（浮点数） */
  count: number,
}
/** 获取应用Token每秒吞吐量响应 */
export interface GetAppTokensPerSecondResponse {
  code: number,
  msg: string,
  data: TokensPerSecondData[],
}
/**
 * ListAppConversationLog 应用会话日志列表
 * 应用会话日志列表请求
*/
export interface ListAppConversationLogRequest {
  agent_id: string,
  /** Unix时间戳（毫秒） */
  start_time: number,
  /** Unix时间戳（毫秒） */
  end_time: number,
  /** 页码，默认1 */
  page?: number,
  /** 页面大小，默认20 */
  page_size?: number,
}
/** 应用会话日志列表数据 */
export interface ListAppConversationLogData {
  /** 日期格式 */
  CreateTime: string,
  user: string,
  ConversationName: string,
  MessageCount: number,
  AppConversationID: string,
  CreateTimestamp: number,
}
/** 分页信息 */
export interface PaginationInfo {
  /** 当前页码 */
  page: number,
  /** 页面大小 */
  page_size: number,
  /** 总记录数 */
  total: number,
  /** 总页数 */
  total_pages: number,
}
/** 应用会话日志列表响应 */
export interface ListAppConversationLogResponse {
  code: number,
  msg: string,
  data: ListAppConversationLogData[],
  /** 分页信息 */
  pagination?: PaginationInfo,
}
/** ListConversationMessageLog 会话消息历史请求 */
export interface ListConversationMessageLogRequest {
  agent_id: string,
  conversation_id: string,
  /** 页码，默认1 */
  page?: number,
  /** 页面大小，默认20 */
  page_size?: number,
}
export interface MessageContent {
  query: string,
  answer?: string[],
}
/** ListConversationMessageLog 会话消息历史数据 */
export interface ListConversationMessageLogData {
  conversation_id: string,
  run_id: string,
  message: MessageContent,
  tokens: number,
  time_cost: number,
  /** 日期格式 */
  create_time: string,
}
export interface MessageStatistics {
  message_count: number,
  tokens_p50: number,
  latency_p50: number,
  latency_p99: number,
}
/** ListConversationMessageLog 会话消息历史 响应 */
export interface ListConversationMessageLogResponse {
  code: number,
  msg: string,
  data: ListConversationMessageLogData[],
  statistics: MessageStatistics,
  /** 分页信息 */
  pagination?: PaginationInfo,
}
/** ExportConversationMessageLog 导出会话消息日志请求 */
export interface ExportConversationMessageLogRequest {
  agent_id: string,
  file_name: string,
  conversation_ids?: string[],
  run_ids?: string[],
  /** 导出文件保存小时数，默认72小时 */
  expire_hours?: number,
}
/** ExportConversationMessageLog 导出会话消息日志响应 */
export interface ExportConversationMessageLogResponse {
  code: number,
  msg: string,
  export_task_id?: string,
}
/** ExportedConversationFileInfo 导出的会话日志文件信息 */
export interface ExportedConversationFileInfo {
  export_task_id: string,
  file_name: string,
  object_key: string,
  created_at: string,
  expire_at: string,
  status: number,
}
/** ListExportConversationFilesRequest 查看导出文件列表请求 */
export interface ListExportConversationFilesRequest {
  agent_id: string,
  page?: number,
  page_size?: number,
}
/** ListExportConversationFilesResponse 查看导出文件列表响应 */
export interface ListExportConversationFilesResponse {
  code: number,
  msg: string,
  data: ExportedConversationFileInfo[],
  pagination?: PaginationInfo,
}
/** GetExportConversationFileDownloadUrlRequest 获取导出文件下载链接请求 */
export interface GetExportConversationFileDownloadUrlRequest {
  agent_id: string,
  export_task_id: string,
  /** 下载链接有效期，默认600s */
  expire_seconds?: number,
}
/** GetExportConversationFileDownloadUrlResponse 获取导出文件下载链接响应 */
export interface GetExportConversationFileDownloadUrlResponse {
  code: number,
  msg: string,
  file_url?: string,
}
/** ListAppMessageWithConLog 请求 */
export interface ListAppMessageWithConLogRequest {
  agent_id: string,
  /** Unix时间戳（毫秒） */
  start_time: number,
  /** Unix时间戳（毫秒） */
  end_time: number,
  /** 页码 */
  page?: number,
  /** 页面大小 */
  page_size?: number,
}
/** ListAppMessageWithConLog 数据 */
export interface ListAppMessageWithConLogData {
  conversation_id: string,
  user: string,
  ConversationName: string,
  run_id: string,
  message: MessageContent,
  create_time: string,
  tokens: number,
  time_cost: number,
}
/** ListAppMessageWithConLog 响应 */
export interface ListAppMessageWithConLogResponse {
  code: number,
  msg: string,
  data: ListAppMessageWithConLogData[],
  /** 分页信息 */
  pagination?: PaginationInfo,
}
/** 获取应用每日消息统计 */
export const GetAppDailyMessages = /*#__PURE__*/createAPI<GetAppDailyMessagesRequest, GetAppDailyMessagesResponse>({
  "url": "/api/statistics/app/messages",
  "method": "POST",
  "name": "GetAppDailyMessages",
  "reqType": "GetAppDailyMessagesRequest",
  "reqMapping": {
    "body": ["agent_id", "start_time", "end_time"]
  },
  "resType": "GetAppDailyMessagesResponse",
  "schemaRoot": "api://schemas/idl_statistics_statistics",
  "service": "statistics"
});
/** 获取应用每日活跃用户统计 */
export const GetAppDailyActiveUsers = /*#__PURE__*/createAPI<GetAppDailyActiveUsersRequest, GetAppDailyActiveUsersResponse>({
  "url": "/api/statistics/app/active-users",
  "method": "POST",
  "name": "GetAppDailyActiveUsers",
  "reqType": "GetAppDailyActiveUsersRequest",
  "reqMapping": {
    "body": ["agent_id", "start_time", "end_time"]
  },
  "resType": "GetAppDailyActiveUsersResponse",
  "schemaRoot": "api://schemas/idl_statistics_statistics",
  "service": "statistics"
});
/** 获取应用平均会话互动数 */
export const GetAppAverageSessionInteractions = /*#__PURE__*/createAPI<GetAppAverageSessionInteractionsRequest, GetAppAverageSessionInteractionsResponse>({
  "url": "/api/statistics/app/session-interactions",
  "method": "POST",
  "name": "GetAppAverageSessionInteractions",
  "reqType": "GetAppAverageSessionInteractionsRequest",
  "reqMapping": {
    "body": ["agent_id", "start_time", "end_time"]
  },
  "resType": "GetAppAverageSessionInteractionsResponse",
  "schemaRoot": "api://schemas/idl_statistics_statistics",
  "service": "statistics"
});
/** 获取应用Token使用统计 */
export const GetAppTokens = /*#__PURE__*/createAPI<GetAppTokensRequest, GetAppTokensResponse>({
  "url": "/api/statistics/app/tokens",
  "method": "POST",
  "name": "GetAppTokens",
  "reqType": "GetAppTokensRequest",
  "reqMapping": {
    "body": ["agent_id", "start_time", "end_time"]
  },
  "resType": "GetAppTokensResponse",
  "schemaRoot": "api://schemas/idl_statistics_statistics",
  "service": "statistics"
});
/** 获取应用Token每秒吞吐量统计 */
export const GetAppTokensPerSecond = /*#__PURE__*/createAPI<GetAppTokensPerSecondRequest, GetAppTokensPerSecondResponse>({
  "url": "/api/statistics/app/tokens-per-second",
  "method": "POST",
  "name": "GetAppTokensPerSecond",
  "reqType": "GetAppTokensPerSecondRequest",
  "reqMapping": {
    "body": ["agent_id", "start_time", "end_time"]
  },
  "resType": "GetAppTokensPerSecondResponse",
  "schemaRoot": "api://schemas/idl_statistics_statistics",
  "service": "statistics"
});
/** 获取应用对话日志列表统计 */
export const ListAppConversationLog = /*#__PURE__*/createAPI<ListAppConversationLogRequest, ListAppConversationLogResponse>({
  "url": "/api/statistics/app/list_app_conversation_log",
  "method": "POST",
  "name": "ListAppConversationLog",
  "reqType": "ListAppConversationLogRequest",
  "reqMapping": {
    "body": ["agent_id", "start_time", "end_time", "page", "page_size"]
  },
  "resType": "ListAppConversationLogResponse",
  "schemaRoot": "api://schemas/idl_statistics_statistics",
  "service": "statistics"
});
/** 获取应用对话消息日志 */
export const ListConversationMessageLog = /*#__PURE__*/createAPI<ListConversationMessageLogRequest, ListConversationMessageLogResponse>({
  "url": "/api/statistics/app/list_conversation_message_log",
  "method": "POST",
  "name": "ListConversationMessageLog",
  "reqType": "ListConversationMessageLogRequest",
  "reqMapping": {
    "body": ["agent_id", "conversation_id", "page", "page_size"]
  },
  "resType": "ListConversationMessageLogResponse",
  "schemaRoot": "api://schemas/idl_statistics_statistics",
  "service": "statistics"
});
/** 获取应用会话和消息日志 */
export const ListAppMessageWithConLog = /*#__PURE__*/createAPI<ListAppMessageWithConLogRequest, ListAppMessageWithConLogResponse>({
  "url": "/api/statistics/app/list_app_message_conlog",
  "method": "POST",
  "name": "ListAppMessageWithConLog",
  "reqType": "ListAppMessageWithConLogRequest",
  "reqMapping": {
    "body": ["agent_id", "start_time", "end_time", "page", "page_size"]
  },
  "resType": "ListAppMessageWithConLogResponse",
  "schemaRoot": "api://schemas/idl_statistics_statistics",
  "service": "statistics"
});
/** 导出应用对话消息日志 */
export const ExportConversationMessageLog = /*#__PURE__*/createAPI<ExportConversationMessageLogRequest, ExportConversationMessageLogResponse>({
  "url": "/api/statistics/app/export_conversation_message_log",
  "method": "POST",
  "name": "ExportConversationMessageLog",
  "reqType": "ExportConversationMessageLogRequest",
  "reqMapping": {
    "body": ["agent_id", "file_name", "conversation_ids", "run_ids", "expire_hours"]
  },
  "resType": "ExportConversationMessageLogResponse",
  "schemaRoot": "api://schemas/idl_statistics_statistics",
  "service": "statistics"
});
/** 查看导出的会话消息日志文件列表 */
export const ListExportConversationFiles = /*#__PURE__*/createAPI<ListExportConversationFilesRequest, ListExportConversationFilesResponse>({
  "url": "/api/statistics/app/list_export_conversation_files",
  "method": "POST",
  "name": "ListExportConversationFiles",
  "reqType": "ListExportConversationFilesRequest",
  "reqMapping": {
    "body": ["agent_id", "page", "page_size"]
  },
  "resType": "ListExportConversationFilesResponse",
  "schemaRoot": "api://schemas/idl_statistics_statistics",
  "service": "statistics"
});
/** 获取导出的会话消息日志文件下载链接 */
export const GetExportConversationFileDownloadUrl = /*#__PURE__*/createAPI<GetExportConversationFileDownloadUrlRequest, GetExportConversationFileDownloadUrlResponse>({
  "url": "/api/statistics/app/get_export_conversation_file_download_url",
  "method": "POST",
  "name": "GetExportConversationFileDownloadUrl",
  "reqType": "GetExportConversationFileDownloadUrlRequest",
  "reqMapping": {
    "body": ["agent_id", "export_task_id", "expire_seconds"]
  },
  "resType": "GetExportConversationFileDownloadUrlResponse",
  "schemaRoot": "api://schemas/idl_statistics_statistics",
  "service": "statistics"
});