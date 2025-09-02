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
}