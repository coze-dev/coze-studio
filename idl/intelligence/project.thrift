include "../base.thrift"
include  "common_struct/intelligence_common_struct.thrift"
include  "common_struct/common_struct.thrift"

struct DraftProjectCreateRequest {
    1  :          i64            space_id (agw.js_conv="str", api.js_conv="true"),
    2  :          string         name       ,
    3  :          string         description,
    4  :          string         icon_uri  ,
    5  : optional MonetizationConf monetization_conf,
    6  : optional string         create_from, // Create source navi: navbar space: space


    255: optional base.Base      Base (api.none="true")       ,
}

struct MonetizationConf {
    1: optional bool is_enable
}

struct DraftProjectCreateResponse {
    1 :  DraftProjectCreateData data

    253: required i64 code,
    254: required string msg,
    255: optional base.BaseResp BaseResp (api.none="true")
}

struct DraftProjectCreateData {
    1: i64 project_id (agw.js_conv="str", api.js_conv="true")
    2: common_struct.AuditData audit_data
}

struct DraftProjectUpdateRequest {
    1 : required i64 project_id (agw.js_conv="str", api.js_conv="true")
    2 : optional string name
    3 : optional string description
    4 : optional string icon_uri

    255: optional base.Base Base (api.none="true")
}

struct DraftProjectUpdateResponse {
    1 :  DraftProjectUpdateData data

    253: required i64 code,
    254: required string msg,
    255: optional base.BaseResp BaseResp (api.none="true")
}

struct DraftProjectUpdateData {
    1 : common_struct.AuditData audit_data
}

struct DraftProjectDeleteRequest {
    1 : required i64 project_id (agw.js_conv="str", api.js_conv="true")

    255: optional base.Base Base (api.none="true")
}

struct DraftProjectDeleteResponse {

    253: required i64 code,
    254: required string msg,
    255: optional base.BaseResp BaseResp (api.none="true")
}

struct DraftProjectCopyRequest {
    1 :  i64 project_id (agw.js_conv="str", api.js_conv="true")
    3 :  i64 to_space_id (agw.js_conv="str", api.js_conv="true")
    4 :  string         name       ,
    5 :  string         description,
    6 :  string         icon_uri  ,
    255: optional base.Base Base (api.none="true")
}

struct DraftProjectCopyResponse {
    1 :  DraftProjectCopyResponseData data

    253: required i64 code,
    254: required string msg,
    255: optional base.BaseResp BaseResp (api.none="true")
}

struct DraftProjectCopyResponseData {
    1 :  intelligence_common_struct.IntelligenceBasicInfo basic_info
    2 :  common_struct.AuditData audit_data
    3 :  common_struct.User user_info
}