include "../base.thrift"
include "common.thrift"
include "message.thrift"
namespace go conversation.run

struct parametersStruct {
    1 : string value
    2 : string resource_type // "uri"
}


// content type
const string ContentTypeText = "text"
const string ContentTypeImage = "image"
const string ContentTypeAudio = "audio"
const string ContentTypeVideo = "video"
const string ContentTypeLink  = "link"
const string ContentTypeMusic = "music"
const string ContentTypeCard  = "card"
const string ContentTypeAPP   = "app"
const string ContentTypeFile  = "file"
const string ContentTypeMix   = "mix"
const string ContentTypeMixApi = "object_string"

// event type

const string RunEventMessage = "message"
const string RunEventDone    = "done"
const string RunEventError   = "error"



struct MixContentModel  {
	1:list<Item> item_list
	2:list<Item> refer_items
}

struct Item  {
	1: string type
	2: string text
	3: Image image
	4: File file
}

struct ImageDetail  {
	1:string url
	2:i32    width
	3:i32    height
}

struct File  {
	1:string  file_key
	2:string  file_name
	3:string  file_type
	4:i64     file_size
	6:string  file_url
}

struct Image  {
	1: string key
	2:ImageDetail image_thumb
	3:ImageDetail image_ori
}


struct Tool {
    1 : i64 plugin_id (api.js_conv='true')
    2 : map<string,parametersStruct>  parameters
    3 : string api_name
    4 : i64 tool_id  (api.js_conv='true')
}

enum DiffModeIdentifier {
    ChatWithA = 1
    ChatWithB = 2
}

struct AdditionalContent {
     1: required string type
     2: optional string text
     3: optional string file_url
}

struct AgentRunRequest  {
    1 :          i64             bot_id    (api.js_conv='true') , //agent id
    2 : required i64             conversation_id  (api.js_conv='true')         , // 会话id
    5 : required string             query                      ,
    7 :          map<string,string> extra                      , // ext 透传字段
    9 :          map<string,string> custom_variables           ,
    10: optional bool               draft_mode                 , // 草稿bot or 线上bot
    11: optional common.Scene              scene               , // explore场景
    12: optional string             content_type               , // 文件 file 图片 image 等
    13: optional i64             regen_message_id   (api.js_conv='true')          , // 重试消息id
    14: optional string             local_message_id           , // 前端本地的message_id 在extra_info 里面透传返回
    15: optional string             preset_bot                 , // 使用的bot模版 代替bot_id bot_version draft_mode参数， coze home使用 preset_bot="coze_home"
    16: optional list<string>       insert_history_message_list,
    17: optional string             device_id,
    18: optional i64             space_id (api.js_conv='true'),
    19: optional list<message.MsgParticipantInfo>  mention_list,
    20: optional list<Tool> toolList
    21: optional string     commit_version
    22: optional string     sub_scene // scene粒度下进一步区分场景，目前仅给bot模版使用 = bot_template
    23: optional DiffModeIdentifier diff_mode_identifier // diff模式下的聊天配置，仅草稿single bot
    24: optional i64 shortcut_cmd_id  (api.js_conv='true')
}



struct RunStreamResponse {
    1: required message.ChatMessage message
    2: optional bool        is_finish
    3: required i32         index
    4: required string      conversation_id
    5: required i32         seq_id
}

struct AgentRunResponse  {
    1: i64    code
    2: string msg
}

struct ErrorData {
    1: i64 code
    2: string msg
}


struct CustomConfig {
    1: optional ModelConfig ModelConfig (api.body = "model_config")
    2: optional BotConfig BotConfig (api.body = "bot_config")
}

struct ModelConfig{
    1: optional string ModelID (api.body="model_id")
}

struct BotConfig{
    1: optional string CharacterName (api.body="character_name")
    2: optional string Prompt (api.body="propmt")
}
struct ShortcutCommandDetail {
    1: required i64 command_id (api.js_conv='true')
    2: map<string,string> parameters  // key=参数名 value=值  object_string object 数组序列化之后的 JSON String
}


