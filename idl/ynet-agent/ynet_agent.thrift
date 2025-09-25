namespace go ynet_agent

// HiAgent 智能体信息 - 对应 external_agent_config 表
struct HiAgentInfo {
    1: required i64 id (api.js_conv='true', agw.js_conv="str")         // 主键ID
    2: required i64 space_id (api.js_conv='true', agw.js_conv="str")   // 空间ID
    3: required string name                          // 智能体名称
    4: optional string description                   // 描述
    5: required string platform                     // 平台类型 (hiagent等)
    6: required string agent_url                    // API端点URL
    7: optional string agent_key                    // API密钥（查询时不返回明文）
    8: optional string agent_id                     // 外部智能体ID
    9: optional string app_id                       // 应用ID
    10: optional string icon                        // 图标
    11: optional string category                    // 分类
    12: required i32 status                         // 状态：0-禁用，1-启用
    13: optional string metadata                    // JSON元数据
    14: required i64 created_by (api.js_conv='true', agw.js_conv="str") // 创建者ID
    15: optional i64 updated_by (api.js_conv='true', agw.js_conv="str") // 更新者ID
    16: required string created_at                  // 创建时间
    17: required string updated_at                  // 更新时间
}

// 创建 HiAgent 请求
struct CreateHiAgentRequest {
    1: required i64 space_id (api.path="space_id", api.js_conv='true', agw.js_conv="str")
    2: required string name (api.body="name")
    3: optional string description (api.body="description")
    4: optional string platform (api.body="platform")
    5: required string agent_url (api.body="agent_url")
    6: optional string agent_key (api.body="agent_key")
    7: optional string agent_id (api.body="agent_id")
    8: optional string app_id (api.body="app_id")
    9: optional string icon (api.body="icon")
    10: optional string category (api.body="category")
}

struct CreateHiAgentResponse {
    253: required i32 code
    254: required string msg
    1: required HiAgentInfo data
}

// 更新 HiAgent 请求
struct UpdateHiAgentRequest {
    1: required i64 space_id (api.path="space_id", api.js_conv='true', agw.js_conv="str")
    2: required i64 agent_id (api.path="agent_id", api.js_conv='true', agw.js_conv="str")
    3: optional string name (api.body="name")
    4: optional string description (api.body="description")
    5: optional string platform (api.body="platform")
    6: optional string agent_url (api.body="agent_url")
    7: optional string agent_key (api.body="agent_key")
    8: optional string agent_id_str (api.body="external_agent_id")
    9: optional string app_id (api.body="app_id")
    10: optional string icon (api.body="icon")
    11: optional string category (api.body="category")
    12: optional i32 status (api.body="status")
}

struct UpdateHiAgentResponse {
    253: required i32 code
    254: required string msg
    1: required HiAgentInfo data
}

// 删除 HiAgent 请求
struct DeleteHiAgentRequest {
    1: required i64 space_id (api.path="space_id", api.js_conv='true', agw.js_conv="str")
    2: required string agent_id (api.path="agent_id", api.js_conv='true', agw.js_conv="str")
}

struct DeleteHiAgentResponse {
    253: required i32 code
    254: required string msg
}

// 获取 HiAgent 详情请求
struct GetHiAgentRequest {
    1: required i64 space_id (api.path="space_id", api.js_conv='true', agw.js_conv="str")
    2: required string agent_id (api.path="agent_id", api.js_conv='true', agw.js_conv="str")
}

struct GetHiAgentResponse {
    253: required i32 code
    254: required string msg
    1: required HiAgentInfo data
}

// 获取 HiAgent 列表请求
struct GetHiAgentListRequest {
    1: required i64 space_id (api.path="space_id", api.js_conv='true', agw.js_conv="str")
    2: optional i32 page_size (api.query="page_size")      // 页面大小，默认20
    3: optional string page_token (api.query="page_token") // 分页token
    4: optional string filter (api.query="filter")         // 搜索关键词
    5: optional string sort_by (api.query="sort_by")       // 排序字段：created_at, name, status
}

struct GetHiAgentListResponse {
    253: required i32 code
    254: required string msg
    1: required list<HiAgentInfo> agents
    2: required i32 total
    3: optional string next_page_token
}

// 测试 HiAgent 连接请求
struct TestHiAgentConnectionRequest {
    1: required string endpoint (api.body="endpoint")
    2: required string auth_type (api.body="auth_type")
    3: optional string api_key (api.body="api_key")
}

struct TestHiAgentConnectionResponse {
    253: required i32 code
    254: required string msg
    1: optional bool is_connected
    2: optional string test_message
}

// 智能体版本回滚请求
struct RevertDraftBotRequest {
    1: required i64 space_id (api.body="space_id", api.js_conv='true', agw.js_conv="str")  // 空间ID
    2: required i64 bot_id (api.body="bot_id", api.js_conv='true', agw.js_conv="str")      // 智能体ID
    3: required string version (api.body="version")   // 要回滚到的版本号
}

// 智能体版本回滚响应
struct RevertDraftBotResponse {
    253: required i32 code     // 响应码
    254: required string msg    // 响应消息
    1: optional RevertDraftBotData data  // 回滚后的数据
}

// 回滚成功后的数据
struct RevertDraftBotData {
    1: required i64 bot_id (api.js_conv='true', agw.js_conv="str")    // 智能体ID
    2: required string version   // 回滚到的版本号
    3: required i64 updated_at   // 更新时间戳
    4: optional string message   // 回滚操作的描述信息
}

// 服务定义
service YnetAgentService {
    // HiAgent CRUD 接口
    CreateHiAgentResponse CreateHiAgent(1: CreateHiAgentRequest req) (api.post="/api/space/{space_id}/hi-agents")
    UpdateHiAgentResponse UpdateHiAgent(1: UpdateHiAgentRequest req) (api.put="/api/space/{space_id}/hi-agents/{agent_id}")
    DeleteHiAgentResponse DeleteHiAgent(1: DeleteHiAgentRequest req) (api.delete="/api/space/{space_id}/hi-agents/{agent_id}")
    GetHiAgentResponse GetHiAgent(1: GetHiAgentRequest req) (api.get="/api/space/{space_id}/hi-agents/{agent_id}")
    GetHiAgentListResponse GetHiAgentList(1: GetHiAgentListRequest req) (api.get="/api/space/{space_id}/hi-agents")

    // 测试连接
    TestHiAgentConnectionResponse TestHiAgentConnection(1: TestHiAgentConnectionRequest req) (api.post="/api/hi-agents/test-connection")

    // 智能体版本回滚接口（保持原有功能）
    RevertDraftBotResponse RevertDraftBot(1: RevertDraftBotRequest req) (api.post="/api/ynet-agent/revert-draft-bot")
}