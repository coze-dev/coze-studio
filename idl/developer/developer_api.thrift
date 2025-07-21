include "../base.thrift"
include "../bot_common/bot_common.thrift"
include "../playground/shortcut_command.thrift"

namespace go ocean.cloud.developer_api


struct DraftBotCreateRequest {
    1: required i64           space_id (agw.js_conv="str", api.js_conv="true")
    2:          string         name
    3:          string         description
    4:          string         icon_uri
    5:          VisibilityType visibility
    6: optional MonetizationConf monetization_conf
    7: optional string         create_from, // 创建来源  navi:导航栏 space:空间
    9: optional bot_common.BusinessType business_type
}

struct MonetizationConf {
    1: optional bool is_enable
}

enum VisibilityType {
    Invisible = 0 // 不可见
    Visible   = 1 // 可见
}

struct DraftBotCreateData {
    1:          i64    bot_id (agw.js_conv="str", api.js_conv="true")
    2:          bool   check_not_pass // true：机审校验不通过
    3: optional string check_not_pass_msg // 机审校验不通过文案
}

struct DraftBotCreateResponse {
    1:          i64                code
    2:          string             msg
    3: required DraftBotCreateData data
}

struct DeleteDraftBotRequest {
    1: required i64 space_id (agw.js_conv="str", api.js_conv="true")
    2: required i64 bot_id (agw.js_conv="str", api.js_conv="true")
}

struct DeleteDraftBotData {
}

struct DeleteDraftBotResponse {
    1:          i64                code
    2:          string             msg
    3: required DeleteDraftBotData data
}

struct DuplicateDraftBotRequest {
    1: required i64 space_id (agw.js_conv="str", api.js_conv="true")
    2: required i64 bot_id (agw.js_conv="str", api.js_conv="true")
}

struct UserLabel {
    1: i64                label_id (agw.js_conv="str", api.js_conv="true")
    2: string             label_name
    3: string             icon_uri
    4: string             icon_url
    5: string             jump_link
}

struct Creator {
    1: i64 id (agw.js_conv="str", api.js_conv="true")
    2: string name // 昵称
    3: string avatar_url
    4: bool   self       // 是否是自己创建的
    5: string    user_unique_name // 用户名
    6: UserLabel user_label       // 用户标签
}

struct DuplicateDraftBotData {
    1: i64    bot_id (agw.js_conv="str", api.js_conv="true")
    2: string name
    3: Creator user_info
}

struct DuplicateDraftBotResponse {
    1:          i64                   code
    2:          string                msg
    3: required DuplicateDraftBotData data
}

struct UpdateDraftBotDisplayInfoResponse {
    1: i64    code
    2: string msg
}

struct DraftBotDisplayInfoData {
    1: optional TabDisplayItems tab_display_info
}

struct UpdateDraftBotDisplayInfoRequest {
    1: required i64                   bot_id (agw.js_conv="str", api.js_conv="true")
    2: optional DraftBotDisplayInfoData display_info
    3: optional string                     space_id
}

// draft bot display info
enum TabStatus {
    Default = 0
    Open    = 1
    Close   = 2
    Hide    = 3
}

struct TabDisplayItems {
    1:  optional TabStatus plugin_tab_status
    2:  optional TabStatus workflow_tab_status
    3:  optional TabStatus knowledge_tab_status
    4:  optional TabStatus database_tab_status
    5:  optional TabStatus variable_tab_status
    6:  optional TabStatus opening_dialog_tab_status
    7:  optional TabStatus scheduled_task_tab_status
    8:  optional TabStatus suggestion_tab_status
    9:  optional TabStatus tts_tab_status
    10: optional TabStatus filebox_tab_status
    11: optional TabStatus long_term_memory_tab_status
    12: optional TabStatus answer_action_tab_status
    13: optional TabStatus imageflow_tab_status
    14: optional TabStatus background_image_tab_status
    15: optional TabStatus shortcut_tab_status
    16: optional TabStatus knowledge_table_tab_status
    17: optional TabStatus knowledge_text_tab_status
    18: optional TabStatus knowledge_photo_tab_status
    19: optional TabStatus hook_info_tab_status
    20: optional TabStatus default_user_input_tab_status
}

