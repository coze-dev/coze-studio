include "../base.thrift"

namespace go statistics

// 获取应用每日消息统计请求
struct GetAppDailyMessagesRequest {
    1: required i64 agent_id (api.body="agent_id", api.js_conv="true")
    2: required i64 start_time (api.body="start_time") // Unix时间戳（毫秒）
    3: required i64 end_time (api.body="end_time")     // Unix时间戳（毫秒）
}

// 消息统计数据
struct MessageStatData {
    1: required i64 agent_id (api.js_conv="true")
    2: required string date   // 日期格式: "2025-08-20" 或 "2025-08-20 15"
    3: required i64 count     // 消息数量
}

// 获取应用每日消息统计响应
struct GetAppDailyMessagesResponse {
    253: required i32 code
    254: required string msg
    1: required list<MessageStatData> data
}

// 获取应用每日活跃用户统计请求
struct GetAppDailyActiveUsersRequest {
    1: required i64 agent_id (api.body="agent_id", api.js_conv="true")
    2: required i64 start_time (api.body="start_time") // Unix时间戳（毫秒）
    3: required i64 end_time (api.body="end_time")     // Unix时间戳（毫秒）
}

// 活跃用户统计数据
struct ActiveUsersStatData {
    1: required i64 agent_id (api.js_conv="true")
    2: required string date   // 日期格式: "2025-08-20" 或 "2025-08-20 15"
    3: required i64 count     // 活跃用户数
}

// 获取应用每日活跃用户统计响应
struct GetAppDailyActiveUsersResponse {
    253: required i32 code
    254: required string msg
    1: required list<ActiveUsersStatData> data
}

// 获取应用平均会话互动数
struct GetAppAverageSessionInteractionsRequest {
    1: required i64 agent_id (api.body="agent_id", api.js_conv="true")
    2: required i64 start_time (api.body="start_time") // Unix时间戳（毫秒）
    3: required i64 end_time (api.body="end_time")     // Unix时间戳（毫秒）
}

// 平均会话次数统计
struct AverageSessionInteractionsData {
    1: required i64 agent_id (api.js_conv="true")
    2: required string date   // 日期格式: "2025-08-20" 或 "2025-08-20 15"
    3: required double count  // 平均互动次数（浮点数）
}

// 获取平均会话次数统计响应
struct GetAppAverageSessionInteractionsResponse {
    253: required i32 code
    254: required string msg
    1: required list<AverageSessionInteractionsData> data

}

// 获取应用Token统计请求
struct GetAppTokensRequest {
    1: required i64 agent_id (api.body="agent_id", api.js_conv="true")
    2: required i64 start_time (api.body="start_time") // Unix时间戳（毫秒）
    3: required i64 end_time (api.body="end_time")     // Unix时间戳（毫秒）
}

// Token统计数据
struct TokenStatData {
    1: required i64 agent_id (api.js_conv="true")
    2: required string date       // 日期格式
    3: required i64 input_tokens  // 输入Token数
    4: required i64 output_tokens // 输出Token数
    5: required i64 total_tokens  // 总Token数
}

// 获取应用Token统计响应
struct GetAppTokensResponse {
    253: required i32 code
    254: required string msg
    1: required list<TokenStatData> data
}

// 获取应用Token每秒吞吐量请求
struct GetAppTokensPerSecondRequest {
    1: required i64 agent_id (api.body="agent_id", api.js_conv="true")
    2: required i64 start_time (api.body="start_time") // Unix时间戳（毫秒）
    3: required i64 end_time (api.body="end_time")     // Unix时间戳（毫秒）
}

// Token每秒吞吐量数据
struct TokensPerSecondData {
    1: required i64 agent_id (api.js_conv="true")
    2: required string date    // 日期格式
    3: required double count   // 每秒Token数（浮点数）
}

// 获取应用Token每秒吞吐量响应
struct GetAppTokensPerSecondResponse {
    253: required i32 code
    254: required string msg
    1: required list<TokensPerSecondData> data
}


