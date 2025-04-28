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
