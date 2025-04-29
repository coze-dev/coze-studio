include "base.thrift"
namespace go developer.connector

enum ConfigStatus {
    Configured        = 1 // 已配置
    NotConfigured     = 2 // 未配置
    Disconnected      = 3 // Token发生变化
    Configuring       = 4 // 配置中，授权中
    NeedReconfiguring = 5 // 需要重新配置 https://bytedance.larkoffice.com/docx/KXNed5NWUoplVBxXdQxcfPNwnrf#Gn7dd2KoaoNZo6xw1tkcT92znbG
}
enum BindType {
    NoBindRequired = 1 // 无需绑定
    AuthBind       = 2 // Auth绑定
    KvBind         = 3 // Kv绑定=
    KvAuthBind     = 4 // Kv并Auth授权
    ApiBind        = 5 // api渠道绑定
    WebSDKBind     = 6
    StoreBind      = 7
    AuthAndConfig  = 8 // 授权和配置各一个按钮
}
enum AllowPublishStatus {
    Allowed = 0
    Forbid = 1
}
struct AuthLoginInfo {
    1: string app_id
    2: string response_type
    3: string authorize_url
    4: string scope
    5: string client_id
    6: string duration
    7: string aid
    8: string client_key
}

enum BotConnectorStatus {
    Normal   = 0 // 正常
    InReview = 1 // 审核中
    Offline  = 2 // 已下线
}
enum UserAuthStatus {
    Authorized = 1 // 已授权
    UnAuthorized = 2 // 未授权
    Authorizing = 3 // 授权中
}

struct PublishConnectorListRequest {
    1: required string space_id
    2: required string bot_id
    3: optional string commit_version
}

struct PublishConnectorInfo {
    1:  required string                                      id                // 发布平台 connector_id
    2:  required string                                      name              // 发布平台名称
    3:  required string                                      icon              // 发布平台图标
    4:  required string                                      desc              // 发布平台描述
    5:  required string                                      share_link        // 分享链接
    6:  required ConfigStatus                                config_status     // 配置状态 1:已绑定 2:未绑定
    7:  required i64                                         last_publish_time // 最近发布时间
    8:  required BindType                                    bind_type         // 绑定类型 1:无需绑定  2:Auth  3: kv值
    9:  required map<string,string>                          bind_info         // 绑定信息 key字段名 value是值
    10: optional string                                      bind_id           // 绑定id信息，用于解绑使用
    11: optional AuthLoginInfo                               auth_login_info   // 用户授权登陆信息
    12: optional bool                                        is_last_published // 是否为上次发布
    13: optional BotConnectorStatus                          connector_status  // bot渠道状态
    14: optional string                                      privacy_policy    // 隐私政策
    15: optional string                                      user_agreement    // 用户协议
    16: optional AllowPublishStatus                          allow_punish      // 渠道是否允许发布
    17: optional string                                      not_allow_reason  // 不允许发布原因
    18: optional string                                      config_status_toast // 配置状态toast
    19: optional i64                                         brand_id          // 品牌 ID
    20: optional bool                                        support_monetization // 支持商业化
    21: optional UserAuthStatus                auth_status       // 1: 已授权，2:未授权. 目前仅 bind_type == 8 时这个字段才有 https://bytedance.larkoffice.com/docx/KXNed5NWUoplVBxXdQxcfPNwnrf#Gn7dd2KoaoNZo6xw1tkcT92znbG
    22: optional string                                      to_complete_info_url // 补全信息按钮的 url
}

struct SubmitBotMarketOption {
    1: optional bool can_open_source // 是否可以公开编排
}
struct SubmitBotMarketConfig {
    1: optional bool   need_submit // 是否发布到market
    2: optional bool   open_source // 是否开源
    3: optional string category_id // 分类
}
struct ConnectorBrandInfo {
    1: required i64    id
    2: required string name
    3: required string icon
}

struct PublishTips {
    1: optional string cost_tips         // 成本承担提醒
}

struct PublishConnectorListResponse {
    1:          i64                          code
    2:          string                       msg
    3:          list<PublishConnectorInfo>   publish_connector_list
    4: optional SubmitBotMarketOption        submit_bot_market_option
    5: optional SubmitBotMarketConfig        last_submit_config       // 上次提交market的配置
    6:          map<i64, ConnectorBrandInfo> connector_brand_info_map // 渠道品牌信息
    7: optional PublishTips                  publish_tips             // 发布提醒
}

service ConnectorService {
    PublishConnectorListResponse PublishConnectorList(1:PublishConnectorListRequest request)(api.post='/api/draftbot/publish/connector/list', api.category="draftbot", api.gen_path="draftbot")
}