struct ChatV3Request {
    1: required i64 BotID (api.body = "bot_id",api.js_conv='true'), //agent_id
    2: optional i64 ConversationID (api.query = "conversation_id", api.js_conv='true'), //conversation_id
    3: required string User (api.body = "user_id"), //user_id，数据隔离标识，需要保证唯一
    4: optional bool Stream (api.body = "stream"), //是否流式，当前仅支持流失
    5: optional list<EnterMessage> AdditionalMessages (api.body = "additional_messages"), //本次对话消息，当前仅支持role=user
    6: optional map<string,string> CustomVariables (api.body = "custom_variables"), //用户自定义变量
    8: optional map<string, string> MetaData (api.body = "meta_data")
    10:optional CustomConfig CustomConfig (api.body = "custom_config")
    11:optional map<string, string> ExtraParams (api.body = "extra_params") // 透传参数到 plugin/workflow 等下游
    12:optional i64 ConnectorID (api.body="connector_id", api.js_conv='true') // 手动指定渠道 id 聊天。目前仅支持 websdk(=999)
    13:optional ShortcutCommandDetail ShortcutCommand (api.body="shortcut_command") // 指定快捷指令
}

struct ChatV3MessageDetail {
    1: required string ID (api.body = "id"),
    2: required string ConversationID (api.body = "conversation_id"),
    3: required string BotID (api.body = "bot_id"),
    4: required string Role (api.body = "role"),
    5: required string Type (api.body = "type"),
    6: required string Content (api.body = "content"),
    7: required string ContentType (api.body = "content_type"),
    8: optional map<string, string> MetaData (api.body = "meta_data"),
    9: required string ChatID (api.body = "chat_id")
    10: optional string SectionID (api.body="section_id")
    11: optional i64 CreatedAt (api.body = "created_at")
    12: optional i64 UpdatedAt (api.body = "updated_at")
    13: optional string ReasoningContent (api.body = "reasoning_content")
}


struct EnterMessage  {
    1: string Role (api.body = "role"), // user / assistant
    2: string Content (api.body = "content"), // 如果是非 text，需要解析 JSON
    3: map<string,string> MetaData (api.body = "meta_data"),
    4: string ContentType (api.body = "content_type"), // text, card, object_string
    5: optional string Type (api.body = "type")
    6: optional string Name (api.body = "name")
}

struct LastError {
    1: required i32 Code (api.body = "code"),
    2: required string Msg (api.body = "msg"),
}

struct Usage {
    1: optional i32 TokenCount (api.body = "token_count"),
    2: optional i32 OutputTokens (api.body = "output_count"),
    3: optional i32 InputTokens (api.body = "input_count"),
}

struct RequiredAction {
    1: string Type (api.body = "type"),
    2: SubmitToolOutputs SubmitToolOutputs (api.body = "submit_tool_outputs")
}

struct SubmitToolOutputs {
    1: list<InterruptPlugin> ToolCalls (api.body = "tool_calls")
}

struct InterruptPlugin {
    1: string id
    2: string type
    3: InterruptFunction function
    4: InterruptRequireInfo require_info
}

struct InterruptFunction {
    1: string name
    2: string arguments
}

struct InterruptRequireInfo {
    1: list<string> infos
}

struct ChatV3ChatDetail {
    1: required i64 ID (api.body = "id",api.js_conv='true'),
    2: required i64 ConversationID (api.body = "conversation_id",api.js_conv='true'),
    3: required i64 BotID (api.body = "bot_id",api.js_conv='true'),
    4: optional i32 CreatedAt (api.body = "created_at"),
    5: optional i32 CompletedAt (api.body = "completed_at"),
    6: optional i32 FailedAt (api.body = "failed_at"),
    7: optional map<string, string> MetaData (api.body = "meta_data"),
    8: optional LastError LastError (api.body = "last_error"),
    9: required string Status (api.body = "status"),
    10: optional Usage Usage (api.body = "usage"),
    11: optional RequiredAction RequiredAction (api.body = "required_action")
    12: optional i64 SectionID (api.body="section_id",api.js_conv='true')
}


// no stream
struct ChatV3Response {
    1: optional ChatV3ChatDetail ChatDetail (api.body = "data"),
    2: required i32 Code (api.body = "code"),
    3: required string Msg (api.body = "msg")
}