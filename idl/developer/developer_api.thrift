include "../base.thrift"
include "../bot_common/bot_common.thrift"

namespace go ocean.cloud.developer_api

struct DraftBotCreateData {
    1:          string bot_id
    2:          bool   check_not_pass // true：机审校验不通过
    3: optional string check_not_pass_msg // 机审校验不通过文案
}
struct DraftBotCreateResponse {
    1:          i64                code
    2:          string             msg
    3: required DraftBotCreateData data
}


struct DraftBotCreateRequest {
    1: required string         space_id
    2:          string         name
    3:          string         description
    4:          string         icon_uri
    5:          VisibilityType visibility
    6: optional MonetizationConf monetization_conf
    7: optional string         create_from, // 创建来源  navi:导航栏 space:空间
    8: optional string         app_id // 关联的抖音分身应用id
    9: optional bot_common.BusinessType business_type
}

struct MonetizationConf {
    1: optional bool is_enable
}


enum VisibilityType {
    Invisible = 0 // 不可见
    Visible   = 1 // 可见
}

service DeveloperApiService {
    DraftBotCreateResponse DraftBotCreate(1:DraftBotCreateRequest request)(api.post='/api/draftbot/create', api.category="draftbot", api.gen_path="draftbot")
}
