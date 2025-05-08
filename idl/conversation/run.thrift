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

// event type

const string RunEventMessage = "message"
const string RunEventDone    = "done"
const string RunEventError   = "error"



struct MixContentModel  {
	1:list<Item> ItemList
	2:list<Item> ReferItems
}

struct Item  {
	1: string Type
	2: string Text
	3: Image Image
	4: File File
}

struct ImageDetail  {
	1:string URL
	2:i32    Width
	3:i32    Height
}

struct File  {
	1:string  FileKey
	2:string  FileName
	3:string  FileType
	4:i64   FileSize
	6:string  FileUrl
}

struct Image  {
	1: string Key
	2:ImageDetail ImageThumb
	3:ImageDetail ImageOri
}


struct Tool {
    1 : string plugin_id
    2 : map<string,parametersStruct>  parameters
    3 : string api_name
}

enum DiffModeIdentifier {
    ChatWithA = 1
    ChatWithB = 2
}


struct AgentRunRequest  {
    1 :          string             bot_id                     ,
    2 : required string             conversation_id            ,
    5 : required string             query                      ,
    7 :          map<string,string> extra                      ,
    9 :          map<string,string> custom_variables           ,
    10: optional bool               draft_mode                 , // 草稿bot or 线上bot
    11: optional common.Scene              scene               , // explore场景
    12: optional string             content_type               , // 文件 file 图片 image 等
    13: optional string             regen_message_id           , // 重试消息id
    14: optional string             local_message_id           , // 前端本地的message_id 在extra_info 里面透传返回
    15: optional string             preset_bot                 , // 使用的bot模版 代替bot_id bot_version draft_mode参数， coze home使用 preset_bot="coze_home"
    16: optional list<string>       insert_history_message_list,
    17: optional string             device_id,
    18: optional string             space_id,
    19: optional list<message.MsgParticipantInfo>  mention_list,
    20: optional list<Tool> toolList
    21: optional string     commit_version
    22: optional string     sub_scene // scene粒度下进一步区分场景，目前仅给bot模版使用 = bot_template
    23: optional DiffModeIdentifier diff_mode_identifier // diff模式下的聊天配置，仅草稿single bot
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
    1: i64 coze
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
    1: required string command_id
    2: map<string,string> parameters  // key=参数名 value=值  object_string object 数组序列化之后的 JSON String
}


struct ChatV3Request {
    1: required string BotID (api.body = "bot_id"),
    2: optional string ConversationID (api.query = "conversation_id"),
    3: required string User (api.body = "user_id"),
    4: optional bool Stream (api.body = "stream"),
    6: optional map<string,string> CustomVariables (api.body = "custom_variables"),
    7: optional bool AutoSaveHistory (api.body = "auto_save_history"),
    8: optional map<string, string> MetaData (api.body = "meta_data")
    9: optional list<Tool> Tools (api.body = "tools"),
    10:optional CustomConfig CustomConfig (api.body = "custom_config")
    11:optional map<string, string> ExtraParams (api.body = "extra_params") // 透传参数到 plugin/workflow 等下游
    12:optional string ConnectorID (api.body="connector_id") // 手动指定渠道 id 聊天。目前仅支持 websdk(=999)
    13:optional ShortcutCommandDetail ShortcutCommand (api.body="shortcut_command") // 指定快捷指令
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
    1: required string ID (api.body = "id"),
    2: required string ConversationID (api.body = "conversation_id"),
    3: required string BotID (api.body = "bot_id"),
    4: optional i32 CreatedAt (api.body = "created_at"),
    5: optional i32 CompletedAt (api.body = "completed_at"),
    6: optional i32 FailedAt (api.body = "failed_at"),
    7: optional map<string, string> MetaData (api.body = "meta_data"),
    8: optional LastError LastError (api.body = "last_error"),
    9: required string Status (api.body = "status"),
    10: optional Usage Usage (api.body = "usage"),
    11: optional RequiredAction RequiredAction (api.body = "required_action")
    12: optional string SectionID (api.body="section_id")
}


// no stream
struct ChatV3Response {
    1: optional ChatV3ChatDetail ChatDetail (api.body = "data"),
    2: required i32 Code (api.body = "code"),
    3: required string Msg (api.body = "msg")
}