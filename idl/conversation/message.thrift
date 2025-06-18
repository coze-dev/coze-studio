include "../base.thrift"
include "common.thrift"

namespace go conversation.message

enum LoadDirection {
    Unknown = 0
    Prev = 1
    Next = 2
}
const string OrderByDesc = "DESC"
const string OrderByAsc = "ASC"

enum MsgParticipantType {
    Bot = 1
    User = 2
}
// follow copilot 定义的枚举
enum ChatMessageMetaType {
    Default_0 = 0;  // Compatible value
    Replaceable = 1;  // 端侧直接替换
    Insertable = 2;  // 插入引用
    DocumentRef = 3;  // 文档引用
    KnowledgeCard = 4; // 知识库引用卡片
    EmbeddedMultimedia = 100;   // 嵌入的多媒体信息，只是alice给端上用的，因为全链路复用这一个字段，所以在这儿改了
}

struct ExtraInfo {
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
    14: string stream_id          ,
    15: string message_title          ,
    16: string stream_plugin_running          ,
    17: string new_section_id,
    18: string remove_query_id,
    19: string execute_display_name,
    20: string task_type, // 对应定时任务task_type，1-预设任务，2-用户任务，3-Plugin后台任务
    21: string refer_format //agent app使用引用格式
    22: string call_id,
}

struct MsgParticipantInfo{
    1: string id
    2: MsgParticipantType type
    3: string name
    4: string desc
    5: string avatar_url
    6: string space_id
    7: string user_id
    8: string user_name
    9: bool allow_mention
    10: string access_path
    11: bool is_fav // 是否被收藏
//    12: shortcut_command.ShortcutStruct shortcuts //快捷指令
    13: bool allow_share // 是否允许被分享
}

//struct InterruptFunction {
//  1: string name
//  2: string arguments
//}

//struct InterruptRequireInfo {
//  1: string require_fields
//  2: string name
//}


struct InterruptPlugin {
  1: string id
  2: string type   // 1 function, 2 require_info
//  3: InterruptFunction function = 3;
//  4: InterruptRequireInfo require_info = 4;
}


struct SubmitToolOutputs {
  1: list<InterruptPlugin>  tool_calls
}

// 和 bot_connector_platform保持同步
struct RequiredAction {
	1 : string type
	2 :SubmitToolOutputs submit_tool_outputs
}

struct ChatMessageMetaInfo{
    1: ChatMessageMetaType type,
    2: string info,
}


struct ChatMessage {
    1 :          string    role        ,
    2 :          string    type        ,
    3 :          string    content     ,
    4 :          string    content_type,
    5 :          string    message_id  ,
    6 :          string    reply_id    ,
    7 :          string    section_id  ,
    8 :          ExtraInfo extra_info  ,
    9 :          string    status      , // 正常、打断状态 拉消息列表时使用，chat运行时没有这个字段
    10: optional i32       broken_pos  , // 打断位置
    11: optional string    sender_id,
    12: optional list<MsgParticipantInfo>  mention_list,
    13:          i64       content_time,
    14:          i64       message_index (api.js_conv='true' go.tag="json:\"message_index,string\""),
    15:          i32       source      , // 消息来源，0 普通聊天消息，1 定时任务，2 通知，3 异步结果
    16: optional ChatMessage reply_message, // 对应回复的query 找不到后端加一个兜底的
    17: optional RequiredAction    required_action // 打断信息
    18: optional list<ChatMessageMetaInfo> meta_infos, // 引用、高亮等文本标记
    19: optional map<string,string> card_status  // 卡片状态
    20: optional string reasoning_content  //模型思维链
}


struct GetMessageListRequest  {

