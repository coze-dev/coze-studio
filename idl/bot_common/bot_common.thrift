namespace go ocean.cloud.bot_common

struct PromptInfo {
    1: optional string Prompt (agw.key="prompt"), // 文本prompt
}

struct ModelInfo {
    1: optional i64                 ModelId           (agw.js_conv="str", api.js_conv="true", agw.key="model_id"), // 模型id
    2: optional double              Temperature       (agw.key="temperature")                                    , // 温度，模型输出随机性，值越大越随机，越小越保守(0-1]
    3: optional i32                 MaxTokens         (agw.key="max_tokens")                                     , // 回复最大Token数
    4: optional double              TopP              (agw.key="top_p")                                          , // 另一种模型的输出随机性，值越大越随机[0,1]
    5: optional double              FrequencyPenalty  (agw.key="frequency_penalty")                              , // 频率惩罚，调整生成内容中的单词频率，正值单词越少见[-1.0,1.0]
    6: optional double              PresencePenalty   (agw.key="presence_penalty")                               , // 存在惩罚，调整生成内容中新词语频率，正值避免重复单词，用新词[-1.0,1.0]
    7: optional ShortMemoryPolicy   ShortMemoryPolicy (agw.key="short_memory_policy")                            , // 上下文策略
    8: optional i32                 TopK              (agw.key="top_k")                                          , // 生成时，采样候选集的大小
    9: optional ModelResponseFormat ResponseFormat    (agw.key="response_format")                                , // 模型回复内容格式
    10: optional ModelStyle         ModelStyle        (agw.key="model_style")                                    , // 用户选择的模型风格
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
    1: optional ContextMode ContextMode  (agw.key="context_mode") , // 上下文允许传输的类型
    2: optional i32         HistoryRound (agw.key="history_round"), // 上下文带的轮数
}

struct PluginInfo {
    1: optional i64 PluginId (agw.js_conv="str", api.js_conv="true", agw.key="plugin_id"), // 插件id
    2: optional i64 ApiId    (agw.js_conv="str", api.js_conv="true", agw.key="api_id")   , // api Id
    3: optional string ApiName (agw.js_conv="str", api.js_conv="true", agw.key="api_name")   , // api name O项目用

    100: optional i64 ApiVersionMs (agw.js_conv="str", api.js_conv="true", agw.key="api_version_ms"), // api version
}

struct WorkflowInfo {
    1: optional i64 WorkflowId (agw.js_conv="str", api.js_conv="true", agw.key="workflow_id"), // WorkflowId
    2: optional i64 PluginId   (agw.js_conv="str", api.js_conv="true", agw.key="plugin_id")  , // 插件id
    3: optional i64 ApiId      (agw.js_conv="str", api.js_conv="true", agw.key="api_id")     , // api Id
    4: optional WorkflowMode FlowMode  (agw.js_conv="str", api.js_conv="true", agw.key="flow_mode") // workflow or imageflow, 默认为workflow
    5: optional string WorkflowName (agw.js_conv="str", api.js_conv="true", agw.key="workflow_name")   , // workflow name
    6: optional string Desc (api.body="desc", agw.key="desc"),
    7: optional list<PluginParameter> Parameters (api.body="parameters", agw.key="parameters"),
    8: optional string PluginIcon (api.body="plugin_icon", agw.key="plugin_icon"),
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
    1: optional string         Prologue                   (agw.key="prologue")                    , // 开场白
    2: optional list<string>   SuggestedQuestions         (agw.key="suggested_questions")         , // 建议问题
    3: optional OnboardingMode OnboardingMode             (agw.key="onboarding_mode")             , // 开场白模型
    4: optional string         CustomizedOnboardingPrompt (agw.key="customized_onboarding_prompt"), // LLM生成，用户自定义 Prompt
    5: optional SuggestedQuestionsShowMode SuggestedQuestionsShowMode (agw.key="suggested_questions_show_mode")         , // 开场白预设问题展示方式 默认0 随机展示
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
    1: optional SuggestReplyMode SuggestReplyMode        (agw.key="suggest_reply_mode")       , // 建议问题模型
    2: optional string           CustomizedSuggestPrompt (agw.key="customized_suggest_prompt"), // 用户自定义建议问题
    3: optional string           ChainTaskName           (agw.key="chain_task_name")          , // 运行Prompt的ChainTask名称
}

