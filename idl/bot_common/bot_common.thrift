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
    1: optional string Prompt (api.body="prompt"), // 文本prompt
}

struct ModelInfo {
    1: optional i64                 ModelId           (agw.js_conv="str", api.js_conv="true", api.body="model_id"), // 模型id
    2: optional double              Temperature       (api.body="temperature")                                    , // 温度，模型输出随机性，值越大越随机，越小越保守(0-1]
    3: optional i32                 MaxTokens         (api.body="max_tokens")                                     , // 回复最大Token数
    4: optional double              TopP              (api.body="top_p")                                          , // 另一种模型的输出随机性，值越大越随机[0,1]
    5: optional double              FrequencyPenalty  (api.body="frequency_penalty")                              , // 频率惩罚，调整生成内容中的单词频率，正值单词越少见[-1.0,1.0]
    6: optional double              PresencePenalty   (api.body="presence_penalty")                               , // 存在惩罚，调整生成内容中新词语频率，正值避免重复单词，用新词[-1.0,1.0]
    7: optional ShortMemoryPolicy   ShortMemoryPolicy (api.body="short_memory_policy")                            , // 上下文策略
    8: optional i32                 TopK              (api.body="top_k")                                          , // 生成时，采样候选集的大小
    9: optional ModelResponseFormat ResponseFormat    (api.body="response_format")                                , // 模型回复内容格式
    10: optional ModelStyle         ModelStyle        (api.body="model_style")                                    , // 用户选择的模型风格
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

// 上下文允许传输的类型
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
    1: optional ContextMode ContextMode  (api.body="context_mode") , // 上下文允许传输的类型
    2: optional i32         HistoryRound (api.body="history_round"), // 上下文带的轮数
}

struct PluginInfo {
    1: optional i64 PluginId (agw.js_conv="str", api.js_conv="true", api.body="plugin_id"), // 插件id
    2: optional i64 ApiId    (agw.js_conv="str", api.js_conv="true", api.body="api_id")   , // api Id
    3: optional string ApiName (api.body="api_name")   , // api name O项目用

    100: optional i64 ApiVersionMs (agw.js_conv="str", api.js_conv="true", api.body="api_version_ms"), // api version
}

struct WorkflowInfo {
    1: optional i64 WorkflowId (agw.js_conv="str", api.js_conv="true", api.body="workflow_id"), // WorkflowId
    2: optional i64 PluginId   (agw.js_conv="str", api.js_conv="true", api.body="plugin_id")  , // 插件id
    3: optional i64 ApiId      (agw.js_conv="str", api.js_conv="true", api.body="api_id")     , // api Id
    4: optional WorkflowMode FlowMode  (agw.js_conv="str", api.body="flow_mode") // workflow or imageflow, 默认为workflow
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
    6: optional string                SubType  (api.body="sub_type")     // 如果Type是数组，则有subtype
}

enum WorkflowMode {
    Workflow  = 0
    Imageflow = 1
    SceneFlow = 2
    ChatFlow = 3
    All       = 100
}
// onboarding内容生成模式
enum OnboardingMode {
    NO_NEED    = 1, // 不需要
    USE_MANUAL = 2, // 人工指定内容（多语言支持由LLM兜底）
    USE_LLM    = 3, // 由LLM生成
}

struct OnboardingInfo {                                 // 对应 Coze Opening Dialog
    1: optional string         Prologue                   (api.body="prologue")                    , // 开场白
    2: optional list<string>   SuggestedQuestions         (api.body="suggested_questions")         , // 建议问题
    3: optional OnboardingMode OnboardingMode             (api.body="onboarding_mode")             , // 开场白模型
    4: optional string         CustomizedOnboardingPrompt (api.body="customized_onboarding_prompt"), // LLM生成，用户自定义 Prompt
    5: optional SuggestedQuestionsShowMode SuggestedQuestionsShowMode (api.body="suggested_questions_show_mode")         , // 开场白预设问题展示方式 默认0 随机展示
}

enum SuggestedQuestionsShowMode{
    Random  = 0,
    All  = 1,
}

enum SuggestReplyMode{
    System  = 0,
    Custom  = 1,
    Disable = 2,
    OriBot  = 3, // agent专用，复用源Bot配置
}

