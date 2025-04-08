include "../base.thrift"
include "../agent/common.thrift"

namespace go agent

// 分支
enum Branch {
    Undefined     = 0
    Base          = 2 // space草稿
    Publish       = 3 // 线上版本,diff场景下使用
}

struct UpdateDraftBotInfoData {
    1: optional bool   has_change       // 是否有变更
}


struct UpdateDraftBotInfoResponse {
    1: required UpdateDraftBotInfoData data,

    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}

struct UpdateDraftBotInfoRequest {
    1: optional common.BotInfoForUpdate bot_info(api.body = 'bot_info')
    2: optional i64   base_commit_version (api.js_conv='true')

    255: base.Base Base (api.none="true")
}

// Onboarding json结构
struct OnboardingContent {
    1: optional string       prologue            // 开场白（C端使用场景，只有1个；后台场景，可能为多个）
    2: optional list<string> suggested_questions // 建议问题
    3: optional common.SuggestedQuestionsShowMode suggested_questions_show_mode
}


struct DraftBotCreateRequest {
    1: required i64           space_id (api.js_conv='true')
    2:          string         name
    3:          string         description
    4:          string         icon_uri
    6: optional MonetizationConf monetization_conf
    7: optional string         create_from, // 创建来源  navi:导航栏 space:空间    
}

struct MonetizationConf {
    1: optional bool is_enable
}


struct DraftBotCreateResponse {
    1:          i64                code
    2:          string             msg
    3: required DraftBotCreateData data
}

struct DraftBotCreateData {
    1:          string bot_id
}