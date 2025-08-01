include "../base.thrift"
include "./plugin_develop_common.thrift"

namespace go ocean.cloud.plugin_develop

service PluginDevelopService {
    GetOAuthSchemaResponse GetOAuthSchema(1: GetOAuthSchemaRequest request)(api.post='/api/plugin/get_oauth_schema', api.category="plugin", api.gen_path="plugin")
    GetOAuthSchemaResponse GetOAuthSchemaAPI(1: GetOAuthSchemaRequest request)(api.post='/api/plugin_api/get_oauth_schema', api.category="plugin", api.gen_path='plugin')
    // Get a list of published workflows, plugins, or details of multiple plugins
    GetPlaygroundPluginListResponse GetPlaygroundPluginList(1: GetPlaygroundPluginListRequest request) (api.post = '/api/plugin_api/get_playground_plugin_list', api.category = "plugin")
    // Creating plugins with code
    RegisterPluginResponse RegisterPlugin(1: RegisterPluginRequest request)(api.post='/api/plugin_api/register', api.category="plugin", api.gen_path="plugin", agw.preserve_base="true")
    // Create plugins through UI
    RegisterPluginMetaResponse RegisterPluginMeta(1: RegisterPluginMetaRequest request) (api.post = '/api/plugin_api/register_plugin_meta', api.category = "plugin")
    // Get a list of plug-in tools, or multiple tool details
    GetPluginAPIsResponse GetPluginAPIs(1: GetPluginAPIsRequest request) (api.post = '/api/plugin_api/get_plugin_apis', api.category = "plugin")
    // Get plugin details
    GetPluginInfoResponse GetPluginInfo(1: GetPluginInfoRequest request) (api.post = '/api/plugin_api/get_plugin_info', api.category = "plugin")
    // Updated list of tools compared to the most recent release
    GetUpdatedAPIsResponse GetUpdatedAPIs(1: GetUpdatedAPIsRequest request) (api.post = '/api/plugin_api/get_updated_apis', api.category = "plugin")
    GetOAuthStatusResponse GetOAuthStatus(1: GetOAuthStatusRequest request)(api.post='/api/plugin_api/get_oauth_status', api.category="plugin", api.gen_path="plugin")
    CheckAndLockPluginEditResponse CheckAndLockPluginEdit(1: CheckAndLockPluginEditRequest request)(api.post='/api/plugin_api/check_and_lock_plugin_edit', api.category="plugin", api.gen_path="plugin", )
    UnlockPluginEditResponse UnlockPluginEdit(1: UnlockPluginEditRequest request)(api.post='/api/plugin_api/unlock_plugin_edit', api.category="plugin", api.gen_path="plugin")
    // Update plugins via code
    UpdatePluginResponse UpdatePlugin(1: UpdatePluginRequest request) (api.post = '/api/plugin_api/update', api.category = "plugin")
    // removal tool
    DeleteAPIResponse DeleteAPI(1: DeleteAPIRequest request) (api.post = '/api/plugin_api/delete_api', api.category = "plugin", api.gen_path = 'plugin')
    // Remove plugin
    DelPluginResponse DelPlugin(1: DelPluginRequest request) (api.post = '/api/plugin_api/del_plugin', api.category = "plugin", api.gen_path = 'plugin')
    // publishing plugin
    PublishPluginResponse PublishPlugin(1: PublishPluginRequest request) (api.post = '/api/plugin_api/publish_plugin', api.category = "plugin")
    // Update plugins via UI
    UpdatePluginMetaResponse UpdatePluginMeta(1: UpdatePluginMetaRequest request) (api.post = '/api/plugin_api/update_plugin_meta', api.category = "plugin")
    GetBotDefaultParamsResponse GetBotDefaultParams(1: GetBotDefaultParamsRequest request) (api.post = '/api/plugin_api/get_bot_default_params', api.category = "plugin")
    UpdateBotDefaultParamsResponse UpdateBotDefaultParams(1: UpdateBotDefaultParamsRequest request) (api.post = '/api/plugin_api/update_bot_default_params', api.category = "plugin")
    // creation tool
    CreateAPIResponse CreateAPI(1: CreateAPIRequest request) (api.post = '/api/plugin_api/create_api', api.category = "plugin", api.gen_path = 'plugin')
    // update tool
    UpdateAPIResponse UpdateAPI(1: UpdateAPIRequest request) (api.post = '/api/plugin_api/update_api', api.category = "plugin", api.gen_path = 'plugin')
    GetUserAuthorityResponse GetUserAuthority(1: GetUserAuthorityRequest request)(api.post='/api/plugin_api/get_user_authority', api.category="plugin", api.gen_path="plugin")
    DebugAPIResponse DebugAPI(1: DebugAPIRequest request)(api.post='/api/plugin_api/debug_api', api.category="plugin", api.gen_path='plugin')
    GetPluginNextVersionResponse GetPluginNextVersion(1: GetPluginNextVersionRequest request)(api.post='/api/plugin_api/get_plugin_next_version', api.category="plugin", api.gen_path='plugin')
    GetDevPluginListResponse GetDevPluginList(1: GetDevPluginListRequest request)(api.post='/api/plugin_api/get_dev_plugin_list', api.category="plugin", api.gen_path='plugin', agw.preserve_base="true")
    // Protocol conversion, such as converting curl and mail carrier collection protocols to openapi3 protocols
    Convert2OpenAPIResponse Convert2OpenAPI(1: Convert2OpenAPIRequest request)(api.post='/api/plugin_api/convert_to_openapi', api.category="plugin", api.gen_path="plugin", agw.preserve_base="true")
    // Batch creation tool, currently used with the Convert2 OpenAPI interface
    BatchCreateAPIResponse BatchCreateAPI(1: BatchCreateAPIRequest request)(api.post='/api/plugin_api/batch_create_api', api.category="plugin", api.gen_path="plugin", agw.preserve_base="true")
    RevokeAuthTokenResponse RevokeAuthToken(1: RevokeAuthTokenRequest request)(api.post='/api/plugin_api/revoke_auth_token', api.category="plugin", api.gen_path="plugin", agw.preserve_base="true")
    GetQueriedOAuthPluginListResponse GetQueriedOAuthPluginList(1: GetQueriedOAuthPluginListRequest request)(api.post='/api/plugin_api/get_queried_oauth_plugins', api.category="plugin", api.gen_path="plugin", agw.preserve_base="true")
}

