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
    7: optional string         create_from, // Create source navi: navbar space: space
    9: optional bot_common.BusinessType business_type
}

struct MonetizationConf {
    1: optional bool is_enable
}

enum VisibilityType {
    Invisible = 0 // invisible
    Visible   = 1 // visible
}

struct DraftBotCreateData {
    1:          i64    bot_id (agw.js_conv="str", api.js_conv="true")
    2:          bool   check_not_pass // True: The machine audit verification failed
    3: optional string check_not_pass_msg // The machine audit verification failed the copy.
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
    2: string name // nickname
    3: string avatar_url
    4: bool   self       // Did you create it yourself?
    5: string    user_unique_name // user name
    6: UserLabel user_label       // user tag
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
    1:          map<string,list<ConnectorBindResult>> connector_bind_result    // Key represents connector_name enumeration Feishu = "feishu" -- obsolete
    2:          map<string,ConnectorBindResult>       publish_result           // The key represents connector_id, and the value is the published result
    3:          bool                                  check_not_pass           // True: The machine audit verification failed
    4: optional SubmitBotMarketResult                 submit_bot_market_result // Added bot marketing results
    5: optional bool                                  hit_manual_check         // In human moderation
    6: optional list<string>                          not_pass_reason          // starlingKey list of reasons why the machine audit failed
    7: optional bool                                  publish_monetization_result // Publish bot billing results
}


struct ConnectorBindResult {
    1:          Connector           connector
    2:          i64                 code                  // The status code returned downstream of the publish call is not consumed by the front end.
    3:          string              msg                   // Additional copy of the release status, the front end is parsed in markdown format
    4: optional PublishResultStatus publish_result_status // post result status
}

struct Connector {
    1:          string             name       // connector_name enumeration Feishu = "feishu"
    2:          string             app_id
    3:          string             app_secret
    4:          string             share_link
    5: optional map<string,string> bind_info
}

enum PublishResultStatus {
    Success  = 1 // success
    Failed   = 2 // fail
    InReview = 3 // in approval
}

struct SubmitBotMarketResult {
    1: optional i64    result_code // Shelf status, 0-success
    2: optional string msg         // msg
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
    11: optional ReferenceInfoStatus reference_info_status // 1: Available update 2: Removed
    12: optional string              description
    13: optional ReferenceUpdateType update_type
}


enum ReferenceInfoStatus {
    HasUpdates = 1 // 1: Updates are available
    IsDelete   = 2 // 2: Deleted
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

// Information about each module in the agent workspace
struct AgentWorkInfo {
    1: optional string prompt          // The agent prompts the front-end information, the server does not need to perceive
    2: optional string other_info      // model configuration
    3: optional string tools           // Plugin information
    4: optional string dataset         // Dataset information
    5: optional string workflow        // Workflow information
    6: optional string system_info_all // system_info_all with bot
    7: optional JumpConfig jump_config // backtrack configuration
    8: optional string suggest_reply  , // Referral Configuration
    9: optional string hook_info       // Hook configuration
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
    Pre        = 1 // Determine user input (front)
    Post       = 2 // Determine node output (postfix)
    PreAndPost = 3 // Front mode and rear mode support simultaneous selection
}
enum IndependentRecognitionModelType {
    SLM = 0 // Small model
    LLM = 1 // Large model
}
struct IndependentModeConfig {
    1: IndependentTiming judge_timing // Judge timing
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
    4:  map<string,list<Connector>>    connector_list                // Key represents connector_name enumeration Feishu = "feishu" -- obsolete
    5:  map<string,map<string,string>> connectors                    // The key represents connector_id, and the value is the published parameter
    6:  optional                       BotMode          botMode       // Default 0
    7:  optional                       list<AgentInfo>  agents
    8:  optional                       string           canvas_data
    9:  optional                       list<BotTagInfo> bot_tag_info
    10: optional SubmitBotMarketConfig submit_bot_market_config       // Configuration published to the market
    11: optional string                publish_id
    12: optional                       string                        commit_version   // Specify the release of a CommitVersion
    13: optional                       PublishType                   publish_type     // Release type, online release/pre-release
    14: optional                       string                        pre_publish_ext   // Pre-release other information
    15: optional                       string                        history_info // Replace the history_info in the original workinfo
}

enum PublishType {
    OnlinePublish = 0
    PrePublish    = 1
}

struct SubmitBotMarketConfig {
    1: optional bool   need_submit // Whether to publish to the market
    2: optional bool   open_source // Is it open source?
    3: optional string category_id // classification
}

enum BotMode {
    SingleMode = 0
    MultiMode  = 1
    WorkflowMode = 2
}

// Information for each module in the workspace
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
    17: optional shortcut_command.ShortcutStruct shortcuts   // Quick Instruction
    18: optional string hook_info       // Hook configuration
    19: optional UserQueryCollectConf user_query_collect_conf   // User query collection configuration
    20: optional LayoutInfo layout_info   //Workflow pattern orchestration data
}

struct UserQueryCollectConf {
    1: bool      IsCollected       (api.body="is_collected")   , // Whether to turn on the collection switch
    2: string    PrivatePolicy     (api.body="private_policy") , // Privacy Policy Link
}

