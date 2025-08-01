namespace go ocean.cloud.bot_common


struct AuthToken {
    1: string service_id,
    2: string access_key_id,
    3: string secret_access_key,
    4: string session_token,
    5: string expired_time,
    6: string current_time,
    7: string upload_host,
    8: string host_scheme,
}

struct PromptInfo {
    1: optional string Prompt (api.body="prompt"), // Text prompt
}

struct ModelInfo {
    1: optional i64                 ModelId           (agw.js_conv="str", api.js_conv="true", api.body="model_id"), // Model ID
    2: optional double              Temperature       (api.body="temperature")                                    , // Temperature, model output randomness, the larger the value, the more random, the smaller the more conservative (0-1]
    3: optional i32                 MaxTokens         (api.body="max_tokens")                                     , // Maximum Token Reply
    4: optional double              TopP              (api.body="top_p")                                          , // Another model's output randomness, the larger the value, the more random [0, 1]
    5: optional double              FrequencyPenalty  (api.body="frequency_penalty")                              , // Frequency penalty, adjust the frequency of words in the generated content, the fewer positive words are [-1.0, 1.0]
    6: optional double              PresencePenalty   (api.body="presence_penalty")                               , // There is a penalty, adjust the frequency of new words in the generated content, avoid repeating words with positive values, and use new words [-1.0, 1.0]
    7: optional ShortMemoryPolicy   ShortMemoryPolicy (api.body="short_memory_policy")                            , // contextual policy
    8: optional i32                 TopK              (api.body="top_k")                                          , // When generating, sample the size of the candidate set
    9: optional ModelResponseFormat ResponseFormat    (api.body="response_format")                                , // model reply content format
    10: optional ModelStyle         ModelStyle        (api.body="model_style")                                    , // User-selected model style
}

enum ModelStyle {
    Custom = 0
    Creative = 1
    Balance = 2
    Precise = 3
}
enum ModelResponseFormat {
    Text = 0,
    Markdown = 1,
    JSON = 2,
}

// The type of transmission allowed by the context
enum ContextMode {
    Chat           = 0,
    FunctionCall_1 = 1,
    FunctionCall_2 = 2,
    FunctionCall_3 = 3,
}

enum ModelFuncConfigType {
    Plugin = 1
    Workflow = 2
    ImageFlow = 3
    Trigger = 4
    KnowledgeText = 5
    KnowledgeTable = 6
    KnowledgeAutoCall = 7
    KnowledgeOnDemandCall = 8
    Variable = 9
    Database = 10
    LongTermMemory = 11
    FileBox = 12
    Onboarding = 13
    Suggestion = 14
    ShortcutCommand = 15
    BackGroundImage = 16
    TTS = 17
    MultiAgentRecognize = 18
    KnowledgePhoto = 19
    HookInfo = 20
}

enum ModelFuncConfigStatus {
    FullSupport = 0
    PoorSupport = 1
    NotSupport = 2
}

struct ShortMemoryPolicy {
    1: optional ContextMode ContextMode  (api.body="context_mode") , // The type of transmission allowed by the context
    2: optional i32         HistoryRound (api.body="history_round"), // Number of rounds of context band
}

struct PluginInfo {
    1: optional i64 PluginId (agw.js_conv="str", api.js_conv="true", api.body="plugin_id"), // Plugin ID
    2: optional i64 ApiId    (agw.js_conv="str", api.js_conv="true", api.body="api_id")   , // api Id
    3: optional string ApiName (api.body="api_name")   , // API name O project

    100: optional i64 ApiVersionMs (agw.js_conv="str", api.js_conv="true", api.body="api_version_ms"), // api version
}

struct WorkflowInfo {
    1: optional i64 WorkflowId (agw.js_conv="str", api.js_conv="true", api.body="workflow_id"), // WorkflowId
    2: optional i64 PluginId   (agw.js_conv="str", api.js_conv="true", api.body="plugin_id")  , // Plugin ID
    3: optional i64 ApiId      (agw.js_conv="str", api.js_conv="true", api.body="api_id")     , // api Id
    4: optional WorkflowMode FlowMode  (agw.js_conv="str", api.body="flow_mode") // Workflow or imageflow, default to workflow
    5: optional string WorkflowName (api.body="workflow_name")   , // workflow name
    6: optional string Desc (api.body="desc", api.body="desc"),
    7: optional list<PluginParameter> Parameters (api.body="parameters", api.body="parameters"),
    8: optional string PluginIcon (api.body="plugin_icon", api.body="plugin_icon"),
}
struct PluginParameter {
    1: optional string                Name (api.body="name")
    2: optional string                Desc (api.body="desc")
    3: optional bool                  Required (api.body="required")
    4: optional string                Type     (api.body="type")
    5: optional list<PluginParameter> SubParameters (api.body="sub_parameters")
    6: optional string                SubType  (api.body="sub_type")     // If Type is an array, there is a subtype
}

enum WorkflowMode {
    Workflow  = 0
    Imageflow = 1
    SceneFlow = 2
    ChatFlow = 3
    All       = 100
}
// onboarding content generation mode
enum OnboardingMode {
    NO_NEED    = 1, // No.
    USE_MANUAL = 2, // Manually specify content (multi-language support is covered by LLM)
    USE_LLM    = 3, // Generated by LLM
}

