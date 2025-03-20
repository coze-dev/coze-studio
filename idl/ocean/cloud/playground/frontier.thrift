namespace go ocean.cloud.playground

// 业务枚举（消息的一级分类）
enum FrontierMessageBiz {
    Editor = 1, // Bot 编辑页
    Plugin = 2, // 插件
    DebugTask = 3, // 调试区task
    MessageNotify = 4, // 消息通知
    EditorPic = 5, //  Bot 编辑图片生成

}

// Bot 编辑页消息二级分类
enum EditorMessageType {
    // 上行消息 1 开头
    EditHeartbeat = 10001,
    EditLockPreempt = 10002,
    EditLockRelease = 10003,
    EditWindowBind = 10004,
    // 下行消息 2 开头
    EditLockHolder = 20001,
    EditLockLoss = 20002,
    NewCommit = 20003,
}

// Bot 编辑页消息
struct EditorMessage {
    1: required EditorMessageType MessageType (go.tag="json:\"message_type\""), // 二级消息类型
    2: required string Payload                (go.tag="json:\"payload\""), // 消息内容（JSON 格式的字符串）

    // 追溯问题相关字段（可选）
    100: optional i64 MessageID (go.tag="json:\"message_id\""),  // generated id
    101: optional i64 SendAt    (go.tag="json:\"send_at\""),     // unix timestamp in second
}

// DebugTask 消息
struct DebugTaskMessage {
    1: required string MessageType (go.tag="json:\"message_type\""), // 二级消息类型
    2: required string Payload     (go.tag="json:\"payload\""), // 消息内容（JSON 格式的字符串)
}

struct DebugTaskPayload {
    1: string BotId (go.tag="json:\"bot_id\""),
    2: string TaskId     (go.tag="json:\"task_id\""),
    3: string ConversationId (go.tag="json:\"conversation_id\""),
    4: list<CozeChatMessage> MessageList     (go.tag="json:\"message_list\""),
}

// DebugTask 消息
struct MessageNotifyMessage {
    1: required string MessageType (go.tag="json:\"message_type\""), // 二级消息类型
    2: required string Scene  (go.tag="json:\"scene\""), // coze场景，home/store/debug
    3: required string Payload (go.tag="json:\"payload\""), // 消息内容（JSON 格式的字符串)
}

struct MessageNotifyPayload {
    1: string BotId (go.tag="json:\"bot_id\""),
    2: string ConversationId (go.tag="json:\"conversation_id\""),
    3: i64 ReadMessageIndex (go.tag="json:\"read_message_index,string\""),
    4: i64 EndMessageIndex (go.tag="json:\"end_message_index,string\""),
    5: string CustomVersion (go.tag="json:\"custom_version\""), // 取值为inhouse或者release。home场景会话区分inhouse和release，需要额外参数方便在非home页面中判断是home哪个环境的message
}


struct CozeChatMessage {
    1 :          string    role        ,
    2 :          string    type        ,
    3 :          string    content     ,
    4 :          string    content_type,
    5 :          string    message_id  ,
    6 :          string    reply_id    ,
    7 :          string    section_id  ,
    8 :          CozeChatMessageExtraInfo extra_info  ,
    9 :          string    status      , // 正常、打断状态 拉消息列表时使用，chat运行时没有这个字段
    10: optional i32       broken_pos  , // 打断位置
    11: optional string    sender_id,
}

struct CozeChatMessageExtraInfo {
    1 : string local_message_id,
    2 : string input_tokens    ,
    3 : string output_tokens   ,
    4 : string token           ,
    5 : string plugin_status   , // "success" or "fail"
    6 : string time_cost       ,
    7 : string workflow_tokens ,
    8 : string bot_state       ,
    9 : string plugin_request  ,
    10: string tool_name       ,
    11: string plugin          ,
    12: string mock_hit_info   ,
    13: string log_id          ,
}