// tts Voices
struct VoicesInfo {                                 // 对应 Coze Voices
    1: optional bool            Muted         (agw.key="muted")          , // 是否开启声音 true:禁用  false:开启
    2: optional map<string,i64> I18nLangVoice (agw.key="i18n_lang_voice"), // 多语音音色配置
    7: optional map<string,string> I18nLangVoiceStr (agw.key="i18n_lang_voice_str"), // 多语音音色配置, string类型
    3: optional bool            Autoplay      (agw.key="autoplay")       , // 是否自动播放
    4: optional map<string,i64> AutoplayVoice (agw.key="autoplay_voice") , // 自动播放的音色
    5: optional bool            CloseVoiceCall (agw.key="voice_call")     , // 是否关闭语音通话，true:关闭 false:开启  默认为false
    6: optional DefaultUserInputType   DefaultUserInputType (agw.key="default_user_input_type"), // 默认用户输入类型
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
    1: AnswerActionTriggerType Type           (agw.key="type")           ,
    2: bool                    NeedPreloading (agw.key="need_preloading"),
    3: map<string,string>      TriggerData    (agw.key="trigger_data")   , // 根据 AnswerActionTriggerType决定
}

struct ActionIcon {
    1: string Type       (agw.key="type")       , // 自定义的按钮 type 不用传
    2: string DefaultUrl (agw.key="default_url"), // 默认状态
    3: string ActiveUrl  (agw.key="active_url") , // 按下按钮的状态
    4: string DefaultUri (agw.key="default_uri"), // 默认状态
    5: string ActiveUri  (agw.key="active_uri") , // 按下按钮的状态
}

struct AnswerActionConfig {
    1: string                  Key         (agw.key="key")         , // 预制的只需要传key
    2: string                  Name        (agw.key="name")        , // 默认
    3: ActionIcon              Icon        (agw.key="icon")        , // 下发uri
    4: map<string,string>      NameI18n    (agw.key="name_i18n")   , // 存储用户i18的name
    5: AnswerActionTriggerRule TriggerRule (agw.key="trigger_rule"), // Direct 没有值； WebView 包含 webview_url和 webview_callback_psm两个key；SendMessage 包含send_message_prompt
    6: i32                     Position    (agw.key="position")    , // 位置
}

struct AnswerActions {
    1: AnswerActionsMode        AnswerActionsMode   (agw.key="answer_actions_mode")  ,
    2: list<AnswerActionConfig> AnswerActionConfigs (agw.key="answer_action_configs"),
}

// bot ext
struct BotExtInfo {
    1: optional AnswerActions AnswerActions   (agw.key="answer_actions")   ,
    2: optional list<i32>     CardIds         (agw.key="card_ids")         ,
    3: optional i32           PromptId        (agw.key="prompt_id")        ,
    4: optional string        BotTemplateName (agw.key="bot_template_name"),
    5: optional bool          UseUGCVoice     (agw.key="use_ugc_voice")    ,
    6: optional i32           AppId           (agw.key="app_id")           ,
    7: optional bool          BindingMp       (agw.key="binding_mp")       , // 是否绑定小程序标识
}

struct KnowledgeInfo {
    1: optional string Id   (agw.key="id")  , // 知识库id
    2: optional string Name (agw.key="name"), // 知识库名称
}

enum SearchStrategy {
    SemanticSearch = 0, // 语义搜索
    HybirdSearch   = 1, // 混合搜索
    FullTextSearch = 20, // 全文搜索
}

