include "../base.thrift"
include  "common_struct/intelligence_common_struct.thrift"
include  "common_struct/common_struct.thrift"

namespace go intelligence

enum OrderBy {
    UpdateTime  = 0
    CreateTime  = 1
    PublishTime = 2
}

enum OceanProjectOrderBy {
    UpdateTime  = 0
    CreateTime  = 1
}

enum SearchScope {
    All = 0,
    CreateByMe = 1,
}

struct GetDraftIntelligenceListOption {
    1: bool need_replica, //need personal version Bot data
}

struct GetDraftIntelligenceListRequest {
    1: required i64 space_id (agw.js_conv="str", api.js_conv="true"),
    2: optional string name,
    3: optional bool has_published,
    4: optional list<intelligence_common_struct.IntelligenceStatus> status,
    5: optional list<intelligence_common_struct.IntelligenceType> types,
    6: optional SearchScope search_scope,

    51: optional bool is_fav,
    52: optional bool recently_open,

    99: optional GetDraftIntelligenceListOption option,
    100: optional OrderBy order_by,
    101: optional string cursor_id,
    102: optional i32 size,

    255: optional base.Base Base
}

struct IntelligencePublishInfo {
    1: string                      publish_time,
    2: bool                        has_published,
    3: list<common_struct.ConnectorInfo> connectors,
}

struct IntelligencePermissionInfo {
    1: bool in_collaboration,
    2: bool can_delete,   // can delete
    3: bool can_view,     // Whether the current user can view it, the current judgment logic is whether the user is in the space where the bot is located
}

struct FavoriteInfo {
    1: bool is_fav, // Whether to collect; use the collection list
    2: string fav_time, // Collection time; collection list use
}

enum BotMode {
    SingleMode = 0
    MultiMode  = 1
    WorkflowMode = 2
}

struct OtherInfo {
    1: string recently_open_time,   // Last opened time; used when recently opened filter
    2: BotMode bot_mode, // Only bot type returns
}

struct Intelligence {
    1: intelligence_common_struct.IntelligenceBasicInfo        basic_info,     // Basic information
    2: intelligence_common_struct.IntelligenceType             type,           // Agent Type
    3: IntelligencePublishInfo      publish_info,   // Agent publishes information, optional
    4: common_struct.User                        owner_info,     // Agent owner information, optional
    5: IntelligencePermissionInfo   permission_info, // The current user's permission information to the agent, optional
}

// For the front end
struct IntelligenceData {
    1: intelligence_common_struct.IntelligenceBasicInfo        basic_info,
    2: intelligence_common_struct.IntelligenceType             type,
    3: IntelligencePublishInfo      publish_info,
    4: IntelligencePermissionInfo   permission_info,
    5: common_struct.User           owner_info,
    6: common_struct.AuditInfo      latest_audit_info,
    7: FavoriteInfo                 favorite_info,

    50: OtherInfo                   other_info,
}

struct DraftIntelligenceListData {
    1: list<IntelligenceData> intelligences,
    2: i32 total,
    3: bool has_more,
    4: string next_cursor_id,
}

struct GetDraftIntelligenceListResponse {
    1: DraftIntelligenceListData data,

    253: i32 code,
    254: string msg,
    255: optional base.BaseResp BaseResp (api.none="true"),
}

struct GetDraftIntelligenceInfoRequest {
    1: i64 intelligence_id (agw.js_conv="str", api.js_conv="true"),
    2: intelligence_common_struct.IntelligenceType intelligence_type,
    3: optional i64 version (agw.js_conv="str", api.js_conv="true"), // Pass in when previewing the version

    255: optional base.Base Base
}

struct GetDraftIntelligenceInfoData {
    1: intelligence_common_struct.IntelligenceType intelligence_type,
    2: intelligence_common_struct.IntelligenceBasicInfo basic_info,
    3: optional IntelligencePublishInfo publish_info,
    4: optional common_struct.User      owner_info,
}

struct GetDraftIntelligenceInfoResponse {
    1: GetDraftIntelligenceInfoData data,

    253: i32 code,
    254: string msg,
    255: optional base.BaseResp BaseResp,
}

struct GetUserRecentlyEditIntelligenceRequest {
    1: i32 size,
    2: optional list<intelligence_common_struct.IntelligenceType> types,
    3: optional string    enterprise_id,         // Enterprise ID
    4: optional string    organization_id,      // organization id

    255: optional base.Base Base
}

struct GetUserRecentlyEditIntelligenceData {
    1: list<IntelligenceData> intelligence_info_list,
}

struct GetUserRecentlyEditIntelligenceResponse {
    1: GetUserRecentlyEditIntelligenceData data,

    253: i32 code,
    254: string msg,
    255: optional base.BaseResp BaseResp,
}