include "../base.thrift"
include "../bot_common/bot_common.thrift"

namespace go ocean.cloud.developer_api

struct DraftBotCreateRequest {
    1: required i64           space_id (agw.js_conv="str", api.js_conv="true")
    2:          string         name
    3:          string         description
    4:          string         icon_uri
    5:          VisibilityType visibility
    6: optional MonetizationConf monetization_conf
    7: optional string         create_from, // 创建来源  navi:导航栏 space:空间
    9: optional bot_common.BusinessType business_type
}

struct MonetizationConf {
    1: optional bool is_enable
}

enum VisibilityType {
    Invisible = 0 // 不可见
    Visible   = 1 // 可见
}

struct DraftBotCreateData {
    1:          i64    bot_id (agw.js_conv="str", api.js_conv="true")
    2:          bool   check_not_pass // true：机审校验不通过
    3: optional string check_not_pass_msg // 机审校验不通过文案
}

struct DraftBotCreateResponse {
    1:          i64                code
    2:          string             msg
    3: required DraftBotCreateData data
}

struct DeleteDraftBotRequest {
    1: required i64 space_id (agw.js_conv="str", api.js_conv="true")
    2: required i64 bot_id (agw.js_conv="str", api.js_conv="true")
}

struct DeleteDraftBotData {
}

struct DeleteDraftBotResponse {
    1:          i64                code
    2:          string             msg
    3: required DeleteDraftBotData data
}

struct DuplicateDraftBotRequest {
    1: required i64 space_id (agw.js_conv="str", api.js_conv="true")
    2: required i64 bot_id (agw.js_conv="str", api.js_conv="true")
}

struct UserLabel {
    1: i64                label_id (agw.js_conv="str", api.js_conv="true")
    2: string             label_name
    3: string             icon_uri
    4: string             icon_url
    5: string             jump_link
}

struct Creator {
    1: i64 id (agw.js_conv="str", api.js_conv="true")
    2: string name // 昵称
    3: string avatar_url
    4: bool   self       // 是否是自己创建的
    5: string    user_unique_name // 用户名
    6: UserLabel user_label       // 用户标签
}

struct DuplicateDraftBotData {
    1: i64    bot_id (agw.js_conv="str", api.js_conv="true")
    2: string name
    3: Creator user_info
}

struct DuplicateDraftBotResponse {
    1:          i64                   code
    2:          string                msg
    3: required DuplicateDraftBotData data
}

service DeveloperApiService {
    DraftBotCreateResponse DraftBotCreate(1:DraftBotCreateRequest request)(api.post='/api/draftbot/create', api.category="draftbot", api.gen_path="draftbot")

    DeleteDraftBotResponse DeleteDraftBot(1:DeleteDraftBotRequest request)(api.post='/api/draftbot/delete', api.category="draftbot", api.gen_path="draftbot")
    DuplicateDraftBotResponse DuplicateDraftBot(1:DuplicateDraftBotRequest request)(api.post='/api/draftbot/duplicate', api.category="draftbot", api.gen_path="draftbot")
}