struct LayoutInfo {
    1: string       WorkflowId               (api.body="workflow_id")                                        , // workflowId
    2: string       PluginId                 (api.body="plugin_id")                                          , // PluginId
}

enum HistoryType {
    SUBMIT        = 1 // abandoned
    FLAG          = 2 // publish
    COMMIT        = 4 // submit
    COMMITANDFLAG = 5 // Submit and publish
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

// If historical information is preserved
struct HistoryInfo {
    1:          string              version        ,
    2:          HistoryType         history_type   ,
    3:          string              info           , // Additional information added to the historical record
    4:          string              create_time    ,
    5:          list<ConnectorInfo> connector_infos,
    6:          Creator             creator        ,
    7: optional string              publish_id     ,
    8: optional string              commit_remark  , // Instructions to fill in when submitting
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
    1: CommonFileInfo file_head // Document related description
    2: string         data      // file data
}

// Upload file, file header
struct CommonFileInfo {
    1: string      file_type // File type, suffix
    2: FileBizType biz_type  // business type
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
    3: UploadFileData data // data
}

struct GetTypeListRequest {
    1: optional bool   model
    2: optional bool   voice
    3: optional bool   raw_model
    4: optional string space_id
    5: optional string cur_model_id // The model ID used by the current bot to handle issues that cannot be displayed by the bot model synchronized by cici/doubao
    6: optional list<string> cur_model_ids // Compatible with MultiAgent, with multiple cur_model_id
    7: optional ModelScene model_scene // model scenario
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
    QianFan         = 10 // Abandoned: Qianfan (Baidu Cloud)
    Gemini          = 11 // name：Google Gemini
    Moonshot        = 12 // name: Moonshot
    GLM             = 13 // Name: Zhipu
    MaaSAutoSync    = 14 // Name: Volcano Ark
    QWen            = 15 // Name: Tongyi Qianwen
    Cohere          = 16 // name: Cohere
    Baichuan        = 17 // Name: Baichuan Intelligent
    Ernie           = 18 // Name: ERNIE Bot
    DeekSeek        = 19 // Name: Magic Square
    Llama           = 20 // name: Llama
    StepFun         = 23
    Other           = 999
}

struct ModelQuota {
    1:           i32    token_limit         // Maximum total number of tokens
    2:           i32    token_resp          // Final reply maximum number of tokens
    3:           i32    token_system        // Prompt system maximum number of tokens
    4:           i32    token_user_in       // Prompt user to enter maximum number of tokens
    5:           i32    token_tools_in      // Prompt tool to enter maximum number of tokens
    6:           i32    token_tools_out     // Prompt tool output maximum number of tokens
    7:           i32    token_data          // Prompt data maximum number of tokens
    8:           i32    token_history       // Prompt history maximum number of tokens
    9:           bool   token_cut_switch    // Prompt history maximum number of tokens
    10:          double price_in            // input cost
    11:          double price_out           // output cost
    12: optional i32    system_prompt_limit // Systemprompt input restrictions, if not passed, no input restrictions
}

enum ModelTagClass {
    ModelType = 1
    ModelUserRight = 2
    ModelFeature = 3
    ModelFunction = 4

    Custom = 20 // Do not do this issue
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
    1: string label // The value displayed by the option
    2: string value // Filled in value
}

struct ModelParameter {
    1: required string name // Configuration fields, such as max_tokens
    2: string label // Configure field display name
    3: string desc // Configuration field detail description
    4: required ModelParamType type // type
    5: string min // Numerical type parameters, the minimum value allowed to be set
    6: string max // Numerical type parameter, the maximum value allowed to be set
    7: i32 precision // Precision of float type parameters
    8: required ModelParamDefaultValue default_val // Parameter default {"default": xx, "creative": xx}
    9: list<Option> options // Enumeration values such as response_format support text, markdown, json
    10: ModelParamClass param_class // Parameter classification, "Generation diversity", "Input and output length", "Output format"
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
    1: bool is_new_model, // Is it a new model?
    2: bool is_advanced_model, // Is it a high-level model?
    3: bool is_free_model, // Is it a free model?

    11: bool is_upcoming_deprecated, // Will it be removed from the shelves soon?
    12: string deprecated_date, // removal date
    13: string replace_model_name, // Remove the replacement model from the shelves.