struct Knowledge {
    1: optional list<KnowledgeInfo> KnowledgeInfo  (agw.key="knowledge_info") , // 知识库信息
    2: optional i64                 TopK           (agw.key="top_k")          , // 召回最大数据量
    3: optional double              MinScore       (agw.key="min_score")      , // 最小匹配度
    4: optional bool                Auto           (agw.key="auto")           , // 自动召回
    5: optional SearchStrategy      SearchStrategy (agw.key="search_strategy"), // 搜索策略
    6: optional bool                ShowSource     (agw.key="show_source"),     // 是否展示来源
    7: optional KnowledgeNoRecallReplyMode NoRecallReplyMode (agw.key="no_recall_reply_mode"),     // 无召回回复mode，默认0
    8: optional string NoRecallReplyCustomizePrompt (agw.key="no_recall_reply_customize_prompt"),     // 无召回回复时自定义prompt，当NoRecallReplyMode=1时生效
    9: optional KnowledgeShowSourceMode ShowSourceMode (agw.key="show_source_mode"),     // 来源展示方式 默认值0 卡片列表方式
    10: optional RecallStrategy     RecallStrategy (agw.key="recall_strategy"), // 召回策略, 默认值为true
}

struct RecallStrategy {
    1: optional bool                UseRerank  (agw.key="use_rerank"),
    2: optional bool                UseRewrite (agw.key="use_rewrite"),
    3: optional bool                UseNl2sql  (agw.key="use_nl2sql")
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
    1: SocietyVisibility VisibilityType (agw.key="visibility_type", go.tag="json:\"visibility_type,omitempty\"") , // 社会场景中可见性: Public = 1,Anonymous = 2
    2: list<string> VisibilityRoles     (agw.key="visibility_roles", go.tag="json:\"visibility_roles,omitempty\""), // 可见角色列表
}

struct Variable {
    1: optional string Key          (agw.key="key")          , // key, Field
    2: optional string Description  (agw.key="description")  , // 描述
    3: optional string DefaultValue (agw.key="default_value"), // 默认值
    4: optional bool   IsSystem     (agw.key="is_system"),     // 是否系统值系统值
    5: optional bool   PromptDisabled (agw.key="prompt_disabled"), // 是否支持在Prompt中调用 默认支持
    6: optional SocietyVisibiltyConfig SocietyVisibilityConfig (agw.key="society_visibility_config", go.tag="json:\"society_visibility_config,omitempty\""), // 社会场景中可见性: Public = 1,Anonymous = 2
    7: optional bool   IsDisabled (agw.key="is_disabled"),  // 是否禁用，默认为false代表启用
}

struct TaskInfo {                                // coze 上的 Scheduled Tasks
    1: optional bool UserTaskAllowed  (agw.key="user_task_allowed") , // 用户开启task任务
    2: optional i64  EnablePresetTask (agw.key="enable_preset_task"), // 允许预设任务
}

enum FieldItemType {
    Text    = 1, // 文本 String
    Number  = 2, // 数字 Integer
    Date    = 3, // 时间 Time
    Float   = 4, // float Number
    Boolean = 5, // bool Boolean
}

struct FieldItem {
    1: optional string        Name         (agw.key="name")                                     , // 字段名称
    2: optional string        Desc         (agw.key="desc")                                     , // 字段描述
    3: optional FieldItemType Type         (agw.key="type")                                     , // 字段类型
    4: optional bool          MustRequired (agw.key="must_required")                            , // 是否必填
    5: optional i64           Id           (agw.js_conv="str", api.js_conv="true", agw.key="id"), // 字段Id 新增为0
    6: optional string        TypeStr      (agw.key="type_str")                                 , // 字段类型 str
    7: optional i64           AlterId      (agw.key="alterId")                                 , // 字段类型 str
}