struct OnboardingInfo {                                 // Coze Opening Dialog
    1: optional string         Prologue                   (api.body="prologue")                    , // opening statement
    2: optional list<string>   SuggestedQuestions         (api.body="suggested_questions")         , // suggestion question
    3: optional OnboardingMode OnboardingMode             (api.body="onboarding_mode")             , // Opener model
    4: optional string         CustomizedOnboardingPrompt (api.body="customized_onboarding_prompt"), // LLM Generation, User-defined Prompt
    5: optional SuggestedQuestionsShowMode SuggestedQuestionsShowMode (api.body="suggested_questions_show_mode")         , // The opening statement presets the problem display method, and the default is 0 random display.
}

enum SuggestedQuestionsShowMode{
    Random  = 0,
    All  = 1,
}

enum SuggestReplyMode{
    System  = 0,
    Custom  = 1,
    Disable = 2,
    OriBot  = 3, // Agent specific, multiplexed source Bot configuration
}

// suggest
struct SuggestReplyInfo {                               // Coze Auto-Suggestion
    1: optional SuggestReplyMode SuggestReplyMode        (api.body="suggest_reply_mode")       , // suggestion problem model
    2: optional string           CustomizedSuggestPrompt (api.body="customized_suggest_prompt"), // user-defined suggestion questions
    3: optional string           ChainTaskName           (api.body="chain_task_name")          , // The name of the ChainTask that runs the Prompt
}

// tts Voices
struct VoicesInfo {                                 // Coze Voices
    1: optional bool            Muted         (api.body="muted")          , // Whether to turn on sound true: disable false: turn on
    2: optional map<string,i64> I18nLangVoice (api.body="i18n_lang_voice"), // Multi-voice voice configuration
    7: optional map<string,string> I18nLangVoiceStr (api.body="i18n_lang_voice_str"), // Multi-voice tone configuration, string type
    3: optional bool            Autoplay      (api.body="autoplay")       , // Whether to play automatically
    4: optional map<string,i64> AutoplayVoice (api.body="autoplay_voice") , // autoplay timbre
    5: optional bool            CloseVoiceCall (api.body="voice_call")     , // Whether to turn off voice calls, true: turn off false: turn on, default is false
    6: optional DefaultUserInputType   DefaultUserInputType (api.body="default_user_input_type"), // Default user input type
}

enum DefaultUserInputType {
    NotSet = 0, // Not set
    Text  = 1,  // Text
    Voice = 2,  // Hold down the voice
    Call  = 3,  // voice call
}

// AnswerActions
enum  AnswerActionsMode {
    Default   = 1,
    Customize = 2,
}

enum AnswerActionTriggerType {
    Direct      = 1, // Platform preset Trigger action
    WebView     = 2, // Click Action to display the custom H5 page
    SendMessage = 3, // Click Action to send a custom user message
}

struct AnswerActionTriggerRule {
    1: AnswerActionTriggerType Type           (api.body="type")           ,
    2: bool                    NeedPreloading (api.body="need_preloading"),
    3: map<string,string>      TriggerData    (api.body="trigger_data")   , // According to AnswerActionTriggerType
}

struct ActionIcon {
    1: string Type       (api.body="type")       , // Customized button type does not need to be passed
    2: string DefaultUrl (api.body="default_url"), // default state
    3: string ActiveUrl  (api.body="active_url") , // The state of pressing the button
    4: string DefaultUri (api.body="default_uri"), // default state
    5: string ActiveUri  (api.body="active_uri") , // The state of pressing the button
}

struct AnswerActionConfig {
    1: string                  Key         (api.body="key")         , // The prefabricated one only needs to pass the key.
    2: string                  Name        (api.body="name")        , // default
    3: ActionIcon              Icon        (api.body="icon")        , // Send uri.
    4: map<string,string>      NameI18n    (api.body="name_i18n")   , // Store the name of user i18
    5: AnswerActionTriggerRule TriggerRule (api.body="trigger_rule"), // Direct has no value; WebView contains webview_url and webview_callback_psm keys; SendMessage contains send_message_prompt
    6: i32                     Position    (api.body="position")    , // location
}

struct AnswerActions {
    1: AnswerActionsMode        AnswerActionsMode   (api.body="answer_actions_mode")  ,
    2: list<AnswerActionConfig> AnswerActionConfigs (api.body="answer_action_configs"),
}

// bot ext
struct BotExtInfo {
    1: optional AnswerActions AnswerActions   (api.body="answer_actions")   ,
    2: optional list<i32>     CardIds         (api.body="card_ids")         ,
    3: optional i32           PromptId        (api.body="prompt_id")        ,
    4: optional string        BotTemplateName (api.body="bot_template_name"),
    5: optional bool          UseUGCVoice     (api.body="use_ugc_voice")    ,
    6: optional i32           AppId           (api.body="app_id")           ,
    7: optional bool          BindingMp       (api.body="binding_mp")       , // Whether to bind the Mini Program logo
}

struct KnowledgeInfo {
    1: optional string Id   (api.body="id")  , // Knowledge ID
    2: optional string Name (api.body="name"), // Knowledge base name
}