struct GetDraftBotDisplayInfoResponse {
    1: i64                     code
    2: string                  msg
    3: DraftBotDisplayInfoData data
}

struct GetDraftBotDisplayInfoRequest {
    1: required i64  bot_id (agw.js_conv="str", api.js_conv="true")
}

struct PublishDraftBotResponse {
    1:          i64                 code
    2:          string              msg
    3: required PublishDraftBotData data
}

struct PublishDraftBotData {
    1:          map<string,list<ConnectorBindResult>> connector_bind_result    // key代表connector_name 枚举 飞书="feishu" -- 废弃
    2:          map<string,ConnectorBindResult>       publish_result           // key代表connector_id，value是发布结果
    3:          bool                                  check_not_pass           // true：机审校验不通过
    4: optional SubmitBotMarketResult                 submit_bot_market_result // 上架bot market结果
    5: optional bool                                  hit_manual_check         // 是否命中人审
    6: optional list<string>                          not_pass_reason          // 机审校验不通过原因的starlingKey列表
    7: optional bool                                  publish_monetization_result // 发布bot计费结果
}


struct ConnectorBindResult {
    1:          Connector           connector
    2:          i64                 code                  // 发布调用下游返回的状态码，前端不消费
    3:          string              msg                   // 发布状态的附加文案，前端按照markdown格式解析
    4: optional PublishResultStatus publish_result_status // 发布结果状态
}

struct Connector {
    1:          string             name       // connector_name 枚举 飞书="feishu"
    2:          string             app_id
    3:          string             app_secret
    4:          string             share_link
    5: optional map<string,string> bind_info
}

enum PublishResultStatus {
    Success  = 1 // 成功
    Failed   = 2 // 失败
    InReview = 3 // 审批中
}

struct SubmitBotMarketResult {
    1: optional i64    result_code // 上架状态，0-成功
    2: optional string msg         // 上架结果的文案
}


enum AgentType {
    Start_Agent  = 0
    LLM_Agent    = 1
    Task_Agent   = 2
    Global_Agent = 3
    Bot_Agent    = 4
}

struct AgentInfo {
    1:  optional string              id
    2:  optional AgentType           agent_type
    3:  optional string              name
    4:  optional AgentPosition       position
    5:  optional string              icon_uri
    6:  optional list<Intent>        intents
    7:  optional AgentWorkInfo       work_info
    8:  optional string              reference_id
    9:  optional string              first_version
    10: optional string              current_version
    11: optional ReferenceInfoStatus reference_info_status // 1:有可用更新 2:被删除
    12: optional string              description
    13: optional ReferenceUpdateType update_type
}


enum ReferenceInfoStatus {
    HasUpdates = 1 // 1:有可用更新
    IsDelete   = 2 // 2:被删除
}

enum ReferenceUpdateType {
    ManualUpdate = 1
    AutoUpdate = 2
}


struct AgentPosition {
    1: double x
    2: double y
}

struct Intent {
    1: optional string intent_id
    2: optional string prompt
    3: optional string next_agent_id
}

// agent 工作区间各个模块的信息
struct AgentWorkInfo {
    1: optional string prompt          // agent prompt 前端信息，server不需要感知
    2: optional string other_info      // 模型配置
    3: optional string tools           // plugin 信息
    4: optional string dataset         // dataset 信息
    5: optional string workflow        // workflow 信息
    6: optional string system_info_all // 同bot的 system_info_all
    7: optional JumpConfig jump_config // 回溯配置
    8: optional string suggest_reply  , // 推荐回复配置
    9: optional string hook_info       // hook配置
}