struct Database {
    1: optional string          TableId   (agw.key="table_id")  , // table id
    2: optional string          TableName (agw.key="table_name"), // table名称
    3: optional string          TableDesc (agw.key="table_desc"), // table简介
    4: optional list<FieldItem> FieldList (agw.key="field_list"), // table字段信息
    5: optional bool            PromptDisabled (agw.key="prompt_disabled"), // 是否支持在Prompt中调用 默认支持
    6: optional BotTableRWMode  RWMode    (agw.key="rw_mode"),
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
    1 : i64                AgentId          (agw.js_conv="str", api.js_conv="true", agw.key="agent_id")    ,
    2 : string             AgentName        (agw.key="agent_name")                                         ,
    3 : PromptInfo         PromptInfo       (agw.key="prompt_info")                                        , // prompt 信息
    4 : list<PluginInfo>   PluginInfoList   (agw.key="plugin_info_list")                                   , // plugin列表
    5 : Knowledge          Knowledge        (agw.key="knowledge")                                          , // 数据集
    6 : list<WorkflowInfo> WorkflowInfoList (agw.key="workflow_info_list")                                 , // Workflow 列表
    7 : ModelInfo          ModelInfo        (agw.key="model_info")                                         , // 模型配置
    8 : list<Intent>       Intents          (agw.key="intents")                                            , // 意图信息
    9 : AgentType          AgentType        (agw.key="agent_type")                                         ,
    10: bool               RootAgent        (agw.key="root_agent")                                         , // 是否是rootagent
    11: i64                ReferenceId      (agw.js_conv="str", api.js_conv="true", agw.key="reference_id"),
    12: string             FirstVersion     (agw.key="first_version")                                      ,
    13: string             LastVersion      (agw.key="last_version")                                       ,
    14: AgentPosition      AgentPosition    (agw.key="agent_position")                                     ,
    15: string             IconUri          (agw.key="icon_uri")                                           ,
    16: JumpConfig         JumpConfig       (agw.key="jump_config")                                        ,
    17: SuggestReplyInfo   SuggestReplyInfo (agw.key="suggest_reply_info")                                 ,
    18: string             Description      (agw.key="description")                                        ,
    19: AgentVersionCompat VersionCompat    (agw.key="version_compat")                                     , // multi_agent版本兼容字段
    20: optional HookInfo  HookInfo         (agw.key="hook_info")                                          ,
    21: optional string                 CurrentVersion                  (agw.key="current_version")        ,   //子bot当前版本
    22: optional ReferenceInfoStatus    ReferenceInfoStatus             (agw.key="reference_info_status")  ,   // 1:有可用更新 2:被删除
    23: optional ReferenceUpdateType    UpdateType                      (agw.key="update_type")            ,   //子bot更新类型
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
    1: string IntentId    (agw.key="intent_id")                                           ,
    2: string Prompt      (agw.key="prompt")                                              ,
    3: i64    NextAgentId (agw.js_conv="str", api.js_conv="true", agw.key="next_agent_id"),
    4: MultiAgentSessionType SessionType (agw.key="session_type")
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
    1: optional TimeCapsuleMode TimeCapsuleMode (agw.key="time_capsule_mode"),
    2: optional DisablePromptCalling DisablePromptCalling (agw.key="disable_prompt_calling"),
}