// ListAppConversationLog 应用会话日志列表
// 应用会话日志列表请求
struct ListAppConversationLogRequest {
    1: required i64 agent_id (api.body="agent_id", api.js_conv="true")
    2: required i64 start_time (api.body="start_time") // Unix时间戳（毫秒）
    3: required i64 end_time (api.body="end_time") // Unix时间戳（毫秒）
    4: optional i32 page (api.body="page") // 页码，默认1
    5: optional i32 page_size (api.body="page_size") // 页面大小，默认20
}

// 应用会话日志列表数据
struct ListAppConversationLogData {
    1: required string CreateTime //日期格式
    2: required string user
    3: required string ConversationName
    4: required i64 MessageCount
    5: required i64 AppConversationID (api.js_conv="true")
    6: required i64 CreateTimestamp

}

// 分页信息
struct PaginationInfo {
    1: required i32 page       // 当前页码
    2: required i32 page_size  // 页面大小
    3: required i64 total      // 总记录数
    4: required i32 total_pages // 总页数
}

// 应用会话日志列表响应
struct ListAppConversationLogResponse {
    253: required i32 code
    254: required string msg
    1: required list<ListAppConversationLogData> data
    2: optional PaginationInfo pagination // 分页信息
}

// ListConversationMessageLog 会话消息历史请求
struct ListConversationMessageLogRequest {
    1: required i64 agent_id (api.body="agent_id", api.js_conv="true")
    2: required i64 conversation_id (api.body="conversation_id", api.js_conv="true")
    3: optional i32 page (api.body="page") // 页码，默认1
    4: optional i32 page_size (api.body="page_size") // 页面大小，默认20

}

struct MessageContent {
    1: required string query
    2: optional string answer
}

// ListConversationMessageLog 会话消息历史数据
struct ListConversationMessageLogData {
    1: required i64 conversation_id (api.js_conv="true")
    2: required i64 run_id (api.js_conv="true")
    3: required MessageContent message
    4: required i64 tokens
    5: required double time_cost
    6: required string create_time //日期格式
}

struct MessageStatistics {
    1: required i64 message_count
    2: required i64 tokens_p50
    3: required double latency_p50
    4: required double latency_p99

}

// ListConversationMessageLog 会话消息历史 响应
struct ListConversationMessageLogResponse {
    253: required i32 code
    254: required string msg
    1: required list<ListConversationMessageLogData> data
    2: required MessageStatistics statistics
    3: optional PaginationInfo pagination // 分页信息

}

// ExportConversationMessageLog 导出会话消息日志请求
struct ExportConversationMessageLogRequest {
    1: required i64 agent_id (api.body="agent_id", api.js_conv="true")
    2: required string file_name (api.body="file_name")
    3: optional list<i64> conversation_ids (api.body="conversation_ids", api.js_conv="true")
    4: optional list<i64> run_ids (api.body="run_ids", api.js_conv="true")
    5: optional i32 expire_hours (api.body="expire_hours") // 导出文件保存小时数，默认72小时
}

// ExportConversationMessageLog 导出会话消息日志响应
struct ExportConversationMessageLogResponse {
    253: required i32 code
    254: required string msg
    1: optional string export_task_id
}

// ExportedConversationFileInfo 导出的会话日志文件信息
struct ExportedConversationFileInfo {
    1: required string export_task_id
    2: required string file_name
    3: required string object_key
    4: required string created_at
    5: required string expire_at
    6: required i32 status
}

// ListExportConversationFilesRequest 查看导出文件列表请求
struct ListExportConversationFilesRequest {
    1: required i64 agent_id (api.body="agent_id", api.js_conv="true")
    2: optional i32 page (api.body="page")
    3: optional i32 page_size (api.body="page_size")
}

// ListExportConversationFilesResponse 查看导出文件列表响应
struct ListExportConversationFilesResponse {
    253: required i32 code
    254: required string msg
    1: required list<ExportedConversationFileInfo> data
    2: optional PaginationInfo pagination
}