struct GetPlaygroundPluginListRequest {
    1:   optional i32       page           (api.body = "page")                           // page number
    2:   optional i32       size           (api.body = "size")                           // page size
    4:   optional string    name           (api.body = "name")                           // ignore
    5:   optional i64       space_id       (api.body = "space_id" api.js_conv = "str")   // Space ID
    6:            list<string> plugin_ids  (api.body = "plugin_ids")                     // If present, query according to plug-in id, no paging logic
    7:            list<i32> plugin_types   (api.body = "plugin_types")                   // When the length is 1 and it is a workflow, return the list of published workflows, and return the list of published plugins by default
    8:   optional i32       channel_id     (api.body = "channel_id")                     // ignore
    9:   optional bool      self_created   (api.body = "self_created")                   // ignore
    10:  optional i32       order_by       (api.body = "order_by")                       // sort
    11:  optional bool      is_get_offline (api.body = "is_get_offline")                 // ignore
    99:           string    referer        (api.header = "Referer")                      // ignore
    255: optional base.Base Base
}

struct GetPlaygroundPluginListResponse {
    1:   required i32                                code
    2:   required string                             msg
    3:            plugin_develop_common.GetPlaygroundPluginListData data
    255: optional base.BaseResp                      BaseResp
}

struct GetPluginAPIsRequest {
    1  : required i64                                plugin_id (api.js_conv = "str"), // Plugin ID
    2  :          list<string>                       api_ids , // If present, query according to tool id, no paging logic
    3  :          i32                                page     , // page number
    4  :          i32                                size     , // page size
    5  :          plugin_develop_common.APIListOrder order    , // ignore
    6  : optional string                             preview_version_ts, // ignore
    255: optional base.Base                          Base     ,
}

