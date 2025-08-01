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
    3: map<i64, ConnectorUnionInfo> connector_union_info_map // Channel collection information, the key is connector_union_id
}

struct PublishConnectorInfo {
    1: required i64 id (agw.js_conv="str", api.js_conv="true")
    2: required string name
    3: required string icon_url
    4: required string description // describe
    5: string description_extra // description extension
    6: required ConnectorClassification connector_classification // channel type
    7: required ConnectorConfigStatus config_status // configuration status
    8: ConnectorStatus connector_status // channel status
    9: required ConnectorBindType bind_type // binding type
    10: required map<string,string> bind_info // Binding information key field name value is value
    11: optional string bind_id // Bind id information for unbinding and use
    12: optional AuthLoginInfo auth_login_info // user authorization login information
    13: string privacy_policy // Privacy Policy
    14: string user_agreement // User Agreement
    15: bool allow_publish // Whether to allow publishing
    16: optional string not_allow_publish_reason // Reasons for not allowing publishing
    17: optional i64 connector_union_id (agw.js_conv="str", api.js_conv="true") // Channel collection id, indicating the channel that needs to be aggregated and displayed.
    18: optional list<UIOption> UIOptions // UI Options
    19: optional bool support_monetization // Support commercialization
    20: optional string installation_guide  // Installation Guidelines
    21: optional UserAuthStatus auth_status   // Currently this field is only available bind_type == 8
    22: optional string config_status_toast // Configuration status toast
    23: optional string to_complete_info_url // connector_status the URL of the Complete Info button while under review
    24: optional string connector_tips // Channel release tips
}

struct LastPublishInfo {
    1: string version_number
    2: list<i64> connector_ids (agw.js_conv="str", api.js_conv="true")
    3: map<i64,ConnectorPublishConfig> connector_publish_config // channel release configuration
}

enum ConnectorClassification {
    APIOrSDK = 1 // API or SDK
    SocialPlatform = 2 // social platform
    Coze = 3 // Coze Shop/Template
    MiniProgram = 4 // Mini Program
    CozeSpaceExtensionLibrary = 5 // MCP Extension Library
}

enum ConnectorConfigStatus {
    Configured        = 1 // Configured
    NotConfigured     = 2 // Not configured
    Disconnected      = 3 // Token changes
    Configuring       = 4 // Configuring, authorizing
    NeedReconfiguring = 5 // Need to reconfigure
}

enum ConnectorStatus {
    Normal   = 0 // Normal
    InReview = 1 // Under review.
    Offline  = 2 // offline
}

struct ConnectorUnionInfo {
    1: required i64    id (agw.js_conv="str", api.js_conv="true")
    2: required string name
    3: required string description
    4: required string icon_url
    5: required list<ConnectorUnionInfoOption> connector_options
}

enum ConnectorBindType {
    NoBindRequired = 1 // No binding required
    AuthBind       = 2 // Auth binding
    KvBind         = 3 // Kv binding
    KvAuthBind     = 4 // Kv and Auth authorization
    ApiBind        = 5 // API channel binding
    WebSDKBind     = 6
    StoreBind      = 7
    AuthAndConfig  = 8 // One button each for authorization and configuration
    TemplateBind   = 9 // template channel binding
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
    1: i64 ui_channel (agw.js_conv="str", api.js_conv="true") // UIChannel Options
    2: bool available // Is it optional
    3: string unavailable_reason // unselectable reason
}

enum UserAuthStatus {
    Authorized = 1 // Authorized
    UnAuthorized = 2 // unauthorized
    Authorizing = 3 // Authorizing
}

struct ConnectorPublishConfig {
    1: list<SelectedWorkflow> selected_workflows // Workflow/ChatFlow selected by publishing channel
}

struct ConnectorUnionInfoOption {
    1: required i64 connector_id (agw.js_conv="str", api.js_conv="true") // Channel ID
    2: required string show_name // Display name, such as: hosted release, download code
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
    2: required string version_number // version number
    3: optional string description // describe
    4: optional map<i64,map<string,string>> connectors // The key represents connector_id, and the value is the parameter published by the channel
    5: optional map<i64,ConnectorPublishConfig> connector_publish_config // Channel release configuration, key represents connector_id

    255: optional base.Base Base (api.none="true")
}

struct PublishProjectResponse {
    1: PublishProjectData data

    253: i64 code
    254: string msg
    255: optional base.BaseResp BaseResp (api.none="true")
}

struct PublishProjectData {
    1: i64 publish_record_id (agw.js_conv="str", api.js_conv="true") // Publish record ID for front-end polling
    2: optional bool publish_monetization_result // The charging configuration is released, and the overseas environment is only available.
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
    3: PublishRecordStatus publish_status // release status
    4: string publish_status_msg // This field is deprecated, please use publish_status_detail
    5: optional list<ConnectorPublishResult> connector_publish_result // Channel release results
    6: optional PublishRecordStatusDetail publish_status_detail // Release status Supplementary information
}

enum PublishRecordStatus {
    Packing = 0 // Packing
    PackFailed = 1 // Packaging failed
    Auditing = 2 // Under review.
    AuditNotPass = 3 // review disapproved
    ConnectorPublishing = 4 // Channel is being released.
    PublishDone = 5 // release complete
}

struct ConnectorPublishResult {
    1: i64 connector_id (agw.js_conv="str", api.js_conv="true")
    2: string connector_name
    3: string connector_icon_url
    4: ConnectorPublishStatus connector_publish_status // channel release status
    5: string connector_publish_status_msg // Channel Release Status Supplementary Information
    6: optional string share_link // OpenIn Link
    7: optional string download_link // Mini Program Channel Download Link
    8: optional ConnectorPublishConfig connector_publish_config // channel release configuration
    9: optional map<string,string> connector_bind_info // Channel binding information key field name value is value
}

struct PublishRecordStatusDetail {
    1: optional list<PackFailedDetail> pack_failed_detail // Packaging failure details
}

//project
enum ConnectorPublishStatus {
    Default = 0 // In release
    Auditing = 1 // Under review.
    Success = 2 // success
    Failed = 3 // fail
    Disable = 4   //disable
}

struct PackFailedDetail {
    1: i64 entity_id (agw.js_conv="str", api.js_conv="true")
    2: common_struct.ResourceType entity_type
    3: string entity_name
}

struct GetPublishRecordDetailRequest {
    1: required i64 project_id (agw.js_conv="str", api.js_conv="true")
    2: optional i64 publish_record_id (agw.js_conv="str", api.js_conv="true") // If you don't upload it, get the last release record.

    255: optional base.Base Base (api.none="true")
}

struct GetPublishRecordDetailResponse {
    1: PublishRecordDetail data

    253: i64 code
    254: string msg
    255: optional base.BaseResp BaseResp (api.none="true")
}