struct JumpConfig {
    1: BacktrackMode   backtrack
    2: RecognitionMode recognition
    3: optional IndependentModeConfig independent_conf
}

enum BacktrackMode {
    Current      = 1
    Previous     = 2
    Start        = 3
    MostSuitable = 4
}

enum RecognitionMode {
    FunctionCall = 1
    Independent  = 2
}

enum IndependentTiming {
    Pre        = 1 // 判断用户输入（前置）
    Post       = 2 // 判断节点输出（后置）
    PreAndPost = 3 // 前置模式和后置模式支持同时选择
}
enum IndependentRecognitionModelType {
    SLM = 0 // 小模型
    LLM = 1 // 大模型
}
struct IndependentModeConfig {
    1: IndependentTiming judge_timing // 判断时机
    2: i32 history_round
    3: IndependentRecognitionModelType model_type
    4: optional string model_id
    5: optional string prompt
}

struct BotTagInfo {
    1: i64    bot_id
    2: string key     // time_capsule
    3: string value   // TimeCapsuleInfo json
    4: i64    version

}


struct PublishDraftBotRequest {
    1:  required i64                   space_id           (agw.js_conv="str", api.js_conv="true")
    2:  required i64                   bot_id             (agw.js_conv="str", api.js_conv="true")
    3:  WorkInfo                       work_info
    4:  map<string,list<Connector>>    connector_list                // key代表connector_name 枚举 飞书="feishu" -- 废弃
    5:  map<string,map<string,string>> connectors                    // key代表connector_id，value是发布的参数
    6:  optional                       BotMode          botMode       // 默认0
    7:  optional                       list<AgentInfo>  agents
    8:  optional                       string           canvas_data
    9:  optional                       list<BotTagInfo> bot_tag_info
    10: optional SubmitBotMarketConfig submit_bot_market_config       // 发布到market的配置
    11: optional string                publish_id
    12: optional                       string                        commit_version   // 指定发布某个CommitVersion
    13: optional                       PublishType                   publish_type     // 发布类型，线上发布/预发布
    14: optional                       string                        pre_publish_ext   // 预发布其他信息
    15: optional                       string                        history_info // 替换原workinfo中的 history_info
}

enum PublishType {
    OnlinePublish = 0
    PrePublish    = 1
}

struct SubmitBotMarketConfig {
    1: optional bool   need_submit // 是否发布到market
    2: optional bool   open_source // 是否开源
    3: optional string category_id // 分类
}

enum BotMode {
    SingleMode = 0
    MultiMode  = 1
    WorkflowMode = 2
}

// 工作区间各个模块的信息
struct WorkInfo {
    1:  optional string message_info
    2:  optional string prompt
    3:  optional string variable
    4:  optional string other_info
    5:  optional string history_info
    6:  optional string tools
    7:  optional string system_info_all
    8:  optional string dataset
    9:  optional string onboarding
    10: optional string profile_memory
    11: optional string table_info
    12: optional string workflow
    13: optional string task
    14: optional string suggest_reply
    15: optional string tts
    16: optional string background_image_info_list
    17: optional shortcut_command.ShortcutStruct shortcuts   // 快捷指令
    18: optional string hook_info       // hook配置
    19: optional UserQueryCollectConf user_query_collect_conf   // 用户query收集配置
    20: optional LayoutInfo layout_info   //workflow模式编排数据
}

struct UserQueryCollectConf {
    1: bool      IsCollected       (api.body="is_collected")   , // 是否开启收集开关
    2: string    PrivatePolicy     (api.body="private_policy") , // 隐私协议链接
}

struct LayoutInfo {
    1: string       WorkflowId               (api.body="workflow_id")                                        , // workflowId
    2: string       PluginId                 (api.body="plugin_id")                                          , // PluginId
}