// suggest
struct SuggestReplyInfo {                               // 对应 Coze Auto-Suggestion
    1: optional SuggestReplyMode SuggestReplyMode        (api.body="suggest_reply_mode")       , // 建议问题模型
    2: optional string           CustomizedSuggestPrompt (api.body="customized_suggest_prompt"), // 用户自定义建议问题
    3: optional string           ChainTaskName           (api.body="chain_task_name")          , // 运行Prompt的ChainTask名称
}

// tts Voices
struct VoicesInfo {                                 // 对应 Coze Voices
    1: optional bool            Muted         (api.body="muted")          , // 是否开启声音 true:禁用  false:开启
    2: optional map<string,i64> I18nLangVoice (api.body="i18n_lang_voice"), // 多语音音色配置
    7: optional map<string,string> I18nLangVoiceStr (api.body="i18n_lang_voice_str"), // 多语音音色配置, string类型
    3: optional bool            Autoplay      (api.body="autoplay")       , // 是否自动播放
    4: optional map<string,i64> AutoplayVoice (api.body="autoplay_voice") , // 自动播放的音色
    5: optional bool            CloseVoiceCall (api.body="voice_call")     , // 是否关闭语音通话，true:关闭 false:开启  默认为false
    6: optional DefaultUserInputType   DefaultUserInputType (api.body="default_user_input_type"), // 默认用户输入类型
}

enum DefaultUserInputType {
    NotSet = 0, // 没设置
    Text  = 1,  // 文字
    Voice = 2,  // 按住语音
    Call  = 3,  // 语音通话
}

// AnswerActions
enum  AnswerActionsMode {
    Default   = 1,
    Customize = 2,
}

enum AnswerActionTriggerType {
    Direct      = 1, // 平台预设Trigger action
    WebView     = 2, // 点击Action 显示自定义的H5页面
    SendMessage = 3, // 点击Action 发送自定义的用户消息
}

struct AnswerActionTriggerRule {
    1: AnswerActionTriggerType Type           (api.body="type")           ,
    2: bool                    NeedPreloading (api.body="need_preloading"),
    3: map<string,string>      TriggerData    (api.body="trigger_data")   , // 根据 AnswerActionTriggerType决定
}

struct ActionIcon {
    1: string Type       (api.body="type")       , // 自定义的按钮 type 不用传
    2: string DefaultUrl (api.body="default_url"), // 默认状态
    3: string ActiveUrl  (api.body="active_url") , // 按下按钮的状态
    4: string DefaultUri (api.body="default_uri"), // 默认状态
    5: string ActiveUri  (api.body="active_uri") , // 按下按钮的状态
}

struct AnswerActionConfig {
    1: string                  Key         (api.body="key")         , // 预制的只需要传key
    2: string                  Name        (api.body="name")        , // 默认
    3: ActionIcon              Icon        (api.body="icon")        , // 下发uri
    4: map<string,string>      NameI18n    (api.body="name_i18n")   , // 存储用户i18的name
    5: AnswerActionTriggerRule TriggerRule (api.body="trigger_rule"), // Direct 没有值； WebView 包含 webview_url和 webview_callback_psm两个key；SendMessage 包含send_message_prompt
    6: i32                     Position    (api.body="position")    , // 位置
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
    7: optional bool          BindingMp       (api.body="binding_mp")       , // 是否绑定小程序标识
}

struct KnowledgeInfo {
    1: optional string Id   (api.body="id")  , // 知识库id
    2: optional string Name (api.body="name"), // 知识库名称
}

enum SearchStrategy {
    SemanticSearch = 0, // 语义搜索
    HybirdSearch   = 1, // 混合搜索
    FullTextSearch = 20, // 全文搜索
}

