namespace go plugin.common

enum OnlineStatus {
    OFFLINE = 0,
    ONLINE  = 1,
}

enum DebugExampleStatus {
    Default = 0,
    Enable  = 1,
    Disable = 2,
}

enum ParameterLocation{
    Path   = 1
    Query  = 2
    Body   = 3
    Header = 4
}

//plugin枚举值
enum PluginParamTypeFormat{
    FileUrl  = 0
    ImageUrl = 1
    DocUrl   = 2
    CodeUrl  = 3
    PptUrl   = 4
    TxtUrl   = 5
    ExcelUrl = 6
    AudioUrl = 7
    ZipUrl   = 8
    VideoUrl = 9
}

enum APIMethod{
    GET    = 1,
    POST   = 2,
    PUT    = 3,
    DELETE = 4,
    PATCH  = 5,
}

enum APIDebugStatus{
    DebugWaiting = 0,
    DebugPassed  = 1,
}

enum ParameterType{
    String  = 1,
    Integer = 2,
    Number  = 3,
    Object  = 4,
    Array   = 5,
    Bool    = 6,
}

// 默认入参的设置来源
enum DefaultParamSource {
    Input    = 0, // 默认用户输入
    Variable = 1, // 引用变量
}

// 针对File类型参数的细分类型
enum AssistParameterType {
    DEFAULT = 1,
    IMAGE   = 2,
    DOC     = 3,
    CODE    = 4,
    PPT     = 5,
    TXT     = 6,
    EXCEL   = 7,
    AUDIO   = 8,
    ZIP     = 9,
    VIDEO   = 10,
    VOICE   = 12,  // 语音
}

enum PluginToolAuthType {
    Required  = 0, // 强授权
    Supported = 1, // 半匿名授权
    Disable   = 2, // 不授权
}

enum PluginCardStatus {
    Latest        = 1,
    NeedUpdate    = 2, // 主卡片版本有升级
    ParamMisMatch = 3, // 插件工具出参不匹配
}

enum PluginType {
    PLUGIN    = 1,
    APP       = 2,
    FUNC      = 3,
    WORKFLOW  = 4,
    IMAGEFLOW = 5,
    LOCAL     = 6,
}

enum PluginStatus {
    SUBMITTED = 1,
    REVIEWING = 2,
    PREPARED  = 3,
    PUBLISHED = 4,
    OFFLINE   = 5,
    Draft     = 0, // 默认值
    BANNED    = 6, // 禁用
}

enum ProductStatus {
    NeverListed = 0,
    Listed      = 1,
    Unlisted    = 2,
    Banned      = 3,
}

enum ProductUnlistType {
    ByAdmin = 1,
    ByUser  = 2,
}

enum CreationMethod {
    COZE = 0,
    IDE  = 1,
}

enum APIListOrderBy {
    CreateTime = 1,
}

enum SpaceRoleType {
    Default = 0, // 默认
    Owner   = 1, // owner
    Admin   = 2, // 管理员
    Member  = 3, // 普通成员
}

enum RunMode {
    DefaultToSync = 0,
    Sync          = 1,
    Async         = 2,
    Streaming     = 3,
}

enum AuthorizationType {
    None    = 0,
    Service = 1,
    OAuth   = 3,
}

enum AuthorizationServiceLocation {
    Header = 1,
    Query  = 2,
}

enum PluginReferrerScene {
    SingleAgent     = 0,
    WorkflowLlmNode = 1,
}

enum WorkflowResponseMode {
    UseLLM  = 0, // 模型总结
    SkipLLM = 1, // 不使用模型总结
}

struct ResponseStyle {
    1: WorkflowResponseMode workflow_response_mode,
}

struct CodeInfo {
    1: string plugin_desc  , // json
    2: string openapi_desc , // yaml
    3: string client_id    ,
    4: string client_secret,
    5: string service_token,
}

struct APIListOrder {
    1: APIListOrderBy order_by,
    2: bool           desc    ,
}

struct UserLabel {
    1: string label_id  ,
    2: string label_name,
    3: string icon_uri  ,
    4: string icon_url  ,
    5: string jump_link ,
}

struct PluginMetaInfo{
    1 :          string                                         name         ,
    2 :          string                                         desc         ,
    3 :          string                                         url          ,
    4 :          PluginIcon                                     icon         ,
    5 :          list<AuthorizationType>                        auth_type    ,
    6 : optional AuthorizationServiceLocation                   location     , // service
    7 : optional string                                         key          , // service
    8 : optional string                                         service_token, // service
    9 : optional string                                         oauth_info   , // json序列化
    10: optional map<ParameterLocation,list<commonParamSchema>> common_params,
    11: optional i32                                            sub_auth_type,
    12: optional string                                         auth_payload ,
    13:          bool                                           fixed_export_ip, // 是否固定出口ip
}

struct PluginIcon {
    1: string uri,
    2: string url,
}

struct GetPlaygroundPluginListData {
    1: list<PluginInfoForPlayground> plugin_list (api.body = "plugin_list")
    2: i32                           total       (api.body = "total")      
}

