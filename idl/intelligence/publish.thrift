include "../base.thrift"
include "common_struct/common_struct.thrift"
include  "common_struct/intelligence_common_struct.thrift"

struct GetProjectPublishedConnectorRequest {
    1: required i64 project_id (agw.js_conv="str", api.js_conv="true")
    255: optional base.Base Base (api.none="true")
}

struct GetProjectPublishedConnectorResponse {
    1: list<common_struct.ConnectorInfo> data

    253: i64 code
    254: string msg
    255: optional base.BaseResp BaseResp (api.none="true")
}

struct PublishConnectorListRequest {
    1: required i64 project_id (agw.js_conv="str", api.js_conv="true")

    255: optional base.Base Base (api.none="true")
}

struct PublishConnectorListResponse {
    1: PublishConnectorListData data

    253: i64 code
    254: string msg
    255: optional base.BaseResp BaseResp (api.none="true")
}

struct PublishConnectorListData {
    1: list<PublishConnectorInfo> connector_list
    2: LastPublishInfo last_publish_info
    3: map<i64, ConnectorUnionInfo> connector_union_info_map // 渠道集合信息，key是connector_union_id
}

struct PublishConnectorInfo {
    1: required i64 id (agw.js_conv="str", api.js_conv="true")
    2: required string name
    3: required string icon_url
    4: required string description // 描述
    5: string description_extra // 描述扩展
    6: required ConnectorClassification connector_classification // 渠道类型
    7: required ConnectorConfigStatus config_status // 配置状态
    8: ConnectorStatus connector_status // 渠道状态
    9: required ConnectorBindType bind_type // 绑定类型
    10: required map<string,string> bind_info // 绑定信息 key字段名 value是值
    11: optional string bind_id // 绑定id信息，用于解绑使用
    12: optional AuthLoginInfo auth_login_info // 用户授权登陆信息
    13: string privacy_policy // 隐私政策
    14: string user_agreement // 用户协议
    15: bool allow_publish // 是否允许发布
    16: optional string not_allow_publish_reason // 不允许发布的原因
    17: optional i64 connector_union_id (agw.js_conv="str", api.js_conv="true") // 渠道集合id，表示需要聚合展示的渠道
    18: optional list<UIOption> UIOptions // UI选项
    19: optional bool support_monetization // 支持商业化
    20: optional string installation_guide  // 安装指引
    21: optional UserAuthStatus auth_status   // 目前仅 bind_type == 8 时这个字段才有 
    22: optional string config_status_toast // 配置状态toast
    23: optional string to_complete_info_url // connector_status为审核中时补全信息按钮的url
    24: optional string connector_tips // 渠道发布提示
}

struct LastPublishInfo {
    1: string version_number
    2: list<i64> connector_ids (agw.js_conv="str", api.js_conv="true")
    3: map<i64,ConnectorPublishConfig> connector_publish_config // 渠道发布配置
}

enum ConnectorClassification {
    APIOrSDK = 1 // api或sdk
    SocialPlatform = 2 // 社交平台
    Coze = 3 // Coze商店/模板
    MiniProgram = 4 // 小程序
    CozeSpaceExtensionLibrary = 5 // MCP扩展库
}

enum ConnectorConfigStatus {
    Configured        = 1 // 已配置
    NotConfigured     = 2 // 未配置
    Disconnected      = 3 // Token发生变化
    Configuring       = 4 // 配置中，授权中
    NeedReconfiguring = 5 // 需要重新配置 
}

enum ConnectorStatus {
    Normal   = 0 // 正常
    InReview = 1 // 审核中
    Offline  = 2 // 已下线
}

struct ConnectorUnionInfo {
    1: required i64    id (agw.js_conv="str", api.js_conv="true")
    2: required string name
    3: required string description
    4: required string icon_url
    5: required list<ConnectorUnionInfoOption> connector_options
}

enum ConnectorBindType {
    NoBindRequired = 1 // 无需绑定
    AuthBind       = 2 // Auth绑定
    KvBind         = 3 // Kv绑定
    KvAuthBind     = 4 // Kv并Auth授权
    ApiBind        = 5 // api渠道绑定
    WebSDKBind     = 6
    StoreBind      = 7
    AuthAndConfig  = 8 // 授权和配置各一个按钮
    TemplateBind   = 9 // 模板渠道绑定
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

struct UIOption {
    1: i64 ui_channel (agw.js_conv="str", api.js_conv="true") // UIChannel选项
    2: bool available // 是否可选
    3: string unavailable_reason // 不可选原因
}

enum UserAuthStatus {
    Authorized = 1 // 已授权
    UnAuthorized = 2 // 未授权
    Authorizing = 3 // 授权中
}

struct ConnectorPublishConfig {
    1: list<SelectedWorkflow> selected_workflows // 发布渠道选择的Workflow/ChatFlow
}

struct ConnectorUnionInfoOption {
    1: required i64 connector_id (agw.js_conv="str", api.js_conv="true") // 渠道 ID
    2: required string show_name // 展示名，如：托管发布、下载代码
}

struct SelectedWorkflow {
    1: i64 workflow_id (agw.js_conv="str", api.js_conv="true")
    2: string workflow_name
}

struct CheckProjectVersionNumberRequest {
    1: required i64 project_id (agw.js_conv="str", api.js_conv="true")
    2: required string version_number

