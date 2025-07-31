
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

//plugin enumeration value
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

// Default imported parameter settings source
enum DefaultParamSource {
    Input    = 0, // default user input
    Variable = 1, // reference variable
}

// Subdivision types for File type parameters
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
    VOICE   = 12,  // voice
}

enum PluginToolAuthType {
    Required  = 0, // strong authorization
    Supported = 1, // semi-anonymous authorization
    Disable   = 2, // not authorized
}

enum PluginCardStatus {
    Latest        = 1,
    NeedUpdate    = 2, // The main card version has been upgraded.
    ParamMisMatch = 3, // Plugin tool exported parameters do not match
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
    Draft     = 0, // default value
    BANNED    = 6, // disable
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
    Default = 0, // default
    Owner   = 1, // owner
    Admin   = 2, // administrator
    Member  = 3, // ordinary member
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
    Standard = 4, // deprecated, the same as OAuth
}

enum ServiceAuthSubType {
    ApiKey             = 0,

    // for opencoze
    OAuthAuthorizationCode  = 4,
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
    UseLLM  = 0, // model summary
    SkipLLM = 1, // Do not use model summaries
}

struct ResponseStyle {
    1: WorkflowResponseMode workflow_response_mode,
}

struct CodeInfo {
    1: string plugin_desc  , // plugin manifest in json string
    2: string openapi_desc , // plugin openapi3 document in yaml string
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
    1 :          string                                         name         , // plugin name
    2 :          string                                         desc         , // Plugin description
    3 :          string                                         url          , // Plugin service address prefix
    4 :          PluginIcon                                     icon         , // plugin icon
    5 :          list<AuthorizationType>                        auth_type    , // Plugin authorization type, 0: no authorization, 1: service, 3: oauth
    6 : optional AuthorizationServiceLocation                   location     , // When the sub-authorization type is api/token, the token parameter position
    7 : optional string                                         key          , // When the sub-authorization type is api/token, the token parameter key
    8 : optional string                                         service_token, // When the sub-authorization type is api/token, the token parameter value
    9 : optional string                                         oauth_info   , // When the sub-authorization type is oauth, the oauth information
    10: optional map<ParameterLocation,list<commonParamSchema>> common_params, // Plugin public parameters, key is the parameter position, value is the parameter list
    11: optional i32                                            sub_auth_type, // Sub-authorization type, 0: api/token of service, 10: client credentials of oauth
    12: optional string                                         auth_payload , // negligible
    13:          bool                                           fixed_export_ip, // negligible
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
    16:          i64                                             tag                                                                                                                     // plugin tag
    17:          string                                          create_time                                                                                                            
    18:          string                                          update_time                                                                                                            
    22:          Creator                                         creator                                                                                                                 // creator information
    23:          string                                          space_id                                                                                                                // Space ID
    24:          PluginStatisticData                             statistic_data                                                                                                          // plugin statistics
    25: optional map<ParameterLocation, list<commonParamSchema>> common_params
    26:          ProductStatus                                   plugin_product_status                                                                                                   // Product status of the plugin
    27:          ProductUnlistType                               plugin_product_unlist_type                                                                                              // Plugin product removal type
    28:          string                                          material_id                                                                                                             // Material ID
    29:          i32                                             channel_id                                                                                                              // Channel ID
    30:          CreationMethod                                  creation_method                                                                                                         // Plugin creation method
    31:          bool                                            is_official                                                                                                             // Is it an official plugin?
    32:          string                                          project_id                                                                                                              // Project ID
    33:          string                                          version_ts                // Version number, millisecond timestamp
    34:          string                                          version_name                                                                                                            // version name
}

struct PluginApi {
    1 :          string                name              // operationId
    2 :          string                desc              // summary
    3 :          list<PluginParameter> parameters       
    4 :          string                plugin_id        
    5 :          string                plugin_name      
    7 :          string                api_id            // The serial number is the same as the playground
    8 :          string                record_id        
    9 : optional PresetCardBindingInfo card_binding_info // Card binding information, nil if not bound.
    10: optional DebugExample          debug_example     // Debug API example
    11: optional string                function_name    
    12:          RunMode               run_mode          // operating mode
}

