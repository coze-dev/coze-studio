include "../../base.thrift"

namespace go ocean.cloud.workflow

enum FrontedTagType {
    TEXT = 0 // Text
    TIME = 1 // Time, with timestamp, in milliseconds
    TIME_DURATION = 2 // Time interval, in milliseconds
}

// Tag
struct TraceTag {
    1: string Key (go.tag = "json:\"key\"", agw.key = "key")
    2: TagType TagType (go.tag = "json:\"tag_type\"", agw.key = "tag_type")
    3: Value Value (go.tag = "json:\"value\"", agw.key = "value")
}

struct FilterTag {
    1: optional string DataType (go.tag = "json:\"data_type\"", agw.key = "data_type")
    2: optional string TagKey (go.tag = "json:\"tag_key\"", agw.key = "tag_key")
    3: optional list<string> MultiTagKeys (go.tag = "json:\"multi_tag_keys\"", agw.key = "multi_tag_keys")
    4: optional list<string> Values (go.tag = "json:\"values\"", agw.key = "values")
    5: optional QueryTypeEnum QueryType (go.tag = "json:\"query_type\"", agw.key = "query_type")
}

enum QueryTypeEnum {
    Undefined = 0
    Match = 1
    Term = 2
    Range = 3
    Exist = 4
    NotExist = 5
}

enum SpanStatus{
    Unknown = 0
    Success = 1
    Fail = 2
}

struct ListRootSpansRequest {
    2: required i64 StartAt (go.tag = "json:\"start_at\"", api.body = "start_at") // It's in milliseconds.
    3: required i64 EndAt (go.tag = "json:\"end_at\"", api.body = "end_at") // It's in milliseconds.
    4: optional i16 Limit (go.tag = "json:\"limit\"", api.body = "limit")
    5: optional bool DescByStartTime (go.tag = "json:\"desc_by_start_time\"", api.body = "desc_by_start_time")
    6: optional i32 Offset (go.tag = "json:\"offset\"", api.body = "offset")
    7: required string WorkflowID(go.tag = "json:\"workflow_id\"", api.body = "workflow_id")
    8: optional string Input(go.tag = "json:\"input\"", api.body = "input")
    9: optional SpanStatus Status(go.tag = "json:\"status\"", api.body = "status")
    10: optional i32 ExecuteMode (go.tag = "json:\"execute_mode\"", api.body = "execute_mode") // Formal run/practice run/Node Debug

    255: optional base.Base Base
}

struct Span {
    1: string TraceID (go.tag = "json:\"trace_id\"", agw.key = "trace_id")
    2: string LogID (go.tag = "json:\"log_id\"", agw.key = "log_id")
    3: string PSM (go.tag = "json:\"psm\"", agw.key = "psm")
    4: string DC (go.tag = "json:\"dc\"", agw.key = "dc")
    5: string PodName (go.tag = "json:\"pod_name\"", agw.key = "pod_name")
    6: string SpanID (go.tag = "json:\"span_id\"", agw.key = "span_id")
    7: string Type (go.tag = "json:\"type\"", agw.key = "type")
    8: string Name (go.tag = "json:\"name\"", agw.key = "name")
    9: string ParentID (go.tag = "json:\"parent_id\"", agw.key = "parent_id")
    10: i64 Duration (go.tag = "json:\"duration\"", agw.key = "duration") // It's in milliseconds.
    11: i64 StartTime (go.tag = "json:\"start_time\"", agw.key = "start_time") // It's in milliseconds.
    12: i32 StatusCode (go.tag = "json:\"status_code\"", agw.key = "status_code")
    13: list<TraceTag> Tags (go.tag = "json:\"tags\"", agw.key = "tags")
}

struct Value {
    1: optional string VStr (go.tag = "json:\"v_str\"", agw.key = "v_str")
    2: optional double VDouble (go.tag = "json:\"v_double\"", agw.key = "v_double")
    3: optional bool VBool (go.tag = "json:\"v_bool\"", agw.key = "v_bool")
    4: optional i64 VLong (go.tag = "json:\"v_long\"", agw.key = "v_long")
    5: optional binary VBytes (go.tag = "json:\"v_bytes\"", agw.key = "v_bytes")
}

enum TagType {
    STRING = 0
    DOUBLE = 1
    BOOL = 2
    LONG = 3
    BYTES = 4
}