enum HistoryType {
    SUBMIT        = 1 // 废弃
    FLAG          = 2 // 发布
    COMMIT        = 4 // 提交
    COMMITANDFLAG = 5 // 提交和发布
}


struct ListDraftBotHistoryRequest {
    1: required i64         space_id (agw.js_conv="str", api.js_conv="true")
    2: required i64         bot_id (agw.js_conv="str", api.js_conv="true")
    3: required i32         page_index
    4: required i32         page_size
    5: required HistoryType history_type
    6: optional string      connector_id
}

struct ListDraftBotHistoryResponse {
    1:          i64                     code
    2:          string                  msg
    3: required ListDraftBotHistoryData data
}

struct ListDraftBotHistoryData {
    1: list<HistoryInfo> history_infos
    2: i32               total
}

// 如果保存历史信息
struct HistoryInfo {
    1:          string              version        ,
    2:          HistoryType         history_type   ,
    3:          string              info           , // 对历史记录补充的其他信息
    4:          string              create_time    ,
    5:          list<ConnectorInfo> connector_infos,
    6:          Creator             creator        ,
    7: optional string              publish_id     ,
    8: optional string              commit_remark  , // 提交时填写的说明
}

struct ConnectorInfo {
    1:          string                 id
    2:          string                 name
    3:          string                 icon
    4:          ConnectorDynamicStatus connector_status
    5: optional string                 share_link
}


enum ConnectorDynamicStatus {
    Normal          = 0
    Offline         = 1
    TokenDisconnect = 2
}

enum IconType {
    Bot       = 1
    User      = 2
    Plugin    = 3
    Dataset   = 4
    Space     = 5
    Workflow  = 6
    Imageflow = 7
    Society   = 8
    Connector = 9
    ChatFlow = 10
    Voice = 11
    Enterprise = 12
}

struct GetIconRequest {
    1: IconType icon_type
}

struct Icon {
    1: string url
    2: string uri
}

struct GetIconResponseData {
    1: list<Icon> icon_list
}
struct GetIconResponse {
    1: i64                 code
    2: string              msg
    3: GetIconResponseData data
}
struct GetUploadAuthTokenResponse {
    1: i64                    code
    2: string                 msg
    3: GetUploadAuthTokenData data
}

struct GetUploadAuthTokenData {
    1: string              service_id
    2: string              upload_path_prefix
    3: UploadAuthTokenInfo auth
    4: string              upload_host
    5: string              schema
}
struct UploadAuthTokenInfo {
    1: string access_key_id
    2: string secret_access_key
    3: string session_token
    4: string expired_time
    5: string current_time
}

struct GetUploadAuthTokenRequest {
    1: string scene
    2: string data_type
}

struct UploadFileRequest {
    1: CommonFileInfo file_head // 文件相关描述
    2: string         data      // 文件数据
}

// 上传文件，文件头
struct CommonFileInfo {
    1: string      file_type // 文件类型，后缀
    2: FileBizType biz_type  // 业务类型
}

enum FileBizType {
    BIZ_UNKNOWN      = 0
    BIZ_BOT_ICON     = 1
    BIZ_BOT_DATASET  = 2
    BIZ_DATASET_ICON = 3
    BIZ_PLUGIN_ICON  = 4
    BIZ_BOT_SPACE    = 5
    BIZ_BOT_WORKFLOW = 6
    BIZ_SOCIETY_ICON = 7
    BIZ_CONNECTOR_ICON = 8
    BIZ_LIBRARY_VOICE_ICON = 9
    BIZ_ENTERPRISE_ICON = 10
}

struct UploadFileResponse {
    1: i64            code
    2: string         msg
    3: UploadFileData data // 数据
}

struct GetTypeListRequest {
    1: optional bool   model
    2: optional bool   voice
    3: optional bool   raw_model
    4: optional string space_id
    5: optional string cur_model_id // 当前bot使用的模型ID，用于处理cici/doubao同步过来的bot模型不能展示的问题
    6: optional list<string> cur_model_ids // 兼容MultiAgent，有多个cur_model_id
    7: optional ModelScene model_scene // 模型场景
}