    21: string update_info, // Recently updated information
    22: ModelTagValue model_feature, // Model Features
}

struct ModelAbility {
    1: optional bool cot_display // Do you want to show cot?
    2: optional bool function_call // Supports function calls
    3: optional bool image_understanding // Does it support picture understanding?
    4: optional bool video_understanding // Does it support video understanding?
    5: optional bool audio_understanding // Does it support audio understanding?
    6: optional bool support_multi_modal // Does it support multimodality?
    7: optional bool prefill_resp // Whether to support continuation
}

struct Model {
    1: string     name
    2: i64        model_type
    3: ModelClass model_class
    4: string     model_icon         // Model icon url
    5: double     model_input_price
    6: double     model_output_price
    7: ModelQuota model_quota
    8: string     model_name         // Model real name, front-end calculation token
    9: string     model_class_name
    10: bool      is_offline
    11: list<ModelParameter> model_params
    12: optional list<ModelDescGroup>    model_desc
    13: optional map<bot_common.ModelFuncConfigType, bot_common.ModelFuncConfigStatus> func_config, // model function configuration
    14: optional string endpoint_name  // Ark model node name
    15: optional list<ModelTag> model_tag_list  // model label
    16: optional bool is_up_required   // User prompt must have and cannot be empty
    17: string model_brief_desc // Model brief description
    18: ModelSeriesInfo model_series // Model series
    19: ModelStatusDetails model_status_details // model state
    20: ModelAbility model_ability // model capability
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
    1: string upload_url // File URL
    2: string upload_uri // File URI, submit using this
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
    Uptodate       = 1 // It is the latest, the same as the main draft
    Behind         = 2 // Behind the main draft
    NoDraftReplica = 3 // No personal draft
}

struct Committer {
    1: optional string id
    2: optional string name
    3: optional string commit_time
}

// Check if the draft can be submitted and returned.
struct CheckDraftBotCommitResponse {
    1: optional i64                     code
    2: optional string                  msg
    3: optional CheckDraftBotCommitData data
}

struct CheckDraftBotCommitData {
    1: optional CommitStatus status
    2: optional string       base_commit_version // master draft version
    3: optional Committer    base_committer      // Master Draft Submission Information
    4: optional string       commit_version      // Personal draft version
}

// Check if the draft can be submitted to the request
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
    1: optional string       prologue            // opening statement
    2: optional list<string> suggested_questions // suggestion question
}



enum ConfigStatus {
    Configured        = 1 // Configured
    NotConfigured     = 2 // Not configured
    Disconnected      = 3 // Token changes
    Configuring       = 4 // Configuring, authorizing
    NeedReconfiguring = 5 // Need to reconfigure
}
enum BindType {
    NoBindRequired = 1 // No binding required
    AuthBind       = 2 // Auth binding
    KvBind         = 3 // Kv binding =
    KvAuthBind     = 4 // Kv and Auth authorization
    ApiBind        = 5 // API channel binding
    WebSDKBind     = 6
    StoreBind      = 7
    AuthAndConfig  = 8 // One button each for authorization and configuration
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
    Normal   = 0 // Normal
    InReview = 1 // Under review.
    Offline  = 2 // offline
}
enum UserAuthStatus {
    Authorized = 1 // Authorized
    UnAuthorized = 2 // unauthorized
    Authorizing = 3 // Authorizing
}

struct PublishConnectorListRequest {
    1: required i64 space_id (api.js_conv="true")
    2: required i64 bot_id (api.js_conv="true")
    3: optional string commit_version
}

struct PublishConnectorInfo {
    1:  required string                                      id                // Publishing Platform connector_id
    2:  required string                                      name              // publishing platform name
    3:  required string                                      icon              // publishing platform icon
    4:  required string                                      desc              // Publish Platform Description
    5:  required string                                      share_link        // share link
    6:  required ConfigStatus                                config_status     // Configuration Status 1: Bound 2: Unbound
    7:  required i64                                         last_publish_time // Last Post
    8:  required BindType                                    bind_type         // Binding type 1: No binding required 2: Auth 3: kv value
    9:  required map<string,string>                          bind_info         // Binding information key field name value is value
    10: optional string                                      bind_id           // Bind id information for unbinding and use
    11: optional AuthLoginInfo                               auth_login_info   // user authorization login information
    12: optional bool                                        is_last_published // Is it the last release?
    13: optional BotConnectorStatus                          connector_status  // bot channel status
    14: optional string                                      privacy_policy    // Privacy Policy
    15: optional string                                      user_agreement    // User Agreement
    16: optional AllowPublishStatus                          allow_punish      // Is the channel allowed to publish?
    17: optional string                                      not_allow_reason  // Reason for not allowing posting
    18: optional string                                      config_status_toast // Configuration status toast
    19: optional i64                                         brand_id          // Brand ID
    20: optional bool                                        support_monetization // Support commercialization
    21: optional UserAuthStatus                auth_status       // 1: Authorized, 2: Unauthorized. Currently this field is only available bind_type == 8
    22: optional string                                      to_complete_info_url // URL of the complete info button
}

struct SubmitBotMarketOption {
    1: optional bool can_open_source // Is it possible to publicly orchestrate?
}


struct ConnectorBrandInfo {
    1: required i64    id
    2: required string name
    3: required string icon
}

struct PublishTips {
    1: optional string cost_tips         // cost-bearing reminder
}

struct PublishConnectorListResponse {
    1:          i64                          code
    2:          string                       msg
    3:          list<PublishConnectorInfo>   publish_connector_list
    4: optional SubmitBotMarketOption        submit_bot_market_option
    5: optional SubmitBotMarketConfig        last_submit_config       // The configuration of the last submitted market
    6:          map<i64, ConnectorBrandInfo> connector_brand_info_map // Channel brand information
    7: optional PublishTips                  publish_tips             // post alert
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
