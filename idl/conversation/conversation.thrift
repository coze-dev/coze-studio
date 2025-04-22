include "../base.thrift"
include "common.thrift"

namespace go conversation_conversation

struct ClearConversationHistoryRequest  {
    1: required string conversation_id
    2: optional common.Scene  scene
    3: optional string bot_id
}

struct ClearConversationHistoryResponse {
    1:          i64    code
    2:          string msg
    3: required string new_section_id
}

struct ClearConversationCtxRequest  {
   1: required string conversation_id
    2: optional common.Scene  scene
    3: optional list<string>  insert_history_message_list, // 存在需要插入聊天的情况
}

struct ClearConversationCtxResponse  {
    1:          i64    code
    2:          string msg
    3: required string new_section_id
}