enum SearchStrategy {
    SemanticSearch = 0, // semantic search
    HybirdSearch   = 1, // Hybrid Search
    FullTextSearch = 20, // Full Text Search
}

struct Knowledge {
    1: optional list<KnowledgeInfo> KnowledgeInfo  (api.body="knowledge_info") , // Knowledge Base Information
    2: optional i64                 TopK           (api.body="top_k")          , // recall maximum data volume
    3: optional double              MinScore       (api.body="min_score")      , // minimum match
    4: optional bool                Auto           (api.body="auto")           , // automatic recall
    5: optional SearchStrategy      SearchStrategy (api.body="search_strategy"), // search strategy
    6: optional bool                ShowSource     (api.body="show_source"),     // Whether to show the source
    7: optional KnowledgeNoRecallReplyMode NoRecallReplyMode (api.body="no_recall_reply_mode"),     // No recall reply mode, default 0
    8: optional string NoRecallReplyCustomizePrompt (api.body="no_recall_reply_customize_prompt"),     // Custom prompt for no recall reply, effective when NoRecallReplyMode = 1
    9: optional KnowledgeShowSourceMode ShowSourceMode (api.body="show_source_mode"),     // Source display method, default value 0 card list method
    10: optional RecallStrategy     RecallStrategy (api.body="recall_strategy"), // Recall policy, default value is true
}

struct RecallStrategy {
    1: optional bool                UseRerank  (api.body="use_rerank"),
    2: optional bool                UseRewrite (api.body="use_rewrite"),
    3: optional bool                UseNl2sql  (api.body="use_nl2sql")
}

enum KnowledgeShowSourceMode{
    ReplyBottom = 0,
    CardList = 1,
}


enum KnowledgeNoRecallReplyMode{
    Default  = 0,
    CustomizePrompt  = 1,
}

enum SocietyVisibility {
    Public = 1, // Visible to all
    Anonymous = 2, // Visible to host only
    Custom = 3, // custom
}
struct SocietyVisibiltyConfig {
    1: SocietyVisibility VisibilityType (api.body="visibility_type", go.tag="json:\"visibility_type,omitempty\"") , // Visibility in Social Scene: Public = 1, Anonymous = 2
    2: list<string> VisibilityRoles     (api.body="visibility_roles", go.tag="json:\"visibility_roles,omitempty\""), // list of visible characters
}

struct Variable {
    1: optional string Key          (api.body="key")          , // key, Field
    2: optional string Description  (api.body="description")  , // describe
    3: optional string DefaultValue (api.body="default_value"), // default value
    4: optional bool   IsSystem     (api.body="is_system"),     // Whether the system value is the system value
    5: optional bool   PromptDisabled (api.body="prompt_disabled"), // Whether to support calling in Prompt, the default is supported
    6: optional SocietyVisibiltyConfig SocietyVisibilityConfig (api.body="society_visibility_config", go.tag="json:\"society_visibility_config,omitempty\""), // Visibility in Social Scene: Public = 1, Anonymous = 2
    7: optional bool   IsDisabled (api.body="is_disabled"),  // Whether to disable, the default is false to enable
}

struct TaskInfo {                                // Scheduled Tasks on Coze
    1: optional bool UserTaskAllowed  (api.body="user_task_allowed") , // User starts task
    2: optional i64  EnablePresetTask (api.body="enable_preset_task"), // Allow preset tasks
}

enum FieldItemType {
    Text    = 1, // Text String
    Number  = 2, // Digital Integer
    Date    = 3, // Time Time
    Float   = 4, // float Number
    Boolean = 5, // bool Boolean
}

struct FieldItem {
    1: optional string        Name         (api.body="name")                                     , // field name
    2: optional string        Desc         (api.body="desc")                                     , // Field description
    3: optional FieldItemType Type         (api.body="type")                                     , // field type
    4: optional bool          MustRequired (api.body="must_required")                            , // Is it required?
    5: optional i64           Id           (agw.js_conv="str", api.js_conv="true", api.body="id"), // The field Id is added as 0.
    6: optional string        TypeStr      (api.body="type_str")                                 , // Field type str
    7: optional i64           AlterId      (api.body="alterId")                                 , // Field type str
}

struct Database {
    1: optional string          TableId   (api.body="table_id")  , // table id
    2: optional string          TableName (api.body="table_name"), // Table name
    3: optional string          TableDesc (api.body="table_desc"), // Table Introduction
    4: optional list<FieldItem> FieldList (api.body="field_list"), // Table field information
    5: optional bool            PromptDisabled (api.body="prompt_disabled"), // Whether to support calling in Prompt, the default is supported
    6: optional BotTableRWMode  RWMode    (api.body="rw_mode"),
}

enum BotTableRWMode {
    LimitedReadWrite = 1,
    ReadOnly = 2,
    UnlimitedReadWrite = 3,
    RWModeMax = 4,
}

enum AgentType {
    Start_Agent  = 0,
    LLM_Agent    = 1,
    Task_Agent   = 2,
    Global_Agent = 3,
    Bot_Agent    = 4,
}

//Version Compatibility: 0 - Old Version 1 - Rollback New Version 2 - Non-Rollback New Version 3 - Rollback New Version (no longer prompted)
enum AgentVersionCompat{
    OldVersion              = 0
    MiddleVersion           = 1
    NewVersion              = 2
    MiddleVersionNotPrompt  = 3
}