struct Knowledge {
    1: optional list<KnowledgeInfo> KnowledgeInfo  (api.body="knowledge_info") , // 知识库信息
    2: optional i64                 TopK           (api.body="top_k")          , // 召回最大数据量
    3: optional double              MinScore       (api.body="min_score")      , // 最小匹配度
    4: optional bool                Auto           (api.body="auto")           , // 自动召回
    5: optional SearchStrategy      SearchStrategy (api.body="search_strategy"), // 搜索策略
    6: optional bool                ShowSource     (api.body="show_source"),     // 是否展示来源
    7: optional KnowledgeNoRecallReplyMode NoRecallReplyMode (api.body="no_recall_reply_mode"),     // 无召回回复mode，默认0
    8: optional string NoRecallReplyCustomizePrompt (api.body="no_recall_reply_customize_prompt"),     // 无召回回复时自定义prompt，当NoRecallReplyMode=1时生效
    9: optional KnowledgeShowSourceMode ShowSourceMode (api.body="show_source_mode"),     // 来源展示方式 默认值0 卡片列表方式
    10: optional RecallStrategy     RecallStrategy (api.body="recall_strategy"), // 召回策略, 默认值为true
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
    Public = 1, // 对所有人可见
    Anonymous = 2, // 仅对host可见
    Custom = 3, // 自定义
}
struct SocietyVisibiltyConfig {
    1: SocietyVisibility VisibilityType (api.body="visibility_type", go.tag="json:\"visibility_type,omitempty\"") , // 社会场景中可见性: Public = 1,Anonymous = 2
    2: list<string> VisibilityRoles     (api.body="visibility_roles", go.tag="json:\"visibility_roles,omitempty\""), // 可见角色列表
}

struct Variable {
    1: optional string Key          (api.body="key")          , // key, Field
    2: optional string Description  (api.body="description")  , // 描述
    3: optional string DefaultValue (api.body="default_value"), // 默认值
    4: optional bool   IsSystem     (api.body="is_system"),     // 是否系统值系统值
    5: optional bool   PromptDisabled (api.body="prompt_disabled"), // 是否支持在Prompt中调用 默认支持
    6: optional SocietyVisibiltyConfig SocietyVisibilityConfig (api.body="society_visibility_config", go.tag="json:\"society_visibility_config,omitempty\""), // 社会场景中可见性: Public = 1,Anonymous = 2
    7: optional bool   IsDisabled (api.body="is_disabled"),  // 是否禁用，默认为false代表启用
}

struct TaskInfo {                                // coze 上的 Scheduled Tasks
    1: optional bool UserTaskAllowed  (api.body="user_task_allowed") , // 用户开启task任务
    2: optional i64  EnablePresetTask (api.body="enable_preset_task"), // 允许预设任务
}

enum FieldItemType {
    Text    = 1, // 文本 String
    Number  = 2, // 数字 Integer
    Date    = 3, // 时间 Time
    Float   = 4, // float Number
    Boolean = 5, // bool Boolean
}

struct FieldItem {
    1: optional string        Name         (api.body="name")                                     , // 字段名称
    2: optional string        Desc         (api.body="desc")                                     , // 字段描述
    3: optional FieldItemType Type         (api.body="type")                                     , // 字段类型
    4: optional bool          MustRequired (api.body="must_required")                            , // 是否必填
    5: optional i64           Id           (agw.js_conv="str", api.js_conv="true", api.body="id"), // 字段Id 新增为0
    6: optional string        TypeStr      (api.body="type_str")                                 , // 字段类型 str
    7: optional i64           AlterId      (api.body="alterId")                                 , // 字段类型 str
}