struct GetPluginAPIsResponse {
    1  :          i64                                       code        ,
    2  :          string                                    msg         ,
    3  :          list<plugin_develop_common.PluginAPIInfo> api_info    ,
    4  :          i32                                       total       ,
    5  :          i32                                       edit_version,
    255: optional base.BaseResp                             BaseResp    ,
}

struct GetUpdatedAPIsRequest {
    1  : required i64    plugin_id (api.js_conv = "str"), // Plugin ID
    255: optional base.Base Base     ,
}

struct GetUpdatedAPIsResponse {
    1  :          i64           code             ,
    2  :          string        msg              ,
    3  :          list<string>  created_api_names, // Newly created tool name
    4  :          list<string>  deleted_api_names, // Deleted tool name
    5  :          list<string>  updated_api_names, // updated tool name
    255: optional base.BaseResp BaseResp         ,
}

struct GetPluginInfoRequest {
    1  : required i64    plugin_id (api.js_conv = "str"), // Currently only plugins are supported OpenAPI plugin information
    2  : optional string preview_version_tsx // ignore
    255: optional base.Base Base     ,
}

struct GetPluginInfoResponse {
    1  :          i64                                       code                 ,
    2  :          string                                    msg                  ,
    3  :          plugin_develop_common.PluginMetaInfo      meta_info            ,
    4  :          plugin_develop_common.CodeInfo            code_info            ,
    5  :          bool                                      status               , // 0 No updates 1 Yes updates Not released
    6  :          bool                                      published            ,  // Has it been published?
    7  :          plugin_develop_common.Creator             creator              , // creator information
    8  :          plugin_develop_common.PluginStatisticData statistic_data       , // ignore
    9  :          plugin_develop_common.ProductStatus       plugin_product_status, // ignore
    10 :          bool                                      privacy_status       , // ignore
    11 :          string                                    privacy_info         , // ignore
    12 :          plugin_develop_common.CreationMethod      creation_method      , // ignore
    13 :          string                                    ide_code_runtime     , // ignore
    14 :          i32                                       edit_version         , // ignore
    15 :          plugin_develop_common.PluginType          plugin_type          , // ignore

    255: optional base.BaseResp                             BaseResp             ,
}

struct UpdatePluginRequest {
    1  :          i64    plugin_id  (api.js_conv = "str")  ,
    3  :          string    ai_plugin    , // plugin manifest in json string
    4  :          string    openapi      , // plugin openapi3 document in yaml string
    5  : optional string    client_id, // ignore
    6  : optional string    client_secret, // ignore
    7  : optional string    service_token, // ignore
    8  : optional string    source_code  , // ignore
    9  : optional i32       edit_version , // ignore
    255: optional base.Base Base         , // ignore
}

struct UpdatePluginResponse {
    1  :          i64                                    code    ,
    2  :          string                                 msg     ,
    3  : required plugin_develop_common.UpdatePluginData data    ,
    255: optional base.BaseResp                          BaseResp,
}

struct RegisterPluginMetaRequest {
    1  : required string                                                                                     name            , // plugin name
    2  : required string                                                                                     desc            , // Plugin description
    3  : optional string                                                                                     url             , // Plugin service address prefix
    4  : required plugin_develop_common.PluginIcon                                                           icon            , // plugin icon
    5  : optional plugin_develop_common.AuthorizationType                                                    auth_type       , // plug-in authorization type
    6  : optional plugin_develop_common.AuthorizationServiceLocation                                         location        , // When the sub-authorization type is api/token, the token parameter position
    7  : optional string                                                                                     key             , // When the sub-authorization type is api/token, the token parameter key
    8  : optional string                                                                                     service_token   , // When the sub-authorization type is api/token, the token parameter value
    9  : optional string                                                                                     oauth_info      , // The authorization type is oauth Yes, oauth information, see GetOAuthSchema return value
    10 : required i64                                                                                        space_id  (api.js_conv = "str")      , // Space ID
    11 : optional map<plugin_develop_common.ParameterLocation,list<plugin_develop_common.commonParamSchema>> common_params   , // Plugin public parameters, key is the parameter position, value is the parameter list
    12 : optional plugin_develop_common.CreationMethod                                                       creation_method , // ignore
    13 : optional string                                                                                     ide_code_runtime, // ignore
    14 : optional plugin_develop_common.PluginType                                                           plugin_type     , // ignore 
    15 : optional i64                                                                                        project_id  (api.js_conv = "str")    , // App ID
    16 : optional i32                                                                                        sub_auth_type   , // Level 2 authorization type, 0: api/token of service, 10: client credentials of oauth
    17 : optional string                                                                                     auth_payload    , // ignore 
    18 : optional bool                                                                                       fixed_export_ip , // ignore
    255: optional base.Base                                                                                  Base            ,
}