struct ListRootSpansResponse {
    1: optional list<Span> Spans (go.tag = "json:\"spans\"", api.body = "spans")

    255: optional base.BaseResp BaseResp
}


struct GetTraceSDKRequest {
    2: optional string LogID (go.tag = "json:\"log_id\"", api.query = "log_id")
    4: optional i64 StartAt (go.tag = "json:\"start_at\"", api.query = "start_at") // It's in milliseconds.
    5: optional i64 EndAt (go.tag = "json:\"end_at\"", api.query = "end_at") // It's in milliseconds.
    6: optional i64 WorkflowID (go.tag = "json:\"workflow_id\"", api.query = "workflow_id")
    7: optional i64 ExecuteID (go.tag = "json:\"execute_id\"", api.query = "execute_id")

    255: optional base.Base Base
}

enum QueryScene {
    ALICE_OP = 0 // Doubao cici full link debugging station
    DOUBAO_CICI_DEBUG = 1 // Doubao cici debugging function
    WORKFLOW_DEBUG = 2 // Workflow debugging
}

enum TenantLevel {
    Ordinary = 0
    AdvancedWhitelist = 1
}

struct GetTraceSDKResponse {
    1: optional TraceFrontend data
    255: optional base.BaseResp BaseResp
}


struct KeyScene {
    1: optional string Scene (go.tag = "json:\"scene\"", agw.key = "scene") // Scenarios such as "Split search terms"\ "Search"
    2: optional string StatusMessage (go.tag = "json:\"status_message\"", agw.key = "status_message") // status information
    3: optional string System (go.tag = "json:\"system\"", agw.key = "system")
    4: optional list<MessageItem> HistoryMessages (go.tag = "json:\"history_messages\"", agw.key = "history_messages") // chat history
    5: optional KeySceneInput Input (go.tag = "json:\"input\"", agw.key = "input") // input
    6: optional KeySceneOutput Output (go.tag = "json:\"output\"", agw.key = "output") // output
    7: optional i64 Duration (go.tag = "json:\"duration\"", agw.key = "duration") // It's in milliseconds.
    8: optional i64 StartTime (go.tag = "json:\"start_time\"", api.body = "start_time") // Start time, used for sorting, in milliseconds
    9: optional list<KeyScene> SubKeyScenes (go.tag = "json:\"sub_key_scenes\"", agw.key = "sub_key_scenes") // subscene
}

struct KeySceneInput {
    1: optional string Role (go.tag = "json:\"role\"", agw.key = "role")
    2: optional list<TraceSummaryContent> contentList (go.tag = "json:\"content_list\"", agw.key = "content_list")
}

struct KeySceneOutput {
    1: optional string Role (go.tag = "json:\"role\"", agw.key = "role")
    2: optional list<TraceSummaryContent> contentList (go.tag = "json:\"content_list\"", agw.key = "content_list")
}

struct TraceSummaryContent {
    1: optional string Key (go.tag = "json:\"key\"", agw.key = "key")   // key
    2: optional string Content (go.tag = "json:\"content\"", agw.key = "content") // content
}

struct MessageItem {
    1: optional string Role (go.tag = "json:\"role\"", agw.key = "role")   // role
    2: optional string Content (go.tag = "json:\"content\"", agw.key = "content") // content
}

struct SpanSummary {
    1: optional list<FrontendTag> Tags (go.tag = "json:\"tags\"", agw.key = "tags")
}


struct FrontendTag {
    1: required string Key (go.tag = "json:\"key\"", agw.key = "key")
    2: optional string KeyAlias (go.tag = "json:\"key_alias\"", agw.key = "key_alias") // Multilingual, if there is no configuration value, use the key
    3: required TagType TagType (go.tag = "json:\"tag_type\"", agw.key = "tag_type")
    4: optional Value Value (go.tag = "json:\"value\"", agw.key = "value")
    5: optional FrontedTagType FrontendTagType (go.tag = "json:\"frontend_tag_type\"", agw.key = "frontend_tag_type") // Front-end type for front-end processing
    6: optional bool canCopy (go.tag = "json:\"can_copy\"", agw.key = "can_copy") // Can it be copied?
}


