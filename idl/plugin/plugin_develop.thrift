include "../base.thrift"
include "./plugin_develop_common.thrift"

namespace go ocean.cloud.plugin_develop

service PluginDevelopService {
    GetOAuthSchemaResponse GetOAuthSchema(1: GetOAuthSchemaRequest request)(api.post='/api/plugin/get_oauth_schema', api.category="plugin", api.gen_path="plugin")
    GetOAuthSchemaResponse GetOAuthSchemaAPI(1: GetOAuthSchemaRequest request)(api.post='/api/plugin_api/get_oauth_schema', api.category="plugin", api.gen_path='plugin')
    // 获取已发布 workflow、plugin 列表，或者多个插件的详情
    GetPlaygroundPluginListResponse GetPlaygroundPluginList(1: GetPlaygroundPluginListRequest request) (api.post = '/api/plugin_api/get_playground_plugin_list', api.category = "plugin")
    // 通过 code 创建插件
    RegisterPluginResponse RegisterPlugin(1: RegisterPluginRequest request)(api.post='/api/plugin_api/register', api.category="plugin", api.gen_path="plugin", agw.preserve_base="true")
    // 通过 UI 创建插件
    RegisterPluginMetaResponse RegisterPluginMeta(1: RegisterPluginMetaRequest request) (api.post = '/api/plugin_api/register_plugin_meta', api.category = "plugin")
    // 获取插件工具列表，或者多个工具详情
    GetPluginAPIsResponse GetPluginAPIs(1: GetPluginAPIsRequest request) (api.post = '/api/plugin_api/get_plugin_apis', api.category = "plugin")
    // 获取插件详情
    GetPluginInfoResponse GetPluginInfo(1: GetPluginInfoRequest request) (api.post = '/api/plugin_api/get_plugin_info', api.category = "plugin")
    // 与最近一次发布版本相比，更新的工具列表
    GetUpdatedAPIsResponse GetUpdatedAPIs(1: GetUpdatedAPIsRequest request) (api.post = '/api/plugin_api/get_updated_apis', api.category = "plugin")
    GetOAuthStatusResponse GetOAuthStatus(1: GetOAuthStatusRequest request)(api.post='/api/plugin_api/get_oauth_status', api.category="plugin", api.gen_path="plugin")
    CheckAndLockPluginEditResponse CheckAndLockPluginEdit(1: CheckAndLockPluginEditRequest request)(api.post='/api/plugin_api/check_and_lock_plugin_edit', api.category="plugin", api.gen_path="plugin", )
    UnlockPluginEditResponse UnlockPluginEdit(1: UnlockPluginEditRequest request)(api.post='/api/plugin_api/unlock_plugin_edit', api.category="plugin", api.gen_path="plugin")
    // 通过 code 更新插件
    UpdatePluginResponse UpdatePlugin(1: UpdatePluginRequest request) (api.post = '/api/plugin_api/update', api.category = "plugin")
    // 删除工具
    DeleteAPIResponse DeleteAPI(1: DeleteAPIRequest request) (api.post = '/api/plugin_api/delete_api', api.category = "plugin", api.gen_path = 'plugin')
    // 删除插件
    DelPluginResponse DelPlugin(1: DelPluginRequest request) (api.post = '/api/plugin_api/del_plugin', api.category = "plugin", api.gen_path = 'plugin')
    // 发布插件
    PublishPluginResponse PublishPlugin(1: PublishPluginRequest request) (api.post = '/api/plugin_api/publish_plugin', api.category = "plugin")
    // 通过UI更新插件
    UpdatePluginMetaResponse UpdatePluginMeta(1: UpdatePluginMetaRequest request) (api.post = '/api/plugin_api/update_plugin_meta', api.category = "plugin")
    GetBotDefaultParamsResponse GetBotDefaultParams(1: GetBotDefaultParamsRequest request) (api.post = '/api/plugin_api/get_bot_default_params', api.category = "plugin")
    UpdateBotDefaultParamsResponse UpdateBotDefaultParams(1: UpdateBotDefaultParamsRequest request) (api.post = '/api/plugin_api/update_bot_default_params', api.category = "plugin")
    // 创建工具
    CreateAPIResponse CreateAPI(1: CreateAPIRequest request) (api.post = '/api/plugin_api/create_api', api.category = "plugin", api.gen_path = 'plugin')
    // 更新工具
    UpdateAPIResponse UpdateAPI(1: UpdateAPIRequest request) (api.post = '/api/plugin_api/update_api', api.category = "plugin", api.gen_path = 'plugin')
    GetUserAuthorityResponse GetUserAuthority(1: GetUserAuthorityRequest request)(api.post='/api/plugin_api/get_user_authority', api.category="plugin", api.gen_path="plugin")
    DebugAPIResponse DebugAPI(1: DebugAPIRequest request)(api.post='/api/plugin_api/debug_api', api.category="plugin", api.gen_path='plugin')
    GetPluginNextVersionResponse GetPluginNextVersion(1: GetPluginNextVersionRequest request)(api.post='/api/plugin_api/get_plugin_next_version', api.category="plugin", api.gen_path='plugin')
    GetDevPluginListResponse GetDevPluginList(1: GetDevPluginListRequest request)(api.post='/api/plugin_api/get_dev_plugin_list', api.category="plugin", api.gen_path='plugin', agw.preserve_base="true")
    // 协议转换，如将 curl 、postman collection 协议转换为 openapi3 协议
    Convert2OpenAPIResponse Convert2OpenAPI(1: Convert2OpenAPIRequest request)(api.post='/api/plugin_api/convert_to_openapi', api.category="plugin", api.gen_path="plugin", agw.preserve_base="true")
    // 批量创建工具，目前是配合 Convert2OpenAPI 接口使用
    BatchCreateAPIResponse BatchCreateAPI(1: BatchCreateAPIRequest request)(api.post='/api/plugin_api/batch_create_api', api.category="plugin", api.gen_path="plugin", agw.preserve_base="true")
    RevokeAuthTokenResponse RevokeAuthToken(1: RevokeAuthTokenRequest request)(api.post='/api/plugin_api/revoke_auth_token', api.category="plugin", api.gen_path="plugin", agw.preserve_base="true")
    GetQueriedOAuthPluginListResponse GetQueriedOAuthPluginList(1: GetQueriedOAuthPluginListRequest request)(api.post='/api/plugin_api/get_queried_oauth_plugins', api.category="plugin", api.gen_path="plugin", agw.preserve_base="true")
}

