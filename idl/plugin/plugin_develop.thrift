include "../base.thrift"
include "./plugin_develop_common.thrift"

namespace go ocean.cloud.plugin_develop

service PluginDevelopService {
    GetOAuthSchemaResponse GetOAuthSchema(1: GetOAuthSchemaRequest request)(api.post='/api/plugin_api/get_oauth_schema', api.category="plugin", api.gen_path='plugin')
    GetPlaygroundPluginListResponse GetPlaygroundPluginList(1: GetPlaygroundPluginListRequest request) (api.post = '/api/plugin_api/get_playground_plugin_list', api.category = "plugin")
    RegisterPluginMetaResponse RegisterPluginMeta(1: RegisterPluginMetaRequest request) (api.post = '/api/plugin_api/register_plugin_meta', api.category = "plugin")
    GetPluginAPIsResponse GetPluginAPIs(1: GetPluginAPIsRequest request) (api.post = '/api/plugin_api/get_plugin_apis', api.category = "plugin")
    GetPluginInfoResponse GetPluginInfo(1: GetPluginInfoRequest request) (api.post = '/api/plugin_api/get_plugin_info', api.category = "plugin")
    GetUpdatedAPIsResponse GetUpdatedAPIs(1: GetUpdatedAPIsRequest request) (api.post = '/api/plugin_api/get_updated_apis', api.category = "plugin")
    GetOAuthStatusResponse GetOAuthStatus(1: GetOAuthStatusRequest request)(api.post='/api/plugin_api/get_oauth_status', api.category="plugin", api.gen_path="plugin")
    CheckAndLockPluginEditResponse CheckAndLockPluginEdit(1: CheckAndLockPluginEditRequest request)(api.post='/api/plugin_api/check_and_lock_plugin_edit', api.category="plugin", api.gen_path="plugin", )
    UnlockPluginEditResponse UnlockPluginEdit(1: UnlockPluginEditRequest request)(api.post='/api/plugin_api/unlock_plugin_edit', api.category="plugin", api.gen_path="plugin")
    UpdatePluginResponse UpdatePlugin(1: UpdatePluginRequest request) (api.post = '/api/plugin_api/update', api.category = "plugin")
    DeleteAPIResponse DeleteAPI(1: DeleteAPIRequest request) (api.post = '/api/plugin_api/delete_api', api.category = "plugin", api.gen_path = 'plugin')
    DelPluginResponse DelPlugin(1: DelPluginRequest request) (api.post = '/api/plugin_api/del_plugin', api.category = "plugin", api.gen_path = 'plugin')
    PublishPluginResponse PublishPlugin(1: PublishPluginRequest request) (api.post = '/api/plugin_api/publish_plugin', api.category = "plugin")
    UpdatePluginMetaResponse UpdatePluginMeta(1: UpdatePluginMetaRequest request) (api.post = '/api/plugin_api/update_plugin_meta', api.category = "plugin")
    GetBotDefaultParamsResponse GetBotDefaultParams(1: GetBotDefaultParamsRequest request) (api.post = '/api/plugin_api/get_bot_default_params', api.category = "plugin")
    UpdateBotDefaultParamsResponse UpdateBotDefaultParams(1: UpdateBotDefaultParamsRequest request) (api.post = '/api/plugin_api/update_bot_default_params', api.category = "plugin")
    CreateAPIResponse CreateAPI(1: CreateAPIRequest request) (api.post = '/api/plugin_api/create_api', api.category = "plugin", api.gen_path = 'plugin')
    UpdateAPIResponse UpdateAPI(1: UpdateAPIRequest request) (api.post = '/api/plugin_api/update_api', api.category = "plugin", api.gen_path = 'plugin')
    GetUserAuthorityResponse GetUserAuthority(1: GetUserAuthorityRequest request)(api.post='/api/plugin_api/get_user_authority', api.category="plugin", api.gen_path="plugin")
    DebugAPIResponse DebugAPI(1: DebugAPIRequest request)(api.post='/api/plugin_api/debug_api', api.category="plugin", api.gen_path='plugin')
    GetPluginNextVersionResponse GetPluginNextVersion(1: GetPluginNextVersionRequest request)(api.post='/api/plugin_api/get_plugin_next_version', api.category="plugin", api.gen_path='plugin')
}

