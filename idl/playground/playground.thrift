include "../base.thrift"
include "../agent/common.thrift"

namespace go playground

// 分支
enum Branch {
    Undefined     = 0
    PersonalDraft = 1 // 草稿
    Base          = 2 // space草稿
    Publish       = 3 // 线上版本,diff场景下使用
}

struct UpdateDraftBotInfoData {
    1: optional bool   has_change       // 是否有变更
    2:          bool   check_not_pass   // true：机审校验不通过
    3: optional Branch branch           // 当前是在哪个分支
    4: optional bool   same_with_online
    5: optional string check_not_pass_msg // 机审校验不通过文案
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