struct Agent {
    1 : i64                AgentId          (agw.js_conv="str", api.js_conv="true", api.body="agent_id")    ,
    2 : string             AgentName        (api.body="agent_name")                                         ,
    3 : PromptInfo         PromptInfo       (api.body="prompt_info")                                        , // Prompt message
    4 : list<PluginInfo>   PluginInfoList   (api.body="plugin_info_list")                                   , // List of plugins
    5 : Knowledge          Knowledge        (api.body="knowledge")                                          , // dataset
    6 : list<WorkflowInfo> WorkflowInfoList (api.body="workflow_info_list")                                 , // Workflow List
    7 : ModelInfo          ModelInfo        (api.body="model_info")                                         , // model configuration
    8 : list<Intent>       Intents          (api.body="intents")                                            , // intent information
    9 : AgentType          AgentType        (api.body="agent_type")                                         ,
    10: bool               RootAgent        (api.body="root_agent")                                         , // Is it a rootagent?
    11: i64                ReferenceId      (agw.js_conv="str", api.js_conv="true", api.body="reference_id"),
    12: string             FirstVersion     (api.body="first_version")                                      ,
    13: string             LastVersion      (api.body="last_version")                                       ,
    14: AgentPosition      AgentPosition    (api.body="agent_position")                                     ,
    15: string             IconUri          (api.body="icon_uri")                                           ,
    16: JumpConfig         JumpConfig       (api.body="jump_config")                                        ,
    17: SuggestReplyInfo   SuggestReplyInfo (api.body="suggest_reply_info")                                 ,
    18: string             Description      (api.body="description")                                        ,
    19: AgentVersionCompat VersionCompat    (api.body="version_compat")                                     , // multi_agent version compatibility field
    20: optional HookInfo  HookInfo         (api.body="hook_info")                                          ,
    21: optional string                 CurrentVersion                  (api.body="current_version")        ,   //The current version of the subbot
    22: optional ReferenceInfoStatus    ReferenceInfoStatus             (api.body="reference_info_status")  ,   // 1: Available update 2: Removed
    23: optional ReferenceUpdateType    UpdateType                      (api.body="update_type")            ,   //Subbot update type
}

struct AgentPosition{
    1: double x,
    2: double y,
}

enum MultiAgentSessionType{
    Flow = 1
    Host = 2
}

enum MultiAgentConnectorType {
    Curve = 0
    Straight   = 1
}

struct Intent{
    1: string IntentId    (api.body="intent_id")                                           ,
    2: string Prompt      (api.body="prompt")                                              ,
    3: i64    NextAgentId (agw.js_conv="str", api.js_conv="true", api.body="next_agent_id"),
    4: MultiAgentSessionType SessionType (api.body="session_type")
}

enum BotMode{
    SingleMode = 0,
    MultiMode  = 1,
    WorkflowMode = 2,
}

enum BotSpecies { // Bot type
    Default  = 0, // Create from flow
    Function = 1, // Created from coze
}

enum TimeCapsuleMode {
    Off = 0, // close
    On  = 1, // open
}
enum DisablePromptCalling {
    Off = 0,
    On  = 1,
}

// Time Capsule Information
struct TimeCapsuleInfo {
    1: optional TimeCapsuleMode TimeCapsuleMode (api.body="time_capsule_mode"),
    2: optional DisablePromptCalling DisablePromptCalling (api.body="disable_prompt_calling"),
}

struct BotTagInfo {
    1: optional TimeCapsuleInfo TimeCapsuleInfo (api.body="time_capsule_info"), // Time capsule information tag key: time_capsule
}

struct FileboxInfo{
    1: optional FileboxInfoMode Mode,
}
enum FileboxInfoMode {
    Off = 0,
    On  = 1,
}

enum BotStatus {
    Deleted = 0
    Using   = 1
    Banned  = 2
}

enum BusinessType {
    Default = 0
    DouyinAvatar = 1
}