struct GetPlaygroundPluginListRequest {
    1:   optional i32       page           (api.body = "page")                           // 页码
    2:   optional i32       size           (api.body = "size")                           // 每页大小
    4:   optional string    name           (api.body = "name")                           // ignore
    5:   optional i64       space_id       (api.body = "space_id" api.js_conv = "str")   // 空间id
    6:            list<string> plugin_ids  (api.body = "plugin_ids")                     // 如果存在，则根据插件id查询，无分页逻辑
    7:            list<i32> plugin_types   (api.body = "plugin_types")                   // 长度为1 ，且为workflow时，返回已发布的workflow列表，默认返回已发布的plugin列表
    8:   optional i32       channel_id     (api.body = "channel_id")                     // ignore
    9:   optional bool      self_created   (api.body = "self_created")                   // ignore
    10:  optional i32       order_by       (api.body = "order_by")                       // 排序
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
    1  : required i64                                plugin_id (api.js_conv = "str"), // 插件id
    2  :          list<string>                       api_ids , // 如果存在，则根据工具id查询，无分页逻辑
    3  :          i32                                page     , // 页码
    4  :          i32                                size     , // 每页大小
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
    1  : required i64    plugin_id (api.js_conv = "str"), // 插件id
    255: optional base.Base Base     ,
}

struct GetUpdatedAPIsResponse {
    1  :          i64           code             ,
    2  :          string        msg              ,
    3  :          list<string>  created_api_names, // 新创建的工具名
    4  :          list<string>  deleted_api_names, // 被删除的工具名
    5  :          list<string>  updated_api_names, // 被更新的工具名
    255: optional base.BaseResp BaseResp         ,
}

struct GetPluginInfoRequest {
    1  : required i64    plugin_id (api.js_conv = "str"), // 目前只支持插件openapi插件的信息
    2  : optional string preview_version_tsx // ignore
    255: optional base.Base Base     ,
}