enum ModelScene {
    Douyin = 1
}

enum ModelClass {
    GPT             = 1
    SEED            = 2
    Claude          = 3
    MiniMax         = 4  // name: MiniMax
    Plugin          = 5
    StableDiffusion = 6
    ByteArtist      = 7
    Maas            = 9
    QianFan         = 10 // 废弃：千帆(百度云)
    Gemini          = 11 // name：Google Gemini
    Moonshot        = 12 // name: Moonshot
    GLM             = 13 // name：智谱
    MaaSAutoSync    = 14 // name: 火山方舟
    QWen            = 15 // name：通义千问
    Cohere          = 16 // name: Cohere
    Baichuan        = 17 // name: 百川智能
    Ernie           = 18 // name：文心一言
    DeekSeek        = 19 // name: 幻方
    Llama           = 20 // name: Llama
    StepFun         = 23
    Other           = 999
}

struct ModelQuota {
    1:           i32    token_limit         // 最大总 token 数量
    2:           i32    token_resp          // 最终回复最大 token 数量
    3:           i32    token_system        // Prompt 系统最大 token 数量
    4:           i32    token_user_in       // Prompt 用户输入最大 token 数量
    5:           i32    token_tools_in      // Prompt 工具输入最大 token 数量
    6:           i32    token_tools_out     // Prompt 工具输出最大 token 数量
    7:           i32    token_data          // Prompt 数据最大 token 数量
    8:           i32    token_history       // Prompt 历史最大 token 数量
    9:           bool   token_cut_switch    // Prompt 历史最大 token 数量
    10:          double price_in            // 输入成本
    11:          double price_out           // 输出成本
    12: optional i32    system_prompt_limit // systemprompt输入限制，如果没有传，对输入不做限制
}

enum ModelTagClass {
    ModelType = 1
    ModelUserRight = 2
    ModelFeature = 3
    ModelFunction = 4

    Custom = 20 // 本期不做
    Others = 100
}

enum ModelParamType {
    Float = 1
    Int = 2
    Boolean = 3
    String = 4
}

struct ModelParamDefaultValue {
    1: required string default_val
    2: optional string creative
    3: optional string balance
    4: optional string precise
}

struct ModelParamClass {
    1: i32    class_id // 1="Generation diversity", 2="Input and output length", 3="Output format"
    2: string label
}

struct Option {
    1: string label // option展示的值
    2: string value // 填入的值
}

struct ModelParameter {
    1: required string name // 配置字段，如max_tokens
    2: string label // 配置字段展示名称
    3: string desc // 配置字段详情描述
    4: required ModelParamType type // 类型
    5: string min // 数值类型参数，允许设置的最小值
    6: string max // 数值类型参数，允许设置的最大值
    7: i32 precision // float类型参数的精度
    8: required ModelParamDefaultValue default_val // 参数默认值{"default": xx, "creative":xx}
    9: list<Option> options // 枚举值，如response_format支持text,markdown,json
    10: ModelParamClass param_class // 参数分类，"Generation diversity", "Input and output length", "Output format"
}

struct ModelDescGroup {
    1: string group_name
    2: list<string> desc
}

struct ModelTag {
    1: string tag_name
    2: ModelTagClass tag_class
    3: string tag_icon
    4: string tag_descriptions
}

struct ModelSeriesInfo {
    1: string series_name,
    2: string icon_url,
    3: string model_vendor,
    4: optional string model_tips,
}

enum ModelTagValue {
    Flagship = 1,
    HighSpeed = 2,
    ToolInvocation = 3,
    RolePlaying = 4,
    LongText = 5,
    ImageUnderstanding = 6,
    Reasoning = 7,
    VideoUnderstanding = 8,
    CostPerformance = 9,
    CodeSpecialization = 10,
    AudioUnderstanding = 11
}