// bot information
struct BotInfo {
    1 : i64                BotId            (agw.js_conv="str", api.js_conv="true", api.body="bot_id")      , // bot id
    2 : string             Name             (api.body="name")                                               , // bot name
    3 : string             Description      (api.body="description")                                        , // Bot description
    4 : string             IconUri          (api.body="icon_uri")                                           , // Bot icon uri
    5 : string             IconUrl          (api.body="icon_url")                                           , // Bot icon url
    6 : i64                CreatorId        (agw.js_conv="str", api.js_conv="true", api.body="creator_id")  , // creator id
    7 : i64                CreateTime       (agw.js_conv="str", api.js_conv="true", api.body="create_time") , // create_time
    8 : i64                UpdateTime       (agw.js_conv="str", api.js_conv="true", api.body="update_time") , // update time
    9 : i64                ConnectorId      (agw.js_conv="str", api.js_conv="true", api.body="connector_id"), // line of business
    10: string             Version          (api.body="version")                                            , // Version, ms
    11: ModelInfo          ModelInfo        (api.body="model_info")                                         , // model configuration
    12: PromptInfo         PromptInfo       (api.body="prompt_info")                                        , // Prompt message
    13: list<PluginInfo>   PluginInfoList   (api.body="plugin_info_list")                                   , // List of plugins
    14: list<WorkflowInfo> WorkflowInfoList (api.body="workflow_info_list")                                 , // Workflow List
    15: OnboardingInfo     OnboardingInfo   (api.body="onboarding_info")                                    , // opening statement
    16: Knowledge          Knowledge        (api.body="knowledge")                                          , // dataset
    17: list<Variable>     VariableList     (api.body="variable_list")                                      , // KV storage
    18: TaskInfo           TaskInfo         (api.body="task_info")                                          , // Task management/preset tasks
    19: list<Database>     DatabaseList     (api.body="database_list")                                      , // data table
    20: SuggestReplyInfo   SuggestReplyInfo (api.body="suggest_reply_info")                                 , // referral question
    21: VoicesInfo         VoicesInfo       (api.body="voices_info")                                        , // Timbre Configuration
    22: BotExtInfo         BotExtInfo       (api.body="bot_ext_info")                                       , // Additional information, extended fields
    23: BotMode            BotMode          (api.body="bot_mode")                                           , // Bot type, single agent or multi agent
    24: list<Agent>        Agents           (api.body="agents")                                             , // Multi agent mode agent information
    25: BotSpecies         BotSpecies       (api.body="bot_species")                                        , // Bot type
    26: BotTagInfo         BotTagInfo       (api.body="bot_tag_info")                                       , // Bot tag information, user new field
    27: FileboxInfo        FileboxInfo      (api.body="filebox_info")                                       , // FileBox Information
    28: MultiAgentInfo     MultiAgentInfo   (api.body="multi_agent_info")                                   , // multi_agent structure
    29: list<BackgroundImageInfo> BackgroundImageInfoList   (api.body="background_image_info_list")         , // Background cover list structure
    30: list<string>       ShortcutSort     (api.body="shortcut_sort")                                      ,
    31: BotStatus          Status           (api.body="status")                                             , // bot state
    32: optional HookInfo  HookInfo         (api.body="hook_info")                                          , // Hook information
    33: UserQueryCollectConf UserQueryCollectConf (api.body="user_query_collect_conf") , // User query collection configuration
    34: LayoutInfo         LayoutInfo       (api.body="layout_info")                                        , // Orchestration information for workflow patterns
    35: BusinessType       BusinessType     (api.body="business_type")
}


struct CommonKnowledge {
    1:  list<KnowledgeInfo> knowledge_infos   , // Knowledge Base Information
}

struct ShortcutCommandComponent { // Panel parameters
    1 : string name  //parameter name
    2 : string description //parameter description
    3 : string type // Input type text, select, file
    4 : optional string tool_parameter  // When requesting a tool, the key of the parameter corresponds to the parameter name of the tool. If not, it will not be returned.
    5 : optional list<string> options // Options list when type is select or what types are supported when type is file image, doc, table, audio, video, zip, code, txt, ppt
    6 : optional string default_value // Default value, not returned when not configured
    7 : bool is_hide // Whether to hide or not to show, the shortcut command of the online bot tool type does not return the component with hide = true
}

struct ShortcutCommandToolInfo {
    1: string name //
    2: string type // Tool type workflow plugin
}

struct ShortcutCommandInfo {
    1: i64 id (api.js_conv="true") // Quick Command ID
    2: string name // Shortcut button name
    3: string command // Quick Instruction
    4: string description // shortcut description
    5: string query_template // Command query template
    6: string icon_url // Quick command icon
    7: optional list<ShortcutCommandComponent> components // Component list (parameter list)
    8: optional ShortcutCommandToolInfo tool // Tool information
    9: optional i64 agent_id (api.js_conv="true") //When the multi instruction is executed by which node, it will not be returned without configuration
}


struct OpenAPIBotInfo {
    1 : i64 bot_id  (api.js_conv="true")  ,                                // bot id
    2 : string name,                                  // bot name
    3 : string description,                           // Bot description
    4 : string icon_url,                              // Bot image url
    5 : i64 create_time,                              // create_time
    6 : i64 update_time,                              // update time
    7 : string version,                               // version
    8 : PromptInfo prompt_info,                       // Prompt message
    9 : OnboardingInfo onboarding_info,             // opening statement
    10: BotMode bot_mode,                  // Bot type, single agent or multi agent
//    11: optional list < VoiceData > voice_data_list,//selected voice message
    12: optional ModelInfo model_info,                // model information
    13: list<PluginInfo> plugin_info_list,            // Plugin information list
    14: optional CommonKnowledge knowledge            // Knowledge Base Information
    15: list<WorkflowInfo> workflow_info_list,        // Workflow information list
    16: list<ShortcutCommandInfo> shortcut_commands,  // Quick Command Information List
//    17: list < Voice > voice_info_list,//Tone Configuration
    18: string default_user_input_type,               // Default user input type
    19: SuggestReplyInfo suggest_reply_info,          // User Question Suggestions
    20: BackgroundImageInfo background_image_info,    // background image
    21: list<Variable> variables,                // Variable list
}



struct LayoutInfo {
    1: string       WorkflowId               (api.body="workflow_id")                                        , // workflowId
    2: string       PluginId                 (api.body="plugin_id")                                          , // PluginId
}

