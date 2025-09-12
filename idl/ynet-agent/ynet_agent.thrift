namespace go ynet_agent

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
    // 智能体版本回滚接口
    RevertDraftBotResponse RevertDraftBot(1: RevertDraftBotRequest req) (api.post="/api/ynet-agent/revert-draft-bot")
}