struct ModelStatusDetails {
    1: bool is_new_model, // 是否为新模型
    2: bool is_advanced_model, // 是否是高级模型
    3: bool is_free_model, // 是否是免费模型

    11: bool is_upcoming_deprecated, // 是否即将下架
    12: string deprecated_date, // 下架日期
    13: string replace_model_name, // 下架替换的模型

    21: string update_info, // 最近更新信息
    22: ModelTagValue model_feature, // 模型特色
}

struct ModelAbility {
    1: optional bool cot_display // 是否展示cot
    2: optional bool function_call // 是否支持function call
    3: optional bool image_understanding // 是否支持图片理解
    4: optional bool video_understanding // 是否支持视频理解
    5: optional bool audio_understanding // 是否支持音频理解
    6: optional bool support_multi_modal // 是否支持多模态
    7: optional bool prefill_resp // 是否支持续写
}

struct Model {
    1: string     name
    2: i64        model_type
    3: ModelClass model_class
    4: string     model_icon         // model icon的url
    5: double     model_input_price
    6: double     model_output_price
    7: ModelQuota model_quota
    8: string     model_name         // model真实名，前端计算token用
    9: string     model_class_name
    10: bool      is_offline
    11: list<ModelParameter> model_params
    12: optional list<ModelDescGroup>    model_desc
    13: optional map<bot_common.ModelFuncConfigType, bot_common.ModelFuncConfigStatus> func_config, // 模型功能配置
    14: optional string endpoint_name  // 方舟模型节点名称
    15: optional list<ModelTag> model_tag_list  // 模型标签
    16: optional bool is_up_required   // user prompt是否必须有且不能为空
    17: string model_brief_desc // 模型简要描述
    18: ModelSeriesInfo model_series // 模型系列
    19: ModelStatusDetails model_status_details // 模型状态
    20: ModelAbility model_ability // 模型能力
}

struct VoiceType {
    1: i64    id
    2: string model_name
    3: string name
    4: string language
    5: string style_id
    6: string style_name
}

struct GetTypeListData {
    1: list<Model>     model_list
    2: list<VoiceType> voice_list
    3: list<Model>     raw_model_list
}

struct GetTypeListResponse {
    1:          i64             code
    2:          string          msg
    3: required GetTypeListData data
}

struct UploadFileData {
    1: string upload_url // 文件url
    2: string upload_uri // 文件uri，提交使用这个
}

struct UpdateUserProfileCheckRequest {
    1: optional string user_unique_name
}

struct UpdateUserProfileCheckResponse {
    1: i64    code
    2: string msg
}

enum CommitStatus {
    Undefined      = 0
    Uptodate       = 1 // 已是最新，同主草稿相同
    Behind         = 2 // 落后主草稿
    NoDraftReplica = 3 // 无个人草稿
}

struct Committer {
    1: optional string id
    2: optional string name
    3: optional string commit_time
}

// 检查草稿是否可以提交返回
struct CheckDraftBotCommitResponse {
    1: optional i64                     code
    2: optional string                  msg
    3: optional CheckDraftBotCommitData data
}

struct CheckDraftBotCommitData {
    1: optional CommitStatus status
    2: optional string       base_commit_version // 主草稿版本
    3: optional Committer    base_committer      // 主草稿提交信息
    4: optional string       commit_version      // 个人草稿版本
}

// 检查草稿是否可以提交请求
struct CheckDraftBotCommitRequest {
    1: required string space_id
    2: required string bot_id
    3: optional string commit_version
}


struct GetOnboardingRequest {
    1: string bot_id
    2: string bot_prompt
}


struct GetOnboardingResponseData {
    1: OnboardingContent onboarding_content
}
struct GetOnboardingResponse {
    1: i64                       code
    2: string                    msg
    3: GetOnboardingResponseData data
}