struct UserQueryCollectConf {
    1: bool      IsCollected       (api.body="is_collected")   , // Whether to turn on the collection switch
    2: string    PrivatePolicy     (api.body="private_policy") , // Privacy Policy Link
}

struct MultiAgentInfo {
    1: MultiAgentSessionType SessionType   (api.body="session_type")                                       , // multi_agent session takeover
    2: AgentVersionCompatInfo VersionCompatInfo    (api.body="version_compat_info")                        , // multi_agent version compatibility field, front-end use
    3: MultiAgentConnectorType ConnectorType    (api.body="connector_type")                                  , // multi_agent connection type, front end
}

struct AgentVersionCompatInfo {
    1: AgentVersionCompat  VersionCompat      (api.body="version_compat")                              ,
    2: string version
}

struct BackgroundImageInfo {
    1: optional BackgroundImageDetail WebBackgroundImage   (api.body="web_background_image")                             , // Web background cover
    2: optional BackgroundImageDetail MobileBackgroundImage    (api.body="mobile_background_image")                             , // Mobile end background cover
}

struct BackgroundImageDetail {
    1: optional string OriginImageUri    (api.body="origin_image_uri")            // original image
    2: optional string OriginImageUrl    (api.body="origin_image_url")
    3: optional string ImageUri  (api.body="image_uri")               // Actual use of pictures
    4: optional string ImageUrl  (api.body="image_url")
    5: optional string ThemeColor    (api.body="theme_color")
    6: optional GradientPosition GradientPosition  (api.body="gradient_position") // Gradual change of position
    7: optional CanvasPosition CanvasPosition    (api.body="canvas_position") // Crop canvas position
}

struct GradientPosition {
    1: optional double Left     (api.body="left")
    2: optional double Right    (api.body="right")
}


struct CanvasPosition {
    1: optional double Width    (api.body="width")
    2: optional double Height   (api.body="height")
    3: optional double Left     (api.body="left")
    4: optional double Top      (api.body="top")
}


// Update for bot information
struct BotInfoForUpdate {
    1:  optional i64 BotId  (agw.js_conv="str", api.js_conv="true",api.body="bot_id") // bot id
    2:  optional string Name  (api.body="name")                                      // bot name
    3:  optional string Description (api.body="description")                         // Bot description
    4:  optional string IconUri (api.body="icon_uri")                             // Bot icon uri
    5:  optional string IconUrl (api.body="icon_url")                             // Bot icon url
    6:  optional i64 CreatorId  (agw.js_conv="str", api.js_conv="true", api.body="creator_id")                             // creator id
    7:  optional i64 CreateTime (agw.js_conv="str", api.js_conv="true", api.body="create_time")                             // create_time
    8:  optional i64 UpdateTime (agw.js_conv="str", api.js_conv="true", api.body="update_time")                             // update time
    9:  optional i64 ConnectorId (agw.js_conv="str", api.js_conv="true", api.body="connector_id")                         // line of business
    10: optional string Version (api.body="version")                                                  // Version, ms
    11: optional ModelInfo ModelInfo    (api.body="model_info")                                             // model configuration
    12: optional PromptInfo PromptInfo  (api.body="prompt_info")                                           // Prompt message
    13: optional list<PluginInfo> PluginInfoList (api.body="plugin_info_list")                                 // List of plugins
    14: optional list<WorkflowInfo> WorkflowInfoList  (api.body="workflow_info_list")                             // Workflow List
    15: optional OnboardingInfo OnboardingInfo  (api.body="onboarding_info")                                   // opening statement
    16: optional Knowledge Knowledge    (api.body="knowledge")                                             // dataset
    17: optional list<Variable> VariableList    (api.body="variable_list")                                     // KV storage
    18: optional TaskInfo TaskInfo  (api.body="task_info")                                               // Task management/preset tasks
    19: optional list<Database> DatabaseList    (api.body="database_list")                                     // data table
    20: optional SuggestReplyInfo SuggestReplyInfo  (api.body="suggest_reply_info")                               // referral question
    21: optional VoicesInfo VoicesInfo  (api.body="voices_info")                                           // Timbre Configuration
    22: optional BotExtInfo BotExtInfo  (api.body="bot_ext_info")                                          // Additional information, extended fields
    23: optional BotMode BotMode    (api.body="bot_mode")                                                 // Bot type, single agent or multi agent
    24: optional list<AgentForUpdate> Agents    (api.body="agents")                                       // Multi agent mode agent information
    25: BotSpecies BotSpecies   (api.body="bot_species")                                                   // Bot type
    26: optional BotTagInfo BotTagInfo  (api.body="bot_tag_info")                                           // Bot tag information, user new field
    27: optional FileboxInfo        FileboxInfo (api.body="filebox_info")                                           // FileBox Information
    28: optional MultiAgentInfo     MultiAgentInfo  (api.body="multi_agent_info")                               // multi_agent structure
    29: optional list<BackgroundImageInfo> BackgroundImageInfoList  (api.body="background_image_info_list")               // Background cover list structure
    30: optional list<string>             ShortcutSort  (api.body="shortcut_sort")
    31: optional HookInfo             HookInfo (api.body="hook_info")
    32: optional UserQueryCollectConf     UserQueryCollectConf (api.body="user_query_collect_conf")// User query collection configuration
    33: optional LayoutInfo               LayoutInfo(api.body="layout_info")                           // Orchestration information for workflow patterns
}