struct TraceSummary{
    1: optional string System (go.tag = "json:\"system\"", agw.key = "system") // System 1 text
    2: optional list<MessageItem> HistoryMessages (go.tag = "json:\"history_messages\"", agw.key = "history_messages") // Level 1 chat history
    3: optional list<KeyScene> KeyScenes (go.tag = "json:\"key_scenes\"", agw.key = "key_scenes")
    4: optional string Input (go.tag = "json:\"input\"", agw.key = "input") // input
    5: optional string Output (go.tag = "json:\"output\"", agw.key = "output") // output
    6: optional i64 Duration (go.tag = "json:\"duration\"", agw.key = "duration") // The duration of the current conversation, in milliseconds
    7: optional string UserID (go.tag = "json:\"user_id\"", agw.key = "user_id") // user ID
}

struct TraceHeader {
    1: optional i64 Duration (go.tag = "json:\"duration\"", agw.key = "duration") // It's in milliseconds.
    2: optional i32 Tokens (agw.key = "tokens")   // Enter the number of tokens consumed
    3: optional i32 StatusCode (go.tag = "json:\"status_code\"", agw.key = "status_code")
    4: optional list<FrontendTag> Tags (go.tag = "json:\"tags\"", agw.key = "tags")
    5: optional string MessageID (go.tag = "json:\"message_id\"", agw.key = "message_id") // Message ID
    6: optional i64 StartTime (go.tag = "json:\"start_time\"", agw.key = "start_time") // It's in milliseconds.
}


struct TraceFrontend {
    1: optional list<TraceFrontendSpan> spans (go.tag = "json:\"spans\"", api.body = "spans")
    2: optional TraceHeader header (go.tag = "json:\"header\"", agw.key = "header")
}

struct TraceFrontendDoubaoCiciDebug {
    1: optional list<TraceFrontendSpan> spans (go.tag = "json:\"spans\"", api.body = "spans")
    2: optional TraceHeader header (go.tag = "json:\"header\"", agw.key = "header")
    3: optional TraceSummary summary (go.tag = "json:\"summary\"", agw.key = "summary")
}
enum InputOutputType {
    TEXT = 0 // Text type
}

struct SpanInputOutput {
    1: optional InputOutputType Type (go.tag = "json:\"type\"", agw.key = "type") // TEXT
    2: optional string Content (go.tag = "json:\"content\"", agw.key = "content")
}

struct TraceFrontendSpan {
    1: string TraceID (go.tag = "json:\"trace_id\"", agw.key = "trace_id")
    2: string LogID (go.tag = "json:\"log_id\"", agw.key = "log_id")
    3: string SpanID (go.tag = "json:\"span_id\"", agw.key = "span_id")
    4: string Type (go.tag = "json:\"type\"", agw.key = "type")
    5: string Name (go.tag = "json:\"name\"", agw.key = "name")
    6: string AliasName (go.tag = "json:\"alias_name\"", agw.key = "alias_name")
    7: string ParentID (go.tag = "json:\"parent_id\"", agw.key = "parent_id")
    8: i64 Duration (go.tag = "json:\"duration\"", agw.key = "duration") // It's in milliseconds.
    9: i64 StartTime (go.tag = "json:\"start_time\"", agw.key = "start_time") // It's in milliseconds.
    10: i32 StatusCode (go.tag = "json:\"status_code\"", agw.key = "status_code")
    11: optional list<TraceTag> Tags (go.tag = "json:\"tags\"", agw.key = "tags")
    12: optional SpanSummary summary (go.tag = "json:\"summary\"", agw.key = "summary") // node details
    13: optional SpanInputOutput Input (go.tag = "json:\"input\"", agw.key = "input")
    14: optional SpanInputOutput Output (go.tag = "json:\"output\"", agw.key = "output")
    15: optional bool IsEntry (go.tag = "json:\"is_entry\"", agw.key = "is_entry") // Is it an entry node?
    16: optional string ProductLine (go.tag = "json:\"product_line\"", agw.key = "product_line") // product line
    17: optional bool IsKeySpan (go.tag = "json:\"is_key_span\"", agw.key = "is_key_span") // Is it a key node?
    18: optional list<string> OwnerList (go.tag = "json:\"owner_list\"", agw.key = "owner_list") // Node owner list, mailbox prefix
    19: optional string RundownDocURL (go.tag = "json:\"rundown_doc_url\"", agw.key = "rundown_doc_url") // Node Details Document
}