    1:           string        conversation_id
    2: required  string        cursor                      // 首次传0/-1，0-最后一页，-1-未读第一页
    3: required  i32           count
    4:           string        bot_id
    5: optional  bool          draft_mode
    6: optional  string        preset_bot                  // 使用的bot模版
    7: optional  common.Scene         scene
    8: optional  string        biz_kind                    // 同一个bot和uid下面的不同业务情况
    9: optional  list<string>  insert_history_message_list // 存在创建聊天记录前需要插入聊天的情况
    10: optional LoadDirection load_direction
    11: optional bool          must_append                // 在已有conversation情况下，是否强制append message
    12: optional i64           share_id  (api.js_conv='true' go.tag="json:\"share_id,string\"")              // 分享ID
}

struct GetMessageListResponse  {
    1: required list<ChatMessage> message_list
    2: required string            cursor          // 下一刷存在时的位置（向上翻页），与next_cursor翻页方向相反。兼容旧逻辑，不加prev前缀
    3: required bool              hasmore         // 下一刷是否存在（向上翻页），与next_has_more翻页方向相反。兼容旧逻辑，不加prev前缀
    4: required string            conversation_id
    5: optional string            last_section_id // 会话最新的section_id 只有第一刷返回
    6:          i64               code
    7:          string            msg
    8: optional map<string, MsgParticipantInfo> participant_info_map
    9:          string           next_cursor           // 下一刷存在时的位置（向下翻页），
    10:         bool             next_has_more         // 下一刷是否存在（向下翻页）
    11:         i64              read_message_index (api.js_conv='true' go.tag="json:\"read_message_index,string\"")
    12:         string           connector_conversation_id //botconnector对应的id
}

struct DeleteMessageRequest  {
    1: required i64 conversation_id (api.js_conv='true')
    2: required i64 message_id (api.js_conv='true')
    3: optional common.Scene  scene
    4: optional i64 bot_id (api.js_conv='true')
}


struct DeleteMessageResponse  {
    1:         i64               code
    2:         string            msg
}

struct BreakMessageRequest  {
    1: required i64 conversation_id (api.js_conv='true') //会话id
    2: required i64 query_message_id (api.js_conv='true')// 当前问题id
    3: optional i64 answer_message_id  (api.js_conv='true') // 当前问题下哪一条回复被打断了
    4: optional i32    broken_pos        // 打断位置
    5: optional common.Scene  scene
}
struct BreakMessageResponse  {
    1: i64    code
    2: string msg
}

//批量查询
struct ListMessageApiRequest {
    1:   required  i64    conversation_id (api.query = "conversation_id",api.js_conv='true') //会话id
    2:   optional  i64    limit (api.body = "limit")  // 限制条数
    3:   optional  string order (api.body = "order")  // 排序方式 desc/asc
    4:   optional  i64    chat_id (api.body = "chat_id",api.js_conv='true') //一次对话的id
    5:   optional  i64    before_id (api.body = "before_id",api.js_conv='true') // 向前翻页需要传的ID
    6:   optional  i64    after_id (api.body = "after_id",api.js_conv='true')   // 向后返回需要传的ID
    255: base.Base Base
}

struct OpenMessageApi {
    1:  i64                id  (api.js_conv='true')// 主键ID
    2:  i64                bot_id (api.js_conv='true') // agent id
    3:  string             role  // user / assistant/tool
    4:  string             content //消息内容
    5:  i64                conversation_id //会话id
    6:  map<string,string> meta_data // 自定义字段
    7:  i64                created_at //创建时间
    8:  i64                updated_at   //更新时间
    9:  i64                chat_id // 一次对话的id
    10: string             content_type // content 类型 ，text/mix
    11: string             type //消息类型 answer/question/function_call/tool_response
    12: string             section_id // 会话的section_id
    13: optional string    reasoning_content //模型思维链
}


struct ListMessageApiResponse {
    1:   optional list<OpenMessageApi> messages (api.body = "data")
    2:   optional bool                 has_more (api.body = "has_more") // 是否还有数据，true 有，false 没有
    3:   optional i64                  first_id (api.body = "first_id",api.js_conv='true') // 第一条数据的id
    4:   optional i64                  last_id (api.body = "last_id",api.js_conv='true')    // 最后一条数据的id
}