struct AgentForUpdate {
   1: optional i64 AgentId (agw.js_conv="str", api.js_conv="true", api.body="id") // The agw field names are specially mapped, note that
   2: optional string AgentName (api.body="name") // The agw field names are specially mapped, note that
   3: optional PromptInfo PromptInfo (api.body="prompt_info")                      // Prompt message
   4: optional list<PluginInfo> PluginInfoList (api.body="plugin_info_list")             // List of plugins
   5: optional Knowledge Knowledge (api.body="knowledge")                         // dataset
   6: optional list<WorkflowInfo> WorkflowInfoList (api.body="workflow_info_list")         // Workflow List
   7: optional ModelInfo ModelInfo (api.body="model_info")                         // model configuration
   8: optional list<Intent> Intents (api.body="intents")                        // intent information
   9: optional AgentType AgentType (api.body="agent_type")
   10: optional bool RootAgent (api.body="root_agent")                             // Is it a rootagent?
   11: optional i64 ReferenceId (agw.js_conv="str", api.js_conv="true", api.body="reference_id")
   12: optional string FirstVersion (api.body="first_version")
   13: optional string LastVersion (api.body="last_version")
   14: optional AgentPosition  Position (api.body="agent_position")
   15: optional string  IconUri (api.body="icon_uri")
   16: optional JumpConfig JumpConfig (api.body="jump_config")
   17: optional SuggestReplyInfo SuggestReplyInfo (api.body="suggest_reply_info")
   18: optional string  Description (api.body="description")
   19: optional AgentVersionCompat VersionCompat (api.body="version_compat")           // multi_agent version compatibility field
   20: optional HookInfo HookInfo (api.body="hook_info")
}

struct TableDetail {
    1: optional string TableId                   // table id
    2: optional string TableName                 // Table name
    3: optional string TableDesc                 // Table Introduction
    4: optional list<FieldItem> FieldList        // Table field information
    5: optional bool            PromptDisabled (api.body="prompt_disabled"), // Whether to support calling in Prompt, the default is supported
}

struct TaskPluginInputField {
    1: optional string Name
    2: optional string Type // "Input", "Reference"
    3: optional string Value
}

struct TaskPluginInput {
    1: optional list<TaskPluginInputField> Params
}

struct TaskWebhookField {
    1: optional string Name,
    2: optional string Type,
    3: optional string Description,
    4: optional list<TaskWebhookField> Children,
}

struct TaskWebhookOutput {
    1: optional list<TaskWebhookField> Params
}

struct TaskInfoDetail {                          // Tasks Detail
    1: optional string TaskId                    // task unique identifier
    2: optional string UserQuestion              // The query executed when the timer fires, for example: Remind me to drink water. Phase 2: TriggerType == "Time"
    3: optional string CreateTime                // Timed task create_time
    4: optional string NextTime                  // The time when the scheduled task will next execute
    5: optional i64 Status                       // Task Status: Valid/Invalid
    6: optional i32 PresetType                   // 1-Draft, 2-Online
    7: optional string CronExpr                  // crontab expression for timed tasks
    8: optional string TaskContent               // Treated UserQuestions, such as Drinking Water
    9: optional string TimeZone                  // Time Zone
    10: optional string TaskName                 // task name
    11: optional string TriggerType              // "Time", "Event"
    12: optional string Action                   // "Bot query", "Plugin", "Workflow"
    13: optional string BotQuery                 // Action == "Bot query"
    14: optional string PluginName               // Both plugins and workflows use this field
    15: optional TaskPluginInput PluginInput     // Both plugins and workflows use this field
    16: optional string WebhookUrl               // TriggerType == "Event"
    17: optional string WebhookBearerToken       // TriggerType == "Event"
    18: optional TaskWebhookOutput WebhookOutput // TriggerType == "Event"
    19: optional string OriginId                    // Traceability ID. Generated when created, updated/released unchanged
}