struct RegisterPluginMetaResponse {
    1  :          i64           code     ,
    2  :          string        msg      ,
    3  :          i64        plugin_id (api.js_conv = "str"),
    255: optional base.BaseResp BaseResp ,
}

struct UpdatePluginMetaRequest {
    1  : required i64                                                                                     plugin_id (api.js_conv = "str")     ,
    2  : optional string                                                                                     name           ,
    3  : optional string                                                                                     desc           ,
    4  : optional string                                                                                     url            , // plugin service url
    5  : optional plugin_develop_common.PluginIcon                                                           icon           ,
    6  : optional plugin_develop_common.AuthorizationType                                                    auth_type      ,
    7  : optional plugin_develop_common.AuthorizationServiceLocation                                         location       , // When the sub-authorization type is api/token, the token parameter position
    8  : optional string                                                                                     key            , // When the sub-authorization type is api/token, the token parameter key
    9  : optional string                                                                                     service_token  , // When the sub-authorization type is api/token, the token parameter value
    10 : optional string                                                                                     oauth_info     , // When the sub-authorization type is oauth, for oauth information, see GetOAuthSchema return value
    11 : optional map<plugin_develop_common.ParameterLocation,list<plugin_develop_common.commonParamSchema>> common_params  , // JSON serialization
    12 : optional plugin_develop_common.CreationMethod                                                       creation_method, // ignore
    13 : optional i32                                                                                        edit_version   , // ignore
    14 : optional plugin_develop_common.PluginType                                                           plugin_type    ,
    15 : optional i32                                                                                        sub_auth_type  , // Level 2 authorization type
    16 : optional string                                                                                     auth_payload   , // ignore
    17 : optional bool                                                                                       fixed_export_ip, // ignore

    255: optional base.Base                                                                                  Base           ,
}

struct UpdatePluginMetaResponse {
    1  :          i64           code        ,
    2  :          string        msg         ,
    3  :          i32           edit_version,
    255: optional base.BaseResp BaseResp    ,
}

struct PublishPluginRequest {
    1  : required i64    plugin_id  (api.js_conv = "str")   ,
    2  :          bool      privacy_status, // Privacy Statement Status
    3  :          string    privacy_info  , // Privacy Statement Content
    4  :          string    version_name  ,
    5  :          string    version_desc  ,
    255: optional base.Base Base          ,
}

struct PublishPluginResponse {
    1  :          i64           code      ,
    2  :          string        msg       ,
    3  :          string        version_ts,
    255: optional base.BaseResp BaseResp  ,
}

// Bot reference plugin
struct GetBotDefaultParamsRequest {
    1  :          i64                                    space_id  (api.js_conv = "str")               ,
    2  :          i64                                    bot_id  (api.js_conv = "str")                 ,
    3  :          string                                    dev_id                   ,
    4  :          i64                                    plugin_id   (api.js_conv = "str")             ,
    5  :          string                                    api_name                 ,
    6  :          string                                    plugin_referrer_id       ,
    7  :          plugin_develop_common.PluginReferrerScene plugin_referrer_scene    ,
    8  :          bool                                      plugin_is_debug          ,
    9  :          string                                    workflow_id              ,
    10 : optional string                                    plugin_publish_version_ts,
    255: optional base.Base                                 Base                     ,
}

