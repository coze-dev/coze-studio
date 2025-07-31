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
// Enumeration following copilot definition
enum ChatMessageMetaType {
    Default_0 = 0;  // Compatible value
    Replaceable = 1;  // End-to-side direct replacement
    Insertable = 2;  // insert reference
    DocumentRef = 3;  // document citation
    KnowledgeCard = 4; // Knowledge Base Reference Card
    EmbeddedMultimedia = 100;   // The embedded multimedia information is only used by Alice for the end. Because full link multiplexing uses this field, it has been changed here.
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
    20: string task_type, // Corresponding to timed task task_type, 1-preset task, 2-user task, 3-Plugin background task
    21: string refer_format //Agent app uses reference format
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
    11: bool is_fav // Is collected
//    12: shortcut_command ShortcutStruct shortcuts//Shortcuts
    13: bool allow_share // Is it allowed to be shared?
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

// Keep up with bot_connector_platform
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
    9 :          string    status      , // Normal, interrupted state, used when pulling the message list, this field is not available when chat is running.
    10: optional i32       broken_pos  , // interrupt position
    11: optional string    sender_id,
    12: optional list<MsgParticipantInfo>  mention_list,
    13:          i64       content_time,
    14:          i64       message_index (api.js_conv='true' go.tag="json:\"message_index,string\""),
    15:          i32       source      , // Sources, 0 normal chat messages, 1 scheduled task, 2 notifications, 3 asynchronous results
    16: optional ChatMessage reply_message, // Corresponding to the replied query, the backend cannot be found, and a backend is added.
    17: optional RequiredAction    required_action // interrupt message
    18: optional list<ChatMessageMetaInfo> meta_infos, // Text markup such as quoting, highlighting, etc
    19: optional map<string,string> card_status  // Card Status
    20: optional string reasoning_content  //Model Thinking Chain
}


struct GetMessageListRequest  {

    1:           string        conversation_id
    2: required  string        cursor                      // First pass 0/-1, 0 - last page, -1 - unread first page
    3: required  i32           count
    4:           string        bot_id
    5: optional  bool          draft_mode
    6: optional  string        preset_bot                  // The bot template used
    7: optional  common.Scene         scene
    8: optional  string        biz_kind                    // Different business situations under the same bot and uid
    9: optional  list<string>  insert_history_message_list // There are situations where you need to insert a chat before creating a chat history
    10: optional LoadDirection load_direction
    11: optional bool          must_append                // Whether to force an appended message in an existing conversation
    12: optional i64           share_id  (api.js_conv='true' go.tag="json:\"share_id,string\"")              // Share ID
}

struct GetMessageListResponse  {
    1: required list<ChatMessage> message_list
    2: required string            cursor          // The position when the next brush exists (page up), opposite to the next_cursor page turning direction. Compatible with old logic, no prev prefix
    3: required bool              hasmore         // Whether the next swipe exists (page up), the opposite direction to the next_has_more page turning. Compatible with old logic, without prev prefix
    4: required string            conversation_id
    5: optional string            last_section_id // Session Latest section_id Only First Brush Back
    6:          i64               code
    7:          string            msg
    8: optional map<string, MsgParticipantInfo> participant_info_map
    9:          string           next_cursor           // The position when the next swipe exists (page down),
    10:         bool             next_has_more         // Does the next swipe exist (page down)
    11:         i64              read_message_index (api.js_conv='true' go.tag="json:\"read_message_index,string\"")
    12:         string           connector_conversation_id //ID for botconnector
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
    1: required i64 conversation_id (api.js_conv='true') //session id
    2: required i64 query_message_id (api.js_conv='true')// Current issue id
    3: optional i64 answer_message_id  (api.js_conv='true') // Which reply was interrupted under the current question?
    4: optional i32    broken_pos        // interrupt position
    5: optional common.Scene  scene
}
struct BreakMessageResponse  {
    1: i64    code
    2: string msg
}

//batch query
struct ListMessageApiRequest {
    1:   required  i64    conversation_id (api.query = "conversation_id",api.js_conv='true') //session id
    2:   optional  i64    limit (api.body = "limit")  // limit number of entries
    3:   optional  string order (api.body = "order")  // Sort by desc/asc
    4:   optional  i64    chat_id (api.body = "chat_id",api.js_conv='true') //ID of a conversation
    5:   optional  i64    before_id (api.body = "before_id",api.js_conv='true') // The ID you need to pass to turn the page forward.
    6:   optional  i64    after_id (api.body = "after_id",api.js_conv='true')   // Return the ID to be passed backwards.
    255: base.Base Base
}

struct OpenMessageApi {
    1:  i64                id  (api.js_conv='true')// primary key ID
    2:  i64                bot_id (api.js_conv='true') // agent id
    3:  string             role  // user / assistant/tool
    4:  string             content //message content
    5:  i64                conversation_id //session id
    6:  map<string,string> meta_data // custom field
    7:  i64                created_at //creation time
    8:  i64                updated_at   //update time
    9:  i64                chat_id // ID of a conversation
    10: string             content_type // Content type, text/mix
    11: string             type //Message Type answer/question/function_call/tool_response
    12: string             section_id // The section_id of conversation
    13: optional string    reasoning_content //Model Thinking Chain
}


struct ListMessageApiResponse {
    1:   optional list<OpenMessageApi> messages (api.body = "data")
    2:   optional bool                 has_more (api.body = "has_more") // Is there still data, true yes, false no
    3:   optional i64                  first_id (api.body = "first_id",api.js_conv='true') // The ID of the first piece of data
    4:   optional i64                  last_id (api.body = "last_id",api.js_conv='true')    // The id of the last piece of data.
}