struct BotTagInfo {
    1: optional TimeCapsuleInfo TimeCapsuleInfo (agw.key="time_capsule_info"), // 时间胶囊信息 tag key : time_capsule
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
    1 : i64                BotId            (agw.js_conv="str", api.js_conv="true", agw.key="bot_id")      , // bot id
    2 : string             Name             (agw.key="name")                                               , // bot名称
    3 : string             Description      (agw.key="description")                                        , // bot描述
    4 : string             IconUri          (agw.key="icon_uri")                                           , // bot 图标uri
    5 : string             IconUrl          (agw.key="icon_url")                                           , // bot 图标url
    6 : i64                CreatorId        (agw.js_conv="str", api.js_conv="true", agw.key="creator_id")  , // 创建人id
    7 : i64                CreateTime       (agw.js_conv="str", api.js_conv="true", agw.key="create_time") , // 创建时间
    8 : i64                UpdateTime       (agw.js_conv="str", api.js_conv="true", agw.key="update_time") , // 更新时间
    9 : i64                ConnectorId      (agw.js_conv="str", api.js_conv="true", agw.key="connector_id"), // 业务线
    10: string             Version          (agw.key="version")                                            , // 版本，毫秒
    11: ModelInfo          ModelInfo        (agw.key="model_info")                                         , // 模型配置
    12: PromptInfo         PromptInfo       (agw.key="prompt_info")                                        , // prompt 信息
    13: list<PluginInfo>   PluginInfoList   (agw.key="plugin_info_list")                                   , // plugin列表
    14: list<WorkflowInfo> WorkflowInfoList (agw.key="workflow_info_list")                                 , // Workflow 列表
    15: OnboardingInfo     OnboardingInfo   (agw.key="onboarding_info")                                    , // 开场白
    16: Knowledge          Knowledge        (agw.key="knowledge")                                          , // 数据集
    17: list<Variable>     VariableList     (agw.key="variable_list")                                      , // kv存储
    18: TaskInfo           TaskInfo         (agw.key="task_info")                                          , // 任务管理/预设任务
    19: list<Database>     DatabaseList     (agw.key="database_list")                                      , // 数据表
    20: SuggestReplyInfo   SuggestReplyInfo (agw.key="suggest_reply_info")                                 , // 推荐问题
    21: VoicesInfo         VoicesInfo       (agw.key="voices_info")                                        , // 音色配置
    22: BotExtInfo         BotExtInfo       (agw.key="bot_ext_info")                                       , // 额外信息，扩展字段
    23: BotMode            BotMode          (agw.key="bot_mode")                                           , // bot 类型，single agent or multi agent
    24: list<Agent>        Agents           (agw.key="agents")                                             , // multi agent mode agent信息
    25: BotSpecies         BotSpecies       (agw.key="bot_species")                                        , // Bot种类
    26: BotTagInfo         BotTagInfo       (agw.key="bot_tag_info")                                       , // bot tag 信息，用户新增字段
    27: FileboxInfo        FileboxInfo      (agw.key="filebox_info")                                       , // filebox 信息
    28: MultiAgentInfo     MultiAgentInfo   (agw.key="multi_agent_info")                                   , // multi_agent结构体
    29: list<BackgroundImageInfo> BackgroundImageInfoList   (agw.key="background_image_info_list")         , // 背景图列表结构体
    30: list<string>       ShortcutSort     (agw.key="shortcut_sort")                                      ,
    31: BotStatus          Status           (agw.key="status")                                             , // bot状态
    32: optional HookInfo  HookInfo         (agw.key="hook_info")                                          , // hook信息
    33: UserQueryCollectConf UserQueryCollectConf (agw.key="user_query_collect_conf") , // 用户query收集配置
    34: LayoutInfo         LayoutInfo       (agw.key="layout_info")                                        , // workflow模式的编排信息
    35: BusinessType       BusinessType     (agw.key="business_type")
}

struct LayoutInfo {
    1: string       WorkflowId               (agw.key="workflow_id")                                        , // workflowId
    2: string       PluginId                 (agw.key="plugin_id")                                          , // PluginId
}

struct UserQueryCollectConf {
    1: bool      IsCollected       (agw.key="is_collected")   , // 是否开启收集开关
    2: string    PrivatePolicy     (agw.key="private_policy") , // 隐私协议链接
}

struct MultiAgentInfo {
    1: MultiAgentSessionType SessionType   (agw.key="session_type")                                       , // multi_agent会话接管方式
    2: AgentVersionCompatInfo VersionCompatInfo    (agw.key="version_compat_info")                        , // multi_agent版本兼容字段 前端用
    3: MultiAgentConnectorType ConnectorType    (agw.key="connector_type")                                  , // multi_agent连线类型 前端用
}

struct AgentVersionCompatInfo {
    1: AgentVersionCompat  VersionCompat      (agw.key="version_compat")                              ,
    2: string version
}

struct BackgroundImageInfo {
    1: optional BackgroundImageDetail WebBackgroundImage   (agw.key="web_background_image")                             , // web端背景图
    2: optional BackgroundImageDetail MobileBackgroundImage    (agw.key="mobile_background_image")                             , // 移动端背景图
}