struct GetBotDefaultParamsResponse {
    1  :          i64                                      code           ,
    2  :          string                                   msg            ,
    3  :          list<plugin_develop_common.APIParameter> request_params ,
    4  :          list<plugin_develop_common.APIParameter> response_params,
    5  :          plugin_develop_common.ResponseStyle      response_style ,
    255: optional base.BaseResp                            BaseResp       ,
}

struct UpdateBotDefaultParamsRequest {
    1  :          i64                                    space_id   (api.js_conv = "str")          ,
    2  :          i64                                    bot_id      (api.js_conv = "str")         ,
    3  :          string                                    dev_id               ,
    4  :          i64                                    plugin_id   (api.js_conv = "str")         ,
    5  :          string                                    api_name             ,
    6  :          list<plugin_develop_common.APIParameter>  request_params       ,
    7  :          list<plugin_develop_common.APIParameter>  response_params      ,
    8  :          string                                    plugin_referrer_id   ,
    9  :          plugin_develop_common.PluginReferrerScene plugin_referrer_scene,
    10 :          plugin_develop_common.ResponseStyle       response_style       ,
    11 :          string                                    workflow_id          ,
    255: optional base.Base                                 Base                 ,
}

struct UpdateBotDefaultParamsResponse {
    1  :          i64           code    ,
    2  :          string        msg     ,
    255: optional base.BaseResp BaseResp,
}

struct DeleteBotDefaultParamsRequest {
    1  :          i64                                    bot_id    (api.js_conv = "str")           ,
    2  :          string                                    dev_id               ,
    3  :          i64                                    plugin_id  (api.js_conv = "str")          ,
    4  :          string                                    api_name             ,
// Bot removal tool when: DeleteBot = false, APIName to set
// Delete bot: DeleteBot = true, APIName is empty
    5  :          bool                                      delete_bot           ,
    6  :          i64                                    space_id  (api.js_conv = "str")           ,
    7  :          string                                    plugin_referrer_id   ,
    8  :          plugin_develop_common.PluginReferrerScene plugin_referrer_scene,
    9  :          string                                    workflow_id          ,
    10 :          i64                                    api_id (api.js_conv = "str"),
    255: optional base.Base                                 Base                 ,
}

struct DeleteBotDefaultParamsResponse {
    255: base.BaseResp BaseResp,
}

struct UpdateAPIRequest {
    1  : required i64                                   plugin_id  (api.js_conv = "str")    ,
    2  : required i64                                   api_id (api.js_conv = "str")        ,
    3  : optional string                                   name           ,
    4  : optional string                                   desc           ,
    5  : optional string                                   path           , // http subURL of tool
    6  : optional plugin_develop_common.APIMethod          method         , // http method of tool
    7  : optional list<plugin_develop_common.APIParameter> request_params , // request parameters of tool
    8  : optional list<plugin_develop_common.APIParameter> response_params, // response parameters of tool
    9  : optional bool                                     disabled       , // whether disable tool
    10 : optional plugin_develop_common.APIExtend          api_extend     , // ignore
    11 : optional i32                                      edit_version   , // ignore
    12 : optional bool                                     save_example   , // whether save example
    13 : optional plugin_develop_common.DebugExample       debug_example  ,
    14 : optional string                                   function_name  , // ignore

    255: optional base.Base                                Base           ,
}

struct UpdateAPIResponse {
    1  :          i64           code        ,
    2  :          string        msg         ,
    3  :          i32           edit_version,
    255: optional base.BaseResp BaseResp    ,
}

struct DelPluginRequest {
    1  :          i64    plugin_id (api.js_conv = "str"),

    255: optional base.Base Base     ,
}

struct DelPluginResponse {
    1  :          i64           code    ,
    2  :          string        msg     ,
    255: optional base.BaseResp BaseResp                 ,
}

struct CreateAPIRequest {
    1  : required i64                                   plugin_id  (api.js_conv = "str")    ,
    2  : required string                                   name           , // tool name
    3  : required string                                   desc           , // tool description
    4  : optional string                                   path           , // http subURL of tool
    5  : optional plugin_develop_common.APIMethod          method         , // http method of tool
    6  : optional plugin_develop_common.APIExtend          api_extend     , // ignore
    7  : optional list<plugin_develop_common.APIParameter> request_params , // ignore
    8  : optional list<plugin_develop_common.APIParameter> response_params, // ignore
    9  : optional bool                                     disabled       , // ignore
    10 : optional i32                                      edit_version   , // ignore
    11 : optional string                                   function_name  , // ignore