struct OnboardingContent {
    1: optional string       prologue            // 开场白
    2: optional list<string> suggested_questions // 建议问题
}



enum ConfigStatus {
    Configured        = 1 // 已配置
    NotConfigured     = 2 // 未配置
    Disconnected      = 3 // Token发生变化
    Configuring       = 4 // 配置中，授权中
    NeedReconfiguring = 5 // 需要重新配置 
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
    1: required i64 space_id (api.js_conv="true")
    2: required i64 bot_id (api.js_conv="true")
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
    21: optional UserAuthStatus                auth_status       // 1: 已授权，2:未授权. 目前仅 bind_type == 8 时这个字段才有 
    22: optional string                                      to_complete_info_url // 补全信息按钮的 url
}

struct SubmitBotMarketOption {
    1: optional bool can_open_source // 是否可以公开编排
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

service DeveloperApiService {

    GetUploadAuthTokenResponse GetUploadAuthToken(1: GetUploadAuthTokenRequest request)(api.post = '/api/playground/upload/auth_token', api.category="playground", api.gen_path="playground")

    DeleteDraftBotResponse DeleteDraftBot(1:DeleteDraftBotRequest request)(api.post='/api/draftbot/delete', api.category="draftbot", api.gen_path="draftbot")
    DuplicateDraftBotResponse DuplicateDraftBot(1:DuplicateDraftBotRequest request)(api.post='/api/draftbot/duplicate', api.category="draftbot", api.gen_path="draftbot")
    CheckDraftBotCommitResponse CheckDraftBotCommit(1:CheckDraftBotCommitRequest request)(api.post='/api/draftbot/commit_check', api.category="draftbot", api.gen_path="draftbot")
    GetOnboardingResponse GetOnboarding(1:GetOnboardingRequest request)(api.post='/api/playground/get_onboarding', api.category="playground", api.gen_path="playground")
    PublishConnectorListResponse PublishConnectorList(1:PublishConnectorListRequest request)(api.post='/api/draftbot/publish/connector/list', api.category="draftbot", api.gen_path="draftbot")

    DraftBotCreateResponse DraftBotCreate(1:DraftBotCreateRequest request)(api.post='/api/draftbot/create', api.category="draftbot", api.gen_path="draftbot")
    UpdateDraftBotDisplayInfoResponse UpdateDraftBotDisplayInfo(1:UpdateDraftBotDisplayInfoRequest request)(api.post='/api/draftbot/update_display_info', api.category="draftbot", api.gen_path="draftbot")
    GetDraftBotDisplayInfoResponse GetDraftBotDisplayInfo(1:GetDraftBotDisplayInfoRequest request)(api.post='/api/draftbot/get_display_info', api.category="draftbot", api.gen_path="draftbot")
    PublishDraftBotResponse PublishDraftBot(1:PublishDraftBotRequest request)(api.post='/api/draftbot/publish', api.category="draftbot", api.gen_path="draftbot")
    ListDraftBotHistoryResponse ListDraftBotHistory(1:ListDraftBotHistoryRequest request)(api.post='/api/draftbot/list_draft_history', api.category="draftbot", api.gen_path="draftbot")

    UploadFileResponse UploadFile(1:UploadFileRequest request)(api.post='/api/bot/upload_file', api.category="bot" api.gen_path="bot")
    GetTypeListResponse GetTypeList(1: GetTypeListRequest request)(api.post='/api/bot/get_type_list', api.category="bot", api.gen_path="bot")

    GetIconResponse GetIcon(1:GetIconRequest request)(api.post='/api/developer/get_icon', api.category="developer", api.gen_path="developer")

    UpdateUserProfileCheckResponse UpdateUserProfileCheck(1: UpdateUserProfileCheckRequest request)(api.post='/api/user/update_profile_check', api.category="user", api.gen_path="user")

}