struct PluginInfoForPlayground {
    1:           string                                          id                                                                                                                     
    2:           string                                          name                                                                                                                    // name_for_human
    3:           string                                          desc_for_human                                                                                                          // description_for_human
    4:           string                                          plugin_icon                                                                                                            
    5:           PluginType                                      plugin_type
    6:           PluginStatus                                    status
    9:           i32                                             auth
    10:          string                                          client_id
    11:          string                                          client_secret
    15:          list<PluginApi>                                 plugin_apis                                                                                                            
    16:          i64                                             tag                                                                                                                     // 插件标签
    17:          string                                          create_time                                                                                                            
    18:          string                                          update_time                                                                                                            
    22:          Creator                                         creator                                                                                                                 // 创建人信息
    23:          string                                          space_id                                                                                                                // 空间id
    24:          PluginStatisticData                             statistic_data                                                                                                          // 插件统计数据
    25: optional map<ParameterLocation, list<commonParamSchema>> common_params
    26:          ProductStatus                                   plugin_product_status                                                                                                   // plugin的商品状态
    27:          ProductUnlistType                               plugin_product_unlist_type                                                                                              // plugin商品下架类型
    28:          string                                          material_id                                                                                                             // 素材id
    29:          i32                                             channel_id                                                                                                              // 渠道id
    30:          CreationMethod                                  creation_method                                                                                                         // 插件创建方式
    31:          bool                                            is_official                                                                                                             // 是否为官方插件
    32:          string                                          project_id                                                                                                              // 项目id
    33:          i64                                             version_ts                 (api.body = "version_ts" api.js_conv = "str") // 版本号，毫秒时间戳
    34:          string                                          version_name                                                                                                            // 版本名称
}

struct PluginApi {
    1 :          string                name              // operationId
    2 :          string                desc              // summary
    3 :          list<PluginParameter> parameters       
    4 :          string                plugin_id        
    5 :          string                plugin_name      
    7 :          string                api_id            // 序号和playground保持一致
    8 :          string                record_id        
    9 : optional PresetCardBindingInfo card_binding_info // 卡片绑定信息，未绑定则为nil
    10: optional DebugExample          debug_example     // 调试api示例
    11: optional string                function_name    
    12:          RunMode               run_mode          // 运行模式
}

struct Creator {
    1: string        id              ,
    2: string        name            ,
    3: string        avatar_url      ,
    4: bool          self            , // 是否是自己创建的
    5: SpaceRoleType space_roly_type ,
    6: string        user_unique_name, // 用户名
    7: UserLabel     user_label      , // 用户标签
}

struct commonParamSchema{
    1: string name 
    2: string value
}

struct PluginParameter {
    1 :          string                name          
    2 :          string                desc          
    3 :          bool                  required      
    4 :          string                type          
    5 :          list<PluginParameter> sub_parameters
    6 :          string                sub_type       // 如果Type是数组，则有subtype
    7 : optional string                from_node_id   // 如果入参的值是引用的则有fromNodeId
    8 : optional list<string>          from_output    // 具体引用哪个节点的key
    9 : optional string                value          // 如果入参是用户手输 就放这里
    10: optional PluginParamTypeFormat format         // 格式化参数
}

struct PluginAPIInfo{
    1 :          string                plugin_id           ,
    2 :          string                api_id              ,
    3 :          string                name                ,
    4 :          string                desc                ,
    5 :          string                path                ,
    6 :          APIMethod             method              ,
    7 :          list<APIParameter>    request_params      ,
    8 :          list<APIParameter>    response_params     ,
    9 :          string                create_time         ,
    10:          APIDebugStatus        debug_status        ,
    11:          bool                  disabled            ,
    12:          PluginStatisticData   statistic_data      ,
    13:          OnlineStatus          online_status       , // ide创建插件展示tool的在线状态
    14:          APIExtend             api_extend          ,
    15: optional PresetCardBindingInfo card_binding_info   , // 卡片绑定信息，未绑定则为nil
    16: optional DebugExample          debug_example       , // 调试示例
    17:          DebugExampleStatus    debug_example_status, // 调试示例状态
    18:          string                function_name       ,
}

struct APIParameter {
    1 :          string             id                    , // for前端，无实际意义
    2 :          string             name                  ,
    3 :          string             desc                  ,
    4 :          ParameterType      type                  ,
    5 : optional ParameterType      sub_type              ,
    6 :          ParameterLocation  location              ,
    7 :          bool               is_required           ,
    8 :          list<APIParameter> sub_parameters        ,
    9 : optional string             global_default        ,
    10:          bool               global_disable        ,
    11: optional string             local_default         ,
    12:          bool               local_disable         ,
    13: optional DefaultParamSource default_param_source  , // 默认入参的设置来源
    14: optional string             variable_ref          , // 引用variable的key
    15: optional AssistParameterType assist_type          ,
}

struct PluginStatisticData {
    1: optional i32 bot_quote, // 为空就不展示
}

struct APIExtend {
    1: PluginToolAuthType auth_mode, // tool维度授权类型
}

// 插件预置卡片绑定信息
struct PresetCardBindingInfo{
    1: string           card_id         ,
    2: string           card_version_num,
    3: PluginCardStatus status          ,
    4: string           thumbnail       , // 缩略图
}

struct DebugExample {
    1: string req_example ,
    2: string resp_example,
}

struct UpdatePluginData {
    1: bool res         ,
    2: i32  edit_version,
}

struct GetUserAuthorityData {
    1: bool can_edit
    2: bool can_read
    3: bool can_delete
    4: bool can_debug
    5: bool can_publish
    6: bool can_read_changelog
}

// 授权状态
enum OAuthStatus {
    Authorized   = 1,
    Unauthorized = 2,
}

struct CheckAndLockPluginEditData {
    1: bool    Occupied, // 是否已被占用
    2: Creator user    , // 如果已经被占用了，返回用户ID
    3: bool    Seized  , // 是否强占成功
}