    255: optional base.Base                                Base           ,
}

struct CreateAPIResponse {
    1  :          i64           code        ,
    2  :          string        msg         ,
    3  :          string        api_id      ,
    4  :          i32           edit_version,
    255: optional base.BaseResp BaseResp    ,
}

struct DeleteAPIRequest {
    1  : required i64    plugin_id (api.js_conv = "str")  ,
    2  : required i64    api_id (api.js_conv = "str")     ,
    3  : optional i32       edit_version, // ignore
    255: optional base.Base Base        ,
}

struct DeleteAPIResponse {
    1  :          i64           code        ,
    2  :          string        msg         ,
    3  :          i32           edit_version,
    255: optional base.BaseResp BaseResp    ,
}

struct GetOAuthSchemaRequest {
    255: optional base.Base Base,
}

struct GetOAuthSchemaResponse {
    1  :          i64           code        ,
    2  :          string        msg         ,
    3  :          string        oauth_schema,
    4  :          string        ide_conf    ,
    255: optional base.BaseResp BaseResp    , // The agreed json
}

struct GetUserAuthorityRequest {
    1  : required i64                               plugin_id (api.body = "plugin_id" api.js_conv = "str")        ,
    2  : required plugin_develop_common.CreationMethod creation_method (api.body = "creation_method"),
    3  :          i64                               project_id (api.body = "project_id" api.js_conv = "str")             ,

    255: optional base.Base                            Base                                                                     ,
}

struct GetUserAuthorityResponse {
    1  : required i32                                  code
    2  : required string                               msg
    3  :          plugin_develop_common.GetUserAuthorityData data     (api.body = "data")

    255: optional base.BaseResp                        BaseResp                   ,
}

// Get authorization status--plugin debug area
struct GetOAuthStatusRequest {
    1  : required i64    plugin_id (api.js_conv = "str"),

    255:          base.Base Base     ,
}

struct GetOAuthStatusResponse {
    1  :          bool                              is_oauth, // Is it an authorized plugin?
    2  :          plugin_develop_common.OAuthStatus status  , // user authorization status
    3  :          string                            content , // Unauthorized, return the authorized url.

    253: i64 code
    254: string msg
    255: required base.BaseResp                     BaseResp,
}

struct CheckAndLockPluginEditRequest {
    1  : required i64    plugin_id (api.body = "plugin_id", api.js_conv = "str"),

    255: optional base.Base Base                                                   ,
}

struct CheckAndLockPluginEditResponse {
    1  : required i32                                              code   ,
    2  : required string                                           msg     ,
    3  :          plugin_develop_common.CheckAndLockPluginEditData data     ,

    255: optional base.BaseResp                                    BaseResp                   ,
}

struct GetPluginPublishHistoryRequest {
    1  : required i64    plugin_id (api.js_conv = "str"),
    2  : required i64    space_id (api.js_conv = "str"),
    3  : optional i32       page     , // Turn the page, what page?
    4  : optional i32       size     , // Flip pages, a few entries per page

    255: optional base.Base Base     ,
}

struct GetPluginPublishHistoryResponse {
    1  : i64                                           code                    ,
    2  : string                                        msg                     ,
    3  : list<plugin_develop_common.PluginPublishInfo> plugin_publish_info_list, // reverse time
    4  : i32                                           total                   , // How many in total, greater than page x size description and next page

    255: base.BaseResp                                 BaseResp                ,
}

struct DebugAPIRequest {
    1  : required i64                               plugin_id (api.js_conv = "str")  ,
    2  : required i64                               api_id  (api.js_conv = "str")    ,
    3  : required string                               parameters  , // request parameters in json string
    4  : required plugin_develop_common.DebugOperation operation   , // ignore
    5  : optional i32                                  edit_version, // ignore

    255: optional base.Base                            Base        ,
}