struct DraftBotInfoV2 {
     1: BotInfo BotInfo
     2: optional string CanvasData
     3: optional i64 BaseCommitVersion
     4: optional i64 CommitVersion
     5: optional map<string,TableDetail> TableInfo // TableInfo
     6: optional map<string, TaskInfoDetail> TaskInfo    // taskInfo
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

struct JumpConfig {
    1: BacktrackMode   backtrack
    2: RecognitionMode recognition
    3: optional IndependentModeConfig independent_conf
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
    1: IndependentTiming judge_timing // judge timing
    2: i32 history_round
    3: IndependentRecognitionModelType model_type
    4: optional string model_id
    5: optional string prompt
}

struct MessageFeedback {
    1: MessageFeedbackType feedback_type    // feedback type
    2: list<MessageFeedbackDetailType> detail_types   // segmentation type
    3: string detail_content            // Negative feedback custom content, corresponding to user selection Others
}

enum MessageFeedbackType {
    Default = 0
    Like = 1
    Unlike = 2
}

enum MessageFeedbackDetailType {
    UnlikeDefault = 0
    UnlikeHarmful = 1 // Harmful information
    UnlikeIncorrect = 2 // incorrect information
    UnlikeNotFollowInstructions = 3 // Did not follow instructions
    UnlikeOthers = 4 // other
}

enum Scene{
    Default  = 0,
    Explore  = 1,
    BotStore = 2,
    CozeHome = 3,
    Playground = 4,
    Evaluation = 5, // evaluation platform
    AgentAPP = 6,
    PromptOptimize = 7, //Prompt optimization
    GenerateAgentInfo = 8 // Createbot's nl2bot features
}

struct UserLabel {
    1: string             label_id
    2: string             label_name
    3: string             icon_uri
    4: string             icon_url
    5: string             jump_link
}

struct ChatV3ChatDetail {
    1: required string ID (api.body = "id"),
    2: required string ConversationID (api.body = "conversation_id"),
    3: required string BotID (api.body = "bot_id"),
    4: optional i32 CreatedAt (api.body = "created_at"),
    5: optional i32 CompletedAt (api.body = "completed_at"),
    6: optional i32 FailedAt (api.body = "failed_at"),
    7: optional map<string, string> MetaData (api.body = "meta_data"),
    8: optional LastError LastError (api.body = "last_error"),
    9: required string Status (api.body = "status"),
    10: optional Usage Usage (api.body = "usage"),
    11: optional RequiredAction RequiredAction (api.body = "required_action")
    12: optional string SectionID (api.body="section_id")
}

struct LastError {
    1: required i32 Code (api.body = "code"),
    2: required string Msg (api.body = "msg"),
}

struct Usage {
    1: optional i32 TokenCount (api.body = "token_count"),
    2: optional i32 OutputTokens (api.body = "output_count"),
    3: optional i32 InputTokens (api.body = "input_count"),
}

struct RequiredAction {
    1: string Type (api.body = "type"),
    2: SubmitToolOutputs SubmitToolOutputs (api.body = "submit_tool_outputs")
}

struct SubmitToolOutputs {
    1: list<InterruptPlugin> ToolCalls (api.body = "tool_calls")
}

struct InterruptPlugin {
    1: string id
    2: string type
    3: InterruptFunction function
    4: InterruptRequireInfo require_info
}

struct InterruptFunction {
    1: string name
    2: string arguments
}

struct InterruptRequireInfo {
    1: list<string> infos
}

struct ChatV3MessageDetail {
    1: required string ID (api.body = "id"),
    2: required string ConversationID (api.body = "conversation_id"),
    3: required string BotID (api.body = "bot_id"),
    4: required string Role (api.body = "role"),
    5: required string Type (api.body = "type"),
    6: required string Content (api.body = "content"),
    7: required string ContentType (api.body = "content_type"),
    8: optional map<string, string> MetaData (api.body = "meta_data"),
    9: required string ChatID (api.body = "chat_id")
    10: optional string SectionID (api.body="section_id")
    11: optional i64 CreatedAt (api.body = "created_at")
    12: optional i64 UpdatedAt (api.body = "updated_at")
    13: optional string ReasoningContent (api.body = "reasoning_content")
}

struct HookInfo {
    1: optional list<HookItem> pre_agent_jump_hook // Pre agent jump hook
    2: optional list<HookItem> post_agent_jump_hook // Post agent jump hook
    3: optional list<HookItem> flow_hook // Process hook
    4: optional list<HookItem> atomic_hook // Atomic power hook
    5: optional list<HookItem> llm_call_hook // Model call hook
    6: optional list<HookItem> res_parsing_hook // Conversation result hook
    7: optional list<HookItem> suggestion_hook // suggesion hook
}
struct HookItem {
    1: optional string uri
    2: optional list<string> filter_rules
    3: optional bool strong_dep
    4: optional i64 timeout_ms
}

//struct ContentAttachment {
//    1: required string FileID (api.body = "file_id")
//}

// struct MetaContent{
//     1: required string Type (api.body="type"),
//     2: optional string Text ( api.body="text"),
//     3: optional string FileID (api.body="file_id"),
//     4: optional string FileURL (api.body="file_url"),
//     5: optional string Card (api.body="card"),
// }


// struct EnterMessage  {
//     1: required string Role (api.body = "role")
//     2: string Content (api.body = "content")//content
//     3: map<string,string> MetaData(api.body = "meta_data")
//     4: string ContentType(api.body = "content_type")//text/card/object_string
//     5: string Type(api.body = "type")
// }

// struct OpenMessageApi {
//     1: string Id (api.body = "id")//primary key ID
//     2: string BotId (api.body = "bot_id")//bot id//TODO All i64 plus annotation str, imported parameters and exported parameters are required
//     3: string Role(api.body = "role")
//     4: string Content (api.body = "content")//content
//     5: string ConversationId(api.body = "conversation_id")   // conversation id
//     6: map<string,string> MetaData(api.body = "meta_data")
//     7: string CreatedAt (api.body = "created_at")//create_time
//     8: string UpdatedAt (api.body = "updated_at")//Update time//Change TODO time to int
//     9: string ChatId(api.body = "chat_id")
//     10: string ContentType(api.body = "content_type")
//     11: string Type(api.body = "type")
// }

enum ReferenceUpdateType {
    ManualUpdate = 1
    AutoUpdate = 2
}

enum ReferenceInfoStatus {
    HasUpdates = 1 // 1: Updates are available
    IsDelete   = 2 // 2: Deleted
}
