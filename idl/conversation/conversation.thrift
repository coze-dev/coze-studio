include "../base.thrift"
include "common.thrift"

namespace go conversation.conversation

struct ClearConversationHistoryRequest  {
    1: required i64 conversation_id  ( api.js_conv="true")
    2: optional common.Scene  scene
    3: optional i64 bot_id  ( api.js_conv="true")
}

struct ClearConversationHistoryResponse {
    1:          i64    code
    2:          string msg
    3: required i64 new_section_id  ( api.js_conv="true")
}

struct ClearConversationCtxRequest  {
   1: required i64 conversation_id ( api.js_conv="true")
    2: optional common.Scene  scene
    3: optional list<string>  insert_history_message_list, // 存在需要插入聊天的情况
}

struct ClearConversationCtxResponse  {
    1:          i64    code
    2:          string msg
    3: required i64 new_section_id  ( api.js_conv="true")
}


struct ConversationData {
    1: i64             Id (api.body = "id", agw.key = "id", api.js_conv="true")
    2: i64                CreatedAt (api.body = "created_at", agw.key = "created_at")
    3: map<string,string> MetaData (api.body = "meta_data", agw.key = "meta_data")
    4: optional i64 CreatorID (api.body = "creator_d", agw.key = "creator_d", api.js_conv="true")
    5: optional i64 ConnectorID (api.body = "connector_id", agw.key="connector_id", api.js_conv="true")
    6: optional i64 LastSectionID (api.body="last_section_id", api.js_conv="true")
    7: optional i64    AccountID (api.body = "account_id")
}

struct CreateConversationRequest {
    1:   optional  map<string,string> MetaData (api.body = "meta_data") //自定义透传字段
    3:   optional  i64             BotId (api.body = "bot_id",  api.js_conv="true")
    4:   optional  i64             ConnectorId (api.body= "connector_id",  api.js_conv="true")
}

struct CreateConversationResponse {
    1: i64    code
    2: string msg
    3: optional ConversationData ConversationData (api.body = "data")
}

struct ClearConversationApiRequest {
    1: required i64 ConversationID (api.path="conversation_id",  api.js_conv="true",)

    255: base.Base Base
}

struct Section {
    1: i64 id (agw.key = "id", api.js_conv = "true")
    2: i64 conversation_id (agw.key = "conversation_id", api.js_conv = "true")
}

struct ClearConversationApiResponse {
    1 : i64 code      (api.body = "code", agw.key="code")        // 错误code
    2 : string msg    (api.body = "msg", agw.key = "msg")        // 错误消息
    3 : Section data  (api.body = "data", agw.key = "data")      // section 信息

    255: base.BaseResp BaseResp
}

struct ListConversationsApiRequest {
    1 : i64    page_num (api.query = "page_num", agw.key = "page_num")
    2 : i64    page_size (api.query = "page_size", agw.key = "page_size")
    3 : string sort_order (api.query = "sort_order", agw.key = "sort_order") // 可选值：ASC、DESC
    4 : string sort_field (api.query = "sort_field", age.key = "sort_field") // 可选值：created_at创建时间
    5 : required i64  bot_id (api.query = "bot_id", agw.key = "bot_id",api.js_conv="true")
    6 : optional i64  connector_id (api.query = "connector_id", agw.key = "connector_id",api.js_conv="true")

    255: base.Base Base
}

struct ListConversationsApiResponse {
    1 : i64 code      (api.body = "code", agw.key="code")       // 错误code
    2 : string msg    (api.body = "msg", agw.key = "msg")        // 错误消息
    3 : ListConversationData data (api.body = "data", agw.key = "data")
    255: base.BaseResp BaseResp
}

struct ListConversationData {
    1 : list<ConversationData> conversations (api.body = "conversations", agw.key = "conversations")
    2 : bool has_more (api.body = "has_more", agw.key = "has_more")
}