struct DebugAPIResponse {
    1  :          i64                                      code           ,
    2  :          string                                   msg            ,
    3  :          list<plugin_develop_common.APIParameter> response_params, // response parameters
    4  :          bool                                     success        , // invoke success or not
    5  :          string                                   resp           , // trimmed response in json string
    6  :          string                                   reason         , // invoke failed reason
    7  :          string                                   raw_resp       , // raw response in json string
    8  :          string                                   raw_req        , // raw request in json string

    255: optional base.BaseResp                            BaseResp       ,
}

struct UnlockPluginEditRequest {
    1  : required i64    plugin_id (api.body = "plugin_id", api.js_conv = "str"),

    255: optional base.Base Base                                                   ,
}

struct UnlockPluginEditResponse {
    1  : required i32           code       ,
    2  : required string        msg        ,
    3  : required bool          released ,

    255: optional base.BaseResp BaseResp                       ,
}

struct GetPluginNextVersionRequest {
    1  : required i64    plugin_id (api.js_conv = "str"),
    2  : required i64    space_id (api.js_conv = "str"),

    255: optional base.Base Base     ,
}

struct GetPluginNextVersionResponse {
    1  : i64           code             ,
    2  : string        msg              ,
    3  : string        next_version_name,

    255: base.BaseResp BaseResp         ,
}

struct RegisterPluginRequest {
    1  :          string                           ai_plugin       , // plugin manifest in json string
    2  :          string                           openapi         , // plugin openapi3 document in yaml string
    4  : optional string                           client_id       , // ignore
    5  : optional string                           client_secret   , // ignore
    6  : optional string                           service_token   , // ignore
    7  : optional plugin_develop_common.PluginType plugin_type     , // ignore 
    8  :          i64                              space_id        (api.js_conv = "str"),
    9  :          bool                             import_from_file, // ignore
    10 : optional i64                              project_id      (api.js_conv = "str") ,
    255: optional base.Base                        Base            ,
}

struct RegisterPluginResponse {
    1  :          i64                                      code    ,
    2  :          string                                   msg     ,
    3  :          plugin_develop_common.RegisterPluginData data    ,
    255: optional base.BaseResp                            BaseResp,
}

struct GetDevPluginListRequest {
    1  : optional list<plugin_develop_common.PluginStatus>  status                                                                                                       ,
    2  : optional i32                                       page                                                                                                         ,
    3  : optional i32                                       size                                                                                                         ,
    4  : required i64                                       dev_id                 (api.body = "dev_id", api.js_conv="str", agw.js_conv="str", agw.cli_conv="str", agw.key="dev_id")        ,
    5  :          i64                                       space_id               (api.body = "space_id", api.js_conv="str", agw.js_conv="str", agw.cli_conv="str", agw.key="space_id")    ,
    6  : optional plugin_develop_common.ScopeType           scope_type                                                                                                   ,
    7  : optional plugin_develop_common.OrderBy             order_by                                                                                                     ,
    8  : optional bool                                      publish_status                                                                                               , // Release status filter: true: published, false: not published
    9  : optional string                                    name                                                                                                         , // Plugin name or tool name
    10 : optional plugin_develop_common.PluginTypeForFilter plugin_type_for_filter                                                                                       , // Plugin Type Filter, End/Cloud
    11 :          i64                                       project_id             (api.body = "project_id", api.js_conv="str", agw.js_conv="str", agw.cli_conv="str", agw.key="project_id"),
    12 :          list<i64>                                 plugin_ids             (api.body = "plugin_ids", agw.js_conv="str", agw.cli_conv="str", agw.key="plugin_ids"), // plugin id list

    255: optional base.Base                                 Base                                                                                                         ,
}

struct GetDevPluginListResponse{
    1  : i32                                                 code                                                                                    ,
    2  : string                                              msg                                                                                     ,
    3  : list<plugin_develop_common.PluginInfoForPlayground> plugin_list                                                                             ,
    4  : i64                                                 total       (api.body = "total", api.js_conv="str", agw.js_conv="str", agw.cli_conv="str", agw.key="total"),