    255: optional base.Base Base (api.none="true")
}

struct CheckProjectVersionNumberResponse {
    1: CheckProjectVersionNumberData data

    253: i64 code
    254: string msg
    255: optional base.BaseResp BaseResp (api.none="true")
}

struct CheckProjectVersionNumberData {
    1: bool is_duplicate
}

struct PublishProjectRequest {
    1: required i64 project_id (agw.js_conv="str", api.js_conv="true")
    2: required string version_number // 版本号
    3: optional string description // 描述
    4: optional map<i64,map<string,string>> connectors // key代表connector_id，value是渠道发布的参数
    5: optional map<i64,ConnectorPublishConfig> connector_publish_config // 渠道发布配置，key代表connector_id

    255: optional base.Base Base (api.none="true")
}

struct PublishProjectResponse {
    1: PublishProjectData data

    253: i64 code
    254: string msg
    255: optional base.BaseResp BaseResp (api.none="true")
}

struct PublishProjectData {
    1: i64 publish_record_id (agw.js_conv="str", api.js_conv="true") // 发布记录ID用于前端轮询
    2: optional bool publish_monetization_result // 收费配置发布结果，海外环境才有
}

struct GetPublishRecordListRequest {
    1: required i64 project_id (agw.js_conv="str", api.js_conv="true")

    255: optional base.Base Base (api.none="true")
}

struct GetPublishRecordListResponse {
    1: list<PublishRecordDetail> data

    253: i64 code
    254: string msg
    255: optional base.BaseResp BaseResp (api.none="true")
}

struct PublishRecordDetail {
    1: i64 publish_record_id (agw.js_conv="str", api.js_conv="true")
    2: string version_number
    3: PublishRecordStatus publish_status // 发布状态
    4: string publish_status_msg // 该字段废弃，请使用publish_status_detail
    5: optional list<ConnectorPublishResult> connector_publish_result // 渠道发布结果
    6: optional PublishRecordStatusDetail publish_status_detail // 发布状态补充信息
}

enum PublishRecordStatus {
    Packing = 0 // 打包中
    PackFailed = 1 // 打包失败
    Auditing = 2 // 审核中
    AuditNotPass = 3 // 审核未通过
    ConnectorPublishing = 4 // 渠道发布中
    PublishDone = 5 // 发布完成
}

struct ConnectorPublishResult {
    1: i64 connector_id (agw.js_conv="str", api.js_conv="true")
    2: string connector_name
    3: string connector_icon_url
    4: ConnectorPublishStatus connector_publish_status // 渠道发布状态
    5: string connector_publish_status_msg // 渠道发布状态补充信息
    6: optional string share_link // OpenIn链接
    7: optional string download_link // 小程序渠道下载链接
    8: optional ConnectorPublishConfig connector_publish_config // 渠道发布配置
    9: optional map<string,string> connector_bind_info // 渠道绑定信息 key字段名 value是值
}

struct PublishRecordStatusDetail {
    1: optional list<PackFailedDetail> pack_failed_detail // 打包失败详情
}

//project
enum ConnectorPublishStatus {
    Default = 0 // 发布中
    Auditing = 1 // 审核中
    Success = 2 // 成功
    Failed = 3 // 失败
    Disable = 4   //禁用
}

struct PackFailedDetail {
    1: i64 entity_id (agw.js_conv="str", api.js_conv="true")
    2: common_struct.ResourceType entity_type
    3: string entity_name
}

struct GetPublishRecordDetailRequest {
    1: required i64 project_id (agw.js_conv="str", api.js_conv="true")
    2: optional i64 publish_record_id (agw.js_conv="str", api.js_conv="true") // 不传则获取最近一次发布记录

    255: optional base.Base Base (api.none="true")
}

struct GetPublishRecordDetailResponse {
    1: PublishRecordDetail data

    253: i64 code
    254: string msg
    255: optional base.BaseResp BaseResp (api.none="true")
}