struct GetPlaygroundPluginListRequest {
    1:   optional i32       page           (api.body = "page")                           // 页码
    2:   optional i32       size           (api.body = "size")                           // 每页大小
    4:   optional string    name           (api.body = "name")                           // 按照api名称搜索
    5:   optional i64       space_id       (api.body = "space_id" api.js_conv = "str")   // team id
    6:            list<string> plugin_ids     (api.body = "plugin_ids") // 插件id列表
    7:            list<i32> plugin_types   (api.body = "plugin_types")                   // 插件类型筛选
    8:   optional i32       channel_id     (api.body = "channel_id")                     // 插件渠道 默认获取全部渠道
    9:   optional bool      self_created   (api.body = "self_created")                   // 是否是自己创建的插件
    10:  optional i32       order_by       (api.body = "order_by")                       // 排序
    11:  optional bool      is_get_offline (api.body = "is_get_offline")                 // 是否获取在渠道下架的插件 临时字段，给wk引用页使用
    99:           string    referer        (api.header = "Referer")                      // referer
    255: optional base.Base Base
}

struct GetPlaygroundPluginListResponse {
    1:   required i32                                code
    2:   required string                             msg
    3:            plugin_develop_common.GetPlaygroundPluginListData data
    255: optional base.BaseResp                      BaseResp
}

struct GetPluginAPIsRequest {
    1  : required i64                             plugin_id (api.js_conv = "str"),
    2  :          list<string>                       api_ids ,
    3  :          i32                                page     ,
    4  :          i32                                size     ,
    5  :          plugin_develop_common.APIListOrder order    ,
    6  : optional string                             preview_version_ts,
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
    1  : required i64    plugin_id (api.js_conv = "str"),
    255: optional base.Base Base     ,
}

struct GetUpdatedAPIsResponse {
    1  :          i64           code             ,
    2  :          string        msg              ,
    3  :          list<string>  created_api_names,
    4  :          list<string>  deleted_api_names,
    5  :          list<string>  updated_api_names,
    255: optional base.BaseResp BaseResp         ,
}

struct GetPluginInfoRequest {
    1  : required i64    plugin_id (api.js_conv = "str"), // 目前只支持插件openapi插件的信息
    2  : optional i64    preview_version_ts (api.js_conv = "str"),
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
    8  :          plugin_develop_common.PluginStatisticData statistic_data       ,
    9  :          plugin_develop_common.ProductStatus       plugin_product_status,
    10 :          bool                                      privacy_status       , // 隐私声明状态
    11 :          string                                    privacy_info         , // 隐私声明内容
    12 :          plugin_develop_common.CreationMethod      creation_method      ,
    13 :          string                                    ide_code_runtime     ,
    14 :          i32                                       edit_version         , // 编辑态版本
    15 :          plugin_develop_common.PluginType          plugin_type          , // plugin的商品状态

    255: optional base.BaseResp                             BaseResp             ,
}

struct UpdatePluginRequest {
    1  :          i64    plugin_id  (api.js_conv = "str")  ,
    3  :          string    ai_plugin    ,
    4  :          string    openapi      ,
    5  : optional string    client_id,
    6  : optional string    client_secret,
    7  : optional string    service_token,
    8  : optional string    source_code  ,
    9  : optional i32       edit_version , // 编辑态版本
    255: optional base.Base Base         , // 函数代码
}

struct UpdatePluginResponse {
    1  :          i64                                    code    ,
    2  :          string                                 msg     ,
    3  : required plugin_develop_common.UpdatePluginData data    ,
    255: optional base.BaseResp                          BaseResp,
}

