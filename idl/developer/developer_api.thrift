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
    1:  required i64                              space_id           (agw.js_conv="str", api.js_conv="true")
    2:  required i64                              bot_id             (agw.js_conv="str", api.js_conv="true")
    3:  required WorkInfo                         work_info
    4:           map<string, list<Connector>>     connector_list     // key代表connector_name 枚举 飞书="feishu" -- 废弃
    5:           map<string, map<string, string>> connectors         // key代表connector_id，value是发布的参数
    6:  optional BotMode                          botMode            // 默认0
    7:  optional list<AgentInfo>                  agents
    8:  optional string                           canvas_data
    9:  optional list<BotTagInfo>                 bot_tag_info
    10: optional SubmitBotMarketConfig            submit_bot_market_config // 发布到market的配置
    11: optional string                           publish_id
    12: optional string                           commit_version     // 指定发布某个CommitVersion
    13: optional PublishType                      publish_type       // 发布类型，线上发布/预发布
    14: optional string                           pre_publish_ext    // 预发布其他信息
    15: optional string                           history_info       // 替换原workinfo中的 history_info
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
struct UploadFileRequest {
    1: CommonFileInfo file_head // 文件相关描述
    2: string         data      // 文件数据
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

// 上传文件，文件头
struct CommonFileInfo {
    1: string      file_type // 文件类型，后缀
    2: FileBizType biz_type  // 业务类型
}

struct UploadFileResponse {
    1: i64            code
    2: string         msg
    3: UploadFileData data // 数据
}

struct UploadFileData {
    1: string upload_url // 文件url
    2: string upload_uri // 文件uri，提交使用这个
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

service DeveloperApiService {
    GetUploadAuthTokenResponse GetUploadAuthToken(1: GetUploadAuthTokenRequest request)(api.post = '/api/playground/upload/auth_token', api.category="playground", api.gen_path="playground")

    DeleteDraftBotResponse DeleteDraftBot(1:DeleteDraftBotRequest request)(api.post='/api/draftbot/delete', api.category="draftbot", api.gen_path="draftbot")
    DuplicateDraftBotResponse DuplicateDraftBot(1:DuplicateDraftBotRequest request)(api.post='/api/draftbot/duplicate', api.category="draftbot", api.gen_path="draftbot")

    DraftBotCreateResponse DraftBotCreate(1:DraftBotCreateRequest request)(api.post='/api/draftbot/create', api.category="draftbot", api.gen_path="draftbot")
    UpdateDraftBotDisplayInfoResponse UpdateDraftBotDisplayInfo(1:UpdateDraftBotDisplayInfoRequest request)(api.post='/api/draftbot/update_display_info', api.category="draftbot", api.gen_path="draftbot")
    GetDraftBotDisplayInfoResponse GetDraftBotDisplayInfo(1:GetDraftBotDisplayInfoRequest request)(api.post='/api/draftbot/get_display_info', api.category="draftbot", api.gen_path="draftbot")
    PublishDraftBotResponse PublishDraftBot(1:PublishDraftBotRequest request)(api.post='/api/draftbot/publish', api.category="draftbot", api.gen_path="draftbot")
    ListDraftBotHistoryResponse ListDraftBotHistory(1:ListDraftBotHistoryRequest request)(api.post='/api/draftbot/list_draft_history', api.category="draftbot", api.gen_path="draftbot")
    UploadFileResponse UploadFile(1:UploadFileRequest request)(api.post='/api/bot/upload_file', api.category="bot" api.gen_path="bot")
    GetIconResponse GetIcon(1:GetIconRequest request)(api.post='/api/developer/get_icon', api.category="developer", api.gen_path="developer")
}
