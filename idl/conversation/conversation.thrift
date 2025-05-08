include "../base.thrift"
include "common.thrift"

namespace go conversation.conversation

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
    1:   optional  map<string,string> MetaData (api.body = "meta_data")
    3:   optional  string             BotId (api.body = "bot_id")
    4:   optional  string             ConnectorId (api.body= "connector_id")
}

struct CreateConversationResponse {
    1: i64    code
    2: string msg
    3: optional ConversationData ConversationData (agw.key = "data")
}

struct ClearConversationApiRequest {
    1: required i64 ConversationID (api.path="conversation_id",  api.js_conv="true",)

    255: base.Base Base
}

struct Section {
    1: i64 ID (agw.key = "id", go.tag = "json:\"id\"", api.js_conv = "true")
    2: i64 ConversationID (agw.key = "conversation_id", go.tag = "json:\"conversation_id\"", api.js_conv = "true")
}

struct ClearConversationApiResponse {
    1 : i64 Code      (api.body = "code", agw.key="code")        // 错误code
    2 : string Msg    (api.body = "msg", agw.key = "msg")        // 错误消息
    3 : Section Data  (api.body = "data", agw.key = "data")      // section 信息

    255: base.BaseResp BaseResp
}

struct ListConversationsApiRequest {
    1 : i64    PageNum (api.query = "page_num", agw.key = "page_num")
    2 : i64    PageSize (api.query = "page_size", agw.key = "page_size")
    3 : string SortOrder (api.query = "sort_order", agw.key = "sort_order") // 可选值：ASC、DESC
    4 : string SortField (api.query = "sort_field", age.key = "sort_field") // 可选值：created_at创建时间
    5 : required i64  BotID (api.query = "bot_id", agw.key = "bot_id",api.js_conv="true")
    6 : optional i64  ConnectorID (api.query = "connector_id", agw.key = "connector_id",api.js_conv="true")

    255: base.Base Base
}

struct ListConversationsApiResponse {
    1 : i64 Code      (api.body = "code", agw.key="code")       // 错误code
    2 : string Msg    (api.body = "msg", agw.key = "msg")        // 错误消息
    3 : ListConversationData Data (api.body = "data", agw.key = "data")
    255: base.BaseResp BaseResp
}

struct ListConversationData {
    1 : list<ConversationData> Conversations (api.body = "conversations", agw.key = "conversations")
    2 : bool HasMore (api.body = "has_more", agw.key = "has_more")
}