struct BackgroundImageDetail {
    1: optional string OriginImageUri    (agw.key="origin_image_uri")            // 原始图片
    2: optional string OriginImageUrl    (agw.key="origin_image_url")
    3: optional string ImageUri  (agw.key="image_uri")               // 实际使用图片
    4: optional string ImageUrl  (agw.key="image_url")
    5: optional string ThemeColor    (agw.key="theme_color")
    6: optional GradientPosition GradientPosition  (agw.key="gradient_position") // 渐变位置
    7: optional CanvasPosition CanvasPosition    (agw.key="canvas_position") // 裁剪画布位置
}

struct GradientPosition {
    1: optional double Left     (agw.key="left")
    2: optional double Right    (agw.key="right")
}


struct CanvasPosition {
    1: optional double Width    (agw.key="width")
    2: optional double Height   (agw.key="height")
    3: optional double Left     (agw.key="left")
    4: optional double Top      (agw.key="top")
}


// bot信息 for 更新
struct BotInfoForUpdate {
    1:  optional i64 BotId  (agw.js_conv="str", api.js_conv="true",agw.key="bot_id") // bot id
    2:  optional string Name  (agw.key="name")                                      // bot名称
    3:  optional string Description (agw.key="description")                         // bot描述
    4:  optional string IconUri (agw.key="icon_uri")                             // bot 图标uri
    5:  optional string IconUrl (agw.key="icon_url")                             // bot 图标url
    6:  optional i64 CreatorId  (agw.js_conv="str", api.js_conv="true", agw.key="creator_id")                             // 创建人id
    7:  optional i64 CreateTime (agw.js_conv="str", api.js_conv="true", agw.key="create_time")                             // 创建时间
    8:  optional i64 UpdateTime (agw.js_conv="str", api.js_conv="true", agw.key="update_time")                             // 更新时间
    9:  optional i64 ConnectorId (agw.js_conv="str", api.js_conv="true", agw.key="connector_id")                         // 业务线
    10: optional string Version (agw.key="version")                                                  // 版本，毫秒
    11: optional ModelInfo ModelInfo    (agw.key="model_info")                                             // 模型配置
    12: optional PromptInfo PromptInfo  (agw.key="prompt_info")                                           // prompt 信息
    13: optional list<PluginInfo> PluginInfoList (agw.key="plugin_info_list")                                 // plugin列表
    14: optional list<WorkflowInfo> WorkflowInfoList  (agw.key="workflow_info_list")                             // Workflow 列表
    15: optional OnboardingInfo OnboardingInfo  (agw.key="onboarding_info")                                   // 开场白
    16: optional Knowledge Knowledge    (agw.key="knowledge")                                             // 数据集
    17: optional list<Variable> VariableList    (agw.key="variable_list")                                     // kv存储
    18: optional TaskInfo TaskInfo  (agw.key="task_info")                                               // 任务管理/预设任务
    19: optional list<Database> DatabaseList    (agw.key="database_list")                                     // 数据表
    20: optional SuggestReplyInfo SuggestReplyInfo  (agw.key="suggest_reply_info")                               // 推荐问题
    21: optional VoicesInfo VoicesInfo  (agw.key="voices_info")                                           // 音色配置
    22: optional BotExtInfo BotExtInfo  (agw.key="bot_ext_info")                                          // 额外信息，扩展字段
    23: optional BotMode BotMode    (agw.key="bot_mode")                                                 // bot 类型，single agent or multi agent
    24: optional list<AgentForUpdate> Agents    (agw.key="agents")                                       // multi agent mode agent信息
    25: BotSpecies BotSpecies   (agw.key="bot_species")                                                   // Bot种类
    26: optional BotTagInfo BotTagInfo  (agw.key="bot_tag_info")                                           // bot tag 信息，用户新增字段
    27: optional FileboxInfo        FileboxInfo (agw.key="filebox_info")                                           // filebox 信息
    28: optional MultiAgentInfo     MultiAgentInfo  (agw.key="multi_agent_info")                               // multi_agent结构体
    29: optional list<BackgroundImageInfo> BackgroundImageInfoList  (agw.key="background_image_info_list")               // 背景图列表结构体
    30: optional list<string>             ShortcutSort  (agw.key="shortcut_sort")
    31: optional HookInfo             HookInfo (agw.key="hook_info")
    32: optional UserQueryCollectConf     UserQueryCollectConf (agw.key="user_query_collect_conf")// 用户query收集配置
    33: optional LayoutInfo               LayoutInfo(agw.key="layout_info")                           // workflow模式的编排信息
}