struct Creator {
    1: string        id              ,
    2: string        name            ,
    3: string        avatar_url      ,
    4: bool          self            , // Did you create it yourself?
    5: SpaceRoleType space_roly_type ,
    6: string        user_unique_name, // user name
    7: UserLabel     user_label      , // user tag
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
    6 :          string                sub_type       // If Type is an array, there is a subtype
    7 : optional string                from_node_id   // fromNodeId if the value of the imported parameter is a reference
    8 : optional list<string>          from_output    // Which node's key is specifically referenced?
    9 : optional string                value          // If the imported parameter is the user's hand input, put it here
    10: optional PluginParamTypeFormat format         // Format parameter
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
    11:          bool                  disabled            , // ignore
    12:          PluginStatisticData   statistic_data      , // ignore
    13:          OnlineStatus          online_status       , // if tool has been published, online_status is Online
    14:          APIExtend             api_extend          , // ignore
    15: optional PresetCardBindingInfo card_binding_info   , // ignore
    16: optional DebugExample          debug_example       , // Debugging example
    17:          DebugExampleStatus    debug_example_status, // Debug sample state
    18:          string                function_name       , // ignore
}

struct APIParameter {
    1 :          string             id                    , // For the front end, no practical significance
    2 :          string             name                  , // parameter name
    3 :          string             desc                  , // parameter desc
    4 :          ParameterType      type                  , // parameter type
    5 : optional ParameterType      sub_type              , // negligible
    6 :          ParameterLocation  location              , // parameter location
    7 :          bool               is_required           , // Is it required?
    8 :          list<APIParameter> sub_parameters        , // sub-parameter
    9 : optional string             global_default        , // global default
    10:          bool               global_disable        , // Is it enabled globally?
    11: optional string             local_default         , // Default value set in the smart body
    12:          bool               local_disable         , // Is it enabled in the smart body?
    13: optional DefaultParamSource default_param_source  , // negligible
    14: optional string             variable_ref          , // Reference variable key
    15: optional AssistParameterType assist_type          , // Multimodal auxiliary parameter types
}

struct PluginStatisticData {
    1: optional i32 bot_quote, // If it is empty, it will not be displayed.
}

struct APIExtend {
    1: PluginToolAuthType auth_mode, // Tool dimension authorization type
}

// Plugin preset card binding information
struct PresetCardBindingInfo{
    1: string           card_id         ,
    2: string           card_version_num,
    3: PluginCardStatus status          ,
    4: string           thumbnail       , // thumbnail
}

struct DebugExample {
    1: string req_example , // request example in json
    2: string resp_example, // response example in json
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

// authorization status
enum OAuthStatus {
    Authorized   = 1,
    Unauthorized = 2,
}

struct CheckAndLockPluginEditData {
    1: bool    Occupied, // Is it occupied?
    2: Creator user    , // If it is already occupied, return the user ID.
    3: bool    Seized  , // Was it successful?
}

struct PluginPublishInfo {
    1 : i64    publisher_id (api.js_conv = "str"), // publisher
    2 : i64    version_ts  , // Version, millisecond timestamp
    3 : string version_name, // version name
    4 : string version_desc, // version description
}

enum DebugOperation{
    Debug = 1, // Debugging, the debugging state will be saved, and the return value will be checked.
    Parse = 2, // Parse only the return value structure
}

struct RegisterPluginData {
    1: i64 plugin_id (api.js_conv = "str"),
    2: string openapi, // the same as the request 'openapi'
}

enum ScopeType {
    All  = 0, // all
    Self = 1, // self
}

enum OrderBy {
    CreateTime  = 0,
    UpdateTime  = 1,
    PublishTime = 2,
    Hot         = 3,
}

enum PluginTypeForFilter {
    CloudPlugin    = 1, // Includes PLUGIN and APP.
    LocalPlugin    = 2, // Include LOCAL
    WorkflowPlugin = 3, // Includes WORKFLOW and IMAGEFLOW
}

enum PluginDataFormat {
    OpenAPI = 1,
    Curl    = 2,
    Postman = 3,
    Swagger = 4,
}

struct DuplicateAPIInfo{
    1: string method,
    2: string path  ,
    3: i64    count ,
}