struct Database {
    1: optional string          TableId   (api.body="table_id")  , // table id
    2: optional string          TableName (api.body="table_name"), // table名称
    3: optional string          TableDesc (api.body="table_desc"), // table简介
    4: optional list<FieldItem> FieldList (api.body="field_list"), // table字段信息
    5: optional bool            PromptDisabled (api.body="prompt_disabled"), // 是否支持在Prompt中调用 默认支持
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

//版本兼容：0-旧版本 1-可回退的新版本 2-不可回退的新版本 3-可回退的新版本(不再提示)
enum AgentVersionCompat{
    OldVersion              = 0
    MiddleVersion           = 1
    NewVersion              = 2
    MiddleVersionNotPrompt  = 3
}

struct Agent {
    1 : i64                AgentId          (agw.js_conv="str", api.js_conv="true", api.body="agent_id")    ,
    2 : string             AgentName        (api.body="agent_name")                                         ,
    3 : PromptInfo         PromptInfo       (api.body="prompt_info")                                        , // prompt 信息
    4 : list<PluginInfo>   PluginInfoList   (api.body="plugin_info_list")                                   , // plugin列表
    5 : Knowledge          Knowledge        (api.body="knowledge")                                          , // 数据集
    6 : list<WorkflowInfo> WorkflowInfoList (api.body="workflow_info_list")                                 , // Workflow 列表
    7 : ModelInfo          ModelInfo        (api.body="model_info")                                         , // 模型配置
    8 : list<Intent>       Intents          (api.body="intents")                                            , // 意图信息
    9 : AgentType          AgentType        (api.body="agent_type")                                         ,
    10: bool               RootAgent        (api.body="root_agent")                                         , // 是否是rootagent
    11: i64                ReferenceId      (agw.js_conv="str", api.js_conv="true", api.body="reference_id"),
    12: string             FirstVersion     (api.body="first_version")                                      ,
    13: string             LastVersion      (api.body="last_version")                                       ,
    14: AgentPosition      AgentPosition    (api.body="agent_position")                                     ,
    15: string             IconUri          (api.body="icon_uri")                                           ,
    16: JumpConfig         JumpConfig       (api.body="jump_config")                                        ,
    17: SuggestReplyInfo   SuggestReplyInfo (api.body="suggest_reply_info")                                 ,
    18: string             Description      (api.body="description")                                        ,
    19: AgentVersionCompat VersionCompat    (api.body="version_compat")                                     , // multi_agent版本兼容字段
    20: optional HookInfo  HookInfo         (api.body="hook_info")                                          ,
    21: optional string                 CurrentVersion                  (api.body="current_version")        ,   //子bot当前版本
    22: optional ReferenceInfoStatus    ReferenceInfoStatus             (api.body="reference_info_status")  ,   // 1:有可用更新 2:被删除
    23: optional ReferenceUpdateType    UpdateType                      (api.body="update_type")            ,   //子bot更新类型
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

enum BotSpecies { // bot种类
    Default  = 0, // 从flow创建
    Function = 1, // 从coze创建
}

enum TimeCapsuleMode {
    Off = 0, // 关
    On  = 1, // 开
}
enum DisablePromptCalling {
    Off = 0,
    On  = 1,
}

// 时间胶囊信息
struct TimeCapsuleInfo {
    1: optional TimeCapsuleMode TimeCapsuleMode (api.body="time_capsule_mode"),
    2: optional DisablePromptCalling DisablePromptCalling (api.body="disable_prompt_calling"),
}

struct BotTagInfo {
    1: optional TimeCapsuleInfo TimeCapsuleInfo (api.body="time_capsule_info"), // 时间胶囊信息 tag key : time_capsule
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

// bot信息
struct BotInfo {
    1 : i64                BotId            (agw.js_conv="str", api.js_conv="true", api.body="bot_id")      , // bot id
    2 : string             Name             (api.body="name")                                               , // bot名称
    3 : string             Description      (api.body="description")                                        , // bot描述
    4 : string             IconUri          (api.body="icon_uri")                                           , // bot 图标uri
    5 : string             IconUrl          (api.body="icon_url")                                           , // bot 图标url
    6 : i64                CreatorId        (agw.js_conv="str", api.js_conv="true", api.body="creator_id")  , // 创建人id
    7 : i64                CreateTime       (agw.js_conv="str", api.js_conv="true", api.body="create_time") , // 创建时间
    8 : i64                UpdateTime       (agw.js_conv="str", api.js_conv="true", api.body="update_time") , // 更新时间
    9 : i64                ConnectorId      (agw.js_conv="str", api.js_conv="true", api.body="connector_id"), // 业务线
    10: string             Version          (api.body="version")                                            , // 版本，毫秒
    11: ModelInfo          ModelInfo        (api.body="model_info")                                         , // 模型配置
    12: PromptInfo         PromptInfo       (api.body="prompt_info")                                        , // prompt 信息
    13: list<PluginInfo>   PluginInfoList   (api.body="plugin_info_list")                                   , // plugin列表
    14: list<WorkflowInfo> WorkflowInfoList (api.body="workflow_info_list")                                 , // Workflow 列表
    15: OnboardingInfo     OnboardingInfo   (api.body="onboarding_info")                                    , // 开场白
    16: Knowledge          Knowledge        (api.body="knowledge")                                          , // 数据集
    17: list<Variable>     VariableList     (api.body="variable_list")                                      , // kv存储
    18: TaskInfo           TaskInfo         (api.body="task_info")                                          , // 任务管理/预设任务
    19: list<Database>     DatabaseList     (api.body="database_list")                                      , // 数据表
    20: SuggestReplyInfo   SuggestReplyInfo (api.body="suggest_reply_info")                                 , // 推荐问题
    21: VoicesInfo         VoicesInfo       (api.body="voices_info")                                        , // 音色配置
    22: BotExtInfo         BotExtInfo       (api.body="bot_ext_info")                                       , // 额外信息，扩展字段
    23: BotMode            BotMode          (api.body="bot_mode")                                           , // bot 类型，single agent or multi agent
    24: list<Agent>        Agents           (api.body="agents")                                             , // multi agent mode agent信息
    25: BotSpecies         BotSpecies       (api.body="bot_species")                                        , // Bot种类
    26: BotTagInfo         BotTagInfo       (api.body="bot_tag_info")                                       , // bot tag 信息，用户新增字段
    27: FileboxInfo        FileboxInfo      (api.body="filebox_info")                                       , // filebox 信息
    28: MultiAgentInfo     MultiAgentInfo   (api.body="multi_agent_info")                                   , // multi_agent结构体
    29: list<BackgroundImageInfo> BackgroundImageInfoList   (api.body="background_image_info_list")         , // 背景图列表结构体
    30: list<string>       ShortcutSort     (api.body="shortcut_sort")                                      ,
    31: BotStatus          Status           (api.body="status")                                             , // bot状态
    32: optional HookInfo  HookInfo         (api.body="hook_info")                                          , // hook信息
    33: UserQueryCollectConf UserQueryCollectConf (api.body="user_query_collect_conf") , // 用户query收集配置
    34: LayoutInfo         LayoutInfo       (api.body="layout_info")                                        , // workflow模式的编排信息
    35: BusinessType       BusinessType     (api.body="business_type")
}


struct CommonKnowledge {
    1:  list<KnowledgeInfo> knowledge_infos   , // 知识库信息
}

struct ShortcutCommandComponent { // panel参数
    1 : string name  //参数名字
    2 : string description //参数描述
    3 : string type // 输入类型 text、select、file
    4 : optional string tool_parameter  // 请求工具时，参数的key 对应tool的参数名称，没有则为不返回
    5 : optional list<string> options // type为select时的可选项列表 or type为file时，支持哪些类型 image、doc、table、audio、video、zip、code、txt、ppt
    6 : optional string default_value // 默认值 没配置时不返回
    7 : bool is_hide // 是否隐藏不展示 线上bot tool类型的快捷指令不返回hide=true的component
}

struct ShortcutCommandToolInfo {
    1: string name //
    2: string type // tool类型 workflow plugin
}

struct ShortcutCommandInfo {
    1: i64 id (api.js_conv="true") // 快捷指令id
    2: string name // 快捷指令按钮名称
    3: string command // 快捷指令
    4: string description // 快捷指令描述
    5: string query_template // 指令query模版
    6: string icon_url // 快捷指令icon
    7: optional list<ShortcutCommandComponent> components // 组件列表（参数列表）
    8: optional ShortcutCommandToolInfo tool // tool信息
    9: optional i64 agent_id (api.js_conv="true") //multi的指令时，该指令由哪个节点执行 没配置不返回
}


struct OpenAPIBotInfo {
    1 : i64 bot_id  (api.js_conv="true")  ,                                // bot id
    2 : string name,                                  // bot名称
    3 : string description,                           // bot描述
    4 : string icon_url,                              // bot图像url
    5 : i64 create_time,                              // 创建时间
    6 : i64 update_time,                              // 更新时间
    7 : string version,                               // 版本
    8 : PromptInfo prompt_info,                       // prompt 信息
    9 : OnboardingInfo onboarding_info,             // 开场白
    10: BotMode bot_mode,                  // bot 类型，single agent or multi agent
//    11: optional list<VoiceData> voice_data_list,     // 选择的语音信息
    12: optional ModelInfo model_info,                // 模型信息
    13: list<PluginInfo> plugin_info_list,            // 插件信息列表
    14: optional CommonKnowledge knowledge            // 知识库信息
    15: list<WorkflowInfo> workflow_info_list,        // workflow信息列表
    16: list<ShortcutCommandInfo> shortcut_commands,  // 快捷指令信息列表
//    17: list<Voice> voice_info_list,                  // 音色配置
    18: string default_user_input_type,               // 默认用户输入类型
    19: SuggestReplyInfo suggest_reply_info,          // 用户问题建议
    20: BackgroundImageInfo background_image_info,    // 背景图片
    21: list<Variable> variables,                // 变量列表
}



struct LayoutInfo {
    1: string       WorkflowId               (api.body="workflow_id")                                        , // workflowId
    2: string       PluginId                 (api.body="plugin_id")                                          , // PluginId
}

struct UserQueryCollectConf {
    1: bool      IsCollected       (api.body="is_collected")   , // 是否开启收集开关
    2: string    PrivatePolicy     (api.body="private_policy") , // 隐私协议链接
}

struct MultiAgentInfo {
    1: MultiAgentSessionType SessionType   (api.body="session_type")                                       , // multi_agent会话接管方式
    2: AgentVersionCompatInfo VersionCompatInfo    (api.body="version_compat_info")                        , // multi_agent版本兼容字段 前端用
    3: MultiAgentConnectorType ConnectorType    (api.body="connector_type")                                  , // multi_agent连线类型 前端用
}

struct AgentVersionCompatInfo {
    1: AgentVersionCompat  VersionCompat      (api.body="version_compat")                              ,
    2: string version
}

struct BackgroundImageInfo {
    1: optional BackgroundImageDetail WebBackgroundImage   (api.body="web_background_image")                             , // web端背景图
    2: optional BackgroundImageDetail MobileBackgroundImage    (api.body="mobile_background_image")                             , // 移动端背景图
}

struct BackgroundImageDetail {
    1: optional string OriginImageUri    (api.body="origin_image_uri")            // 原始图片
    2: optional string OriginImageUrl    (api.body="origin_image_url")
    3: optional string ImageUri  (api.body="image_uri")               // 实际使用图片
    4: optional string ImageUrl  (api.body="image_url")
    5: optional string ThemeColor    (api.body="theme_color")
    6: optional GradientPosition GradientPosition  (api.body="gradient_position") // 渐变位置
    7: optional CanvasPosition CanvasPosition    (api.body="canvas_position") // 裁剪画布位置
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


// bot信息 for 更新
struct BotInfoForUpdate {
    1:  optional i64 BotId  (agw.js_conv="str", api.js_conv="true",api.body="bot_id") // bot id
    2:  optional string Name  (api.body="name")                                      // bot名称
    3:  optional string Description (api.body="description")                         // bot描述
    4:  optional string IconUri (api.body="icon_uri")                             // bot 图标uri
    5:  optional string IconUrl (api.body="icon_url")                             // bot 图标url
    6:  optional i64 CreatorId  (agw.js_conv="str", api.js_conv="true", api.body="creator_id")                             // 创建人id
    7:  optional i64 CreateTime (agw.js_conv="str", api.js_conv="true", api.body="create_time")                             // 创建时间
    8:  optional i64 UpdateTime (agw.js_conv="str", api.js_conv="true", api.body="update_time")                             // 更新时间
    9:  optional i64 ConnectorId (agw.js_conv="str", api.js_conv="true", api.body="connector_id")                         // 业务线
    10: optional string Version (api.body="version")                                                  // 版本，毫秒
    11: optional ModelInfo ModelInfo    (api.body="model_info")                                             // 模型配置
    12: optional PromptInfo PromptInfo  (api.body="prompt_info")                                           // prompt 信息
    13: optional list<PluginInfo> PluginInfoList (api.body="plugin_info_list")                                 // plugin列表
    14: optional list<WorkflowInfo> WorkflowInfoList  (api.body="workflow_info_list")                             // Workflow 列表
    15: optional OnboardingInfo OnboardingInfo  (api.body="onboarding_info")                                   // 开场白
    16: optional Knowledge Knowledge    (api.body="knowledge")                                             // 数据集
    17: optional list<Variable> VariableList    (api.body="variable_list")                                     // kv存储
    18: optional TaskInfo TaskInfo  (api.body="task_info")                                               // 任务管理/预设任务
    19: optional list<Database> DatabaseList    (api.body="database_list")                                     // 数据表
    20: optional SuggestReplyInfo SuggestReplyInfo  (api.body="suggest_reply_info")                               // 推荐问题
    21: optional VoicesInfo VoicesInfo  (api.body="voices_info")                                           // 音色配置
    22: optional BotExtInfo BotExtInfo  (api.body="bot_ext_info")                                          // 额外信息，扩展字段
    23: optional BotMode BotMode    (api.body="bot_mode")                                                 // bot 类型，single agent or multi agent
    24: optional list<AgentForUpdate> Agents    (api.body="agents")                                       // multi agent mode agent信息
    25: BotSpecies BotSpecies   (api.body="bot_species")                                                   // Bot种类
    26: optional BotTagInfo BotTagInfo  (api.body="bot_tag_info")                                           // bot tag 信息，用户新增字段
    27: optional FileboxInfo        FileboxInfo (api.body="filebox_info")                                           // filebox 信息
    28: optional MultiAgentInfo     MultiAgentInfo  (api.body="multi_agent_info")                               // multi_agent结构体
    29: optional list<BackgroundImageInfo> BackgroundImageInfoList  (api.body="background_image_info_list")               // 背景图列表结构体
    30: optional list<string>             ShortcutSort  (api.body="shortcut_sort")
    31: optional HookInfo             HookInfo (api.body="hook_info")
    32: optional UserQueryCollectConf     UserQueryCollectConf (api.body="user_query_collect_conf")// 用户query收集配置
    33: optional LayoutInfo               LayoutInfo(api.body="layout_info")                           // workflow模式的编排信息
}

struct AgentForUpdate {
   1: optional i64 AgentId (agw.js_conv="str", api.js_conv="true", api.body="id") // agw字段名做了特殊映射 注意
   2: optional string AgentName (api.body="name") // agw字段名做了特殊映射 注意
   3: optional PromptInfo PromptInfo (api.body="prompt_info")                      // prompt 信息
   4: optional list<PluginInfo> PluginInfoList (api.body="plugin_info_list")             // plugin列表
   5: optional Knowledge Knowledge (api.body="knowledge")                         // 数据集
   6: optional list<WorkflowInfo> WorkflowInfoList (api.body="workflow_info_list")         // Workflow 列表
   7: optional ModelInfo ModelInfo (api.body="model_info")                         // 模型配置
   8: optional list<Intent> Intents (api.body="intents")                        // 意图信息
   9: optional AgentType AgentType (api.body="agent_type")
   10: optional bool RootAgent (api.body="root_agent")                             // 是否是rootagent
   11: optional i64 ReferenceId (agw.js_conv="str", api.js_conv="true", api.body="reference_id")
   12: optional string FirstVersion (api.body="first_version")
   13: optional string LastVersion (api.body="last_version")
   14: optional AgentPosition  Position (api.body="agent_position")
   15: optional string  IconUri (api.body="icon_uri")
   16: optional JumpConfig JumpConfig (api.body="jump_config")
   17: optional SuggestReplyInfo SuggestReplyInfo (api.body="suggest_reply_info")
   18: optional string  Description (api.body="description")
   19: optional AgentVersionCompat VersionCompat (api.body="version_compat")           // multi_agent版本兼容字段
   20: optional HookInfo HookInfo (api.body="hook_info")
}

struct TableDetail {
    1: optional string TableId                   // table id
    2: optional string TableName                 // table名称
    3: optional string TableDesc                 // table简介
    4: optional list<FieldItem> FieldList        // table字段信息
    5: optional bool            PromptDisabled (api.body="prompt_disabled"), // 是否支持在Prompt中调用 默认支持
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
    1: optional string TaskId                    // 任务唯一标识
    2: optional string UserQuestion              // 定时器触发时执行的 query，例如：提醒我喝水. 二期：TriggerType == "Time"
    3: optional string CreateTime                // 定时任务创建时间
    4: optional string NextTime                  // 定时任务下次执行的时间点
    5: optional i64 Status                       // 任务状态：有效/无效
    6: optional i32 PresetType                   // 1-草稿，2-线上
    7: optional string CronExpr                  // 定时任务的 crontab 表达式
    8: optional string TaskContent               // 处理过后的 UserQuestion，例如：喝水
    9: optional string TimeZone                  // 时区
    10: optional string TaskName                 // 任务名称
    11: optional string TriggerType              // "Time", "Event"
    12: optional string Action                   // "Bot query", "Plugin", "Workflow"
    13: optional string BotQuery                 // Action == "Bot query" 时的输入
    14: optional string PluginName               // plugin 和 workflow 都用这个字段
    15: optional TaskPluginInput PluginInput     // plugin 和 workflow 都用这个字段
    16: optional string WebhookUrl               // TriggerType == "Event"
    17: optional string WebhookBearerToken       // TriggerType == "Event"
    18: optional TaskWebhookOutput WebhookOutput // TriggerType == "Event"
    19: optional string OriginId                    // 溯源 ID。创建时生成，更新/发布不变
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

struct MessageFeedback {
    1: MessageFeedbackType feedback_type    // 反馈类型
    2: list<MessageFeedbackDetailType> detail_types   // 细分类型
    3: string detail_content            // 负反馈自定义内容，对应用户选择Others
}

enum MessageFeedbackType {
    Default = 0
    Like = 1
    Unlike = 2
}

enum MessageFeedbackDetailType {
    UnlikeDefault = 0
    UnlikeHarmful = 1 // 有害信息
    UnlikeIncorrect = 2 // 信息有误
    UnlikeNotFollowInstructions = 3 // 未遵循指令
    UnlikeOthers = 4 // 其他
}

enum Scene{
    Default  = 0,
    Explore  = 1,
    BotStore = 2,
    CozeHome = 3,
    Playground = 4,
    Evaluation = 5, // 评测平台
    AgentAPP = 6,
    PromptOptimize = 7, //prompt优化
    GenerateAgentInfo = 8 // createbot的nl2bot功能
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
    1: optional list<HookItem> pre_agent_jump_hook // pre agent跳转hook
    2: optional list<HookItem> post_agent_jump_hook // post agent跳转hook
    3: optional list<HookItem> flow_hook // 流程hook
    4: optional list<HookItem> atomic_hook // 原子能力hook
    5: optional list<HookItem> llm_call_hook // 模型调用hook
    6: optional list<HookItem> res_parsing_hook // 对话结果hook
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
//     2: string Content(api.body = "content")     // 内容
//     3: map<string,string> MetaData(api.body = "meta_data")
//     4: string ContentType(api.body = "content_type")//text/card/object_string
//     5: string Type(api.body = "type")
// }

// struct OpenMessageApi {
//     1: string Id(api.body = "id")             // 主键ID
//     2: string BotId(api.body = "bot_id")        // bot id //已TODO 所有的i64加注解str,入参和出参都要
//     3: string Role(api.body = "role")
//     4: string Content(api.body = "content")          // 内容
//     5: string ConversationId(api.body = "conversation_id")   // conversation id
//     6: map<string,string> MetaData(api.body = "meta_data")
//     7: string CreatedAt(api.body = "created_at")      // 创建时间
//     8: string UpdatedAt(api.body = "updated_at")      // 更新时间 //已TODO 时间改成int
//     9: string ChatId(api.body = "chat_id")
//     10: string ContentType(api.body = "content_type")
//     11: string Type(api.body = "type")
// }

enum ReferenceUpdateType {
    ManualUpdate = 1
    AutoUpdate = 2
}

enum ReferenceInfoStatus {
    HasUpdates = 1 // 1:有可用更新
    IsDelete   = 2 // 2:被删除
}