struct GetPluginInfoResponse {
    1  :          i64                                       code                 ,
    2  :          string                                    msg                  ,
    3  :          plugin_develop_common.PluginMetaInfo      meta_info            ,
    4  :          plugin_develop_common.CodeInfo            code_info            ,
    5  :          bool                                      status               , // 0 无更新 1 有更新未发布
    6  :          bool                                      published            ,  // 是否已发布
    7  :          plugin_develop_common.Creator             creator              , // 创建人信息
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
    1  : required string                                                                                     name            , // 插件名
    2  : required string                                                                                     desc            , // 插件描述
    3  : optional string                                                                                     url             , // 插件服务地址前缀
    4  : required plugin_develop_common.PluginIcon                                                           icon            , // 插件图标
    5  : optional plugin_develop_common.AuthorizationType                                                    auth_type       , // 插件授权类型
    6  : optional plugin_develop_common.AuthorizationServiceLocation                                         location        , // 子授权类型为api/token时，token参数位置
    7  : optional string                                                                                     key             , // 子授权类型为api/token时，token参数key
    8  : optional string                                                                                     service_token   , // 子授权类型为api/token时，token参数value
    9  : optional string                                                                                     oauth_info      , // 授权类型为oauth是，oauth信息，见GetOAuthSchema返回值
    10 : required i64                                                                                        space_id  (api.js_conv = "str")      , // 空间id
    11 : optional map<plugin_develop_common.ParameterLocation,list<plugin_develop_common.commonParamSchema>> common_params   , // 插件公共参数，key为参数位置，value为参数列表
    12 : optional plugin_develop_common.CreationMethod                                                       creation_method , // ignore
    13 : optional string                                                                                     ide_code_runtime, // ignore
    14 : optional plugin_develop_common.PluginType                                                           plugin_type     , // ignore 
    15 : optional i64                                                                                        project_id  (api.js_conv = "str")    , // 应用id
    16 : optional i32                                                                                        sub_auth_type   , // 二级授权类型，0：api/token of service，10：client credentials of oauth
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
    7  : optional plugin_develop_common.AuthorizationServiceLocation                                         location       , // 子授权类型为api/token时，token参数位置
    8  : optional string                                                                                     key            , // 子授权类型为api/token时，token参数key
    9  : optional string                                                                                     service_token  , // 子授权类型为api/token时，token参数value
    10 : optional string                                                                                     oauth_info     , // 子授权类型为oauth时，oauth信息，见GetOAuthSchema返回值
    11 : optional map<plugin_develop_common.ParameterLocation,list<plugin_develop_common.commonParamSchema>> common_params  , // json序列化
    12 : optional plugin_develop_common.CreationMethod                                                       creation_method, // ignore
    13 : optional i32                                                                                        edit_version   , // ignore
    14 : optional plugin_develop_common.PluginType                                                           plugin_type    ,
    15 : optional i32                                                                                        sub_auth_type  , // 二级授权类型
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
    2  :          bool      privacy_status, // 隐私声明状态
    3  :          string    privacy_info  , // 隐私声明内容
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

// bot引用plugin
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
// bot删除工具时: DeleteBot = false , APIName要设置
// 删除bot时   : DeleteBot = true  , APIName为空
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
    255: optional base.BaseResp BaseResp    , // 约定的json
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

// 获取授权状态--plugin debug区
struct GetOAuthStatusRequest {
    1  : required i64    plugin_id (api.js_conv = "str"),

    255:          base.Base Base     ,
}

struct GetOAuthStatusResponse {
    1  :          bool                              is_oauth, // 是否为授权插件
    2  :          plugin_develop_common.OAuthStatus status  , // 用户授权状态
    3  :          string                            content , // 未授权，返回授权url

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
    3  : optional i32       page     , // 翻页，第几页
    4  : optional i32       size     , // 翻页，每页几条

    255: optional base.Base Base     ,
}

struct GetPluginPublishHistoryResponse {
    1  : i64                                           code                    ,
    2  : string                                        msg                     ,
    3  : list<plugin_develop_common.PluginPublishInfo> plugin_publish_info_list, // 时间倒序
    4  : i32                                           total                   , // 总共多少条，大于 page x size 说明还有下一页

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
    8  : optional bool                                      publish_status                                                                                               , // 发布状态筛选：true:已发布, false:未发布
    9  : optional string                                    name                                                                                                         , // 插件名或工具名
    10 : optional plugin_develop_common.PluginTypeForFilter plugin_type_for_filter                                                                                       , // 插件种类筛选 端/云
    11 :          i64                                       project_id             (api.body = "project_id", api.js_conv="str", agw.js_conv="str", agw.cli_conv="str", agw.key="project_id"),
    12 :          list<i64>                                 plugin_ids             (api.body = "plugin_ids", agw.js_conv="str", agw.cli_conv="str", agw.key="plugin_ids"), // 插件id列表

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
//     DuplicateAPIPath: 导入的文件中有重复的API Path，且 request.MergeSamePaths = false
//     InvalidParam: 其他错误
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
// PathsToReplace表示要覆盖的tools，
// 如果BaseResp.StatusCode = DuplicateAPIPath，那么PathsToReplace不为空
    3  : optional list<plugin_develop_common.PluginAPIInfo> paths_duplicated,
    4  : optional list<plugin_develop_common.PluginAPIInfo> paths_created   ,
    5  :          i32                                       edit_version    ,

// BaseResp.StatusCode
//     DuplicateAPIPath: 有重复的API Path，且 request.ReplaceDupPath = false
//     InvalidParam: 其他错误
    255: required base.BaseResp                             BaseResp        ,
}

struct RevokeAuthTokenRequest {
    1  : required i64    plugin_id (api.js_conv = "str", api.body = "plugin_id"),
    2  : optional i64    bot_id   (api.js_conv = "str", api.body = "bot_id"), // 如果不传使用uid赋值 bot_id = connector_uid
    3  : optional i32       context_type (api.body = "context_type"),
    255:          base.Base Base     ,
}

struct RevokeAuthTokenResponse {
    255: required base.BaseResp BaseResp,
}

struct OAuthPluginInfo {
    1: i64                               plugin_id (api.js_conv = "str") ,
    2: plugin_develop_common.OAuthStatus status     , // 用户授权状态
    3: string                            name       , // 插件name
    4: string                            plugin_icon, // 插件头像
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