    255: base.BaseResp                                       baseResp                                                                                ,
}

struct Convert2OpenAPIRequest {
    1  : optional string    plugin_name  (api.body = "plugin_name")     ,
    2  : optional string    plugin_url    (api.body = "plugin_url")    ,
    3  : required string    data          (api.body = "data")    , // import content, e.g. curl, postman, swagger
    4  : optional bool      merge_same_paths  (api.body = "merge_same_paths") , // ignore
    5  :          i64    space_id        (api.js_conv = "str", api.body = "space_id")  ,
    6  : optional string    plugin_description (api.body = "plugin_description"), // ignore

    255: optional base.Base Base              ,
}

struct Convert2OpenAPIResponse {
    1  :          i64                                          code               ,
    2  :          string                                       msg                ,
    3  : optional string                                       openapi            , // openapi3 document in yaml string
    4  : optional string                                       ai_plugin          , // plugin manifest in json string
    5  : optional plugin_develop_common.PluginDataFormat       plugin_data_format , // protocol type
    6  :          list<plugin_develop_common.DuplicateAPIInfo> duplicate_api_infos, // ignore

// BaseResp.StatusCode
//     DuplicateAPIPath: Duplicate API Path in imported file with request. MergeSamePaths = false
//     InvalidParam: Other errors
    255: optional base.BaseResp                                BaseResp           ,
}

struct BatchCreateAPIRequest {
    1  :          i64                                    plugin_id (api.js_conv = "str", api.body = "plugin_id")        ,
    2  :          string                                 ai_plugin         (api.body = "ai_plugin"), // plugin manifest in json string
    3  :          string                                 openapi           (api.body = "openapi"), // plugin openapi3 document in yaml string
    4  :          i64                                    space_id          (api.js_conv = "str", api.body = "space_id") ,
    5  :          i64                                    dev_id            (api.js_conv = "str", api.body = "dev_id"), // ignore
    6  :          bool                                      replace_same_paths (api.body = "replace_same_paths"), // whether to replace the same tool, method:subURL is unique 
    7  : optional list<plugin_develop_common.PluginAPIInfo> paths_to_replace  (api.body = "paths_to_replace"), // ignore
    8  : optional i32                                       edit_version      (api.body = "edit_version"), // ignore

    255: optional base.Base                                 Base              ,
}

struct BatchCreateAPIResponse {
    1  :          i64                                       code            ,
    2  :          string                                    msg             ,
// PathsToReplace represents the tools to override,
// If BaseResp. StatusCode = DuplicateAPIPath, then PathsToReplace is not empty
    3  : optional list<plugin_develop_common.PluginAPIInfo> paths_duplicated,
    4  : optional list<plugin_develop_common.PluginAPIInfo> paths_created   ,
    5  :          i32                                       edit_version    ,

// BaseResp.StatusCode
//     DuplicateAPIPath: There is a duplicate API Path with request. ReplaceDupPath = false
//     InvalidParam: Other errors
    255: required base.BaseResp                             BaseResp        ,
}

struct RevokeAuthTokenRequest {
    1  : required i64    plugin_id (api.js_conv = "str", api.body = "plugin_id"),
    2  : optional i64    bot_id   (api.js_conv = "str", api.body = "bot_id"), // If not passed using uid assignment bot_id = connector_uid
    3  : optional i32       context_type (api.body = "context_type"),
    255:          base.Base Base     ,
}

struct RevokeAuthTokenResponse {
    255: required base.BaseResp BaseResp,
}

struct OAuthPluginInfo {
    1: i64                               plugin_id (api.js_conv = "str") ,
    2: plugin_develop_common.OAuthStatus status     , // user authorization status
    3: string                            name       , // Plugin name
    4: string                            plugin_icon, // plugin avatar
}

struct GetQueriedOAuthPluginListRequest {
    1  : required i64    bot_id (api.js_conv = "str"),
    255:          base.Base Base  ,

}

struct GetQueriedOAuthPluginListResponse {
    1  :          list<OAuthPluginInfo> oauth_plugin_list,

    253: i64 code
    254: string msg
    255: required base.BaseResp         BaseResp         ,
}