// GetExportConversationFileDownloadUrlRequest 获取导出文件下载链接请求
struct GetExportConversationFileDownloadUrlRequest {
    1: required i64 agent_id (api.body="agent_id", api.js_conv="true")
    2: required string export_task_id (api.body="export_task_id")
    3: optional i32 expire_seconds (api.body="expire_seconds") // 下载链接有效期，默认600s
}

// GetExportConversationFileDownloadUrlResponse 获取导出文件下载链接响应
struct GetExportConversationFileDownloadUrlResponse {
    253: required i32 code
    254: required string msg
    1: optional string file_url
}

// ListAppMessageWithConLog 请求 
struct ListAppMessageWithConLogRequest {
    1: required i64 agent_id (api.body="agent_id", api.js_conv="true")
    2: required i64 start_time (api.body="start_time") // Unix时间戳（毫秒）
    3: required i64 end_time (api.body="end_time") // Unix时间戳（毫秒）
    4: optional i32 page (api.body="page") // 页码
    5: optional i32 page_size (api.body="page_size") // 页面大小
}

// ListAppMessageWithConLog 数据 
struct ListAppMessageWithConLogData {
    1: required i64 conversation_id (api.js_conv="true")
    2: required string user
    3: required string ConversationName
    4: required i64 run_id (api.js_conv="true")
    5: required MessageContent message
    6: required string create_time
    7: required i64 tokens
    8: required double time_cost
}

// ListAppMessageWithConLog 响应
struct ListAppMessageWithConLogResponse {
    253: required i32 code
    254: required string msg
    1: required list<ListAppMessageWithConLogData> data
    2: optional PaginationInfo pagination // 分页信息
}




// 智能体统计服务
service StatisticsService {
    // 获取应用每日消息统计
    GetAppDailyMessagesResponse GetAppDailyMessages(1:GetAppDailyMessagesRequest request) (api.post="/api/statistics/app/messages")
    
    // 获取应用每日活跃用户统计
    GetAppDailyActiveUsersResponse GetAppDailyActiveUsers(1:GetAppDailyActiveUsersRequest request) (api.post="/api/statistics/app/active-users")
    
    // 获取应用平均会话互动数
    GetAppAverageSessionInteractionsResponse GetAppAverageSessionInteractions(1:GetAppAverageSessionInteractionsRequest request) (api.post="/api/statistics/app/session-interactions")
    
    // 获取应用Token使用统计
    GetAppTokensResponse GetAppTokens(1:GetAppTokensRequest request) (api.post="/api/statistics/app/tokens")
    
    // 获取应用Token每秒吞吐量统计
    GetAppTokensPerSecondResponse GetAppTokensPerSecond(1:GetAppTokensPerSecondRequest request) (api.post="/api/statistics/app/tokens-per-second")

    // 获取应用对话日志列表统计
    ListAppConversationLogResponse ListAppConversationLog(1:ListAppConversationLogRequest request) (api.post="/api/statistics/app/list_app_conversation_log")

    // 获取应用对话消息日志
    ListConversationMessageLogResponse ListConversationMessageLog(1:ListConversationMessageLogRequest request) (api.post="/api/statistics/app/list_conversation_message_log")

    // 获取应用会话和消息日志
    ListAppMessageWithConLogResponse ListAppMessageWithConLog(1:ListAppMessageWithConLogRequest request) (api.post="/api/statistics/app/list_app_message_conlog")

    // 导出应用对话消息日志
    ExportConversationMessageLogResponse ExportConversationMessageLog(1:ExportConversationMessageLogRequest request) (api.post="/api/statistics/app/export_conversation_message_log")

    // 查看导出的会话消息日志文件列表
    ListExportConversationFilesResponse ListExportConversationFiles(1:ListExportConversationFilesRequest request) (api.post="/api/statistics/app/list_export_conversation_files")

    // 获取导出的会话消息日志文件下载链接
    GetExportConversationFileDownloadUrlResponse GetExportConversationFileDownloadUrl(1:GetExportConversationFileDownloadUrlRequest request) (api.post="/api/statistics/app/get_export_conversation_file_download_url")

}