struct AgentForUpdate {
   1: optional i64 AgentId (agw.js_conv="str", api.js_conv="true", agw.key="id") // agw字段名做了特殊映射 注意
   2: optional string AgentName (agw.key="name") // agw字段名做了特殊映射 注意
   3: optional PromptInfo PromptInfo (agw.key="prompt_info")                      // prompt 信息
   4: optional list<PluginInfo> PluginInfoList (agw.key="plugin_info_list")             // plugin列表
   5: optional Knowledge Knowledge (agw.key="knowledge")                         // 数据集
   6: optional list<WorkflowInfo> WorkflowInfoList (agw.key="workflow_info_list")         // Workflow 列表
   7: optional ModelInfo ModelInfo (agw.key="model_info")                         // 模型配置
   8: optional list<Intent> Intents (agw.key="intents")                        // 意图信息
   9: optional AgentType AgentType (agw.key="agent_type")
   10: optional bool RootAgent (agw.key="root_agent")                             // 是否是rootagent
   11: optional i64 ReferenceId (agw.js_conv="str", api.js_conv="true", agw.key="reference_id")
   12: optional string FirstVersion (agw.key="first_version")
   13: optional string LastVersion (agw.key="last_version")
   14: optional AgentPosition  Position (agw.key="agent_position")
   15: optional string  IconUri (agw.key="icon_uri")
   16: optional JumpConfig JumpConfig (agw.key="jump_config")
   17: optional SuggestReplyInfo SuggestReplyInfo (agw.key="suggest_reply_info")
   18: optional string  Description (agw.key="description")
   19: optional AgentVersionCompat VersionCompat (agw.key="version_compat")           // multi_agent版本兼容字段
   20: optional HookInfo HookInfo (agw.key="hook_info")
}

struct TableDetail {
    1: optional string TableId                   // table id
    2: optional string TableName                 // table名称
    3: optional string TableDesc                 // table简介
    4: optional list<FieldItem> FieldList        // table字段信息
    5: optional bool            PromptDisabled (agw.key="prompt_disabled"), // 是否支持在Prompt中调用 默认支持
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
//     1: required string Type (agw.key="type"),
//     2: optional string Text ( agw.key="text"),
//     3: optional string FileID (agw.key="file_id"),
//     4: optional string FileURL (agw.key="file_url"),
//     5: optional string Card (agw.key="card"),
// }


// struct EnterMessage  {
//     1: required string Role (agw.key = "role")
//     2: string Content(agw.key = "content")     // 内容
//     3: map<string,string> MetaData(agw.key = "meta_data")
//     4: string ContentType(agw.key = "content_type")//text/card/object_string
//     5: string Type(agw.key = "type")
// }

// struct OpenMessageApi {
//     1: string Id(agw.key = "id")             // 主键ID
//     2: string BotId(agw.key = "bot_id")        // bot id //已TODO 所有的i64加注解str,入参和出参都要
//     3: string Role(agw.key = "role")
//     4: string Content(agw.key = "content")          // 内容
//     5: string ConversationId(agw.key = "conversation_id")   // conversation id
//     6: map<string,string> MetaData(agw.key = "meta_data")
//     7: string CreatedAt(agw.key = "created_at")      // 创建时间
//     8: string UpdatedAt(agw.key = "updated_at")      // 更新时间 //已TODO 时间改成int
//     9: string ChatId(agw.key = "chat_id")
//     10: string ContentType(agw.key = "content_type")
//     11: string Type(agw.key = "type")
// }

enum ReferenceUpdateType {
    ManualUpdate = 1
    AutoUpdate = 2
}

enum ReferenceInfoStatus {
    HasUpdates = 1 // 1:有可用更新
    IsDelete   = 2 // 2:被删除
}