struct RegisterPluginMetaRequest {
    1  : required string                                                                                     name            ,
    2  : required string                                                                                     desc            ,
    3  : optional string                                                                                     url             ,
    4  : required plugin_develop_common.PluginIcon                                                           icon            ,
    5  : optional plugin_develop_common.AuthorizationType                                                    auth_type       ,
    6  : optional plugin_develop_common.AuthorizationServiceLocation                                         location        ,
    7  : optional string                                                                                     key             , // service
    8  : optional string                                                                                     service_token   , // service   Authorization: xxxxxx
    9  : optional string                                                                                     oauth_info      , // service
    10 : required i64                                                                                     space_id  (api.js_conv = "str")      , // json序列化
    11 : optional map<plugin_develop_common.ParameterLocation,list<plugin_develop_common.commonParamSchema>> common_params   ,
    12 : optional plugin_develop_common.CreationMethod                                                       creation_method , // 默认0 默认原来表单创建方式，1 cloud ide创建方式
    13 : optional string                                                                                     ide_code_runtime, // ide创建下的代码编程语言 "1" Node.js "2" Python3
    14 : optional plugin_develop_common.PluginType                                                           plugin_type     ,
    15 : optional i64                                                                                     project_id  (api.js_conv = "str")    ,
    16 : optional i32                                                                                        sub_auth_type   , // 二级授权类型
    17 : optional string                                                                                     auth_payload    ,
    18 : optional bool                                                                                       fixed_export_ip , // 设置固定出口ip
    255: optional base.Base                                                                                  Base            , // 公共参数列表
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
    4  : optional string                                                                                     url            ,
    5  : optional plugin_develop_common.PluginIcon                                                           icon           ,
    6  : optional plugin_develop_common.AuthorizationType                                                    auth_type      , // uri
    7  : optional plugin_develop_common.AuthorizationServiceLocation                                         location       ,
    8  : optional string                                                                                     key            , // service
    9  : optional string                                                                                     service_token  , // service   Authorization: xxxxxx
    10 : optional string                                                                                     oauth_info     , // service
    11 : optional map<plugin_develop_common.ParameterLocation,list<plugin_develop_common.commonParamSchema>> common_params  , // json序列化
    12 : optional plugin_develop_common.CreationMethod                                                       creation_method, // //默认0 默认原来表单创建方式，1 cloud ide创建方式
    13 : optional i32                                                                                        edit_version   , // 编辑态版本
    14 : optional plugin_develop_common.PluginType                                                           plugin_type    ,
    15 : optional i32                                                                                        sub_auth_type  , // 二级授权类型
    16 : optional string                                                                                     auth_payload   ,
    17 : optional bool                                                                                       fixed_export_ip, // 是否配置固定出口ip

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
    11 :          i64                                    api_id (api.js_conv = "str"),
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
    12 :          i64                                    api_id (api.js_conv = "str"),
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
    5  : optional string                                   path           ,
    6  : optional plugin_develop_common.APIMethod          method         ,
    7  : optional list<plugin_develop_common.APIParameter> request_params ,
    8  : optional list<plugin_develop_common.APIParameter> response_params,
    9  : optional bool                                     disabled       ,
    10 : optional plugin_develop_common.APIExtend          api_extend     ,
    11 : optional i32                                      edit_version   , // 编辑态版本
    12 : optional bool                                     save_example   , // 是否保存调试结果
    13 : optional plugin_develop_common.DebugExample       debug_example  , // 调试结果
    14 : optional string                                   function_name  ,

    255: optional base.Base                                Base           , // 启用/禁用
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
    1  : required i64                                   plugin_id  (api.js_conv = "str")    , // 第一次调用保存并继续的时候使用这个接口
    2  : required string                                   name           ,
    3  : required string                                   desc           ,
    4  : optional string                                   path           ,
    5  : optional plugin_develop_common.APIMethod          method         ,
    6  : optional plugin_develop_common.APIExtend          api_extend     ,
    7  : optional list<plugin_develop_common.APIParameter> request_params ,
    8  : optional list<plugin_develop_common.APIParameter> response_params,
    9  : optional bool                                     disabled       ,
    10 : optional i32                                      edit_version   , // 编辑态版本
    11 : optional string                                   function_name  ,

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
    3  : optional i32       edit_version,
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
    3  : required string                               parameters  ,
    4  : required plugin_develop_common.DebugOperation operation   , // json
    5  : optional i32                                  edit_version,

    255: optional base.Base                            Base        ,
}

struct DebugAPIResponse {
    1  :          i64                                      code           ,
    2  :          string                                   msg            ,
    3  :          list<plugin_develop_common.APIParameter> response_params,
    4  :          bool                                     success        , // parse时会返回这个字段
    5  :          string                                   resp           ,
    6  :          string                                   reason         ,
    7  :          string                                   raw_resp       ,
    8  :          string                                   raw_req        ,

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