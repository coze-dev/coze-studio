include "../base.thrift"
include "frontier.thrift"
include "user_delete_base.thrift"
include "shortcut_command.thrift"
include "prompt_resource.thrift"
include "douyin_fenshen.thrift"
include "open_api_playground.thrift"
include "op.thrift"
include "../bot_common/bot_common.thrift"
include "../bot_task/bot_task_common.thrift"
include "../punish/punish_center.thrift"

namespace go ocean.cloud.playground


enum DraftBotStatus {
    Deleted = 0
    Using   = 1
    Banned  = 2
    MoveFail = 3
}

enum BotSource {
    Coze      = 1,   // coze创建
    DouBao    = 2,   // 豆包创建
    Api       = 3,   // API接口创建
}

struct DraftBotCreateRequest {
    1  : required i64            SpaceId    ,
    2  :          string         Name       ,
    3  :          string         Description,
    4  :          string         IconUri    ,
    5  :          VisibilityType Visibility ,
    6  : required i64            UserId     ,
    7  : optional WorkInfo       WorkInfo   ,
    8  : optional BotCreateSource       Source   ,      // bot来源细分
    9  : optional BotSource      BotSource ,            // bot来源
    10 : optional MonetizationConf MonetizationConf,   // bot计费配置
    11 : optional bot_common.BusinessType BusinessType,
    12 : optional string AppId,

    255: optional base.Base      Base       ,
}

struct MonetizationConf {
    1: optional bool IsEnable
}

enum BotCreateSource {
    Nl2Bot =1
}

struct DraftBotCreateData {
    1: i64 BotId
}
struct DraftBotCreateResponse {
    1 : required DraftBotCreateData Data
    255: optional base.BaseResp BaseResp
}

enum BotMode {
    SingleMode = 0
    MultiMode  = 1
    WorkflowMode = 2
}
enum SearchType {
    Api   = 1
    Model = 2
    Bot   = 3
}

struct GetDraftBotInfoRequest {
    1 : optional i64        SpaceId
    2 : required i64        BotId
    3 : optional i64        Version    // 查历史记录，历史版本的id
    4 : optional i64        UserId
    5 : optional Source     Source
    6 : optional BotMode    BotMode    // 不传则本身bot是哪种模式 就返回哪种模式的信息
    7 : optional SearchType SearchType // 查询类型，api表示前端用，Model表示copilot用

    8 : optional string     CommitVersion // 查询指定commit_version版本
    9 : optional OnboardingSetting OnboardingSetting
    10: optional bool WithStaticIcon

    11: optional bool IsAllStatus // 查询全状态

    255: optional base.Base Base
}

enum Source {
    Explore  = 1
    Op       = 2
    BotStore = 3
}

struct WorkInfo {
    1            :      optional      string MessageInfo
    2            :      optional      string Prompt
    3            :      optional      string Variable
    4            :      optional      string OtherInfo
    5            :      optional      string HistoryInfo
    6            :      optional      string Tools
    7            :      optional      string SystemInfoAll
    8            :      optional      string Dataset
    9            :      optional      string Onboarding
    10: optional string ProfileMemory
    11: optional string TableInfo
    12: optional string Workflow
    13: optional string Task
    14: optional string SuggestReply
    15: optional string TTS
    16: optional string BackgroundImageInfoList
    17: optional shortcut_command.ShortcutStruct Shortcut   // 快捷指令
    18: optional string HookInfo
    19: optional bot_common.UserQueryCollectConf UserQueryCollectConf // 用户query收集配置
    20: optional bot_common.LayoutInfo LayoutInfo   //workflow模式编排数据
}
struct FileboxPluginInfo {
    1: i64 PluginId
    2: i64 ApiId

}
struct FileboxInfo{
    1: FileboxInfoMode Mode
}

enum FileboxInfoMode {
    Off = 0
    On  = 1
}

// 分支
enum Branch {
    Undefined     = 0
    PersonalDraft = 1 // 草稿
    Base          = 2 // space草稿
    Publish       = 3 // 线上版本,diff场景下使用
}

struct DraftBotInfo {

    1 :          i64              Id          ,
    2 :          string           Name        ,
    3 :          string           Description ,
    4 :          string           IconUri     ,
    5 :          string           IconUrl     ,
    6 :          VisibilityType   Visibility  ,
    7 :          Publish          HasPublished,
    8 :          string           AppIds      ,
    9 :          i64              CreateTime  ,
    10:          i64              UpdateTime  ,
    11:          i64              CreatorId   ,
    12:          i64              SpaceId     ,
    13:          WorkInfo         WorkInfo    ,
    14:          string           ConnectorIds,
    15:          BotMode          BotMode     ,
    16:          list<DraftAgent> DraftAgents ,
    17:          string           CanvasData  ,
    20:          list<BotTagInfo> BotTagInfos ,
    21: optional FileboxInfo      FileboxInfo ,
    22: optional bool    InCollaboration       , // 命中了多人协作的灰度
    23: optional Branch  Branch                , // 获取的内容是哪个分支
    24: optional i64     CommitVersion         , // 如果是个人草稿，则为checkout/rebase的版本号；如果是space草稿，则为提交的版本号
    25: optional UserBasicInfo CommitDeveloper , // 提交人
    26: optional i64     CommitTime            , // 提交时间
    27: optional i64     PublishTime           , // 发布时间
    28: optional bot_common.MultiAgentInfo MultiAgentInfo  //multi_agent结构体
    29: optional UserBasicInfo    Publisher       // 是最新发布版本时传发布人
    30: optional DraftBotStatus   status       , // 草稿bot状态
    31: optional bot_common.BusinessType BusinessType

}

struct GetDraftBotInfoResponse {
    1 : required DraftBotInfo Data
    255: optional base.BaseResp BaseResp
}
enum ReferenceUpdateType {
    ManualUpdate = 1
    AutoUpdate = 2
}
struct DraftAgent{
    1 : optional i64                 AgentId            ,
    2 : optional string              AgentName          ,
    3 : optional string              Prompt             , // prompt
    4 : optional string              Tools              , // 支持的工具
    5 : optional string              Dataset            , // 数据集
    6 : optional string              WorkFlow           , // WorkFlow
    7 : optional string              OtherInfo          , // 其他信息
    8 : optional list<Intent>        Intents            , // 意图信息
    9 : optional string              Position           , // 位置信息
    10: optional string              IconUri            , // 图片信息
    11: optional AgentType           AgentType          ,
    12: optional string              SystemInfoAll      , // 同 draft bot system info allff
    13:          bool                RootAgent          , // 是否是rootagent
    14: optional string              ReferenceId        ,
    15: optional string              FirstVersion       ,
    16: optional string              CurrentVersion     ,
    17: optional ReferenceInfoStatus ReferenceInfoStatus, // 1:有可用更新 2:被删除
    18: optional bot_common.JumpConfig JumpConfig       , // 回溯配置
    19: optional string              SuggestReply       , // 推荐回复配置
    20: optional string              Description        ,
    21: optional bot_common.AgentVersionCompat  VersionCompat      ,
    22: optional ReferenceUpdateType UpdateType         , //子bot更新类型
    23: optional string              HookInfo           ,
}

struct Intent{
    1: string IntentId   ,
    2: string prompt     ,
    3: i64    NextAgentId,
    4: bot_common.MultiAgentSessionType SessionType,
}

struct IntentApi{
    1: string intent_id
    2: string prompt
    3: string next_agent_id
    4: bot_common.MultiAgentSessionType session_type,
}

enum Publish {
    NoPublish    = 0
    HadPublished = 1
}



struct DuplicateDraftBotRequest {
    1 : required i64 SpaceId
    2 : required i64 BotId
    3 : required i64 UserId
    4 : optional i32 Scene // 复制场景: 0-默认 1-社会化场景复制（复制workflow）
    255: optional base.Base Base
}
struct DuplicateDraftBotData {
    1: i64 BotId
    2: string Name
    3: Creator UserInfo
}
struct DuplicateDraftBotResponse {
    1 : required DuplicateDraftBotData Data
    255: optional base.BaseResp BaseResp
}


struct RevertDraftBotRequest {
    1 : required i64 space_id
    2 : required i64 bot_id
    3 : required i64 version  // 查历史记录，历史版本的id
    4 : required i64 UserId
    255: optional base.Base Base
}
struct RevertDraftBotData {
}
struct RevertDraftBotResponse {
    1 : required RevertDraftBotData Data
    255: optional base.BaseResp BaseResp
}


struct UpdateDraftBotRequest {
    1  : required i64              SpaceId     ,
    2  : required i64              BotId       ,
    3  : optional WorkInfo         WorkInfo    ,
    4  : optional string           name        ,
    5  : optional string           description ,
    6  : optional string           icon_uri    ,
    7  : optional VisibilityType   visibility  , // 可见类型
    8  : required i64              UserId      ,
    9  : optional string           AppIds      , // ["a","b"]，和原有的数据做并集
    10 : optional Publish          Publish     ,
    11 : optional string           ConnectorIds,
    12 : optional list<AgentInfo>  UpdateAgents,
    13 : optional string           CanvasData  ,
    14 : optional BotMode          BotMode     ,
    15 : optional list<string>     DeleteAgents,
    16 : optional string           BaseCommitVersion, // 修改的基线版本
    17 :          list<BotTagInfo> BotTagInfos ,
    18 : optional FileboxInfo      FileboxInfo ,
    19 : optional bot_common.AgentVersionCompat  VersionCompat,

    255: optional base.Base Base

}

enum TagType {
    Draft  = 0
    Online = 1
}


enum AgentType {
    Start_Agent  = 0
    LLM_Agent    = 1
    Task_Agent   = 2
    Global_Agent = 3
    Bot_Agent    = 4
}

struct AgentPosition{
    1: double x
    2: double y
}

// agent 工作区间各个模块的信息
struct AgentWorkInfo{
    1: optional string                Prompt        // agent prompt, 前端存储 server不需要理解
    2: optional string                OtherInfo     // 模型配置
    3: optional string                Tools         // plugin 信息
    4: optional string                Dataset       // dataset 信息
    5: optional string                Workflow      // workflow 信息
    6: optional string                SystemInfoAll // 同bot draft 的systemInfoAll
    7: optional bot_common.JumpConfig JumpConfig    // 回溯配置
    8: optional string                SuggestReply  // 推荐回复配置
    9: optional string                HookInfo      // hook信息
}

enum ReferenceInfoStatus {
    HasUpdates = 1 // 1:有可用更新
    IsDelete   = 2 // 2:被删除
}

struct AgentInfo{
    1 : optional i64                 Id                 ,
    2 : optional AgentType           AgentType          ,
    3 : optional string              Name               ,
    4 : optional AgentPosition       Position           ,
    5 : optional string              IconUri            ,
    6 : optional list<Intent>        Intents            ,
    7 : optional AgentWorkInfo       WorkInfo           ,
    8 : optional string              ReferenceId        ,
    9 : optional string              FirstVersion       ,
    10: optional string              CurrentVersion     ,
    11: optional ReferenceInfoStatus ReferenceInfoStatus, // 1:有可用更新 2:被删除
    12: optional string              description        ,
    13: optional bot_common.AgentVersionCompat VersionCompat,
}


struct CanvasData {
    1: optional string sourceNodeId
    2: optional string targetNodeId
}

struct UpdateDraftBotData {
}
struct UpdateDraftBotResponse {
    1 : required UpdateDraftBotData Data
    255: optional base.BaseResp BaseResp
}

enum PublishType {
    OnlinePublish = 0
    PrePublish    = 1
}

struct PublishDraftBotRequest {
    1  : required                       i64                SpaceId
    2  : required                       i64                BotId
    3  : required                       i64                UserId
    4  : optional                       WorkInfo           WorkInfo
    5  : map<string,map<string,string>> Connectors
    6  : optional                       BotMode            BotMode         // 默认0
    7  : optional                       list<AgentInfo>    Agents
    8  : optional                       string             CanvasData
    9  : list<BotTagInfo>               BotTagInfos
    10 : optional                       map<string,string> AntifraudParams
    11 : optional                       string             PublishId
    12 : optional                       string             CommitVersion   // 指定发布某个CommitVersion
    13 : optional                       PublishType        PublishType     // 发布类型，线上发布/预发布
    14 : optional                       string             PrePublistExt   // 预发布其他信息
    15 : optional                       bool               SkipAudit       // 是否跳过审核
    16 : optional                       string             SocietyInfo
    17 : optional                       string             HistoryInfo     // 替换原workinfo中的 history_info
    255: optional base.Base Base
}

struct PublishDraftBotResponse {
    1 : required i64                 BotId
    2 : required string              Version
    3 : required PublishDraftBotData PublishDraftBotData

    255: optional base.BaseResp BaseResp
}

struct Connector {
    1:          string             Name
    2:          string             AppId
    3:          string             AppSecret
    4:          string             ShareLink
    5: optional map<string,string> BindInfo
}

struct ConnectorBindResult {
    1: optional Connector Connector
    2:          i64       Code
    3:          string    Msg
}

struct PublishDraftBotData{
    1: map<string,ConnectorBindResult> PublishResult       // key代表connector_id，value是发布结果
    2: list<string>                    SuccessConnectorIds
}


enum HistoryType {
    SUBMIT        = 1,  // 废弃
    FLAG          = 2,  // 发布
    ExploreOnline = 3,
    COMMIT        = 4,  // 提交
    COMMITANDFLAG = 5,  // 提交和发布
    MULTIAGENTUPGRADE = 6 //multi-agent升级前的版本
    Evaluation = 7 // 评测
}

struct ExecuteDraftBotRequest {
    1 : required i64      SpaceId
    2 : required i64      BotId
    3 : required WorkInfo WorkInfo
    4 : required i64      DeviceId
    5 : required string   PushUuid
    6 : required i64      UserId
    7 : optional Source   Source
    8 : optional bool     OnlineMode
    9 : optional string   BotVersion
    255: optional base.Base Base
}
struct ExecuteDraftBotData {
}
struct ExecuteDraftBotResponse {
    1 : required ExecuteDraftBotData Data
    255: optional base.BaseResp BaseResp
}


struct CreateDraftBotHistoryRequest {
    1 : required i64         SpaceId
    2 : required i64         BotId
    3 : required WorkInfo    WorkInfo
    4 : required i64         UserId
    5 : required HistoryType HistoryType
    6 : required string      ConnectorIds
    7 : optional BotMode     BotMode
    8 : optional string      CanvasData
    255: optional base.Base Base
}
struct CreateDraftBotHistoryData {
}
struct CreateDraftBotHistoryResponse {
    1 : required CreateDraftBotHistoryData Data
    255: optional base.BaseResp BaseResp
}

struct DraftScriptRequest {
    1 : required string RunType    // 执行类型 TransToDraft\TransToTeamSpace
    2 : optional i64    ToSpaceId
    3 : optional i64    UserId
    4 : optional i32    HistoryLen // 历史数据转移条数，不传默认60
    5 : optional i32    Offset
    6 : optional i32    Limit
    255: optional base.Base Base
}
struct DraftScriptData {
    1: string Msg // 迁移结果信息
}
struct DraftScriptResponse {
    1 : required DraftScriptData Data
    255: optional base.BaseResp BaseResp
}




// //////////

struct PingRequest {
    255: optional base.Base Base
}

struct PingResponse {
    255: optional base.BaseResp BaseResp
}

enum TaskType {
    PROMPT = 0
    BOT    = 1
    CHAIN  = 2
}

struct AddTaskRequest {
    1  : string               Name
    2  : string               Target
    3  : i64                  UserID
    4  : i64                  BotID
    5  : TaskType             TaskType
    6  : i64                  AppID
    8  : optional             string                 display_name
    9  : optional             bool                   is_bot_template
    10 : PromptTemplateFormat prompt_template_format
    255: optional base.Base Base
}


struct AddTaskResponse {
    1 : required i64   TaskId
    2 : i64      BotId
    255: required base.BaseResp BaseResp
}


// model其他信息的json结构
// 是playground老数据用的，bot用modelinfo
struct ModelItem {
    1   :   double         frequency_penalty
    2   :   i64            max_tokens
    3   :   string         model
    4   :   double         presence_penalty
    5   :   double         temperature
    6   :   double         top_p
    7   :   ShortMemPolicy ShortMemPolicy
    8   :   i32            prompt_id
    9   :   list<i32>      card_ids
    10: i32 model_name
    11: optional i32       top_k
    12: optional bot_common.ModelResponseFormat response_format
    13: optional bot_common.ModelStyle          model_style // 用户选择的模型风格
}

struct SuggestReply {
    1: i32    suggest_reply_mode        // 0-(默认)默认Prompt，1-自定义Prompt，2-关闭，3-(agent专用)使用源Bot配置
    2: string customized_suggest_prompt
    3: string chain_task_name           // 服务端写入，客户端无需感知
}



struct ItemInfo {
    1: i64        ItemId
    2: ItemType   ItemType
    3: string     Name
    4: string     Value
    5: ItemStatus ItemStatus
}


// Onboarding json结构
struct OnboardingContent {
    1: optional string       prologue            // 开场白（C端使用场景，只有1个；后台场景，可能为多个）
    2: optional list<string> suggested_questions // 建议问题
    3: optional bot_common.SuggestedQuestionsShowMode suggested_questions_show_mode
}
enum ItemStatus {
    Used    = 1
    Deleted = 2
}

enum ItemType {
    MessageInfo   = 1  // 用户和系统交互消息,json，每次全部传
    SystemInfo    = 2  // 系统prompt
    Variable      = 3  // 变量
    OtherInfo     = 4  // 其他信息,模型，温度,json
    HistoryInfo   = 5  // 历史备注
    APIINFO       = 6  // 选择的api
    SYSTEMINFOAll = 7  // 拼完变量的prompt,拉取bot信息用
    DataSet       = 8  // 数据集
    Onboarding    = 9  // Onboarding 文案，json的形式存
    OUTPUTPARSER  = 10
    PROFILEMEMORY = 11 // Profile Memory
    Table         = 12 // 数据表
    WorkFlow      = 13 // workflow
    Task          = 14 // 任务管理
    SuggestReply  = 15 // suggest reply
    Functions     = 16 // chain function
}

// 保存变量常量playground信息
struct SavePlaygroundRecordRequest {
    1 : i64            TaskId
    2 : string         TaskName
    3 : list<ItemInfo> ItemInfos             // 分块信息
    4 : optional       PlaygroundHistoryInfo PlaygroundHistoryInfo // 保存历史信息
    5 : i64            UserID
    6 : string         UserName
    7 : i32            Version               // 工作区版本
    255: optional base.Base Base
}

enum ContentType {
    Text    = 1
    Suggest = 2
    Music   = 3
    WebView = 4
    Video   = 5
    Image   = 6
    Tako    = 8
    File    = 9
    Card    = 50
}


struct SavePlaygroundRecordResponse {
    1 : list<ItemInfo> ItemInfos   // 变量，常量
    2 : i32            ItemVersion // 存档版本
    3 : i32            Version     // 工作区版本
    255: required base.BaseResp BaseResp
}


enum GetRecType {
    Latest  = 1
    History = 2
}

// 查看Playground信息或历史记录
struct GetPlaygroundRecordRequest {
    1 : optional i32      Version // 查历史记录
    2 : i64      TaskId
    3 : i64      UserID
    4 : string   TaskName // 传name，不穿id，默认是chain task
    255: optional base.Base Base
}

struct GetPlaygroundRecordResponse {
    1 : list<ItemInfo> ItemInfos
    2 : string         bot_name
    3 : string         task_name
    4 : i32            Version   // 工作区版本
    255: required base.BaseResp BaseResp
}


// 如果保存历史信息
struct PlaygroundHistoryInfo {
    1: i64    HistoryId
    2: i8     HistoryType
    3: string HistoryInfo    // 对历史记录补充的其他信息
    4: string HistoryTime
    5: i32    HistoryVersion
}
// 查询历史记录列表
struct ListPlaygroundHistoryInfoRequest {
    1 : i64    TaskId
    2 : i64    UserID
    3 : string TaskName
    255: optional base.Base Base
}

struct ListPlaygroundHistoryInfoResponse {
    1 : list<PlaygroundHistoryInfo> PlaygroundHistoryInfos
    255: required base.BaseResp BaseResp
}


struct TaskInfo {
    1   :                    string               TaskId
    2   :                    string               Name
    3   :                    string               Target
    4   :                    string               ModelInfo
    5   :                    string               CreateTime
    6   :                    i64                  UserID
    7   :                    string               CreatorName
    8   :                    TaskType             TaskType
    9   :                    i64                  AppID
    10: string               BotId
    11: bool                 IsBotTemplate
    12: string               DisplayName
    13: PromptTemplateFormat PromptTemplateFormat
}

enum PromptTemplateFormat {
    FString = 1
    Jinja2  = 2
}
enum ListType {
    User = 1
    All  = 2
}

struct ListTaskRequest {
    1  : i64            UserID
    2  : ListType       ListType
    3  : string         Name
    4  : optional       i64         BotID
    5  : list<TaskType> TaskTypes
    6  : i64            AppID
    7  : i32            Page
    8  : i32            Size
    9  : string         DisplayName
    10 : optional       bool        OnlineUsage
    11 : optional       bool        IsBotTemplate
    255: optional base.Base Base
}

struct ListTaskResponseData {
    1: required list<TaskInfo> TaskInfos
    2:          i32            Count
}

struct ListTaskResponse {
    1 : ListTaskResponseData Data
    255: required base.BaseResp BaseResp
}
enum TaskStatus {
    Used    = 1
    Deleted = 2
}
struct UpdateTaskRequest {
    1 : i64                  TaskId
    2 : string               Name
    3 : string               Target
    4 : TaskStatus           Status
    5 : i64                  UserID
    6 : optional             string                 DisplayName
    7 : PromptTemplateFormat prompt_template_format
    255: optional base.Base Base

}

struct UpdateTaskResponse {
    255: required base.BaseResp BaseResp
}

struct DuplicateTaskRequest {
    1 : i64      TaskId
    2 : i64      UserID
    3 : optional i64      BotID         // 是否需要更改botid
    4 : string   TaskName
    6 : optional string   DisplayName
    7 : optional bool     IsBotTemplate
    255: optional base.Base Base
}

struct DuplicateTaskResponse {
    1 : required i64 TaskId
    255: required base.BaseResp BaseResp
}
struct MessageInfo {
    1:          MessageInfoRole    Role
    2:          string             Content
    3: optional i32                ContentType // 1 文本消息(默认) 2 建议词 50 卡片,enum和contenttype对齐
    4:          map<string,string> ext
}
// 调试prompt任务的msginfo
struct MessageInfoPrompt {
    1: string role
    2: string content
}
enum MessageInfoRole {
    Assistant     = 1
    User          = 2
    ModelResponse = 3   // llm中间结果
    ApiResponse   = 4   // 执行api输出结果
    System        = 5
    DataSetRecord = 6   // 数据集召回的记录
    TIME          = 100 // 执行时间
}

struct VoicesInfo {                                 // 对应 Coze Voices
    1:  bool            muted              // 是否开启声音 true:禁用  false:开启
    2:  map<string,i64> i18n_lang_voice  // 多语音音色配置
    3:  bool            autoplay       // 是否自动播放
    4:  map<string,i64> autoplay_voice  // 自动播放的音色
}

struct PluginApi {
    1   :      string          name                  // operationId
    2   :      string          desc                  // summary
    3   :      list<Parameter> parameters
    4   :      string          plugin_id
    5   :      string          plugin_name
    6   :      string          plugin_name_for_model
    7   :      string          workflow_id
    8   :      string          idempotent_id
    9   :      string          api_id
    10: string record_id
    11: optional WorkflowMode   flow_mode                   // workflow or imageflow, 默认为workflow
    12: optional string plugin_icon
    13: optional string project_id
}

enum WorkflowMode {
    Workflow  = 0
    Imageflow = 1
    SceneFlow = 2
    ChatFlow  = 3
    All       = 100
}

struct Parameter {
    1: string          name
    2: string          desc
    3: bool            required
    4: string          type
    5: list<Parameter> sub_parameters
    6: string          sub_type              // 如果Type是数组，则有subtype
    7: optional string from_node_id          // 如果入参的值是引用的则有fromNodeId
    8: optional list<string> from_output     // 具体引用哪个节点的key
    9: optional string  value                // 如果入参是用户手输 就放这里
}

enum ReqSource {
    Web        = 1 // 来自开发者平台
    App        = 2 // 来自客户端
    Playground = 3 // 来自调试平台
}


struct SubmitTaskRequest {
    1  : string                  TaskId
    2  : string                  Model
    3  : double                  Temperature
    4  : i32                     MaxTokens
    5  : double                  TopP
    6  : double                  FrequencyPenalty
    7  : double                  PresencePenalty
    8  : list<MessageInfoPrompt> Messages
    9  : i64                     UserID
    10 : string                  UserName
    255: optional base.Base Base
}

// 上下文允许传输的类型
enum ContextContentType {
    USER_RES            = 0 // 无任何处理版
    USER_LLM_RES        = 1
    USER_LLM_APILEN_RES = 2
    USER_LLM_API_RES    = 3
}

struct ShortMemPolicy {
    1: ContextContentType ContextContentType
    2: i32                HistoryRound
}

struct NonFuncCallLLMOutput {
    1: string       why
    2: list<string> plans
    3: string       action       // 调用的插件的api
    4: string       action_input
}

struct FuncCallLLMOutput {
    1: string name
    2: string arguments
}
struct ScheduledTasksInfo {
    1: bool user_task_allowed
}

struct SubmitBotTaskRequest {
    1 : i64               TaskId
    2 : ModelInfo         ModelInfo
    3 : list<PluginApi>   PluginApis // 用户勾选的api
    4 : list<BotPrompt>   BotPrompts // 用户编辑的prompt
    5 : list<MessageInfo> Messages   // 包括思考过程，中间结果
    6 : TaskType          TaskType
    7 : i64               UserId
    8 : i64               DeviceId
    9 : string            PushUuid
    255: optional base.Base Base
}
struct BotPrompt {
    1: PromptType prompt_type
    2: string     data
    3: string     record_id
}
enum PromptType {
    SYSTEM     = 1
    USERPREFIX = 2
    USERSUFFIX = 3
}

struct ModelInfo {
    2            :             string         model
    3            :             double         temperature
    4            :             i32            max_tokens
    5            :             double         top_p
    6            :             double         frequency_penalty
    7            :             double         presence_penalty
    8            :             ShortMemPolicy ShortMemPolicy
    9            :             i32            PromptId
    10:          list<i32>     card_ids
    12: optional AnswerActions answer_actions
    13: optional i32           top_k
    14: optional bot_common.ModelResponseFormat response_format // 模型回复内容格式
    15: optional bot_common.ModelStyle          model_style // 用户选择的模型风格
}

struct ModelInfoV2 {
    2:  required string         model
    3:  optional double         temperature
    4:  optional i32            max_tokens
    5:  optional double         top_p
    6:  optional double         frequency_penalty
    7:  optional double         presence_penalty
    8:  optional ShortMemPolicy ShortMemPolicy
    9:  optional i32            PromptId
    10: optional list<i32>      card_ids
    12: optional AnswerActions  answer_actions
    13: optional i32            top_k

    14: optional bot_common.ModelResponseFormat response_format // 模型回复内容格式
    15: optional bot_common.ModelStyle          model_style // 用户选择的模型风格
}

struct AnswerActions {
    1: AnswerActionsMode        answer_actions_mode
    2: list<AnswerActionConfig> answer_action_configs
}

struct GetBotInfoRequest {
    1 : i32 Version
    2 : i64 BotID
    3 : i64 TaskID
    4 : i64 UserID
    255: optional base.Base Base
}

struct GetBotInfoResponse {
    1 : string Tools
    2 : string PromptList
    3 : string ModelInfo
    4 : string DataSetList
    5 : string BotOnboarding
    6 : string ProfileMemory
    7 : string WorkFlow
    8 : string SuggestReply
    9 : string Task
    255: required base.BaseResp BaseResp
}

struct SubmitTaskResponse {
    1 : required string AiMsg
    255: required base.BaseResp BaseResp
}
struct SubmitBotTaskResponse {
    1 : required string AiMsg
    255: required base.BaseResp BaseResp
}

struct FrontierAuthRequest {
    1    :      i32                ProductID
    2    :      i32                AppID
    3    :      i64                DeviceID
    4    :      map<string,string> Params
    5    :      map<string,string> Headers
    101: string ConnUUID
    255: base.Base Base
}

struct FrontierAuthResponse {
    1 : i64                UserID
    2 : map<string,string> DownPubParams
    3 : map<string,string> UpPubParams
    4 : list<string>       Groups
    255: base.BaseResp BaseResp
}
struct FrontierSendMessageRequest {
    1    :      i32                      ProductID
    2    :      i32                      AppID
    3    :      i64                      DeviceID
    9    :      i64                      UserID
    4    :      i32                      Service
    5    :      i32                      Method
    11   :      string                   PayloadEncoding
    6    :      string                   PayloadType
    7    :      binary                   Payload
    8    :      map<string,string>       Extended        // from query string
    10   :      map<string,string>       Header          // from client frame message
    12   :      map<string,list<string>> HttpHeader      // from http header
    101: string ConnUUID
    // 102:   optional                 FrontierWafMssdkVerifyRes ConnVerifyRes
    // 103:   optional                 FrontierWafMssdkVerifyRes MessageVerifyRes
    // 104:   optional                 FrontierSessionInfo       SessionInfo
    255: base.Base Base
}

struct FrontierSendMessageResponse {
    1 : i32                Service
    2 : i32                Method
    3 : map<string,string> Header
    6 : string             PayloadEncoding
    4 : string             PayloadType
    5 : binary             Payload
    255: base.BaseResp BaseResp
}
struct Event {
    1    :      i32                      ProductID
    2    :      i32                      AppID
    3    :      i64                      DeviceID
    6    :      i64                      UserID
    4    :      EventTypeCode            EventType
    5    :      map<string,string>       Extended
    7    :      map<string,list<string>> Header
    101: string ConnUUID
}
enum EventTypeCode {
    ON_LINE  = 0
    OFF_LINE = 1
    TOUCH    = 2
}
struct SendEventRequest {
    1 : list<Event> Events
    255: base.Base Base
}

struct SendEventResponse {
    255: base.BaseResp BaseResp
}

struct ACKMessageRequest {
    1: list <TraceInfo> TraceInfo
    255: base.Base Base
}


struct PushCozeEventRequest {
    1: required string EventId,     // 事件ID-幂等键
    2: required string EventType,   // 事件类型,
    3: required string CreateTime,  // 创建时间
    4: required string ConnectorId,      // 接入方注册id
    5: required string ConnectorName,   // 接入方注册名称
    6: required map<string,string> EventInfo,   // 具体事件的数据体

    255: optional base.Base Base
}


struct PushCozeEventResponse {
    255: optional base.BaseResp BaseResp
}


struct TraceInfo {
    1:   i32                ProductID
    2:   i32                AppID
    3:   i64                DeviceID
    4:   i64                UserID
    5:   string             TraceID
    6:   map<string,string> Extended

    101: string             ConnUUID
}

struct ACKMessageResponse {
    255: base.BaseResp BaseResp
}


struct PushMessage {
    1            :      string       conversation_id
    2            :      optional     string          section_id
    3            :      optional     string          message_id
    4            :      optional     string          local_message_id
    5            :      optional     i64             index
    6            :      optional     string          sec_sender
    7            :      optional     string          reply_id
    8            :      optional     i32             status           // 可见，不可见等
    9            :      optional     i64             create_time      // 创建时间
    10: optional i32    message_type // 1 msg 2 ack
    11: optional i32    content_type // 1 文本消息(默认) 2 建议词 50 卡片,enum和contenttype对齐
    12: optional string content      // 消息体内容，json format {"text":"", "suggest":[]]}
    13:          map<string,string> ext             , // 拓展消息属性 plugin:本次使用的插件，plugin_request:插件的请求，plugin_status:插件状态，正在调用，调用成功，失败
    14: optional i32                reply_type      , // 枚举和MessageInfoRole对齐
}

struct PushCmd {
    1: optional i32                cmd_type        // 1 消息变更命令 2 会话删除命令 3 会话添加命令
    2: optional i64                index
    3: optional string             conversation_id
    4: optional string             message_id
    5:          map<string,string> ext
}

// 前端推送的位置信息,供后续地里位置插件使用（可以先不要）
struct GeoInfo {
    1: optional string longitude
    2: optional string latitude
}

struct PushEvent {
    1:          i32         event_type // 1 消息类型 2 命令类型
    2: optional PushMessage message
    3: optional PushCmd     cmd
    4: optional GeoInfo     geo
}

struct PushContent {
    1: string text
}

enum ToolOutputStatus {
    Success = 0
    Fail    = 1
}
struct GetOnboardingRequest {
    1 : i64    bot_id
    2 : i64    user_id
    3 : string bot_prompt
    255: base.Base Base
}


struct GetOnboardingResponseData {
    1: OnboardingContent onboarding_content
}
struct GetOnboardingResponse {
    1 : GetOnboardingResponseData data
    255: base.BaseResp BaseResp
}
struct RevertPlaygroundRecordRequest {
    1 : i32 version // 历史记录
    2 : i64 task_id
    3 : i64 user_id
    255: optional base.Base Base
}

struct RevertPlaygroundRecordResponse {
    255: base.BaseResp BaseResp
}

struct GetTaskInfoRequest {
    1 : i64 task_id
    255: base.Base Base
}

struct GetTaskInfoResponse {
    1 : TaskInfo task_info
    255: base.BaseResp BaseResp
}

struct GetUploadAuthTokenRequest {
    1 : string Scene
    2 : string DataType
    255: base.Base Base
}

struct GetUploadAuthTokenResponse {
    1 : i64                    Code
    2 : string                 Msg
    3 : GetUploadAuthTokenData Data
    255: base.BaseResp BaseResp
}

struct GetUploadAuthTokenData {
    1: string              ServiceId
    2: string              UploadPathPrefix
    3: UploadAuthTokenInfo Auth
    4: string              UploadHost
}
struct UploadAuthTokenInfo {
    1: string AccessKeyId
    2: string SecretAccessKey
    3: string SessionToken
    4: string ExpiredTime
    5: string CurrentTime
}



// --------------------space相关 start--------------------------------
enum SpaceType {
    Personal = 1 // 个人
    Team     = 2 // 小组
}

enum SpaceRoleType {
    Default = 0 // 默认
    Owner   = 1 // owner
    Admin   = 2 // 管理员
    Member  = 3 // 普通成员
}

enum VolcanoUserVolcanoUserTypeType {
    RootUser     =  1  //  主用户
    BasicUser    =  2  //  子用户
}

// 空间配置信息
struct SpaceConfig {
    1: bool IsSupportExternalUsersJoinSpace       // 是否支持外部用户加入当前团队
}

struct BotSpace {
    1: required i64       Id          // 空间id，新建为0
    2: required string    Name        // 空间名称
    3: required string    Description // 空间描述
    4: required string    IconUri     // 图标uri 存储
    5: required SpaceType SpaceType   // 空间类型
    6: required i64       OperatorId  // 操作人id
    7: optional string    IconUrl     // 图标url 展示
    8: optional i64       AdminLimit  // admin角色数量限制
    9: optional i64       MemberLimit // member角色数量限制
    10: optional string AppIds   // 发布平台
    11: optional i64    OwnerId  // 空间owner id
    12: optional SpaceMode space_mode // 空间模式
    13: optional SpaceConfig SpaceConfig // 空间配置信息
    14: optional SpaceTag  space_tag  // 空间标签
}

struct AppIDInfo{
    1: string id
    2: string name
    3: string icon
}

struct ConnectorInfo{
    1: string id
    2: string name
    3: string icon
}

enum SpaceTag {
    Professional  =  1  // 专业版
}

struct BotSpaceV2 {
    1: string              id             // 空间id，新建为0
    2: list<AppIDInfo>     app_ids        // 发布平台
    3: string              name           // 空间名称
    4: string              description    // 空间描述
    5: string              icon_url       // 图标url
    6: SpaceType           space_type     // 空间类型
    7: list<ConnectorInfo> connectors     // 发布平台
    8: bool                hide_operation // 是否隐藏新建，复制删除按钮
    9: i32                 role_type      // 在team中的角色 1-owner 2-admin 3-member
    10: optional SpaceMode space_mode     // 空间模式
    11: bool               display_local_plugin // 是否显示端侧插件创建入口
    12: SpaceRoleType      space_role_type // 角色类型，枚举
    13: optional SpaceTag  space_tag       // 空间标签
}

struct SaveSpaceRequest {
    1 : required BotSpace BotSpace
    255: optional base.Base Base
}

enum SpaceMode {
    Normal = 0
    DevMode = 1
}

// 空间配置信息
struct SpaceConfigV2 {
    1: bool is_support_external_users_join_space        // 是否支持外部用户加入当前团队
}

struct SaveSpaceV2Request {
    1: string   space_id  // 空间id
    2: required string    name        // 空间名称
    3: required string    description // 空间描述
    4: required string    icon_uri    // 空间图像
    5: required SpaceType space_type  // 空间类型
    6: optional SpaceMode space_mode // 空间模式
    7: optional SpaceConfigV2 space_config // 空间配置

    255: optional base.Base Base (api.none="true")
}

struct SaveSpaceResponse {
    1 : required i64 id // 空间id
    255: required base.BaseResp BaseResp
}

struct SaveSpaceRet {
    1: string id             // 空间id
    2: bool   check_not_pass // true：机审校验不通过
}

struct SaveSpaceV2Response {
    1:      SaveSpaceRet data
    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp (api.none="true")
}

struct DeleteSpaceRequest {
    1: required i64 SpaceId    // 空间id
    2: required i64 OperatorId // 操作人id
    255: optional base.Base Base
}

struct DeleteSpaceV2Request {
    1 : required string space_id // 空间id
    255: optional base.Base Base (api.none="true")
}

struct DeleteSpaceResponse {
    255: required base.BaseResp BaseResp
}

struct EmptyData {

}

struct DeleteSpaceV2Response {
    1:      EmptyData data
    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp (api.none="true")
}

struct GetSpaceListRequest {
    1: required i64 UserId // user_id
    255: optional base.Base Base
}

struct GetSpaceListV2Request {
    1: optional string search_word                      // 搜索词

    255: optional base.Base Base (api.none="true")
}

struct GetSpaceListResponse {
    1: list<BotSpace> BotSpaceList
    2: bool           HasPersonalSpace // 是否有个人空间
    3: i32            TeamSpaceNum     // 个人创建team空间数量
    4: optional       i32              MaxTeamSpaceNum // 个人最大能创建的空间数量
    255: required base.BaseResp BaseResp
}

struct GetOperationSpaceListRequest {
    1: i64 space_id
    2: i64 owner_uid
    3: i64 space_type
    4: i64 page
    5: i64 size

    255: base.Base Base
}

struct SpaceItem {
    1:  i64    space_id
    2:  string space_name
    3:  i64    owner_uid
    4:  i64    space_type
    5:  i64    remain_token
    6:  i64    user_count
    7:  i64    create_time
    8:  string description
    9:  string icon_url
    10: string byte_tree_node_id
    11: string byte_tree_node_name
    12: i64 member_limit
}

struct GetOperationSpaceListResponse {
    1: list<SpaceItem> workspace_list
    2: i64             total

    255: base.BaseResp BaseResp
}

struct GetModelConfigListRequest {
    1: i64 space_id

    255: base.Base Base
}

struct GetModelConfigListResponse {
    1: list<ModelConfig> configs

    255: base.BaseResp BaseResp
}

enum ModelStatus {
    enable  = 0
    disable = 1
}

struct ModelConfig{
    1: string      model_name
    2: string      key_name
    3: ModelStatus model_status
    4: bool        is_default_model
    5: i64         model_id
    6: i64         config_id
    7: TagRemoveStatus   remove_tag
}

enum TagRemoveStatus{
    Default  = 0  // 默认，不移除
    RemoveQuotaTag = 1 // 移除限额标签
}


struct AddModelConfigRequest {
    1: i64    space_id
    2: string key_name
    3: i64    endpoint_id
    4: string model_name
    5: i64    model_id

    255: base.Base Base
}

struct AddModelConfigResponse {
    1: i64 config_id
    255: base.BaseResp BaseResp
}

struct UpdateModelConfigRequest {
    1: i64         config_id
    3: ModelStatus model_status
    4: bool        is_default_model

    255: base.Base Base
}

struct UpdateModelConfigResponse {
    255: base.BaseResp BaseResp
}

struct SetByteTreeRequest {
    1: i64    space_id
    2: string byte_tree_node_id
    3: string byte_tree_node_name

    255: base.Base Base
}

struct SetByteTreeResponse {
    255: base.BaseResp BaseResp (api.none="true")
}

struct SpaceInfo {
    1: list<BotSpaceV2> bot_space_list     // 用户加入空间列表
    2: bool             has_personal_space // 是否有个人空间
    3: i32              team_space_num     // 个人创建team空间数量
    4: i32              max_team_space_num // 个人最大能创建的空间数量
    5: list<BotSpaceV2> recently_used_space_list // 最近使用空间列表
}

struct GetSpaceListV2Response {
    1             :      SpaceInfo data
    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct SpaceMemberTag {
    1: optional VolcanoUserType volcano_user_type  //   火山用户类型
}

struct MemberInfo {
    1: required i64           user_id         (api.js_conv='true' agw.js_conv="str") // 用户id
    2: required string        name            // 用户名称
    3: required string        icon_url        // 用户图标
    4: required SpaceRoleType space_role_type // 成员角色
    5: optional bool          is_join         // 是否已经加入空间
    6: optional string        join_date       // 加入日期
    7: optional string        user_name       // bot平台唯一用户名称
    8: optional SpaceMemberTag space_member_tag // 用户标签
    9: optional bool          is_confirming   // 是否邀请加入确认中
}

struct SearchMemberRequest {
    1 : required list<string> SearchWordList // 搜索字段列表
    2 : required i64          SpaceId        // 空间id
    255: optional base.Base Base
}

struct SearchMemberResponse {
    1 : list<MemberInfo> MemberInfoList   // 成员列表
    2 : list<string>     FailedSearchList // 查询失败列表信息
    255: required base.BaseResp BaseResp
}

struct SearchMemberV2Request {
    1: required list<string> search_list // 搜索字段列表
    2: required i64          space_id    (api.js_conv='true' agw.js_conv="str" api.body="space_id") // 空间id
    3: optional bool         search_volcano_account_list    // 搜索火山账号用户信息列表

    255: base.Base Base
}

struct SearchMemberV2Response {
    1: i64              code
    2: string           msg
    3: list<MemberInfo> member_info_list   // 成员列表
    4: list<string>     failed_search_list // 查询失败列表信息

    255: base.BaseResp BaseResp
}

struct AddSpaceMemberRequest {
    1 : required list<MemberInfo> MemberInfoList // 成员列表
    2 : required i64              SpaceId        // 空间id
    3 : required i64              OperatorId     // 操作人id
    255: optional base.Base Base
}

struct AddSpaceMemberResponse {
    255: required base.BaseResp BaseResp
}

struct AddSpaceMemberV2Request {
    1: required list<MemberInfo> member_info_list // 成员列表
    2: required i64              space_id         (api.js_conv='true' agw.js_conv="str") // 空间id

    255: base.Base Base (api.none="true")
}

struct AddSpaceMemberV2Response {
    1: i64    code
    2: string msg

    255: base.BaseResp BaseResp (api.none="true")
}

struct UpdateSpaceMemberRequest {
    1 : required i64           SpaceId       // 空间id
    2 : required i64           UserId        // 更新用户id
    3 : required SpaceRoleType SpaceRoleType // 更新用户角色
    4 : required i64           OperatorId    // 操作人id
    255: optional base.Base Base
}

struct UpdateSpaceMemberResponse {
    255: required base.BaseResp BaseResp
}

struct UpdateSpaceMemberV2Request {
    1: i64           space_id        (api.js_conv='true' agw.js_conv="str") // 空间id
    2: i64           user_id         (api.js_conv='true' agw.js_conv="str") // 更新用户id
    3: SpaceRoleType space_role_type // 更新用户角色

    255: base.Base Base
}

struct UpdateSpaceMemberV2Response {
    1: i64    code
    2: string msg

    255: base.BaseResp BaseResp
}

struct SpaceMemberDetailData {
    1            :   required     i64              SpaceId        // 空间id
    2            :   required     string           Name           // 空间名称
    3            :   required     string           Description    // 空间描述
    4            :   required     string           IconUrl        // 空间图标url
    5            :   required     SpaceRoleType    SpaceRoleType  // 当前用户角色
    6            :   required     i64              Total          // 查询总数，用于分页
    7            :   required     list<MemberInfo> MemberInfoList // 成员列表
    8            :   required     i64              AdminTotalNum  // 总共多少admin角色
    9            :   required     i64              MemberTotalNum // 总共多少member角色
    10: required i64 MaxAdminNum  // 允许最多admin数量
    11: required i64 MaxMemberNum // 允许最多member数量
    12: required SpaceConfigDetails SpaceConfigDetails            // 团队设置详情
}

struct BindVolcanoInfo {
    1: bool   IsBindVolcanoAccount              (api.body="is_bind_volcano_account")           // 是否绑定火山账号
    2: string AccountName                       (api.body="account_name")                      // 账号名称
}

// 团队设置详情
struct SpaceConfigDetails {
    1: bool CanShowJoinTeamPermissionSettings      (api.body="can_show_join_team_permission_settings")   // 是否可展示加入团队权限设置
    2: bool CanEditJoinTeamPermissionSettings      (api.body="can_edit_join_team_permission_settings")   // 是否可编辑加入团队权限设置
    3: bool IsSupportExternalUsersJoinSpace        (api.body="is_support_external_users_join_space")     // 是否支持外部用户加入当前团队
}

struct SpaceMemberDetailV2Data {
    1   :    i64                  SpaceId                              (api.js_conv='true'           agw.js_conv="str" api.body="space_id") // 空间id
    2   :    string               Name                                 (api.body="name")             // 空间名称
    3   :    string               Description                          (api.body="description")      // 空间描述
    4   :    string               IconUrl                              (api.body="icon_url")         // 空间图标url
    5   :    SpaceRoleType        SpaceRoleType                        (api.body="space_role_type")  // 当前用户角色
    6   :    i32                  Total                                (api.body="total")            // 查询总数，用于分页
    7   :    list<MemberInfo>     MemberInfoList                       (api.body="member_info_list") // 成员列表
    8   :    i32                  AdminTotalNum                        (api.body="admin_total_num")  // 总共多少admin角色
    9   :    i32                  MemberTotalNum                       (api.body="member_total_num") // 总共多少member角色
    10: i32  MaxAdminNum          (api.body="max_admin_num")           // 允许最多admin数量
    11: i32  MaxMemberNum         (api.body="max_member_num")          // 允许最多member数量
    13: bool TeamInviteLinkStatus (api.body="team_invite_link_status") // team通过分享链接加入空间按钮的状态
    14: BindVolcanoInfo           BindVolcanoInfo                      (api.body="bind_volcano_info") // 绑定火山账号信息
    15: SpaceConfigDetails        SpaceConfigDetails                   (api.body="space_config_details") // 团队设置详情
}

struct CheckSpaceMemberResponse {
    1: required bool HasMember // true 代表用户在空间内 false 代表不在
    2: optional SpaceRoleType        SpaceRoleType // 如果在，这个人在空间内的身份
    255: required base.BaseResp BaseResp
}

struct CheckSpaceMemberRequest {
    1 : required i64 SpaceId // 空间id
    2 : required i64 UserId  // 用户id
    255: optional base.Base Base
}

struct SpaceMemberDetailRequest {
    1 : required i64           SpaceId       // 空间id
    2 : optional string        SearchWord    // 搜索词
    3 : optional SpaceRoleType SpaceRoleType // 角色  0: all
    4 : required i32           Page          // 分页
    5 : required i32           Size          // 大小
    6 : required i64           OperatorId    // 操作人id
    255: optional base.Base Base
}

struct SpaceMemberDetailResponse {
    1 : required SpaceMemberDetailData data
    255: required base.BaseResp BaseResp
}

struct SpaceMemberDetailV2Request {
    1:          i64           space_id        (api.js_conv='true' agw.js_conv="str") // 空间id
    2: optional string        search_word     // 搜索词
    3: optional SpaceRoleType space_role_type // 角色  0: all
    4:          i32           page            // 分页
    5:          i32           size            // 大小

    255: base.Base Base (api.none="true")
}

struct SpaceMemberDetailV2Response {
    1: i64                     code
    2: string                  msg
    3: SpaceMemberDetailV2Data data

    255: base.BaseResp BaseResp (api.none="true")
}

struct RemoveSpaceMemberRequest {
    1 : required i64 SpaceId      // 空间id
    2 : required i64 RemoveUserId // 移除用户uid
    3 : required i64 OperatorId   // 操作人id
    255: optional base.Base Base
}

struct RemoveSpaceMemberResponse {
    255: required base.BaseResp BaseResp
}

struct RemoveSpaceMemberV2Request {
    1: i64 space_id       (api.js_conv='true' agw.js_conv="str") // 空间id
    2: i64 remove_user_id (api.js_conv='true' agw.js_conv="str") // 移除用户uid

    255: base.Base Base (api.none="true")
}

struct RemoveSpaceMemberV2Response {
    1: i64    code
    2: string msg

    255: base.BaseResp BaseResp (api.none="true")
}

struct ExitSpaceRequest {
    1 : required i64 SpaceId        // 空间id
    2 : required i64 TransferUserId // 权限转移user_id
    3 : required i64 OperatorId     // 操作人id
    255: optional base.Base Base
}

struct ExitSpaceResponse {
    255: required base.BaseResp BaseResp
}

struct ExitSpaceV2Request {
    1: i64 space_id         (api.js_conv='true' agw.js_conv="str") // 空间id
    2: i64 transfer_user_id (api.js_conv='true' agw.js_conv="str") // 权限转移user_id

    255: optional base.Base Base (api.none="true")
}

struct ExitSpaceV2Response {
    1: i64    code
    2: string msg

    255: base.BaseResp BaseResp (api.none="true")
}

struct TransferSpaceRequest {
    1 : required i64 SpaceId        // 空间id
    2 : required i64 TransferUserId // 权限转移user_id
    3 : required i64 OperatorId     // 操作人id
    255: optional base.Base Base
}

struct TransferSpaceResponse {
    255: required base.BaseResp BaseResp
}

struct TransferSpaceV2Request {
    1: i64 space_id         (api.js_conv='true' agw.js_conv="str") // 空间id
    2: i64 transfer_user_id (api.js_conv='true' agw.js_conv="str") // 权限转移user_id

    255: base.Base Base
}

struct TransferSpaceV2Response {
    1: i64    code
    2: string msg

    255: base.BaseResp BaseResp
}

struct GetBotDraftListRequest {
    1  : required i64           space_id        , // 空间id
    2  : optional string        bot_name        , // bot_name 搜索
    3  : optional OrderBy       order_by        , // 排序
    4  : optional list<string>  publish_platform, // 发布平台  -- 废弃
    5  : optional TeamBotType   team_bot_type   , // team bot 类型，代表team内的个人草稿、公开可见
    6  : optional ScopeType     scope_type      , // 范围类型，代表team公开可见的 All、Mine  -- 废弃
    7  : optional i32           page_index      , // 分页
    8  : optional i32           page_size       , // 分页大小
    9  : optional i64           user_id         ,
    10 : optional PublishStatus is_publish      , // 是否已发布
    12  : optional string       cursor_id      , //  获取第一页不传，后续调用时传上一次返回的cursor_id
    14  : optional bool         is_fav      , //
    15 : list<DraftBotStatus>     draft_bot_status_list, // 需要的状态列表 默认只返回 Using = 1
    16 : optional bool            recently_open,  // 是否按最近打开筛选

    255: optional base.Base     Base            ,
}



enum PublishStatus {
    All       = 0
    Publish   = 1
    NoPublish = 2
}
enum VisibilityType {
    Invisible = 0 // 不可见
    Visible   = 1 // 可见
    SocietyInvisible = 2 // 社会化不可见
}

enum ScopeType {
    All  = 0 // 所有
    Self = 1 // 自己
}

enum TeamBotType {
    MySpace  = 0 // 个人空间看可见和不可见
    MyDrafts = 1 // team内个人草稿
    TeamBots = 2 // team内所有
    Mine     = 3 // team内个人
}

struct GetBotDraftListResponse {
    1  :          list<DraftBot> bot_draft_list, // 结果
    2  :          i32            total         , // 总个数
    4  :          string         cursor_id         , // 下次传入
    5  :          bool           has_more         ,
    255: required base.BaseResp  BaseResp      ,
}

enum OrderBy {
    CreateTime  = 0
    UpdateTime  = 1
    PublishTime = 2
}

struct Model {
    1: string name
    2: i64    model_type
    // 3:     ModelClass         model_class
    // 4:     string             model_icon  //model icon的url
    5: double model_input_price
    6: double model_output_price
}
struct VoiceType {
    1   :    i64          id
    2   :    string       model_name
    3   :    string       name
    4   :    string       language
    5   :    string       style_id
    6   :    string       style_name
    7   :    string       language_code
    8   :    string       language_key
    9   :    VoicePreview preview
    10: bool is_beta
}

struct VoicePreview {
    1: string version
    2: string preview_text
    3: string preview_audio
    4: string md5
}

struct DraftBot {

    1 :          i64              Id              ,
    2 :          string           Name                ,
    3 :          string           DescriptionForModel ,
    4 :          string           DescriptionForHuman ,
    5 :          string           IconUrl             ,
    6 :          ModelInfo        ModelInfo           ,
    7 :          VoiceType        VoiceType           ,
    9 :          i64              CreatorId         ,
    10:          DraftBotStatus   BotStatus           ,
    11:          string           Edit                ,
    12:          i64              CreateTime        ,
    13:          i64              UpdateTime      ,
    14:          string           IconUri             ,
    15:          double           Temperature         ,
    16:          i8               Visibility          ,
    17:          i8               HasPublished        ,
    18:          i64              SpaceId         ,
    19:          string           AppId               ,
    20:          Creator          Creator             ,
    21:          i64              PublishTime     ,
    22:          string           ConnectorIds        ,
    23:          i32              Index               ,
    24:          BotExploreStatus BotExploreStatus    ,
    25:          string           SpaceName           ,
    26:          i64              ExploreId       ,
    27:          string           LastOnlineTime      ,
    28:          string           ExploreBotUpdateTime,
    29:          BotDeleteStatus  ExploreDelStatus    ,
    30:          i64              ExploreVersion   ,
    31:          BotMode          BotMode             ,
    33:          list<BotTagInfo> BotTagInfos         ,
    34: optional FileboxInfo      FileboxInfo         ,
    35:          bool             IsFav           ,
    37:          i64              FavoriteAt      ,
    38:          bool             InCollaboration,      // true 为多人协作模式，否则单人模式,
    39: optional string           SystemInfoAll,
    40: optional AuditInfo        LatestAuditInfo, // 最近一次审核详情
    41: optional i64              RecentlyOpenTime, // 最近被打开时间
}

struct AuditInfo {
    1: optional AuditStatus audit_status
    2: optional string publish_id
    3: optional string commit_version
}

// bot信息简略版
struct BriefDraftBot {
        1 :          string              Id,
        2 :          string           Name,
}

struct BotTagInfo {
    1: i64    BotId ,
    2: string Key    , // time_capsule
    3: string Value  , // TimeCapsuleInfo json
    4: i64    Version   ,
}
// 和 developerapi保持一致
struct TimeCapsuleInfo {
    1: TimeCapsuleMode time_capsule_mode
    2: DisablePromptCalling disable_prompt_calling
}
enum TimeCapsuleMode {
    Off = 0
    On  = 1

}
enum DisablePromptCalling {
    Off = 0
    On  = 1
}
struct TransBotSpace {
    1: i64    SpaceId
    2: string SpaceName
    3: i64    OriSpaceId
    4: string OriSpaceName
}


struct Creator {
    1: string id
    2: string name       // 昵称
    3: string avatar_url
    4: string user_name  // uniq name
    5: optional bot_common.UserLabel user_label // 用户标签
}


struct ListDraftBotHistoryRequest {
    1 : i64         DraftId
    2 : i64         UserID
    3 : i64         SpaceID
    4 : HistoryType HistoryType
    5 : i32         PageIndex
    6 : i32         PageSize
    7 : optional    string              ConnectorId
    8 : optional    list<string>        BotVersions             // 按照BotVersion查询
    9 : optional    list<PublishType>   PublishTypes            // 支持按publishType筛选，不传默认只查Online
    10: optional    bool                GetByConnectorLatest    // 获取每个渠道最新发布的版本信息

    255: optional base.Base Base
}

struct ListDraftBotHistoryResponse {
    1 : list<DraftHistoryInfo> PlaygroundHistoryInfos
    2 : optional map<string,DraftHistoryInfo> ConnectorLatestHistoryMap // key: connector_id, 只在传GetByConnectorLatest时返回
    255: required base.BaseResp BaseResp
}

struct DraftHistoryInfo {
    1:             i64         HistoryId
    2:             HistoryType HistoryType
    3:             string      HistoryInfo    // 对历史记录补充的其他信息
    4:             string      HistoryTime
    5:             i64         HistoryVersion
    6:             string      ConnectorIds
    7:             Creator     Creator
    8:             string      PrePublishExt
    9:             string      BotVersion
    10: optional   string      PublishID
    11: optional   PublishType PublishType
    12: optional   string      CommitRemark   // 获取提交记录时使用
}

struct GetLatestDraftHistoryInfoRequest {
    1 : i64         DraftId
    2 : HistoryType HistoryType
    3 : string      ConnectorId

    255: optional base.Base Base
}

struct GetLatestDraftHistoryInfoResponse {
    1 : i64         HistoryId
    2 : i64         DraftId
    3 : HistoryType HistoryType
    4 : string      HistoryInfo    // 对历史记录补充的其他信息
    5 : string      HistoryTime
    6 : i64         HistoryVersion
    7 : string      ConnectorIds
    8 : WorkInfo    WorkInfo

    255: required base.BaseResp BaseResp
}

struct GetLatestPublishTimeRequest {
    1 : i64          DraftId
    2 : HistoryType  HistoryType
    3 : list<string> ConnectorIdList

    255: optional base.Base Base
}

struct GetLatestPublishTimeResponse {
    1 : map<string,i64> ConnectorPublishTimeMap

    255: required base.BaseResp BaseResp
}

struct GetLatestPublishRecordRequest {
    1 : i64 DraftBotID

    255: optional base.Base Base
}

struct PublishRecord {
    1: i64    PublishTime   // 发布时间
    2: string PublishResult // 发布结果
    3: string ConnectorIDs  // 发布成功的connector_id（旧字段）
}

struct GetLatestPublishRecordResponse {
    1 : optional PublishRecord Data

    255: required base.BaseResp BaseResp
}

struct GetSpaceMemberRequest {
    1 : required i64 SpaceId // 空间id
    2 : required i64 UserId  // 用户id
    255: optional base.Base Base
}

struct GetSpaceMemberResponse {
    1 : optional MemberInfo MemberInfo // 成员信息
    255: required base.BaseResp BaseResp
}

struct MultiGetSpaceMemberRequest {
    1: required list<i64> UserIds // 用户id列表，最大20个
    2: required i64 SpaceId // 空间id
    255: optional base.Base Base
}

struct MultiGetSpaceMemberResponse {
    1:   required map<i64,MemberInfo> MemberInfo // key= user_id
    255: required base.BaseResp BaseResp
}

struct DeleteDraftBotRequest {
    1 : required i64 SpaceId // 空间id
    2 : required i64 UserId  // 用户id
    3 : required i64 BotId   // botid
    255: optional base.Base Base
}

struct DeleteDraftBotResponse {
    255: required base.BaseResp BaseResp
}

struct GetSpaceInfoRequest {
    1 : required i64 SpaceId // 空间id
    255: optional base.Base Base
}

enum JoinSpaceType {
    Apply    =  1      // 申请加入
    Invite   =  2      // 邀请加入
}

struct GetSpaceInfoV2Request {
    1 : required string space_id                  // 申请 or 邀请 code码
    2 : optional JoinSpaceType  join_space_type   // 加入空间类型

    255: optional base.Base Base (api.none="true")
}


struct GetSpaceInfoResponse {
    1 : required BotSpace BotSpace
    255: required base.BaseResp BaseResp
}

enum InviteLinkStatus {
    Normal    =  1          // 正常
    Invalid   =  2          // 失效 开关关闭 or 撤销
    Expired   =  3          // 过期
    Rejected  =  4          // 已拒绝
}

struct SpaceInfoForInviteData {
    1: string space_name
    2: string description
    3: string icon_url
    4: string owner_name                            // 空间owner昵称
    5: string owner_user_name                       // 空间owner用户名
    6: string owner_icon_url                        // 空间owner图像
    7: string operator_name                         // 操作人昵称
    8: string operator_user_name                    // 操作人用户名
    9: string operator_icon_url                     // 操作人图像
    10: InviteLinkStatus invite_link_status         // 邀请链接状态
    11: string expire_time                          // 过期时间，时间戳，秒级别
    12: bool is_joined                              // 是否已经加入了
}

struct GetSpaceInfoV2Response {
    1             :      SpaceInfoForInviteData data
    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp (api.none="true")
}

// --------------------space相关 end--------------------------------

struct GetTaskListByResourceIdRequest {
    1 : required list<i64> resource_id   // 资源ID
    2 : required ItemType  resource_type // 资源类型
    3 : optional i64       limit         // 4: optional i64 offset // 从0开始
    4 : optional i64       operator_id   // 当前操作人
    5 : optional i64       space_id      // 命名空间
    6 : optional string    name          // 模糊匹配名称
    255: optional base.Base Base
}

struct GetBotListByResourceIdData {
    1: list<DraftBot> bot_info
    2: i64            total
}

struct GetTaskListByResourceIdResponse {
    1 : map<i64,GetBotListByResourceIdData> data
    255: base.BaseResp BaseResp
}

struct GetExploreBotListRequest {
    1 : optional  list<string>     PublishPlatform  // 发布平台
    2 : optional  i32              PageIndex        // 分页
    3 : optional  i32              PageSize         // 分页大小
    4 : optional  Source           Source           // 发布平台
    5 : optional  string           KeyWord          // 发布平台
    6 : optional  BotExploreStatus BotExploreStatus // 发布平台
    7 : list<i64> CategoryID       // 分类 id
    8 : bool      Uncategorized    // 运维后台查询未分类的 explore bot

    255: optional base.Base Base
}
// enum GetExploreBotListMode {
        //Visible=1
    // All=2
// }


struct ExploreBotCategory {
    1: required i64    ID
    2: required string Name
}

struct ExploreBotInfo {
    1: bool                     NeedBacklog // 是否替换成运维调整的热度
    2: list<ExploreBotCategory> Category
    3: i32                      HeatValue
}

struct GetExploreBotListResponse {
    1 : list<DraftBot>          BotDraftList    // 结果
    2 : i32                     Total           // 总个数
    3 : map<i64,ExploreBotInfo> ExploreBotInfos // key: explore_bot_id
    255: base.BaseResp BaseResp
}

struct GetExploreBotInfoRequest {
    1 : required i64 DraftBotId // draftbotid
    2 : optional i64 ExploreId  // ExploreId
    255: optional base.Base Base
}


struct GetExploreBotInfoResponse {
    1 : DraftBot Info
    255: base.BaseResp BaseResp
}

struct DuplicateBotToSpaceRequest {
    1 : required i64    TargetSpaceId
    2 : required i64    BotId
    3 : required i64    UserId
    4 : required i64    BotUserId
    5 : optional Source Source
    6 : optional string Name
    255: optional base.Base Base
}

struct DuplicateBotToSpaceResponse {
    1 : string BotId
    255: base.BaseResp BaseResp
}

struct GetExploreCategoryListRequest {
    255: optional base.Base Base
}

struct GetExploreCategoryListResponse {
    1 : list<ExploreBotCategory> Category

    255: base.BaseResp BaseResp
}



struct UpdateExploreBotRequest {
    1  : required string           ExploreBotId
    2  : optional string           Name
    3  : optional string           Description
    4  : optional string           IconUri
    5  : optional i32              Index
    6  : optional BotExploreStatus ExploreStatus // 上线下线
    7  : optional BotDeleteStatus  DelStatus     // 删除
    9  : optional i64              UserId
    10 : optional i64              BotUserId
    11 : optional list<string>     CategoryId    // warning ！！！空数组视为未分类，空指针不处理 ！！！ warning
    255: optional base.Base Base
}

enum BotExploreStatus {
    Online  = 1
    Offline = 2
}
enum BotDeleteStatus {
    Deleted = 1
}

struct UpdateExploreBotResponse {
    255: base.BaseResp BaseResp
}

struct CheckDraftBotCommitRequest {
    1: required i64 SpaceID
    2: required i64 BotID
    3: required i64 UserID
    4: optional i64 CommitVersion

    255: optional base.Base Base
}

struct Committer {
    1: optional i64    ID   (agw.js_conv="str", api.js_conv="true", agw.key="id")
    2: optional string Name (agw.key="name")
    3: optional i64    CommitTime   (agw.js_conv="str", api.js_conv="true", agw.key="commit_time")
}

enum CommitStatus {
    Undefined      = 0
    Uptodate       = 1 // 已是最新，同主草稿相同
    Behind         = 2 // 落后主草稿
    NoDraftReplica = 3 // 无个人草稿
}

struct CheckDraftBotCommitResponse {
    1: optional CommitStatus Status
    2: optional i64          BaseCommitVersion // 主草稿版本
    3: optional Committer    BaseCommitter     // 主草稿提交信息
    4: optional i64          CommitVersion     // 个人草稿版本

    255: optional base.BaseResp BaseResp
}

struct CommitDraftBotRequest {
    1: required i64 SpaceID
    2: required i64 BotID
    3: required i64 UserID

    // 4 ~ 12 如果传了会先更新这部分到个人作为提交的内容，为了防止前端auto-save的时序问题
    // 如果没有传，则会使用当前已经auto-save的内容
    4           :   optional WorkInfo        WorkInfo
    5           :   optional string          Name
    6           :   optional string          Description
    7           :   optional string          IconUri
    8           :   optional VisibilityType  Visibility
    9           :   optional list<AgentInfo> UpdateAgents
    10          :   optional string          CanvasData
    11          :   optional BotMode         BotMode
    12          :   optional list<string>    DeleteAgents
    13          :   optional string          Remark         // 本次提交的备注信息

    255: optional base.Base Base
}

enum CommitResult {
    Undefined      = 0
    Committed      = 1 // 提交成功
    Behind         = 2 // 版本落后
    NoDraftReplica = 3 // 无个人草稿
}

struct CommitDraftBotResponse {
    1: optional CommitResult CommitResult
    2: optional Committer    Committer
    3: optional Branch       Branch
    4: optional i64          CommitVersion

    255: optional base.BaseResp BaseResp
}

struct GetOpAllBotListRequest {
    1  : optional i64           SpaceId         // 空间id
    2  : optional string        BotName         // bot_name 搜索
    3  : optional list<string>  PublishPlatform // 发布平台
    4  : optional i32           PageIndex       // 分页
    5  : optional i32           PageSize        // 分页大小
    6  : optional PublishStatus IsPublish       // 是否已发布
    7  : optional i64           BotID           // BotID

    8  : optional list<i64>     BotIDs          // BotID
    12 : optional string        ConnId          // ConnId,只能传一个

    255: optional base.Base Base
}

struct GetOpAllBotListResponse {
    1 : list<DraftBot> BotDraftList // 结果
    2 : i32            Total        // 总个数
    255: required base.BaseResp BaseResp
}

struct GetOpSpaceListRequest {
    1 : optional string Name // space_name
    255: optional base.Base Base
}

struct GetOpSpaceListResponse {
    1 : list<BotSpace> BotSpaceList
    255: required base.BaseResp BaseResp
}

enum OpStatus {
    Doing = 1
    Done  = 2
    Fail  = 3
}

struct GetCategoryListRequest {
    255: optional base.Base Base
}

struct GetCategoryListResponse {
    1 : required CategoryListData data

    255: base.BaseResp BaseResp
}

struct Category {
    1: i64    id
    2: i32    index
    3: string name
    4: string name_key
    5: i32    bot_count
}

struct CategoryListData {
    1: list<Category> categorys
}

struct SaveCategoryRequest {
    1 : list<Category> categorys

    255: optional base.Base Base
}

struct SaveCategoryResponse {
    255: base.BaseResp BaseResp
}

struct StoreCookieBannerRequest {
    1 : required string WebId
    2 : required i64    UserId
    3 : required string CookieBannerInfo

    255: optional base.Base Base
}

struct StoreCookieBannerResponse {
    255: base.BaseResp BaseResp
}

enum AccountCancelCheckStatus {
    Pass           = 0
    NoLeaveAllTeam = 1
}

// 用户注销、删除用户创建的所有资源
struct AccountCancelRequest {
    1 : required i64 UserId

    255: optional base.Base Base
}

struct AccountCancelResponse {
    1 : optional AccountCancelCheckStatus CheckStatus

    255: required base.BaseResp BaseResp
}

// 火山账号注销
struct VolcanoAccountLogoutRequest {
    1 : required i64 AccountId                              // 火山账号id
    2 : required i64 UserId                                 // coze uid

    255: optional base.Base Base
}

struct VolcanoAccountLogoutResponse {

    255: required base.BaseResp BaseResp
}

// 火山账号注销检查
struct CanUserApplyCloseRequest {
    1 : i64 AccountId                              // 火山账号id
    2 : string EventName                           // 事件名称
    3 : string Action                              // inner top 中注册的Action
    4 : string Version                             // inner top 中的版本号

    100: optional string RequestId (api.header = "X-Tt-Logid"),
    101: optional string Service (api.header = "X-Top-Service"),
    102: optional string Region (api.header = "X-Top-Region"),

    255: optional base.Base Base
}

struct CanUserApplyCloseResult  {
    1: bool Success                               // 检查结果
    2: string Reason                              // 失败原因，检测失败时必填
    3: optional string RedirectURL                // 跳转处理URL，不为空时覆盖默认跳转地址
}

struct InnerTopResponseMetadata {
    1: string RequestId
    2: string Action
    3: string Version
    4: string Service
    5: string Region
    6: optional InnerTopError Error
}

struct InnerTopError {
    1: string Code
    2: string Message
}

struct CanUserApplyCloseResponse {
    1: CanUserApplyCloseResult Result
    2: InnerTopResponseMetadata ResponseMetadata

    255: required base.BaseResp BaseResp
}

enum CopyTaskStatus {
    Create          =  1    // 创建
    InProgress      =  2    // 执行中
    Success         =  3    // 成功
    Fail            =  4    // 失败
}

// coze专业版复制授权链接生成
struct CozeProCopyGenerateAuthLinkRequest {
    1 : required i64 copy_user_id (api.js_conv='true' agw.js_conv="str")     // 普通版用户的id
    2 : required i64 target_space_id (api.js_conv='true' agw.js_conv="str")  // 目标空间id

    255: optional base.Base Base (api.none="true")
}

struct CozeProCopyGenerateAuthLinkData {
    1 : required string auth_code
}

struct CozeProCopyGenerateAuthLinkResponse {
    1: required CozeProCopyGenerateAuthLinkData data

    253: required i64                   code
    254: required string                msg
    255: required base.BaseResp         BaseResp (api.none="true")
}

// coze专业版复制授权链接元信息获取
struct CozeProCopyGetLinkMetaInfoRequest {
    1 : required string auth_code

    255: optional base.Base Base (api.none="true")
}

struct CozeProCopyGetLinkMetaInfoData {
    1 : required string target_user_name
}

struct CozeProCopyGetLinkMetaInfoResponse {
    1: required CozeProCopyGetLinkMetaInfoData data

    253: required i64                   code
    254: required string                msg
    255: required base.BaseResp         BaseResp (api.none="true")
}

// coze专业版复制任务确认
struct CozeProCopyTaskConfirmRequest {
    1: required string auth_code

    255: optional base.Base Base
}

struct CozeProCopyTaskConfirmResponse {

    253: required i64                   code
    254: required string                msg
    255: required base.BaseResp         BaseResp
}

// 专业版子用户配置
struct VolcanoBasicUserConfig {
    1: optional bool forbid_create_sapce                     // 禁止内部用户（子用户）创建团队，默认false
    2: optional bool forbid_invite_external_user             // 禁止添加外部用户进入团队，默认false
    3: optional bool forbid_join_external_space              // 禁止加入外部团队，默认false
}

struct SaveVolcanoUserManageInfoRequest {
    1: required VolcanoBasicUserConfig volcano_basic_user_config            // 火山子用户管理

     255: optional base.Base Base (api.none="true")
}

struct SaveVolcanoUserManageInfoResponse {

    253: i64 code
    254: string msg
    255: optional base.BaseResp BaseResp (api.none="true")
}

// 获取专业版子用户配置
struct VolcanoUserManageInfo {
    1: VolcanoBasicUserConfig volcano_basic_user_config            // 火山子用户管理
 }

struct GetVolcanoUserManageInfoRequest {

     255: optional base.Base Base (api.none="true")
}

struct GetVolcanoUserManageInfoResponse {
    1: VolcanoUserManageInfo data

    253: i64 code
    254: string msg
    255: optional base.BaseResp BaseResp (api.none="true")
}

struct GetModelListRequest {
    1: required i64 SpaceId                         // 空间id
    2: required i64 UserId                          // 用户id
    3: optional bool IsProUserNeedSeedModel         // 专业版用户是否需要普通版seed模型，默认为false
    4: ModelScene ModelScene                        // 模型场景

    255: optional base.Base Base
}

enum ModelScene {
    Douyin = 1
}

struct GetModelListResponse {
    1: optional map<i64,ModelDetail> ModelDescMap
    2: optional i64 CozeProDefaultModelId                           // 专业版用户默认模型id

    255: required base.BaseResp         BaseResp
}

struct ListWaitingQueueRequest {
    1 : required i32        page_size
    2 : required i32        page_no
    3 : optional string     email
    4 : optional i64        user_id
    5 : optional WaitStatus wait_status
    6 : optional string     feature
    7 : optional string     mobile
    255: optional base.Base Base
}

enum WaitStatus {
    Wait   = 1
    Failed = 2
    Grant  = 3
}

enum GrantType {
    WaitListOff = 1
    AdminOpt    = 2
    WhiteList   = 3
}

struct WaitData {
    1   :          i64         id
    2   :          string      uid
    3   :          string      mail
    4   :          string      using_for
    5   :          string      hear_from
    6   :          string      ext_message
    7   :          string      ip_region
    8   :          string      register_time
    9   :          string      grant_time
    10: GrantType  grant_type
    11: WaitStatus wait_status
    12: string     mobile
}

struct WaitQueueData {
    1: required i64            waiting_count
    2:          list<WaitData> waiting_list
    3: required i32            page_size
    4: required i32            page_no
}
struct ListWaitingQueueResponse {
    1 : required WaitQueueData data
    255: optional base.BaseResp BaseResp
}

struct GrantBotQualificationRequest {
    1 : optional i64       total
    2 : optional i64       timestamp
    3 : optional list<i64> user_ids
    4 : required GrantType grant_type
    255: optional base.Base Base
}

struct GrantBotQualificationResponse {

    255: optional base.BaseResp BaseResp
}


struct GetWaitListConfigRequest {
    255: optional base.Base Base

}

struct GetWaitListConfigResponse {
    1 : i64 begin_time // 开启时为一个时间戳，未开启是为-1
    255: optional base.BaseResp BaseResp
}

struct GetWaitListStatisticalRequest {
    255: optional base.Base Base
}

struct GetWaitListStatisticalResponse {
    2 : i32 wait_list_count
    3 : i32 grant_count
    255: optional base.BaseResp BaseResp
}

struct DayStatisticalInfo {
    2: i32 wait_list_count
    3: i32 grant_count
}

struct StatisticalInfo {
    1: DayStatisticalInfo info
}

struct AddWaitListUserRequest {
    1 : required   i64           user_id
    2 : WaitStatus wait_status
    3 : string     using_for
    4 : string     hear_from
    5 : string     ext_message
    6 : string     ip
    7 : i64        register_time
    8 : string     email
    9 : string     mobile

    255: optional base.Base Base
}

struct AddWaitListUserResponse {

    255: optional base.BaseResp BaseResp
}

/* ------------- account cancel callback start --------------- */
struct UCenterGetAllUserDataRequest {
    1 : i32                              AppId=0
    2 : i64                              UserId=0
    3 : user_delete_base.UserIdentifier  UserIdentifier
    4 : user_delete_base.UserDeleteScene DeleteScene
    255: base.Base Base
}

struct UCenterGetAllUserDataResponse {
    1 : list<user_delete_base.UserData> UserData
    255: base.BaseResp BaseResp // code 使用 user_delete_base.UserDeleteRespCode
}

struct UCenterDeleteUserDataRequest {
    1 : i64                              TaskId
    2 : i32                              AppId
    3 : i64                              UserId
    4 : user_delete_base.UserIdentifier  UserIdentifier
    5 : user_delete_base.UserDeleteScene DeleteScene
    255: base.Base Base
}

struct UCenterDeleteUserDataResponse {
    255: base.BaseResp BaseResp // code 使用 user_delete_base.UserDeleteRespCode
}

struct UCenterRestoreUserDataRequest {
    1 : i64                              TaskId
    2 : i32                              AppId
    3 : i64                              UserId
    4 : user_delete_base.RestoreType     RestoreType
    5 : list<user_delete_base.UserData>  UserData       // 删除时通过 GetAllUserData 返回的用户数据
    6 : user_delete_base.UserIdentifier  UserIdentifier
    7 : user_delete_base.UserDeleteScene DeleteScene
    255: base.Base Base
}

struct UCenterRestoreUserDataResponse {
    255: base.BaseResp BaseResp // code 使用 user_delete_base.UserDeleteRespCode
}

struct UCenterVerifyUserDataRequest {
    1 : i64                              TaskId
    2 : i32                              AppId
    3 : i64                              UserId
    4 : user_delete_base.VerifyType      VerifyType
    5 : user_delete_base.UserIdentifier  UserIdentifier
    6 : user_delete_base.UserDeleteScene DeleteScene
    255: base.Base Base
}

struct UCenterVerifyUserDataResponse {
    255: base.BaseResp BaseResp // code 使用 user_delete_base.UserDeleteRespCode
}
/* ------------- account cancel callback end --------------- */

// 创建邀请
enum InviteFunc {
    GetInfo = 1
}

// 打开/关闭team分享加入链接
struct InviteMemberLinkV2Request {
    1: required i64        space_id                (api.js_conv='true' agw.js_conv="str")
    2: required bool       team_invite_link_status // true-打开链接；false-关闭链接
    3:          InviteFunc func                    // 1 获取信息
    255: base.Base Base
}

struct InviteMemberLinkData {
    1: string key
    2: string expire_time           // 过期时间，时间戳，秒级别
}

struct InviteMemberLinkV2Response {
    1: i64                  code
    2: string               msg
    3: InviteMemberLinkData data

    255: base.BaseResp BaseResp
}

struct CreateInviteRequest {
    1 : required i64 SpaceID
    2 : required i64 UserId
    255: base.Base Base (api.none="true")
}
struct CreateInviteData {
    1: string Secret
}
struct CreateInviteResponse {
    1 : required CreateInviteData Data
    255: required base.BaseResp BaseResp (api.none="true")
}

// 加入
struct JoinSpaceV2Request {
    1: required string space_id                   // 申请 or 邀请 code码
    2: optional JoinSpaceType  join_space_type    // 加入空间类型
    3: optional bool is_reject                    // 邀请管理可以选择拒绝

    255: base.Base Base (api.none="true")
}
struct JoinSpaceData {
    1: i64 space_id (api.js_conv='true' agw.js_conv="str")
}
struct JoinSpaceV2Response {
    1:          i64           code
    2:          string        msg
    3: required JoinSpaceData Data

    255: base.BaseResp BaseResp (api.none="true")
}

// 绑定火山trn
struct BindVolcanoTrnRequest {
    1: required string space_id
    2: required string trn
    3: optional string account_name

    255: base.Base Base (api.none="true")
}

struct BindVolcanoTrnData {
    1:  string        account_name              // 火山账号名称
    2:  string        pre_space_id              // 之前绑定的空间id
    3:  string        pre_space_name            // 之前绑定的空间名称
    4:  string        pre_user_id               // 之前绑定的用户id
    5:  string        pre_user_name             // 之前绑定的用户昵称
    6:  string        pre_user_unique_name      // 之前绑定的用户名
}

struct BindVolcanoTrnResponse {
    1:  i64                         code
    2:  string                      msg
    3: BindVolcanoTrnData           data


    255: base.BaseResp BaseResp (api.none="true")
}

// 解绑火山trn
struct UnbindVolcanoTrnRequest {
    1: required string space_id

    255: base.Base Base (api.none="true")
}

struct UnbindVolcanoTrnData {
    1:  string        account_name               // 火山账号名称
}

struct UnbindVolcanoTrnResponse {
    1:  i64                         code
    2:  string                      msg
    3:  UnbindVolcanoTrnData        data

    255: base.BaseResp BaseResp (api.none="true")
}

// 邀请管理列表
enum SpaceInviteStatus {
    All              =  0     // 所有
    Joined           =  1     // 已加入
    Confirming       =  2     // 确认中
    Rejected         =  3     // 已拒绝
    Revoked          =  4     // 已撤销
    Expired          =  5     // 已过期
}

struct GetSpaceInviteManageListRequest {
    1: i64 space_id                                    (api.js_conv='true' agw.js_conv="str") // 空间id
    2: SpaceInviteStatus space_invite_status           // 空间邀请状态
    3: string search_word                              // 搜索词
    4: i32 page
    5: i32 size

    255: optional base.Base Base
}

struct SpaceInviteManageInfo {
    1: required i64           invite_user_id            (api.js_conv='true' agw.js_conv="str") // 邀请用户id
    2: required string        invite_nick_name          // 邀请用户昵称
    3: required string        invite_user_name          // 邀请用户名
    4: required string        invite_user_icon_url      // 邀请用户图像
    5: required string        invite_date               // 邀请时间，时间戳 精确到秒
    6: required SpaceInviteStatus space_invite_status   // 邀请状态
    7: required i64           operator_user_id            (api.js_conv='true' agw.js_conv="str") // 操作人用户id
    8: required string        operator_nick_name          // 操作人用户昵称
    9: required string        operator_user_name          // 操作人用户名
    10: required string       operator_user_icon_url      // 操作人用户图像
    11: required SpaceRoleType operator_role_type         // 操作人角色类型
    12: required string       expired_date                // 过期时间，时间戳 精确到秒
}

struct SpaceInviteManageInfoData {
    1: list<SpaceInviteManageInfo> space_invite_manage_info_list             // 空间邀请管理信息
    2: i32 total,
    3: bool has_more,
}

struct GetSpaceInviteManageListResponse {
    1: SpaceInviteManageInfoData data,   // 邀请管理信息

    253: i32 code,
    254: string msg,
    255: optional base.BaseResp BaseResp (api.none="true"),
}

// 撤销空间管理邀请
struct RevocateSpaceInviteRequest {
    1: i64 space_id                                    (api.js_conv='true' agw.js_conv="str") // 空间id
    2: i64 invite_user_id                              (api.js_conv='true' agw.js_conv="str") // 撤销邀请的用户uid

    255: optional base.Base Base
}

struct RevocateSpaceInviteResponse {

    253: i32 code,
    254: string msg,
    255: optional base.BaseResp BaseResp (api.none="true"),
}

// 关闭邀请
struct CloseInviteRequest {
    1 : required i64 SpaceID
    2 : required i64 UserId
    255: optional base.Base Base
}
struct CloseInviteData {

}
struct CloseInviteResponse {
    1 : required CloseInviteData Data
    255: required base.BaseResp BaseResp
}
// 获取邀请信息
struct InviteInfo {
    1: i64    SpaceId
    2: i64    CreatorId
    3: string Secret
}
struct GetInviteInfoRequest {
    1 : string Secret
    2 : i64    SpaceId
    255: optional base.Base Base
}

struct GetInviteInfoData {
    1: list<InviteInfo> Infos
}
struct GetInviteInfoResponse {
    1 : required GetInviteInfoData Data
    255: required base.BaseResp BaseResp
}

struct CheckWorkInfoRequest {
    1 : WorkInfo WorkInfo
    2 : i64      userId
    3 : i64      botId
    4 : i64      spaceId
    255: optional base.Base Base

}
struct CheckWorkInfoResponse {
    1 : bool res
    255: required base.BaseResp BaseResp

}


/* ------------- prompt optimize start --------------------- */
enum PromptOptimizeType {
    MARKDOWN = 1
}

struct PromptOptimizeRequest {
    1 : i64      DeviceId
    2 : string   PushUuid
    3 : required string             OriginalPrompt
    4 : required PromptOptimizeType OptimizeType
    5 : required i64                UserId
    6 : i64      BotId
    7 : bool     Sync

    255: optional base.Base Base
}

struct PromptOptimizeResponse {
    1 : required i64    record_id
    2 : optional string optimized_prompt
    255: optional base.BaseResp BaseResp
}
/* ------------- prompt optimize end --------------------- */
/* ------------- chat flow start --------------------- */
struct CreateAgentRequest{
    1: required i64                SpaceId
    2: required i64                BotId               // draft botId
    3: required i64                UserId
    4: optional AgentType          AgentType
    5: optional AgentPosition      position
    6: optional AgentReferenceInfo references
    7: optional string base_commit_version, // 修改的基线版本
    8: optional bot_common.AgentVersionCompat VersionCompat, //0或者2
    255: optional base.Base Base
}

struct CreateAgentResponse{
    1 : required DraftAgent agentInfo
    255: optional base.BaseResp BaseResp
}
struct CopyAgentRequest{
    1 : required i64    SpaceId
    2 : required i64    BotId               // draft botId
    3 : required i64    UserId
    4 : required i64    AgentId
    5 : optional string base_commit_version // 修改的基线版本
    255: optional base.Base Base
}

struct CopyAgentResponse{
    1 : required DraftAgent agentInfo
    255: optional base.BaseResp BaseResp
}

/* ------------- chat flow end --------------------- */

// 需要是蛇形。json string和developer_api 的匹配
struct AnswerActionConfig {
    1: string                  key
    2: string                  name         // 默认
    3: ActionIcon              icon         // 下发svg, 不过期的url
    4: map<string,string>      name_i18n    // 存储用户i18的name
    5: AnswerActionTriggerRule trigger_rule // Direct 没有值； WebView 包含 webview_url和 webview_callback_psm两个key；SendMessage 包含send_message_prompt
    6: i32                     position


}


struct ActionIcon {
    1: string type
    2: string default_url
    3: string active_url
    4: string default_uri // 默认状态
    5: string active_uri  // 按下按钮的状态
}

struct AnswerActionTriggerRule {
    1: AnswerActionTriggerType type
    2: bool                    need_preloading
    3: map<string,string>      trigger_data    // 根据 AnswerActionTriggerType决定
}
enum AnswerActionsMode {
    Default   = 1
    Customize = 2
}

enum AnswerActionTriggerType {
    Direct      = 1 // 平台预设Trigger action
    WebView     = 2 // 点击Action 显示自定义的H5页面
    SendMessage = 3 // 点击Action 发送自定义的用户消息

}

struct UpdateExploreBotFixRequest {
    1  : required string           DraftBotId

    6  : optional BotExploreStatus ExploreStatus // 上线下线
    9  : optional i64              UserId
    10 : optional i64              BotUserId
    255: optional base.Base Base
}



struct UpdateExploreBotFixResponse {
    255: base.BaseResp BaseResp
}

struct GetBotMigrateProgressRequest {
    1 : optional i64         TargetSpaceId
    2 : optional i64         BotId
    3 : i32      Page
    4 : i32      Size
    5 : optional AsyncStatus FinalStatus
    255: optional base.Base Base

}

enum AsyncStatus {

    Create = 1 // 创建
    Finish = 2 // 成功
    Failed = 3 // 失败
}


struct GetBotMigrateProgressResponse {

    1 : list<MigBotSpaceAsyncTask> AsyncTask
    2 : i64                        Total
    255: base.BaseResp BaseResp

}


struct MigBotSpaceAsyncTask {
    1            :             i64                      Id
    2            :             i64                      PrimaryId
    3            :             string                   TaskName
    4            :             AsyncStatus              Status
    5            :             MigBotSpaceTaskInfo      TaskInfo
    6            :             MigBotSpaceSubTaskStatus SubTaskStatus
    7            :             i64                      OperatorId
    8            :             i64                      CreateTime
    9            :             list<DraftBot>           BotList
    10: optional TransBotSpace TransBotSpace


}

 struct MigBotSpaceAsyncTaskVO {
    1: list<TransferResourceInfo>  transfer_resource_plugin_list
    2: list<TransferResourceInfo>  transfer_resource_workflow_list
    3: list<TransferResourceInfo>  transfer_resource_knowledge_list
    4: MigBotSpaceTaskInfoVo         task_info
 }

struct MigBotSpaceTaskInfo {
    1: i64       TargetSpaceId
    2: i64       UserId
    3: list<i64> BotIds
    4: i64       OriSpaceId

}

struct MigBotSpaceTaskInfoVo {
    1: string       TargetSpaceId
    4: string       OriSpaceId
}

struct MigBotSpaceSubTaskStatus {
    1: optional bool                       TransferDraftBotSpace
    3: optional bool                       TransferPluginSpace
    4: optional bool                       TransferWorkflowSpace
    5: optional bool                       TransferDatasetSpace
    6: optional bool                       TransferCardSpace
    8: optional list<TransferFailResource> TransferFailPlugin
    9: optional list<TransferFailResource> TransferFailDataset
    13:optional list<TransferFailResource>  TransferFailWorkFlow
    10: list<TransferResourceInfo>  TransferResourcePluginList
    11: list<TransferResourceInfo>  TransferResourceWorkFlowList
    12: list<TransferResourceInfo>  TransferResourceKnowledgeList
}

struct MigrateDraftBotRequest {
    1 : list<i64> BotIds
    2 : i64       TargetSpaceId
    3 : i64       OperatorId

    255: optional base.Base Base

}

struct TransferFailResource {
    1: i64    id
    2: string name
}


struct TransferResourceInfo {
    1: string    id
    2: string name
    3: string icon
    5: i32 status // 0:未成功 1：成功
}


struct MigrateDraftBotResponse {

    255: base.BaseResp BaseResp

}

struct RetryMigTaskRequest {
    1 : i64 TaskId
    3 : i64 OperatorId

    255: optional base.Base Base

}

struct RetryMigTaskResponse {

    255: base.BaseResp BaseResp

}

// --------------------voice--------------------------------
struct GetVoiceConfigRequest {
    255: optional base.Base Base
}

struct GetVoiceConfigResponse {
    1 : required list<VoiceConfig> VoiceList

    255: base.BaseResp BaseResp
}

struct VoiceConfig {
    1: required i64    ID (agw.key = "id",go.tag="json:\"id\"")
    2: required string LanguageCode (agw.key = "language_code", go.tag="json:\"language_code\"")
    3: required string PreviewText (agw.key = "preview_text", go.tag="json:\"preview_text\"")
    4: required string PreviewAudio (agw.key = "preview_audio", go.tag="json:\"preview_audio\"")
    5: required string LanguageName (agw.key = "language_name", go.tag="json:\"language_name\"")
    6: required string Name (agw.key = "name", go.tag="json:\"name\"")
    7: required string StyleID (agw.key = "style_id", go.tag="json:\"style_id\"")
    8: optional i32    IsDefault (agw.key = "is_default", go.tag="json:\"is_default\"")
    9: optional i64    UpdateTime (agw.key = "update_time", go.tag="json:\"update_time\"")
    10: optional i32   Status (agw.key = "status", go.tag="json:\"status\"")
}

struct GetVoiceTokenRequest {
    255: optional base.Base Base
}

struct GetVoiceTokenResponse {
    1 : required string Token
    255: base.BaseResp BaseResp
}

struct SupportVoiceCallRequest {
    1: required list<i64> voice_id_list                       // 查询音色id是否支持语音通话

    255: optional base.Base Base (api.none="true")
}

struct SupportVoiceCallResponse {
    1:   required map<i64,bool> support_voice_id_map        //  支持语音通话的音色id

    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct GetSupportLanguageRequest {
    255: optional base.Base Base (api.none="true")
}

struct GetSupportLanguageResponse {
    1: optional list<LanguageConfig> language_list

    255: optional base.BaseResp BaseResp
}

struct LanguageConfig {
    1: required string language_code
    2: required string language_name
    3: required string language_loc
}

struct GetOpVoiceListRequest {
    1: optional list<i64>  voice_ids (agw.js_conv="str" api.js_conv="true" agw.key="voice_ids")
    2: optional string     name
    3: optional string     style_id
    4: optional string     language_code
    5: optional i32        status
    6: optional i32        page_index
    7: optional i32        page_size

    255: optional base.Base Base (api.none="true")
}

struct GetOpVoiceListResponse {
    1: optional list<VoiceConfig> voice_list
    2: optional i32               total

    255: optional base.BaseResp BaseResp
}

struct SynchronizeVoiceListRequest {
    255: optional base.BaseResp BaseResp
}

struct SynchronizeVoiceListResponse {
    1: optional CountVoiceList success_voice
    2: optional CountVoiceList failed_voice

    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct CountVoiceList {
    1: list<VoiceConfig> voice_list
    2: i32               total
}

struct GenerateAudioRequest {
    1: required string style_id
    2: required string preview_text

    255: optional base.BaseResp BaseResp
}

struct GenerateAudioResponse {
    1: optional string audio_url
    2: optional string audio_uri

    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct UpdateOpVoiceRequest {
    1: required i64    voice_id
    2: optional string name
    3: optional string preview_text     // 预览音频的文本
    4: optional string preview_audio    // 预览音频的uri
    5: optional i32    status           // 状态
    6: optional i32    is_default      // 是否为默认音色
    7: optional string language_code   // 音色

    255: required base.BaseResp BaseResp
}

struct UpdateOpVoiceResponse {

    253: required i64    code
    254: required string msg
    255: optional base.BaseResp BaseResp
}


// --------------------voice end--------------------------------


// draftbot display info
enum TabStatus {
    Default = 0
    Open    = 1
    Close   = 2
    Hide    = 3
}

struct TabDisplayInfo {
    1            :         optional         TabStatus PluginTabStatus
    2            :         optional         TabStatus WorkflowTabStatus
    3            :         optional         TabStatus KnowledgeTabStatus
    4            :         optional         TabStatus DatabaseTabStatus
    5            :         optional         TabStatus VariableTabStatus
    6            :         optional         TabStatus OpeningDialogTabStatus
    7            :         optional         TabStatus ScheduledTaskTabStatus
    8            :         optional         TabStatus SuggestionTabStatus
    9            :         optional         TabStatus TtsTabStatus
    10: optional TabStatus FileboxTabStatus
    11: optional TabStatus long_term_memory_tab_status
    12: optional TabStatus answer_action_tab_status
    13: optional TabStatus ImageFlowTabStatus
    14: optional TabStatus background_image_tab_status
    15: optional TabStatus shortcut_tab_status
    16: optional TabStatus knowledge_table_tab_status
    17: optional TabStatus knowledge_text_tab_status
    18: optional TabStatus knowledge_photo_tab_status
    19: optional TabStatus hook_info_tab_status
    20: optional TabStatus default_user_input_tab_status
}


struct GetDraftBotDisplayInfoRequest {
    1 : required i64 BotId
    2 : required i64 UserId

    255: optional base.Base Base
}

struct GetDraftBotDisplayInfoResponse {
    1 : optional TabDisplayInfo TabDisplayInfo

    255: optional base.BaseResp BaseResp
}

struct UpdateDraftBotDisplayInfoRequest {
    1 : required i64            BotId
    2 : required i64            UserId
    3 : optional TabDisplayInfo TabDisplayInfo
    4 : optional i64 SpaceId

    255: optional base.Base Base
}

struct UpdateDraftBotDisplayInfoResponse {
    255: optional base.BaseResp BaseResp
}

enum ProduceType {
    OptimizePrompt = 1
    SuggestPlugin  = 2
    NL2Bot         = 3
}

struct ReportProduceRecordRequest {
    1 : optional i64         BotId
    2 : required i64         UserId
    3 : required ProduceType Type
    4 : required bool        Success
    5 : optional string      Produced
    6 : optional string      Before
    7 : optional string      Based
    8 : optional string      Ext
    9 : optional i32         SceneType // bot's plugin retrive scene type 0-Bot详情页， 1-NL2Bot

    255: optional base.Base Base
}

struct ReportProduceRecordResponse {
    1 : required i64 RecordId
    255: optional base.BaseResp BaseResp
}

// -------------------- bot version相关 --------------------
struct SaveDraftBotRequest {
    1  : required i64                           SpaceId         , // 传0表示写到个人空间
    2  : required i64                           BotId           , // 新建时传0
    3  : required i64                           ConnectorId     , // 发布业务方id
    4  : required i64                           UserId          , // 用户uid
    5  : optional string                        Name            , // Bot名称
    6  : optional string                        Description     , // Bot描述
    7  : optional string                        IconUri         , // Bot图标
    8  : optional bot_common.PromptInfo         PromptInfo      , // Prompt 信息
    9  : optional bot_common.ModelInfo          ModelInfo       , // 模型信息
    10 : optional list<bot_common.PluginInfo>   PluginInfoList  , // 插件信息
    11 : optional bot_common.OnboardingInfo     OnboardingInfo  , // 开场白
    12 : optional list<bot_common.WorkflowInfo> WorkflowInfoList, // Workflow信息
    13 : optional bot_common.SuggestReplyInfo   SuggestReplyInfo, // 推荐问题
    14 : optional bot_common.VoicesInfo         VoicesInfo      , // 音色配置
    15 : optional bot_common.BotExtInfo         BotExtInfo      , // 额外信息，扩展字段
    16:  optional bool                          isCreate        , // 是否新建，允许BotId不为0新建草稿bot
    17:  optional string                        Version         , // 线上bot对应的version
    18:  optional list<bot_common.BackgroundImageInfo> BackgroundImageInfoList  // 背景图

    255: base.Base Base
}

struct SaveDraftBotResponse {
    1  : required i64           BotId   ,

    255: required base.BaseResp BaseResp
}

enum BotInfoType {
    DraftBot   = 1 // 草稿bot
    BotVersion = 2 // 线上bot
}

struct GetBotInfoV2Request {
    1 : required BotInfoType BotInfoType  // bot 信息类型
    2 : required i64         BotId        // botId
    3 : required i64         ConnectorId  // 业务线id，草稿bot传0
    4 : optional string      Version      // bot版本
    5 : optional BotMode     BotMode      // 不传则本身bot是哪种模式就返回哪种模式信息
    6 : optional string      ConnectorUid // 业务线Uid，如：草稿多人协作uid
    7 : optional SearchType  SearchType   // 查询类型，api表示前端用，Model表示copilot用

    8 : optional string      CommitVersion // 指定commitVersion获取bot信息
    9 : optional OnboardingSetting OnboardingSetting
    10 : optional GetBotVersionOption Option  // 获取详情的选项

    255: base.Base Base
}

struct OnboardingSetting {
      1: optional ReplaceUserName ReplaceUserName  //默认替换为空
      2: optional i64 ReplaceTargetUid
}

enum ReplaceUserName {
     ReplaceUidWithNil =0
     ReplaceUidWithUserName =1
     KeepUserName =2

}


struct GetBotInfoV2Response {
    1 : bot_common.BotInfo BotInfo // bot信息
    2 : optional    BotOptionData BotOptionData // bot选项信息

    255: required base.BaseResp BaseResp
}

struct GetPublishBotListRequest {
    1 : required string  space_id
    2 : optional BotMode bot_mode
    3 : required i64     page_num
    4 : required i64     page_size
    5 : optional string  name
    6 : optional bool    login_user_create // 登录用户自己创建的
    7 : optional string  bot_id            // 被排除的botId
    255: optional base.Base Base
}

struct DraftBotApi {
    1   :                   string             id            // drft_bot_id
    2   :                   string             name
    3   :                   string             description
    4   :                   string             icon_uri
    5   :                   string             icon_url
    6   :                   VisibilityType     visibility
    7   :                   Publish            has_published
    8   :                   list<AppIDInfo>    app_ids
    9   :                   string             create_time
    10: string              update_time
    11: string              creator_id
    12: string              space_id
    13: ModelInfo           model_info
    14: Creator             creator
    15: string              publish_time

    16: list<ConnectorInfo> connectors

    17: string              index
    18: BotExploreStatus    bot_explore_status
    19: string              space_name
    20: string              explore_id         // explore_bot_id
    21: string              last_online_time
    22: BotMode             bot_mode
    23: string              version
    24: WorkInfoApi         work_info
    25: DraftBotStatus      status  // 引用的草稿bot状态
    26: optional bot_common.SuggestReplyInfo   suggest_reply, // 推荐问题
}

struct WorkInfoApi {
    1: string suggest_reply
}

struct GetPublishBotListData {
    1: required i64               total
    2: optional list<DraftBotApi> bot_infos
}

struct GetPublishBotListResponse {
    1             :      required GetPublishBotListData data
    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct AgentReferenceInfo{
    1: required string ReferenceId
    2: required string Version
}

struct BatchCreateAgentRequest {
    1: required string                   space_id
    2: required string                   bot_id              // draftbotid
    3: required AgentType                agent_type
    4: required list<AgentPosition>      position
    5: optional list<AgentReferenceInfo> references
    6: required i32 agent_cnt // references为空时，批量创建的agent数量
    7: optional string base_commit_version, // 修改的基线版本
    8: optional bot_common.AgentVersionCompat version_compat, //0或者2
    255: optional base.Base Base
}

// agent 工作区间各个模块的信息
struct AgentWorkInfoApi {
    1: optional string                prompt          // agent prompt, 前端存储 server不需要理解
    2: optional string                other_info      // 模型配置
    3: optional string                tools           // plugin 信息
    4: optional string                dataset         // dataset 信息
    5: optional string                workflow        // workflow 信息
    6: optional string                system_info_all // 同bot draft 的systemInfoAll
    7: optional bot_common.JumpConfig jump_config     // 回溯配置
    8: optional string                suggest_reply   // 推荐回复配置
    9: optional string                hook_info       // hook信息
}

struct AgentInfoApi {
    1 : optional string              id                   ,
    2 : optional AgentType           agent_type           ,
    3 : optional string              name                 ,
    4 : optional AgentPosition       position             ,
    5 : optional string              icon_uri             ,
    6 : optional list<Intent>        intents              ,
    7 : optional AgentWorkInfoApi    work_info            ,
    8 : optional string              reference_id         ,
    9 : optional string              first_version        ,
    10: optional string              current_version      ,
    11: optional ReferenceInfoStatus reference_info_status, // 1:有可用更新 2:被删除
    12: optional string              description          ,
}

struct BatchCreateAgentResponse {
    1:   required list<AgentInfoApi> data
    2:   optional Branch             branch
    3:   optional bool               same_with_online
    253: required i64                code
    254: required string             msg
    255: required base.BaseResp BaseResp
}

struct UpdateAgentData {
    1: optional Branch branch
    2: optional bool   same_with_online
}

struct UpdateAgentRequest {
    1: required string id
    2: optional string reference_id
    3: optional string current_version
    4: optional string space_id
    5: optional string bot_id
    6: optional string base_commit_version // 修改的基线版本
    7: optional string name // agent名
    8: optional string description // agent描述
    9: optional AgentPosition position // agent画布位置
    10: optional string icon_uri // agent头像
    11: optional list<IntentApi> intents
    12: optional AgentWorkInfoApi work_info
    13: optional bool is_delete
    255: optional base.Base Base
}

struct UpdateAgentResponse {
    1:   required UpdateAgentData data
    253: required i64             code
    254: required string          msg
    255: required base.BaseResp BaseResp
}

struct PublishInfo {
    1: string bot_id
    2: string info        // 对历史记录补充的其他信息
    3: string create_time
    4: string bot_version // bot版本号
}

struct BotLastPublishInfoRequest {
    1 : required string  space_id
    2 : required string  bot_id
    3 : optional BotMode bot_mode
    255: optional base.Base Base
}
struct BotLastPublishInfoData {
    1: required list<PublishInfo> publish_info
}
struct BotLastPublishInfoResponse {
    1             :      required BotLastPublishInfoData data
    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct BotVersionPair {
    1: string version
    2: string bot_id
}
struct MGetBotByVersionRequest {
    1 : required list<BotVersionPair> bot_versions
    2 : required string               space_id
    255: optional base.Base Base (api.none="true")
}
struct MGetBotByVersionResponse {
    1             :      optional list<DraftBotApi> data
    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp (api.none="true")
}

struct BotLastVersionProcessRequest {
    1 : required bool IsTest    // 测试100条数据
    2 : optional i64  creatorId
    255: optional base.Base Base (api.none="true")
}
struct BotLastVersionProcessResponse {
    255: required base.BaseResp BaseResp
}

struct ProduceBotRequest {
    1 : optional string       space_id            // bot's space_id
    2 : optional string       name                // bot's name
    3 : optional string       description         // bot's description
    4 : optional string       icon_url            // bot's icon_url
    5 : optional string       icon_uri            // bot's icon, uri
    6 : optional string       prompt              // bot's system_prompt
    7 : optional string       plugin_apis         // bot's plugins
    8 : optional string       prologue            // bot's prologue
    9 : optional list<string> suggested_questions // bot's suggested_question
    10: optional BotSourceForNl2Bot bot_source    // bot's source
    255: optional base.Base Base (api.none="true")
}

enum BotSourceForNl2Bot {
    CozeHome = 1  // nl2bot, bot由coze小助手创建
    Space = 2     // nl2bot, bot由空间创建
}

struct ProduceBotData {
    1: string bot_id      // bot_id
    2: string name        // bot's name
    3: string description // bot's description
    4: string icon_url    // bot's icon_url
    5: string link        // bot's link
}

struct ProduceBotResponse {
    1             :      optional ProduceBotData data
    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct UpdateProducedBotRequest {
    1 : required string bot_id
    2 : optional string name        // bot's name
    3 : optional string description // bot's description
    4 : optional string icon_url    // bot's icon_url
    5 : optional string icon_uri    // bot's icon, uri
    255: optional base.Base Base (api.none="true")
}

struct UpdateProducedBotResponse {
    1             :      optional ProduceBotData data
    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct GetBotLatestVersionWithMultiConnectorRequest {
    1 : required i64       BotId           // botId
    2 : optional list<i64> ConnectorIdList // 业务线id，该参数不传默认是已发布的所有渠道

    255: base.Base Base
}

struct GetBotLatestVersionWithMultiConnectorResponse {
    1 : map<i64,bot_common.BotInfo> ConnectorBotInfoMap // bot信息, key:connector_id, value:bot信息

    255: required base.BaseResp BaseResp
}

struct GetBotVersionV2Request {
    1 : required i64                 BotId   // botId
    2 : optional string              Version // bot版本，不传则获取最新版本
    3 : optional GetBotVersionOption Option  // 获取详情的选项

    255: base.Base Base
}

struct GetBotVersionOption {
    1: optional bool NeedModelDetail     // 是否需要模型详情
    2: optional bool NeedPluginDetail    // 是否需要插件详情
    3: optional bool NeedWorkflowDetail  // 是否需要workflow详情
    4: optional bool NeedKnowledgeDetail // 是否需要knowledge详情
    5: optional bool NeedShortcutCommand // 是否需要快捷指令
}

struct GetBotVersionV2Response {
    1 : BotVersionData BotInfo       // bot详细信息
    2 : optional       BotOptionData BotOptionData // bot选项信息

    255: required base.BaseResp BaseResp
}

struct BotVersionData {
    1: bot_common.BotInfo BotBaseInfo            // bot基础信息
    2: list<i64>          PublishedConnectorList // bot该版本发布到的渠道
}

struct BotOptionData {
    1: optional map<i64,ModelDetail>        model_detail_map      // 模型详情
    2: optional map<i64,PluginDetal>        plugin_detail_map     // 插件详情
    3: optional map<i64,PluginAPIDetal>     plugin_api_detail_map // 插件API详情
    4: optional map<i64,WorkflowDetail>     workflow_detail_map   // workflow详情
    5: optional map<string,KnowledgeDetail> knowledge_detail_map  // knowledge详情
    6: optional list<shortcut_command.ShortcutCommand>   shortcut_command_list  // 快捷指令list
}

struct ModelDetail {
    1: optional string name           // 模型展示名（对用户）
    2: optional string model_name     // 模型名（对内部）
    3: optional i64    model_id       (agw.js_conv="str" api.js_conv="true") // 模型ID
    4: optional i64    model_family   // 模型类别
    5: optional string model_icon_url // IconURL
}

struct PluginDetal {
    1: optional i64    id            (agw.js_conv="str" api.js_conv="true")
    2: optional string name
    3: optional string description
    4: optional string icon_url
    5: optional i64    plugin_type
    6: optional i64    plugin_status
    7: optional bool   is_official
}

struct PluginAPIDetal {
    1: optional i64                   id          (agw.js_conv="str" api.js_conv="true")
    2: optional string                name
    3: optional string                description
    4: optional list<PluginParameter> parameters
    5: optional i64                   plugin_id   (agw.js_conv="str" api.js_conv="true")
}

struct PluginParameter {
    1: optional string                name
    2: optional string                description
    3: optional bool                  is_required
    4: optional string                type
    5: optional list<PluginParameter> sub_parameters
    6: optional string                sub_type       // 如果Type是数组，则有subtype
    7: optional i64                   assist_type
}

struct WorkflowDetail {
    1: optional i64    id          (agw.js_conv="str" api.js_conv="true")
    2: optional string name
    3: optional string description
    4: optional string icon_url
    5: optional i64    status
    6: optional i64    type        // 类型，1:官方模版
    7: optional i64    plugin_id   (agw.js_conv="str" api.js_conv="true") // workfklow对应的插件id
    8: optional bool   is_official
    9: optional PluginAPIDetal api_detail
}

struct KnowledgeDetail {
    1: optional string id
    2: optional string name
    3: optional string icon_url
    4: DataSetType format_type
}

struct GetPublishedBotListRequest {
    1 : required list<i64> space_id_list (agw.js_conv="str" api.js_conv="true")
    2 : required i32       page
    3 : required i32       size

    255: base.Base Base (api.none="true")
}

struct GetPublishedBotListResponse {
    1             :      GetPublishedBotListData data

    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp (api.none="true")
}

struct GetPublishedBotListData {
    1:          i64                 total
    2: optional list<SimpleBotInfo> published_bot_list
}

struct SimpleBotInfo {
    1            :   i64                bot_id             (agw.js_conv="str"  api.js_conv="true")
    2            :   string             version
    3            :   string             name
    4            :   string             description
    5            :   string             icon_url
    6            :   i64                creator_id         (agw.js_conv="str"  api.js_conv="true")
    7            :   i64                publish_time       (agw.js_conv="str"  api.js_conv="true") // 发布时间的时间戳,秒级
    8            :   bot_common.BotMode bot_mode           // bot 类型，0-single_agent, 1-multi_agent
    9            :   optional           ModelDetail        model_info          // single_agent的时候才会返回
    10: optional i64 space_id           (agw.js_conv="str" api.js_conv="true")
}

struct GetBotVersionInfoRequest {
    1 : required i64                bot_id  (agw.js_conv="str" api.js_conv="true") // bot_id
    2 : required string             version // 版本
    3 : required GetBotVersionScene scene   // 查看的场景，用于鉴权

    255: base.Base Base (api.none="true")
}

enum GetBotVersionScene {
    BotStore = 1
}

struct GetBotVersionInfoResponse {
    1             :      GetBotVersionInfoData data

    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp (api.none="true")
}

struct GetBotVersionInfoData {
    1:          BotVersionInfo bot_version_info
    2: optional BotOptionData  bot_option_data
}

struct BotVersionInfo {
    1:          bot_common.BotInfo common_bot_info
    2: optional Creator            creator
    3: optional list<TaskInfoData> preset_tasks    // 预设任务
    4: optional CanvasInfo         canvas_info     // multiAgent的画布信息
    5: optional list<bot_task_common.TaskInfo> task_list     // 定时任务 && webhook 任务
}

struct TaskInfoData {
    1: optional i64    task_id       (agw.js_conv="str" api.js_conv="true")
    2: optional string user_question
    3: optional i64    create_time   (agw.js_conv="str" api.js_conv="true")
    4: optional i64    next_time     (agw.js_conv="str" api.js_conv="true")
    5: optional i32    status
    6: optional i32    preset_type   // 0非预设 1预设(测试) 2预设(发布)
    7: optional string cron_expr
    8: optional string task_content
    9: optional string time_zone
}

struct CanvasInfo {
    1: optional list<Edge> edges
    2: optional i64        connector_type
}

struct Edge {
    1: optional string SourceNodeID
    2: optional string TargetNodeID
    3: optional string SourcePortID
}

enum UserType {
    External = 0
    Internal = 1
}

enum UserStatus {
    Normal   = 1
    Banned   = 2
    Canceled = 3
}

struct UserBasicInfo {
    1: required i64                  UserId         (api.body="user_id")
    2: required UserType             UserType       (api.body="user_type")
    3: required string               Username       (api.body="user_name") // 昵称
    4: required string               UserAvatar     (api.body="user_avatar") // 头像
    5: optional string               UserUniqueName (api.body="user_unique_name") // 用户名
    6: optional bot_common.UserLabel UserLabel      (api.body="user_label") // 用户标签
    7: optional i64                  CreateTime     (api.body="create_time") // 用户创建时间
    8: optional UserStatus           UserStatus     (api.body="user_status") // 用户当前状态
}

struct MGetUserBasicInfoRequest {
    1 : required list<i64> UserIds (agw.js_conv="str", api.js_conv="true", api.body="user_ids")
    2 : optional bool NeedUserStatus (api.body="need_user_status")
    3 : optional bool NeedEnterpriseIdentity (api.body="need_enterprise_identity") // 是否需要企业认证信息，前端通过AGW调用时默认为true

    255: optional base.Base Base (api.none="true")
}

struct MGetUserBasicInfoResponse {
    1 : optional map<i64,UserBasicInfo> UserBasicInfoMap (api.body="id_user_info_map")

    253:          i64           code
    254:          string        msg
    255: optional base.BaseResp BaseResp (api.none="true")
}

struct GetBotUserInfoRequest {
    1 : optional string UserEmail
    2 : optional i64    UserID
    3 : optional i64    AccountID   // 火山accountId

    255: optional base.Base Base
}

struct BotUserInfo {
    1: i64    UserID
    2: i64    UserType
    3: string UserEmail
    4: string VolcanoOpenID
    5: i64    VolcanoAccountID
    6: i64    VirtualMerchantID
}

struct GetBotUserInfoResponse {
    1 : BotUserInfo data        // 兼容老逻辑，请求参数里面有UserEmail 和 UserID 时赋值
    2 : list<BotUserInfo> BotUserInfoList

    255: optional base.BaseResp BaseResp
}

struct SaveBotUserInfoRequest {
    1: required i64         UserID
    2: optional string      VolcanoOpenID

    255: optional base.Base Base
}

struct SaveBotUserInfoResponse {

    255: optional base.BaseResp BaseResp
}

struct GetCozeProRightsRequest {

    255: base.Base Base (api.none="true")
}

struct CozeRights {
    1: string rights_name;                              // 权益名称
    2: list<string> rights_content_list                 // 权益内容
}

struct NotOpenCozeProRightsInfo {
    1: list<CozeRights>  coze_pro_rights_list               // 火山专业版信息列表
    2: list<CozeRights>  coze_base_rights_list              // 火山基础版信息列表
}

struct OpenCozeProRightsInfo{
    1: list<CozeRights>  open_coze_pro_rights_list          // 开通了的火山专业版信息列表
}

enum VolcanoUserType {
    RootUser     =  1  //  根用户
    BasicUser    =  2  //  子用户
}

struct GetCozeProRightsResponse {
    1: bool is_open_coze_pro_rights                                          // 是否已经开通coze专业版权益，至少需要开通一条权益
    2: i64 account_id                                                        // 火山账号id，绑定则非0，没绑定则为0
    3: NotOpenCozeProRightsInfo  not_open_coze_pro_rights_info               // 未开通专业版展示信息
    4: OpenCozeProRightsInfo  open_coze_pro_rights_info                      // 开通专业版展示信息
    5: string instance_id                                                    // 火山实例Id
    6: VolcanoUserType volcano_user_type                                     // 火山用户类型

    255: base.BaseResp BaseResp (api.none="true")
}

struct MGetSpaceInfoRequest {
    1 : required list<i64> SpaceIds

    255: optional base.Base Base
}

struct MGetSpaceInfoResponse {
    1 : required map<i64,BotSpace> SpaceInfoMap

    255: optional base.BaseResp BaseResp
}

struct ConversationInfo {
    1: i64  ConversationId
    2: i64  UserId
    3: i64  BotId
    4: bool DraftMode
    5: Scene Scene
}

enum Scene{
    Default  = 0,
    Explore  = 1,
    BotStore = 2,
    CozeHome = 3,
    Playground = 4,
    Evaluation = 5, // 评测平台
    AgentApp = 6,

    GenerateAgentInfo = 8, // 生成agent信息
}

struct GetConversationRequest {
    1 : required i64  BotId
    2 : required i64  UserId
    3 : optional bool DraftMode
    4 : optional Scene Scene // 场景
    5 : optional string BizKind // 同一个bot和uid下面的不同业务情况
    6 : list<i64> InsertHistoryMessageList // 存在创建聊天记录前需要插入聊天等情况
    7 : optional bool MustAppend
    8 : optional i64  share_id // 分享ID

    255: base.Base Base
}

struct GetConversationResponse {
    1 : required ConversationInfo ConversationInfo

    255: required base.BaseResp BaseResp
}


struct GetConversationInfoByIdRequest {
    1 : required i64 ConversationId

    255: base.Base Base
}

struct GetConversationInfoByIdResponse {
    1 : required ConversationInfo ConversationInfo

    255: required base.BaseResp BaseResp
}

struct MgetHomeConversationRequest {
    1: list<i64> UserIds

    255: base.Base Base
}

struct MgetHomeConversationResponse {
    1: map<i64,list<ConversationInfo>> ConversationInfoMap

    255: required base.BaseResp BaseResp
}

struct GetCozeMessageListRequest {
    1:    required i64  BotId
    2:    optional i64 UserId
    3:    optional string Cursor
    4:    optional i32 Count

    255: base.Base Base

}

struct GetCozeMessageListResponse {
    1             :      GetCozeMessageListData Data

    255: required base.BaseResp BaseResp
}

struct GetCozeMessageListData {
    1: required list<ChatMessage> MessageList
    2: string Cursor
    3: bool HasMore
    4: optional ShortMemPolicy BotShortMemoryPolicy

}


struct ChatMessage {
    1 :          string    Role        ,
    2 :          string    Type        ,
    3 :          string    Content     ,
    4 :          string    ContentType,
    5 :          string    MessageId  ,
    6 :          string    ReplyId    ,
    7 :          string    SectionId  ,
    9 :          string    Status      , // 正常、打断状态 拉消息列表时使用，chat运行时没有这个字段
    10: optional i32       BrokenPos  , // 打断位置
    11: optional string    SenderId,
}

struct DeleteConversationInfoRequest {
    1 : i64 ConversationId
    2 : Scene Scene // 场景
    3 : i64 OperateId //操作人ID
    255: base.Base Base
}

struct DeleteConversationInfoResponse {

    255: required base.BaseResp BaseResp
}

struct DatasetMap {
    1: string id
    2: string name

}

struct DatasetConfig {
    1: list<DatasetMap> dataset
    2: i32              top_k
    3: double           min_score
    4: bool             auto
    5: SearchStrategy   search_strategy

}


enum SearchStrategy {
    SemanticSearch = 0
    HybirdSearch   = 1
    FullTextSearch = 20
}




struct AccountEventCallBackRequest {
    1 : required string AccountEvent

    255: optional base.Base Base
}

struct AccountEventCallBackResponse {
    255: optional base.BaseResp BaseResp
}


enum UserEventType {
    UserRegisterEvent = 1
    UserLoginEvent    = 2
    UserCancelEvent   = 3
    UserBanEvent      = 4
    UserUnBanEvent    = 5
}

// user 广播事件
struct UserEvent {
    1: required UserEventType      EventType
    2: required i64                Id
    3: required i64                UserId
    4: optional map<string,string> Ext
}

enum BotEventType {
    BotCreateEvent   = 1,
    BotUpdateEvent   = 2,
    BotPublishEvent  = 3,
    BotDeleteEvent   = 4,
    BotMigrateEvent  = 5,
    BotCommitEvent   = 6,
    BotBanEvent      = 7,
    BotUnBanEvent    = 8,
    BotOwnerTransfer = 9,
}

struct BotBasicInfo {
    1: required i64    BotId     ,
    2: optional string BotVersion,
    3: required i64    SpaceId   ,
    4: required i64    OwnerId   ,
    5: optional string    OwnerName   ,
    6: optional string    BotDesc   ,
    7: optional string    BotName   ,

}

struct BotEventWorkInfo {
    1: optional list<BotEventPluginInfo>   PluginInfoList
    2: optional list<BotEventWorkFlowInfo> WorkflowInfoList
    3: optional list<BotEventAgentInfo>    AgentInfoList
}

// Bot 广播事件
struct BotEvent {
    1: required BotEventType       EventType   ,
    2: required i64                Id          ,
    3: required BotBasicInfo       BotBasicInfo,
    4: required BotEventWorkInfo   BotWorkInfo ,
    5: required i64                OperatorId  ,
    6: optional map<string,string> Ext         ,
    7: BotEventSource Source,
}

enum BotEventSource {
    NL2Bot         = 1,

}

struct BotEventPluginInfo {
    1: optional i64                   PluginId    // 插件id
    2: optional list<BotEventApiInfo> ApiInfoList // 插件API信息
}

struct BotEventApiInfo {
    1: optional i64 ApiId
}

struct BotEventWorkFlowInfo {
    1: optional i64 WorkFlowId
    2: optional i64 PluginId
}

struct BotEventAgentInfo {
    1: i64 AgentId
}



struct Resource {
    1: string       Uri
    2: ResourceType Type
}

enum ResourceType {
    Image = 1
    File  = 2
}

struct PackResourceRequest {
    1 : required list<Resource> ResourceList

    255: optional base.Base Base
}

struct PackResourceResponse {
    1 : map<string,string> UrlInfo

    255: optional base.BaseResp BaseResp
}

struct DuplicateBotVersionToSpaceRequest {
    1 : required i64    target_space_id (agw.js_conv="str" api.js_conv="true" api.body="target_space_id")
    2 : required i64    bot_id          (agw.js_conv="str" api.js_conv="true" api.body="bot_id")
    3 : required i64    version         (agw.js_conv="str" api.js_conv="true" api.body="version")
    4 : required string name
    5 : optional bool   dup_society_host

    255: base.Base Base (api.none="true")

}

struct DuplicateBotVersionToSpaceData {
    1: i64 bot_id (agw.js_conv="str" api.js_conv="true" api.body="bot_id")

}

struct DuplicateBotVersionToSpaceResponse {
    1             :      DuplicateBotVersionToSpaceData data
    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp (api.none="true")

}

struct Variable {
    1 : optional string key           // key, Field
    2 : optional string description   // 描述
    3 : optional string default_value // 默认值
}

struct BotAuditInfo {
    1 : optional string                         bot_name              // bot 名称
    2 : optional string                         bot_desc              // bot 描述
    3 : optional string                         bot_icon_uri          // bot 图像url
    4 : optional string                         bot_prompt            // bot prompt
    5 : optional string                         bot_opening_text      // bot 开场白文案
    6 : optional list<string>                   bot_opening_questions // bot 开场白预置问题
    7 : optional string                         bot_preset_task       // bot 定时任务
    8 : optional string                         bot_suggest_prompt    // bot/agent 用户问题建议 Prompt
    9 : optional list<Variable>                 variable_list         // bot 变量
    10: optional list<bot_task_common.TaskInfo> task_list             // bot trigger
    11: optional string                         jump_config_prompt    // agent回溯配置Prompt
    12: optional string                         background_images      //背景图数据
    13: optional list<AgentInfoApi>             update_agents            //agent数据过审
    14: optional bot_common.BackgroundImageInfo background_images_struct   //背景图结构化数据
    15: optional list<bot_common.Agent>         update_agents_struct     //agent结构化数据过审
}

struct BotInfoAuditRequest {
    1 : required string       bot_id
    2 : required BotAuditInfo bot_audit_info
    3 : optional string       space_id
    4 : optional bot_common.BotMode bot_mode

    255: optional base.Base Base (api.none="true")
}


struct BotInfoAuditData {
    1 : optional bool check_not_pass // true：机审校验不通过
    2 : optional list<string> not_pass_reason // 机审校验不通过原因的starlingKey列表
}

struct BotInfoAuditResponse {
    1             :      optional BotInfoAuditData data

    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp
}


struct BotInfoCheckRequest {
    1 : required string       bot_id
    2 : optional string       space_id
    3 : optional BotAuditInfo bot_audit_info

    255: base.Base Base (api.none="true")
}

struct BotInfoCheckResponse {

    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp (api.none="true")
}

struct GetDraftBotInfoV2Request {
    1: required i64    BotId       // botId
    2: optional i64    UserId
    3: optional Branch Branch      // 获取branch对应的bot内容。 diff场景需要指定草稿
    4: optional i64    ConnectorId // 如果获取线上版本的数据, 需要带上
    5: optional string Version     // 如果要查指定版本的数据，需要带上
    6: optional bool NeedValidateResource // 是否需要过滤无效plugin、workflow资源
    255: optional base.Base Base

}
struct GetDraftBotInfoV2Response {
    1: bot_common.DraftBotInfoV2 DraftBotInfoV2
    255: optional base.BaseResp BaseResp
}

struct UpdateDraftBotInfoV2Request {
    1:          i64                         SpaceId
    2: optional i64                         UserId
    3: optional bot_common.BotInfoForUpdate BotInfo
    4: optional string                      CanvasData
    5: optional i64                         BaseCommitVersion
    6: optional i64                         CommitVersion
    255: optional base.Base Base

}

struct UpdateDraftBotInfoV2Response {
    255: optional base.BaseResp BaseResp
}

struct DraftBotCollaborationRequest {
    1: required string space_id
    2: required string bot_id
    255: optional base.Base Base
}
struct DraftBotCollaborationData {
    1: Creator       creator
    2: list<Creator> collaboration_list
    3: map<i64, list<string>> collaborator_roles // key：uid，value：协作者角色列表
}
struct DraftBotCollaborationResponse {
    1:   required DraftBotCollaborationData data
    253: required i64                       code
    254: required string                    msg
    255: required base.BaseResp BaseResp
}

struct DraftBotPublishHistoryDetailRequest {
    1  : required string    bot_id                                            ,
    2  : required string    space_id                                          ,
    3  : required string    publish_id                                        ,
    4  : required i64       version    (agw.js_conv="str", api.js_conv="true"), // commit_version

    255: optional base.Base Base       (api.none="true")                      ,
}

struct DraftBotPublishHistoryDetailResponse {
    1  :          DraftBotPublishHistoryDetailData data                      ,

    255: required base.BaseResp                    BaseResp (api.none="true"),
}

struct DraftBotPublishHistoryDetailData {
    1:          list<PublishResult> publish_result, // 发布结果
    2: optional string bot_id,
    3: optional string publish_time,
}

struct PublishResult {
    1: PublishConnectorInfo publish_connector_info, // 发布渠道信息
    2: PublishResultStatus  publish_result_status , // 发布结果状态
    3: string               publish_result_msg    , // 发布结果文案，前端按照markdown格式解析
}

struct PublishConnectorInfo {
    1: string id        , // 发布平台 connector_id
    2: string name      , // 发布平台名称
    3: string icon      , // 发布平台图标
    4: string desc      , // 发布平台描述
}

enum PublishResultStatus {
    Success  = 1, // 成功
    Failed   = 2, // 失败
    InReview = 3, // 审批中
}

enum RiskAlertType {
    Plugin = 1
    NewBotIDEGuide = 2
    NewBeginnerGuide = 3 // 新手引导
}

enum SwitchType {
    CozeAssistantGuide = 1
}

enum SwitchStatus {
    AlwaysOn = 0 // 默认常驻开
    AlwaysOff = 1// 常驻关
}


struct GetUserRiskAlertInfoRequest {
    1: optional list<RiskAlertType> risk_alert_type_list
    2: optional list<SwitchType> switch_type_list

    10: string Cookie      (agw.key = "Cookie", agw.source = "header") ,
    255: base.Base Base (api.none="true")
}

struct UserRiskAlertInfoData {
    1: optional map<RiskAlertType,bool> RiskAlertInfo
    2: optional map<SwitchType,SwitchStatus> SwitchInfo
}

struct GetUserRiskAlertInfoResponse {
    1:   required UserRiskAlertInfoData data

    253: required i64                   code
    254: required string                msg
    255: required base.BaseResp BaseResp (api.none="true")
}

struct UpdateUserRiskAlertInfoRequest {
    1: optional RiskAlertType risk_alert_type
    2: optional map<SwitchType,SwitchStatus> switch_info

    255: base.Base Base (api.none="true")
}

struct UpdateUserRiskAlertInfoResponse {
    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp (api.none="true")
}
//最大100
struct GetLatestBotDraftInfoRequest{
    1: list<i64> BotIds
    2: optional i64 UserId

    255: base.Base Base (api.none="true"),
}

struct GetLatestBotDraftInfoResponse{
    1: list<BotDraftLatestInfo> Infos
    255: required base.BaseResp BaseResp (api.none="true")

}






struct BotDraftLatestInfo {
    1: i64 BotId
    2: string BotVerison
    3: string Desc
    4: i64 UserId
    5: string UserName
    6: string AvatarUrl
    7: bool UserAuth
    8: i64 SpaceId
    9: string Name
}

//每次最大100个
struct GetUserBotAuthRequest{
    1: list<i64> BotIds
    2: i64 UserId
    255: base.Base Base (api.none="true"),
}

struct GetUserBotAuthResponse{
    1: map<i64,bool> BotAuthList
    255: required base.BaseResp BaseResp (api.none="true")
}



struct TimeCapsuleInvokeEventRequest {
    1 : required i64 bot_id (agw.js_conv="str" api.js_conv="true" api.body="bot_id")

    255: base.Base Base (api.none="true")
}

struct TimeCapsuleInvokeEventResponse {
253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp (api.none="true")
    }

struct TransMessageInfo {
    1:          MessageInfoRole    Role
    2:          string             Content
    3: optional i32                ContentType // 1 文本消息(默认) 2 建议词 50 卡片,enum和contenttype对齐
    4:          map<string,string> ext
    5:          string             PushUuid
    6:          string             id
    7:          string             LogId
}

struct GetDraftMessageInfoRequest {
    1: required i64 BotId
    2: required i64 UserId
    255: optional base.Base Base

}
struct GetDraftMessageInfoResponse {
    1: required list<TransMessageInfo> MessageList
    2: required i64 CreateTime
    255: optional base.BaseResp BaseResp,
}

enum AgentVersionOperate{
    Upgrade             = 1
    BrowseOldNoPrompt   = 2
}
struct SwitchAgentVersionRequest{
    1: required string bot_id
    2: required string space_id
    3: required AgentVersionOperate operate_type
    255: optional base.Base Base
}

struct SwitchAgentVersionResponse{
    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}

struct GetVersionByBotVersionRequest{
    1  : required i64 BotId, // BotId
    2  : required i64 ConnectorID, // ConnectorID
    3  : required i64 BotVersion, // BotVersion

    255: optional base.Base Base
}

struct GetVersionByBotVersionResponse {
    1 : required i64 Version // Version

    255: required base.BaseResp BaseResp (api.none="true")
}
enum BotPopupType {
    AutoGenBeforePublish = 1
}

struct GetBotPopupInfoRequest {
    1: required list<BotPopupType> bot_popup_types
    2: required i64                bot_id          (agw.js_conv="str" api.js_conv="true")

    255: base.Base Base (api.none="true")
}

struct BotPopupInfoData {
    1: required map<BotPopupType,i64> bot_popup_count_info
}

struct GetBotPopupInfoResponse {
    1:   required BotPopupInfoData data

    253: required i64              code
    254: required string           msg
    255: required base.BaseResp BaseResp (api.none="true")
}

struct UpdateBotPopupInfoRequest {
    1: required BotPopupType bot_popup_type
    2: required i64          bot_id         (agw.js_conv="str" api.js_conv="true")

    255: base.Base Base (api.none="true")
}

struct UpdateBotPopupInfoResponse {
    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp (api.none="true")
}

struct GenerateDescriptionRequest {
    1: required string bot_name
    2: required string prompt

    255: base.Base Base (api.none="true")
}

struct GenerateDescriptionData {
    1: required string description
}

struct GenerateDescriptionResponse {
    1: required GenerateDescriptionData data,

    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}

struct GetUserQueryCollectOptionRequest {

    255: base.Base Base (api.none="true")
}

struct GetUserQueryCollectOptionData {
    1: list<ConnectorInfo> support_connectors // 支持收集的渠道
    2: string private_policy_template // 隐私链接模板
}

struct GetUserQueryCollectOptionResponse {
    1: GetUserQueryCollectOptionData data,

    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}

struct GenerateUserQueryCollectPolicyRequest {
    1: i64 bot_id (agw.js_conv="str", api.js_conv="true") // bot id
    2: string developer_name      // 开发者名称
    3: string contact_information // 联系信息

    255: base.Base Base (api.none="true")
}

struct GenerateUserQueryCollectPolicyData {
    1: string policy_link
}

struct GenerateUserQueryCollectPolicyResponse {
    1: GenerateUserQueryCollectPolicyData data,

    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}

struct GetPolicyContentRequest {
    1: required string secret (api.path = "secret") // 隐私链接secret

    255: base.Base Base (api.none="true")
}

struct GetPolicyContentResponse {
    1: string content_type (agw.target = "header", agw.key = "Content-Type"),
    2: string policy_content (agw.target = "body"),

    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}

struct UpdateMultiAgentRequest{
    1: required string space_id
    2: required string bot_id
    4: optional bot_common.MultiAgentSessionType session_type //data_type=1时必须
    5: optional string base_commit_version // 修改的基线版本
    6: optional bot_common.MultiAgentConnectorType connector_type
    255: optional base.Base Base
}

struct UpdateMultiAgentData {
    1: optional Branch branch
    2: optional bool   same_with_online
}

struct UpdateMultiAgentResponse{
    1: required UpdateMultiAgentData    data
    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}

struct GetCozeInnerTokenRequest {
    1  :          string    user_id,

    255: optional base.Base Base   ,
}

struct GetCozeInnerTokenResponse {
    1  :          string        token   ,

    255: optional base.BaseResp BaseResp,
}

struct CheckCozeInnerTokenRequest {
    1  :          string    token,

    255: optional base.Base Base ,
}

struct CheckCozeInnerTokenResponse {
    1  :          string        user_id ,

    255: optional base.BaseResp BaseResp,
}

struct LangDetectRequest {
    1: required list<string> detect_text_list  // 待识别的文本列表

    255: optional base.Base Base (api.none="true")
}

struct LangDetectInfo {
    1: required string lang_code = "un"   // 检测的语种(mt.thrift.Language)
    2: optional string lang_name = "未知"
    3: required double probability = 0   // 语种检测对应的置信度(0.0~1.0)
}

struct LangDetectResponse {
    1:   optional list<LangDetectInfo> data

    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct UploadFileReq{
    1: required i64 BotID
    2: required i64 ConnectorID
    4: required string FileBizType
    3: required UploadContent UploadContent
    255: optional base.Base BaseResp
}

struct UploadContent{
    1: string Suffix
    2: binary Data
}
struct UploadFileResp{
    1: required FileData FileData
    2: optional base.BaseResp BaseResp
}

struct FileData{
    1: required string Url
    2: required string Uri
}

struct GenerateStoreCategoryRequest {
    1: required string bot_name,
    2: required string bot_description,
    3: required string prompt,

    255: base.Base Base (api.none="true"),
}

struct GenerateStoreCategoryData {
    1: required string category_id
}

struct GenerateStoreCategoryResponse {
    1: required GenerateStoreCategoryData data,

    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}


enum GetImageScene {
    Onboarding = 0
    BackgroundImage = 1
}

struct GetImagexShortUrlRequest{
    1: list<string> uris
    2: GetImageScene scene

    255: base.Base Base (api.none="true"),
}
struct GetImagexShortUrlData {
    1: map<string,UrlInfo>   url_info //审核状态，key uri，value url 和 审核状态

}

struct GetImagexShortUrlResponse{
    1             :      GetImagexShortUrlData data
    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp (api.none="true")
}

struct UrlInfo {
    1: string url
    2: bool   review_status

}



struct GetBotDevelopModeRequest {
    1: required i64          spaceID
    2: required i64          botID

    255: base.Base Base
}

struct GetBotDevelopModeResponse {
    1: optional i64          botID
    2: optional i32          developMode

    255: required base.BaseResp BaseResp
}

struct SwitchBotDevelopModeRequest {
    1: required i64          spaceID
    2: required i64          botID
    3: required i32          targetDevelopMode
    4: required i64          userID

    255: base.Base Base
}

struct SwitchBotDevelopModeResponse {
    255: required base.BaseResp BaseResp
}

struct WorkflowBindedCheckRequest {
    1: required list<i64>          BotIDs
    2: required i64                workflowId

    255: base.Base Base
}

struct WorkflowBindedCheckResponse {
    1: required bool               Binded //true 存在有效绑定 false没有
    255: required base.BaseResp BaseResp
}


typedef string JsonDict

struct MGetObjectDataReq  {
    1: list<string> object_ids,
    2: ProjectMeta project_meta,  //tcs队列信息
    /** request type:
     * 0 = get current data during task assignment (must enable read service)
     * 1 = pull sync data during review (read service not required);
     */
    3: optional i16 request_type = 0,    //读回调类型
    /** template_context: FE pass-through data, key = object_id, value = data from FE*/
    4: optional map<string,string> template_context,
    /**
     *  object_version_map:  object_id => object_version.
     *  if has object_version, get data with this version.
     *  otherwise, get data with latested version.
     */
    5: optional map<string, string> object_version_map,

    /**
    *
    * key: object_id
    * value: some passthrough data in create task object_data
    */
    6: optional map<string, JsonDict> passthrough_data_map,

    7: optional string verifier,    // 读回调领取任务verifier信息（username)

    255: optional base.Base Base,
}

struct ProjectMeta {
    /** Project ID */
    1: i64 project_id,  //队列id
    /** Project type, business layer doesn't need to care about this property */
    2: optional string product_type,  //  tcs内部产品线
    /** Project tag */
    3: optional string project_group, //队列组
    /** Project ID */
    4: optional string project_slug,
    /** Project mode */
    5: optional ProjectMode project_mode,  //模式：1标注 2质检 3双审 4抽检 5自定义
    /** Task mode */
    6: optional TaskMode task_mode,
    /* Project name/title */
    7: optional string project_title,  //队列中文名
    /* Project tags */
    8: optional list<string> tags,    //队列标签
    /**
     * Project type:
     * 0 = normal queue, 1 = shared task pool queue, 2 = monitor queue
     */
    9: optional i16 project_type = 0,

    /**
     * Additional information about the project. e.g. monitor_project_id
     * or task infomration passed-through from pipeline
     */
    50: optional JsonDict extra,
}

enum ProjectMode {
    /**
     * label. multi-round labelling mode, once configured number of rounds done,
     * merged result is effetive, no audting
     * 多轮标注. 配置的轮数标注完后, merge结果生效. 无质检
     */
	label = 1
    /**
     * QA. First round result is effective result. Blind review round will happen based on sampling rate
     * (by default blind review result does not callback). If blind review result is not consistent with
     * previous results, audit will happen and audit result will be effective
     *
     * 质检. 一审结果直接生效, 抽样盲审(盲审结果默认不回调), 盲审不一致的进行质检. 质检结果生效.
     */
	audit = 2
    /**
     * double_review(dual moderation). Blind review with 100% sampling rate, after 2 round，merge results
     * (at the moment you need merge the results yourself). Inconsistent results between 2 rounds
     * lead to an audit.
     *
     * 双审. 100%盲省, 一, 二盲完成后，merge结果生效(暂时只支持业务自行merge). 不一致结果进行质检.
     */
	double_review = 3
	/**
     * QA sampling. Samples of the tasks go to auditing round after first round. Auditing requires
     * a additional labelling on whether the first round result is correct.
     *
     * 抽检. 一轮初审后按照一定比例进入质检轮, 质检需要额外标注初审的结果是否正确
     */
	sample_audit = 4
	/**
     * Semi-custom. Based on first round results to decide which process to follow
     * next (label/audit/double_review/sample_audit)
     *
     * 可视化自定义. 根据初审结果决定任务具体走哪个模式(标注/质检/双审/抽检)
     */
	custom = 5
	/**
     * Custom. Under this mode, the task does not follow particular process.
     * User of this mode need to plugin code in order to define the process.
     *
     * 完全自定义. 该模式下的任务没有固定的流程,具体的审核方式需要写代码插件进行自定义
     */
	full_custom = 6
}

enum TaskMode {
    /** see definition from ProjectMode */
    /** 多轮标注. 配置的轮数标注完后, merge结果生效. 无质检 */
	label = 1
	/** 质检. 一审结果直接生效, 抽样盲审, 盲审不一致的进行质检. 质检结果生效. */
	audit = 2
	 /** 双审. 100%盲省, 一, 二盲完成后，merge结果生效(暂时只支持业务自行merge). 不一致结果进行质检. */
	double_review = 3
}

struct MGetObjectDataRsp {
    /** object_id => object_data. if no data, the object_id is not recorded in the map */
    1: required map<string, JsonDict> object_data_map,

    255: optional base.BaseResp BaseResp,
}

struct MSetTaskResultReq {
    1: ProjectMeta project_meta,
    2: list<TaskResult> task_results,

    // 3,4,5 are control parameters, for passing-through to callback service.
    // these are depended upon by the callback service Router (content.review.review_general_router)
    // please ignore if your service doesn't depend on the Router
    3: optional JsonDict config,
    4: optional JsonDict rule,
    5: optional i64 dry_run,

    // 回调类型
    10: optional CallbackType callback_type

    255: optional base.Base Base,
}

# The overall review results of a task
# 1. Every callback will include results from previous rounds
# 2. Please maintain the idempotence of the interface
# 3. Business logic should combine VerifyResult.turn, TaskResult.current_turn, TaskResult.has_next_turn
# to select results and do other processing
struct TaskResult {
    /** task ID, uniquelly identifies a task within TCS platform */
	1: i64 task_id,
	/** business side's unique identifier for a task, corresponds to the object_data */
	2: string object_id,
    /** deprecated */
	3: i32 object_version,
    /**
     * deprecated, usage not recommended. Used under audit mode. merged_result only has value
     * when in the last round and blind moderation turn callback setting is enabled.
     */
	4: optional VerifyResult merged_result,
    /** sorted by turn number (acsending) */
	5: optional list<VerifyResult> verify_results,
    /**
     * current ture. 0 = first review, 1 = second review (blind review), 2 = third review, -1 = audit
     * (when processing task result in your business logic, please first check the current_turn)
     */
	6: optional i16 current_turn,
    /** object_data is the actual data of the task, submitted by the business side (with create_task) */
	7: optional JsonDict object_data,
    /** task mode, 1=labeling,2=audit,3=double,4=sample_audit,5=custom,6=full_custom */
	8: optional TaskMode task_mode,
    /**
     * if there is a next round. 0 = no; 1 = yes;
     *
     * Note: the value is not effetive under sample_audit sync mode
     * nor under audit mode where blind_review callback setting is not enabled.
     */
	9: optional i16 has_next_turn,

	/**
	 *  task create timestamp millsecondes
	 */
	10: optional i64 create_time,
}

# result for a round of review
struct VerifyResult {
    /** unique id for current review result    本次审核结果的唯一标识 */
    1: i64 verify_id,
    /** review result, structure can reference the page template   本次审核的结果，内部结构可参考页面模板  */
    2: JsonDict verify_result,
    /** the reviwer   本次审核人 */
    3: string verifier,
    /**
     * >=0 means current round number in a multi-round process
     * -1 means auditing,
     * -2 means direct modification.
     *
     * >=0表示多轮审核中本次审核的轮数. -1表示质检, -2表示直接修改
     */
    4: i16 turn,
    /** the assign time of the task, millsecondes timestamp with utc+8, must minus 8hour when convert to CST time   任务领取时间,时间戳  */
    5: optional i64 assign_time,
    /** the submission time of the review, millsecondes timestamp with utc+8, must minus 8hour when convert to CST time  任务提交时间,时间戳  */
    6: optional i64 resolve_time,
    /** review cost time */
    7: optional double duration

    /** the assign unix ts of the task */
    8: optional i64 real_assign_time,
    /** the submission unix ts of the review */
    9: optional i64 real_resolve_time,

    // sub task
    10: optional i64 sub_project_id
    11: optional string sub_project_title
}

/** 回调类型枚举值 */
enum CallbackType {
    /** 未知类型回调 */
    Unknown                 = 0
    /** 普通回调 */
    Normal                  = 1
    /** 直接提交 */
    DirectSubmit            = 2
    /** 上一页超时提交 */
    PreviousPageTimeout     = 3
    /** 失败重试回调 */
    FailedRetry             = 4
    /** 手动回调 */
    ManualRetry             = 5
    /** 仅回调不审出 */
    OnlyCallBack            = 6
    /** 仲裁轮审出 */
    Arbitration             = 7
}

struct MSetTaskResultRsp  {
    1: list<i64> failed_task_ids,

    // callback service's internally processed task result
    // these are depended upon by the callback service Router (content.review.review_general_router)
    // please ignore if your service doesn't depend on the Router
    2: optional list<NodeResult> node_results,

    // 逻辑队列的回调是否启用
    // only used for logical queue callback
    // if mms logical queue callback is enabled, set to true
    10: optional bool mms_callback_enabled,

    /**  BaseResp.StatusCode will be non-zero, if failed_task_ids has value */
    255: optional base.BaseResp BaseResp,
}

// NodeResult，record node status and context
struct NodeResult {
    1: optional i32 status_code,
    2: optional string status_message,
    3: optional JsonDict node_context,
    4: optional string node_name,
    5: optional string node_type,
}

struct BotAuditCallbackRequest {
    1  : required      string                    PublishID  ,
    2  : optional      i64                       BotID      ,
    3  : optional      i64                       CommitVersion,
    4  : required      BotAuditCallbackSource    Source     ,
    5  : required      AuditResult               AuditResult,

    255: optional base.Base   Base       ,
}

enum BotAuditCallbackSource {
    Plugin   = 1
    Workflow = 2
    Bot = 3
}

struct AuditResult {
    1: AuditStatus AuditStatus ,
    2: string      AuditMessage,
}

enum AuditStatus {
    Auditing = 0, // 审核中
    Success  = 1, // 审核通过
    Failed   = 2, // 审核失败
}

struct BotAuditCallbackResponse {

    255: optional base.BaseResp BaseResp,
}
struct GetPlatformCommonConfigRequest {
    255: base.Base Base (api.none="true"),
}

struct CozeBanner {
    1: string banner_content,
    2: string color_scheme,
}

struct GetPlatformCommonConfigData {
    1: string BotIDEGuideVideoUrl
    2: CozeBanner CozeBanner,
    3: list<HomeBannerDisplay> HomeBannerDisplay (api.body="home_banner_display"),
    4: list<QuickStartConfig> QuickStart (api.body="quick_start"),
    5: list<string> OceanProjectSpaces,
    6: list<string> DouyinAvatarSpaces, // 能创建抖音分身bot的空间列表，inhouse灰度期间使用
}

struct QuickStartConfig {
    1: string DocumentUrl (api.body="document_url")   // 新手教程文档链接
    2: string ImageUrl  (api.body="image_url") // 图片链接
    3: string Content   (api.body="content") // 文案
}

struct GetPlatformCommonConfigResponse {
    1: required GetPlatformCommonConfigData data,

    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}

struct GetAllUserLabelRequest {

    255: optional base.Base   Base       ,
}

struct GetAllUserLabelResponse {
    1: list<bot_common.UserLabel> user_labels,

    255: optional base.BaseResp BaseResp,
}

struct SaveUserLabelRequest {
    1: bot_common.UserLabel user_label, // 传ID则更新，不传ID则新建

    255: optional base.Base   Base       ,
}

struct SaveUserLabelResponse {

    255: optional base.BaseResp BaseResp,
}

struct DeleteUserLabelRequest {
    1: string label_id,

    255: optional base.Base   Base       ,
}

struct DeleteUserLabelResponse {
    255: optional base.BaseResp BaseResp,
}

struct GetLabelledUserRequest {
    1: i32    page            , // page>=1
    2: i32    size            , // 0<size<=50
    3: string user_id         , // 按照id查询
    4: string user_unique_name, // 按照用户名查询

    255: optional base.Base   Base       ,
}

struct GetLabelledUserResponse {
    1: list<UserLabelInfo> user_info,
    2: i32                 count    ,

    255: optional base.BaseResp BaseResp,
}

struct UserLabelInfo {
    1:          string               user_id         ,
    2:          string               user_unique_name, // 用户名
    3: optional bot_common.UserLabel user_label      ,
}

struct MGetUserLabelInfoRequest {
    1: list<string> query_condition,
    2: QueryType    query_type     ,

    255: optional base.Base   Base       ,
}

enum QueryType {
    QueryByID   = 0,
    QueryByName = 1,
}

struct MGetUserLabelInfoResponse {
    1: list<UserLabelInfo> user_info,

    255: optional base.BaseResp BaseResp,
}

struct UpdateUserLabelRequest {
    1: list<string> user_ids,
    2: string       label_id,

    255: optional base.Base   Base       ,
}

struct UpdateUserLabelResponse {

    255: optional base.BaseResp BaseResp,
}


struct MoveDraftBotRequest {
    1 : string    bot_id
    2 : string       target_spaceId
    3 : string       from_spaceId
    4 : MoveAction      move_action

    255: optional base.Base Base
}

struct MoveDraftBotResponse {
    1 : DraftBotStatus  bot_status
    2 : MigBotSpaceAsyncTaskVO async_task
    3 : list<BriefDraftBot>    multi_quote_bots
    4 : bool forbid_move

    255: optional base.BaseResp BaseResp,
}

enum MoveAction {
    Move = 0 // 普通移动
    ForcedMove = 1 // 强制移动,不管资源有没有成功都移过去
    RetryMove  = 2 // 重试迁移
    Preview = 3 // 预览，查看任务需要迁移哪些资源
    ViewTask = 4 // 查看任务状态
    CancelTask = 5 // 取消任务
}


struct GetShortcutAvailNodesRequest {
    1: required string bot_id
    2: required string space_id
    3: required i64 page_num // 从1开始
    4: required i64 page_size
    255: base.Base Base (api.none="true"),
}
struct ShortcutAvailNodes {
    1: required string agent_id
    2: required string agent_name
}
struct GetShortcutAvailNodesData {
    1: required bool has_more
    2: required list<ShortcutAvailNodes> nodes
}
struct GetShortcutAvailNodesResponse {
     1: required GetShortcutAvailNodesData data,
    255: required base.BaseResp BaseResp (api.none="true")
}

enum BlockScene {
   Block_All_Login           = 0;
   Block_Auth_Bind           = 1;
   Block_Auth_Unbind         = 2;
   Block_Auth_ChangeBind     = 3;
   Block_Reset_Password      = 4; // 忘记密码（未登录）
   Block_Change_Password     = 5; // 修改密码（登录态下）
   Block_Mobile_Bind         = 6;
   Block_Mobile_ChangeBind   = 7;
   Block_Email_Bind          = 8;
   Block_Email_ChangeBind    = 9;
   Block_Update_LoginName    = 10;
   Block_All_Auth            = 11; // 对外授权
}

struct CheckBlockBySceneRequest {
    1: BlockScene BlockScene,
    2: i64 UserId,
    3: i32 AppId,
    4: optional string LoginType, // 登录方式
    5: optional string PlatformName, // 涉及三方时，传三方平台的名称
    6: optional string Extra,
    7: optional i32 Agid, // 账号组id
    8: optional i32 PlatformAppId,  // 涉及三方时，传三方平台的platform appId
    9: i64 DeviceId,    // 设备id
    10: optional string VersionCode,    // 通参版本号
    11: optional string ClientKey,    // 接入方client_key
    12: optional string Scope,    //  逗号分隔的scope list
    255: base.Base Base,
}

// 不能执行相关业务操作时透传给前端
struct CheckBlockBySceneResponse {
    1: i32 BizErrCode,              // 允许执行操作时传0，不允许时传其他
    2: string BizErrMsg,            // 业务自定义数据,错误文案，透传给端上
    3: string ExtraData,            // 业务自定义数据,业务数据，透传给端上（一般为json字符串）
    4: optional map<string,string> ExtraMap, // 业务自定义数据,用于给passport传递业务数据
    5: optional bool NeedRetry, // 是否允许用户快速重试，会返回 verify_ticket 给客户端，
    255: base.BaseResp BaseResp,
}

struct GeneratePicRequest {
    1: GeneratePicPrompt gen_prompt
    2: optional string image_url // 生成动图的静图链接
    3: optional string image_uri // 生成动图的静图链接
    4: i64    bot_id (agw.js_conv="str" api.js_conv="true" api.body="bot_id")
    5: PicType    pic_type     // 图片种类，头像还是背景
    6 : required i64      device_id
    7: string    bot_name
    8: string    bot_desc

    255: base.Base Base (api.none="true")

}

enum GenPicStatus {
    Init=0
    Generating=1
    Success=2
    Fail=3
    Cancel=4

}

struct GeneratePicPrompt {
    1: string ori_prompt
    2:optional string style_prompt

}

struct GeneratePicData {
    1: string pic_url // 文件url
    2: string pic_uri // 文件uri，提交使用这个
    3: i64 task_id (agw.js_conv="str" api.js_conv="true" api.body="task_id")

}

struct GeneratePicResponse {

    1: GeneratePicData data
    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")

}
struct CancelGenerateGifRequest {
    1: i64    task_id (agw.js_conv="str" api.js_conv="true" api.body="task_id")
    255: base.Base Base (api.none="true")

}


struct CancelGenerateGifResponse {
    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}

struct MarkReadNoticeRequest {
    1: i64    bot_id (agw.js_conv="str" api.js_conv="true" api.body="bot_id")
    2: PicType    pic_type     // 图片种类，头像还是背景
    255: base.Base Base (api.none="true")

}

struct MarkReadNoticeResponse {
    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")

}



//查询生图任务
enum PicType {
    IconStatic=1
    IconGif=2
    BackgroundStatic=3
    BackgroundGif=4
    PicPrompt=5

}
struct PicOperationPrompt {
    1: map<PicType,GeneratePicPrompt> PicOpPrompt
}

struct GetPicTaskRequest {

    1: i64    bot_id (agw.js_conv="str" api.js_conv="true" api.body="bot_id")
    2: optional PicType    pic_type     // 图片种类，头像还是背景
    255: base.Base Base (api.none="true")

}

struct GetPicTaskData {
    1: list<PicTask> tasks // 任务
    2: list<TaskNotice> notices // 消息
}

struct GetPicTaskResponse {

    1: GetPicTaskData data
    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}
struct PicTask {
   1: string id
   2: string bot_id

   3: PicType type
   4: ImgInfo img_info
   5: GenPicStatus status // 进行中，成功，失败
   6: string operator_id
   7: string create_time
}
struct ImgInfo {
    1: string tar_url
    2: string tar_uri
    3: GeneratePicPrompt prompt
    4: string ori_url  //生成动图的静图url
    5: string ori_uri  //生成动图的静图uri

}

struct TaskNotice {
   1: bool un_read
   2:PicType type
}

struct ListStyleRequest {
    255: base.Base Base (api.none="true")

}
enum PicStyle {
    CharactersAnime=1
    CharactersRealistic=2
    CharactersCGThickPainting=3
    CharactersJapaneseShowa=4
    CharactersAmericanComics=5
    CharactersChineseWatercolor=6
    ScenesScienceFiction=7
    ScenesRealistic=8
    ScenesChinesePainting=9
    ScenesCartoonIllustrations=10
    ScenesCartoon3D=11

}
struct PicStyleInfo{
    1: PicStyle pic_style
    2: string prompt
    3: string style_url
    4: string style_uri
    5: string style_name //

}
struct ListStyleData {
    1: list<PicStyleInfo> pic_styles
}

struct ListStyleResponse {

    1: ListStyleData data
    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}


struct GetGenPicTimesRequest{
    255: base.Base Base (api.none="true")

}
struct GetGenPicTimesResponse{
    1: GetGenPicTimesData data
    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}
struct GetGenPicTimesData {
   1:list<GetGenPicTimesInfo> infos
}

struct GetGenPicTimesInfo{
   1:PicType type
   2:i32     times
}


// Bot 生图消息
struct GenPicMessage {
    1: PicTask pic_task(go.tag="json:\"pic_task\""), // 生图消息

    // 追溯问题相关字段（可选）
    100: optional i64 MessageID (go.tag="json:\"message_id\""),  // generated id
    101: optional i64 SendAt    (go.tag="json:\"send_at\""),     // unix timestamp in second
    102: optional string ErrMsg   (go.tag="json:\"err_msg\""),     // 错误信息
}




struct UploadFileOpenRequest {
    1: required string ContentType (api.header = "Content-Type", agw.source = "header", agw.key = "Content-Type"), // 文件类型
    2: required binary Data (agw.source = "raw_body"),          // 二进制数据
    255: base.Base Base
}

struct UploadFileOpenResponse {
    1: optional File File (agw.key = "data"),
    255: base.BaseResp BaseResp
}

struct UploadFileAtomicRequest {
    1: required string ContentType, // 文件类型
    2: required binary Data,        // 二进制数据
    3: optional string CreatorID,   // 创建者
    255: base.Base Base
}

struct UploadFileAtomicResponse {
    1: File File,
    255: base.BaseResp BaseResp
}

struct RetrieveFileOpenRequest {
    1: required string ID (api.query = "file_id", agw.source = "query", agw.key = "file_id"),    // 文件ID
    255: base.Base Base
}

struct RetrieveFileOpenResponse {
    1: optional File File (agw.key = "data"),
    255: base.BaseResp BaseResp
}

struct RetrieveFileAtomicRequest {
    1: required string ID,          // 文件ID
    2: optional string CreatorID,   // 创建者
    255: base.Base Base
}

struct RetrieveFileAtomicResponse {
    1: File File,
    255: base.BaseResp BaseResp
}

struct Page {
    1: i64 PageNum,
    2: i64 PageSize,
    3: i64 Total
}

struct ListFilesAtomicRequest {
    1: optional list<string> IDs,   // 文件ID列表
    2: optional Page Page,
    3: optional string CreatorID,   // 创建者
    255: base.Base Base
}

struct ListFilesAtomicResponse {
    1: list<File> Files,
    2: Page Page,
    255: base.BaseResp BaseResp
}

struct RetrieveFileContentOpenRequest {
    1: required string ID (api.query = "file_id", agw.source = "query", agw.key = "file_id"),    // 文件ID
    255: base.Base Base
}

struct RetrieveFileContentOpenResponse {
    1: string ContentType (agw.target = "header", agw.key = "Content-Type"),
    2: string ContentDisposition (agw.target = "header", agw.key = "Content-Disposition"),
    3: binary Data (agw.target = 'body'),
    255: base.BaseResp BaseResp
}

struct RetrieveFileContentAtomicRequest {
    1: required string ID,// 文件ID
    2: optional string CreatorID,   // 创建者
    255: base.Base Base
}

struct RetrieveFileContentAtomicResponse {
    1: string ContentType,
    2: string ContentDisposition,
    3: binary Data,
    255: base.BaseResp BaseResp
}

struct ImageXUploadImageRequest {
    1: string FileName,      // 文件名 必须包含后缀 如 .jpg
    2: binary Data,          // 文件信息

    255: base.Base Base
}

struct ImageXUploadImageResponse {
    1: string ImageURI,
    2: string ImageURL,

    255: base.BaseResp BaseResp
}

struct File{
    1: string ID (agw.key = "id"),                  // 文件ID
    2: i64 Bytes (agw.key = "bytes"),               // 文件字节数
    3: i64 CreatedAt (agw.key = "created_at"),        // 上传时间戳，单位s
    4: string FileName (agw.key = "file_name"),     // 文件名
    5: string URL (agw.target="ignore", api.ignore = "")
    6: optional string ExternalUrl (agw.key="url") // 目前仅 openapi 场景有用。白名单用户会返回文件 url
}


struct GetDraftBotInfoAgwRequest {
    1: required i64  bot_id  (api.js_conv='true',agw.js_conv="str") // 草稿bot_id
    2: optional string  version  // 查历史记录，历史版本的id，对应 bot_draft_history的id
    3: optional string  commit_version // 查询指定commit_version版本，预发布使用，貌似和version是同一个东西，但是获取逻辑有区别

    255: base.Base Base (api.none="true")
}

struct UserInfo {
    1: i64    user_id   (api.js_conv='true',agw.js_conv="str")  // 用户id
    2: string name     // 用户名称
    3: string icon_url // 用户图标
}

struct BotConnectorInfo {
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


enum BotMarketStatus {
    Offline = 0 // 下架
    Online  = 1 // 上架
}

struct GetDraftBotInfoAgwResponse {
    1: required GetDraftBotInfoAgwData data,

    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}

struct GetDraftBotInfoAgwData {
    1: required bot_common.BotInfo bot_info // 核心bot数据
    2: optional BotOptionData bot_option_data // bot选项信息
    3: optional bool            has_unpublished_change // 是否有未发布的变更
    4: optional BotMarketStatus bot_market_status      // bot上架后的商品状态
    5: optional bool            in_collaboration       // bot是否处于多人协作模式
    6: optional bool            same_with_online       // commit内容是否和线上内容一致
    7: optional bool            editable               // for前端，权限相关，当前用户是否可编辑此bot
    8: optional bool            deletable              // for前端，权限相关，当前用户是否可删除此bot
    9: optional UserInfo        publisher              // 是最新发布版本时传发布人
    10:         bool has_publish // 是否已发布
    11:         i64 space_id    (api.js_conv='true',agw.js_conv="str")  // 空间id
    12:         list<BotConnectorInfo> connectors    // 发布的业务线详情
    13: optional Branch              branch          // 获取的是什么分支的内容
    14: optional string              commit_version  // 如果branch=PersonalDraft，则为checkout/rebase的版本号；如果branch=base，则为提交的版本
    15: optional string              committer_name  // for前端，最近一次的提交人
    16: optional string              commit_time     // for前端，提交时间
    17: optional string              publish_time    // for前端，发布时间
    18: optional BotCollaboratorStatus collaborator_status // 多人协作相关操作权限
    19: optional AuditInfo           latest_audit_info // 最近一次审核详情
    20: optional string              app_id // 抖音分身的bot会有appId
}

struct BotCollaboratorStatus {
    1: bool commitable    // 当前用户是否可以提交
    2: bool operateable   // 当前用户是否可运维
    3: bool manageable    // 当前用户是否可管理协作者
}

struct UpdateDraftBotInfoAgwRequest {
    1: optional bot_common.BotInfoForUpdate bot_info
    2: optional i64   base_commit_version (api.js_conv='true',agw.js_conv="str")

    255: base.Base Base (api.none="true")
}

struct UpdateDraftBotInfoAgwResponse {
    1: required UpdateDraftBotInfoAgwData data,

    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}

struct UpdateDraftBotInfoAgwData {
    1: optional bool   has_change       // 是否有变更
    2:          bool   check_not_pass   // true：机审校验不通过
    3: optional Branch branch           // 当前是在哪个分支
    4: optional bool   same_with_online
    5: optional string check_not_pass_msg // 机审校验不通过文案
}

struct CommitDraftBotInfoAgwRequest {
    1: required i64  bot_id  (api.js_conv='true',agw.js_conv="str") // 草稿bot_id
    2: optional string       remark            // 本次提交的备注信息

    255: base.Base Base (api.none="true")
}


struct CommitDraftBotInfoAgwResponse {
    1: required CommitDraftBotInfoAgwData data,

    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}

struct CommitDraftBotInfoAgwData {
    1: optional CommitResult commit_result
    2: optional Committer    committer
    3: optional Branch       branch
    4: optional string       commit_version
    5: optional bool         same_with_online
}

struct OnCompleteGenGifRequest {
    1: string ImageUrl
    2: GenPicStatus Status
    3: string Msg
    4: string Ext

    255: base.Base Base

}


struct OnCompleteGenGifResponse {

    255: base.BaseResp BaseResp

}

struct GetFileUrlsRequest {
    1 :  GetFileUrlsScene scene
    255: base.Base Base
}

struct GetFileUrlsResponse {
    1 : list<FileInfo> file_list
    255: base.BaseResp BaseResp
}

enum GetFileUrlsScene {
    shorcutIcon = 1
}

struct FileInfo {
    1 : string url
    2 : string uri
}

enum CheckEntityConfigType {
    HumanReviewWhiteConfig = 1
}

enum CheckEntityConfigCategory {
    WhiteList = 1
    BlackList = 2
}

enum CheckEntityType {
     User = 1
     Space = 2
     Bot = 3
}

struct CheckEntityInConfigListRequest {
    1: required CheckEntityConfigType ConfigType,
    2: required CheckEntityType       EntityType,
    3: required list<string>          EntityList

    255: base.Base Base
}

struct CheckEntityInConfigListResponse {
    1: required map<string, bool>         CheckEntityResultMap   // key: entity, value: 是否在配置名单内
    2: required CheckEntityConfigCategory ConfigCategory         // 配置类型，黑名单 or 白名单

    255: base.BaseResp BaseResp
}

struct GetBotAuditRecordRequest {
    1:required i64 BotId
    2:required i64 ReqId
    255: base.Base Base
}

struct BotAuditRecord {
    1:required i64 Id
    2:required i64 BotId
    3:required string PublishId
    4:required i8 AuditScenes
    5:required i8 AuditStatus
    6:required i64 CommitVersion
    7:optional string AuditResult
}

struct GetBotAuditRecordResponse {
    1: BotAuditRecord Data
    255: base.BaseResp BaseResp
}

struct CopyAgentV2Request {
    1: required string bot_id               // draftbotid
    2: required string agent_id
    3: optional string base_commit_version // 修改的基线版本
    255: optional base.Base Base
}

struct CopyAgentV2Response {
    1: required     bot_common.Agent    data
    2: optional     BotOptionData       bot_option_data // 选项信息
    3: optional     Branch              branch           // 编辑的分支
    4: optional     bool                same_with_online // 是否与线上一致
    255: optional base.BaseResp BaseResp
}

struct UpdateAgentV2Request {
    1: required string id
    2: optional string reference_id
    3: optional string current_version
    4: optional string space_id
    5: required string bot_id
    6: optional string base_commit_version                                      // 修改的基线版本
    7: optional string name                                                     // agent名
    8: optional string description                                              // agent描述
    9: optional AgentPosition position                                          // agent画布位置
    10: optional string icon_uri                                                // agent头像
    11: optional list<IntentApi> intents
    12: optional bool is_delete
    13: optional bot_common.PromptInfo prompt_info                                                      // agent prompt
    14: optional bot_common.ModelInfo model_info                                                        // 模型配置
    15: optional list<bot_common.PluginInfo> plugin_info_list                                           // plugin列表
    16: optional bot_common.Knowledge knowledge                                                         // dataset 信息
    17: optional list<bot_common.WorkflowInfo> workflow_info_list                                       // Workflow 列表
    18:optional bot_common.JumpConfig jump_config                                                       // 回溯配置
    19: optional bot_common.SuggestReplyInfo suggest_reply_info // 推荐回复配置
    20: optional bot_common.HookInfo hook_info                                                          // hook信息
    255: optional base.Base Base
}

struct UpdateAgentV2Response {
    1:   required UpdateAgentData data
    253: required i64             code
    254: required string          msg
    255: required base.BaseResp BaseResp
}

struct CreateAgentV2Request {
    1: required string             bot_id              // draftbotid
    2: required AgentType          agent_type
    3: optional AgentPosition      position
    4: optional AgentReferenceInfo references
    5: optional string             base_commit_version // 修改的基线版本
    255: optional base.Base Base
}

struct CreateAgentV2Response {
    1: required     bot_common.Agent    data
    2: optional     Branch              branch           // 编辑的分支
    3: optional     bool                same_with_online // 是否与线上一致
    255: optional base.BaseResp BaseResp
}

struct BatchCreateAgentV2Request {
    1: required string                   bot_id              // draftbotid
    2: required AgentType                agent_type
    3: required list<AgentPosition>      position
    4: optional list<AgentReferenceInfo> references
    5: required i32                      agent_cnt                   // references为空时，批量创建的agent数量
    6: optional string                   base_commit_version, // 修改的基线版本
    255: optional base.Base Base
}

struct BatchCreateAgentV2Response {
    1: required     list<bot_common.Agent>      data
    2: optional     Branch                      branch
    3: optional     bool                        same_with_online
    255: required base.BaseResp BaseResp
}

enum UpdateBannerActionType {
    Create = 1
    Update = 2
    Publish = 3
    CreateAndPublish = 4
    Delete = 5
    Offline = 6
}

enum BannerRegionType {
    Inhouse = 1
    Release = 2
    InhouseAndRelease = 3
}

enum BannerStatus {
    Draft = 1              // 草稿
    PublishedOnDisplay = 2 // 展示中
    PublishedToDisplay = 3 // 即将展示
    Offline            = 4 // 已下线
    End                = 5 // 已结束
}

struct GetBannerListRequest {
    101: i32 Page,
    102: i32 Size,
    255: base.Base Base
}

struct Banner {
    1: i64 BannerId,
    2: string BannerContent,
    3: string ColorScheme,
    4: BannerRegionType Region,
    5: i64 StartTime,
    6: i64 EndTime,
    7: string OperatorEmail,
    8: BannerStatus Status,
    9: i64 CreateTime,
    10: i64 UpdateTime,
    11: string Timezone,
}

struct GetBannerListResponse {
    1: required i64 Total,
    2: required list<Banner> BannerList,

    255: required base.BaseResp BaseResp,
}

struct UpdateBannerRequest {
    1: required UpdateBannerActionType ActionType
    2: optional i64 BannerId
    3: optional string BannerContent
    4: optional string ColorScheme
    5: optional BannerRegionType Region
    6: optional i64 StartTime
    7: optional i64 EndTime
    8: required string Operator
    9: optional string Timezone

    255: base.Base Base
}

struct UpdateBannerResponse {
    255: required base.BaseResp BaseResp
}


struct GetBotBasicInfoRequest {
    1: required i64 BotID
    2: optional bool IsAllStatus // 是否查全状态的bot_draft
    255: base.Base Base
}

struct BotBaseInfo {
    1: i64 BotId     ,
    2: i64 SpaceId   ,
    3: i64 OwnerId   ,
}

struct GetBotBasicInfoResponse {
    1: BotBaseInfo Data

    255: required base.BaseResp BaseResp
}


struct GetBotEvaluationVersionRequest {
    1: required i64 BotID
    2: required i64 UserID

    255: base.Base Base (api.none="true")
}

struct GetBotEvaluationVersionResponse {
    1: optional BotEvaluationData Data // botID未查到则data为nil

    255: base.BaseResp BaseResp (api.none="true")
}

struct BotEvaluationData {
    1: optional i64 BotID
    2: optional i64 Version
    3: optional string HistoryInfo
}

struct GetBotCollaborationQuotaRequest {
    1: required i64 bot_id (agw.js_conv="str", api.js_conv="true")
    2: optional bool only_config_item // 传入true则只获取额度配置，提供给permission使用
    255: optional base.Base Base
}

struct GetBotCollaborationQuotaResponse {
    1:   required GetBotCollaborationQuotaData data
    253: required i64                       code
    254: required string                    msg
    255: required base.BaseResp BaseResp
}

struct GetBotCollaborationQuotaData {
    1: i32 max_collaboration_bot_count // 用户最大开启多人协作bot的数量限制
    2: i32 max_collaborators_count    // bot最大添加的协作者数量限制
    3: i32 current_collaboration_bot_count // 当前已经开启多人协作bot的数量
    4: i32 current_collaborators_count    // 当前bot已经添加的协作者数量
    5: bool open_collaborators_enable // 能否开启协作开关 false不可开启
    6: bool add_collaborators_enable // 能否添加协作者 false不可添加
    7: bool can_upgrade    // 是否可升级套餐 顶级付费账号不可升级
    8: bool in_collaboration // true 为多人协作模式，否则单人模式
}
struct GetInternalSpaceInfoRequest {
    1: optional list<i64> SpaceIds, // 需要查询的空间id列表

    255: optional base.Base Base
}

struct InternalSpaceInfo {
    1: list<string> ConnectorWhiteList, // 可发布的渠道id列表
}

struct GetInternalSpaceInfoResponse {
    // 只会返回内场空间的配置信息，非内场空间的id不会返回
    1: required map<i64, InternalSpaceInfo> InternalSpaceInfoMap,   // key: 空间ID，value: 内场空间配置信息

    255: required base.BaseResp         BaseResp
}

enum UpdateInternalSpaceType {
    Upsert = 1,
    Del = 2,
}

struct UpdateInternalSpaceRequest {
    1: required UpdateInternalSpaceType UpdateType,
    2: required map<i64, InternalSpaceInfo> UpdateInfo, // key: spaceID, value: 内场空间配置信息(传空则按默认配置)
    3: optional string Operator, // 操作人

    255: optional base.Base Base
}

struct InternalSpaceUpdateRes {
    1: required bool IsSuccess, // 更新是否成功
}

struct UpdateInternalSpaceResponse {
    255: required base.BaseResp BaseResp
}
struct GetBotAllModelPluginIdsRequest {
    1: required i64 BotId
    2: required BotInfoType BotInfoType    // 查询的bot类型
    3: optional string BotVersion         // 线上bot版本
    4: optional string CommitVersion
    5: optional string UserId
    6: optional string ConnectorId

    255: base.Base Base (api.none="true")
}

struct GetBotAllModelPluginIdsResponse {
    1: required ModelPluginDetail Data

    255: required base.BaseResp BaseResp
}

struct ModelProfile {
    1: ModelDetail ModelDetail
    2: string Logo  // 模型的logo:专业版为基座模型名称+版本+CustomModelId，普通版为model_id
    3: i64 LogoId   // 映射好的int64 ID, 普通版为原model_id
}

struct ModelPluginDetail {
    1: map<i64,ModelProfile> ModelDetailMap
    2: map<i64,PluginDetal> PluginDetailMap
}


struct CheckBotAllModelPluginIdsRequest {
    1: required i64 bot_id (agw.js_conv="str", api.js_conv="true",agw.key="bot_id")
    2: optional string commit_version

    255: base.Base Base (api.none="true")
}

struct CheckBotAllModelPluginIdsResponse {
    1: required ModelPluginInfo data
    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp
}


struct ModelPluginInfo {
    1: list<ModelDetail> model_list
    2: list<PluginDetal> plugin_list
    3: string            whitelist_survey
}

// notice相关
// notice 数据定义
struct Notice {
    1: i64 id (api.js_conv='true',agw.js_conv="str") // 通知 id
    2: string content // 通知内容
    3: string jump_link // 跳转链接，为空不跳转
    4: ReadStatus read_status // 已读未读状态
    5: NoticeSender sender // 通知发布者信息
    6: i64 create_time (api.js_conv='true',agw.js_conv="str") // 创建时间 毫秒
}
enum ReadStatus {
    Unread = 1
    Read = 2
}

enum NoticeSenderType {
    Bot = 1 // bot发送通知
}
struct NoticeSender {
    1: NoticeSenderType sender_type // 通知发送方 1=bot
    2: string sender_id      // 发送方id
    3: string sender_name    // 发送方name
    4: string sender_icon_url // 发送方头像
}

enum NoticeRankType {
    All = 0
    Unread = 1
}
// notice 列表接口
struct GetNoticeListRequest {
    1: required i64  cursor  (api.js_conv='true',agw.js_conv="str") // 分页cursor,列表首刷传0,后续传上一刷返回的next cursor
    2: optional i32  count // 请求多少条，最多50条，默认20条
    3: optional NoticeRankType notice_rank_type // 列表筛选 全部/未读 默认全部

    255: base.Base Base (api.none="true")
}

struct GetNoticeListData {
    1: list<Notice> notice_list // notice列表
    2: i64 next_cursor (api.js_conv='true',agw.js_conv="str") // 下一刷请求的cursor
    3: bool has_more // 是否有下一刷
}

struct GetNoticeListResponse {
    1: required GetNoticeListData data,

    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}

struct GetNoticeUnreadCountRequest {

    255: base.Base Base (api.none="true")
}

struct GetNoticeUnreadCountData {
    1: i32 unread_count // 未读数
}

struct GetNoticeUnreadCountResponse {
    1: required GetNoticeUnreadCountData data,

    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}

struct NoticeMarkReadRequest {
    1: list<string> notice_ids // 已读的通知 id列表，一键已读时不传或传空
    2: optional bool mark_all // 一键已读
    255: base.Base Base (api.none="true")
}


struct NoticeMarkReadResponse {

    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}

// notice end

// home_banner 接口
struct CreateHomeBannerTaskRequest {
    1: required string TaskName
    2: required string Creator
    3: required list<BannerConfig> BannerList
    255: base.Base Base (api.none="true")
}

struct CreateHomeBannerTaskResponse {
    1: required HomeBannerTaskBaseInfo Data
    255: optional base.BaseResp BaseResp
}

struct HomeBannerTaskBaseInfo{
    1: i64 TaskId
    2: i64 TaskStartTime
    3: i64 TaskEndTime
    4: string Creator
    5: string Operator
    6: i64 CreateTime
}

enum HomeBannerTaskStatus{
    Online = 1
    Delete = 2
}

struct UpdateHomeBannerTaskRequest {
    1: required i64 TaskId
    2: optional string TaskName
    3: optional HomeBannerTaskStatus Status
    4: optional list<BannerConfig> BannerList
    5: required string Operator
    255: base.Base Base (api.none="true")
}

struct UpdateHomeBannerTaskResponse {
    255: optional base.BaseResp BaseResp
}

enum IsDefaultBannerTask {
    NotDefault = 0
    Default = 1
}

struct GetHomeBannerTaskListRequest {
    1: optional i64 TaskId
    2: optional string TaskName
    3: optional HomeBannerTaskStatus Status
    4: optional i32 PageSize
    5: optional i32 PageIndex
    6: optional i64 CurrentTime
    7: optional IsDefaultBannerTask IsDefault // 0-非默认，1-默认
    255: base.Base Base (api.none="true")
}

struct GetHomeBannerTaskListResponse {
    1: required list<HomeBannerTaskConfig> HomeBannerTaskList
    2: required i32 Total
    255: optional base.BaseResp BaseResp
}

struct HomeBannerTaskConfig {
    1: i64 TaskId (api.body="task_id")
    2: string TaskName  (api.body="task_name")
    3: i64 TaskStartTime (api.body="task_start_time")
    4: i64 TaskEndTime    (api.body="task_end_time")
    5: list<BannerConfig> BannerList (api.body="banner_list")
    6: string Creator     (api.body="creator")
    7: string Operator    (api.body="operator")
    8: i64 CreateTime (api.body="create_time")

}

struct BannerConfig {
    1: string ImageUri   (api.body="image_uri")
    2: string MainTitle  (api.body="main_title")   // 主标题
    3: string SubTitle   (api.body="sub_title")    // 主标题
    4: string ButtonText (api.body="button_text")  // Button文案
    5: string ButtonUrl  (api.body="button_url")   // Button跳转链接
    6: i64    StartTime  (api.body="start_time")   // 开始生效时间
    7: i64    EndTime    (api.body="end_time")     // 结束生效时间
    8: StyleStatus Style (api.body="style")// 1-暗黑 2-明亮
}

enum StyleStatus{
    Dark = 1
    Light = 2
}

struct HomeBannerDisplay{
    1: string ImageUrl   (api.body="image_url")
    2: string MainTitle  (api.body="main_title")   // 主标题
    3: string SubTitle   (api.body="sub_title")    // 副标题
    4: string ButtonText (api.body="button_text")  // Button文案
    5: string ButtonUrl  (api.body="button_url")   // Button跳转链接
    6: StyleStatus Style (api.body="style")// 1-暗黑 2-明亮
}

// home_banner end

struct DraftBotMetaInfo {
    1: i64 BotId (agw.js_conv="str",api.js_conv="true",agw.key="bot_id")
    2: i64 SpaceId (agw.js_conv="str",api.js_conv="true",agw.key="space_id")
    3: string BotName (api.body="bot_name")
    4: string IconUrl (api.body="icon_url")
}

struct GetRecentDraftBotListRequest {
    1: required BehaviorType BehaviorType (api.body="behavior_type")

    100: required i32 Limit (api.body="limit")
    255: base.Base Base (api.none="true")
}

struct GetRecentDraftBotListData {
    1: list<DraftBotMetaInfo> BotList (api.body="bot_list"),
    2: i64 Total (api.body="total"),
}

struct GetRecentDraftBotListResponse {
    1: GetRecentDraftBotListData data

    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp
}

enum SpaceResourceType {
    DraftBot = 1
    Project = 2
    Space   = 3
    DouyinAvatarBot = 4
}

enum BehaviorType {
    Visit = 1
    Edit = 2
}

struct ReportUserBehaviorRequest {
    1: required string ResourceID (api.body = "resource_id")
    2: required SpaceResourceType ResourceType (api.body="resource_type")
    3: required BehaviorType BehaviorType (api.body="behavior_type")
    4: optional i64 SpaceID (agw.js_conv="str",api.js_conv="true",agw.key="space_id") // 本需求必传

    255: base.Base Base (api.none="true")
}

struct ReportUserBehaviorResponse {
    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct GetPromptReferenceInfoRequest {
    1: required i64 SpaceID (agw.js_conv="str",api.js_conv="true",agw.key="space_id")
    2: required i64 ReferenceID (agw.js_conv="str",api.js_conv="true",agw.key="reference_id")
    3: required PromptReferenceType ReferenceType (agw.key="reference_type")
    4: optional i64 APIID (agw.js_conv="str",api.js_conv="true",agw.key="api_id") // 引用plugin时才需要传
    5: optional i64 ProjectID (agw.js_conv="str",api.js_conv="true",agw.key="project_id")

    255: base.Base Base (api.none="true")
}

enum PromptReferenceType {
    Plugin = 1
    Workflow = 2
    ImageFlow = 3
    Knowledge = 4
}

struct PromptReferenceInfo {
    1: i64 ID (agw.js_conv="str",api.js_conv="true",agw.key="id")
    2: string Name (agw.key="name")
    3: string Desc (agw.key="desc")
    4: string IconURL (agw.key="icon_url")
    5: optional i64 APIID (agw.js_conv="str",api.js_conv="true",agw.key="api_id") // 引用plugin时才有值
    6: optional i64 SpaceID (agw.js_conv="str",api.js_conv="true",agw.key="space_id")
    7: optional bool IsPublic (agw.key="is_public") // 是否为公开资源
    8: optional PromptReferenceInfoDetail DetailInfo (agw.key="detail_info") // 资源详情
}

struct PromptReferenceInfoDetail {
    1: optional PluginApi  PluginDetail    (agw.key="plugin_detail")
    2: optional PluginApi  WorkflowDetail  (agw.key="workflow_detail")
    3: optional DataSetInfo KnowledgeDetail (agw.key="knowledge_detail")
}

struct DataSetInfo {
    1: string id
    2: string name
    3: string icon_url
    4: DataSetType format_type
    5: optional string project_id
}

enum DataSetType {
    Text = 0 // 文本
    Table = 1 // 表格
    Image = 2 // 图片
}

struct GetPromptReferenceInfoResponse {
    1: optional PromptReferenceInfo Data (api.body="data")

    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp
}

/***************************** bpm 相关 *****************************/
// 获取服务树下拉列表
struct GetByteTreeByNameReq {
    1: optional string name

    100: optional string jwt_token (api.header = "x-jwt-token"), // jwt token
    255: optional base.Base Base
}

struct ByteTreeItem {
    1: string node_name // 展示用
    2: string node_id   // 传参用
}

struct ByteTreeData {
    1: list<ByteTreeItem> node
}

struct GetByteTreeByNameResp {
    1: i32          code
    2: string       msg
    3: ByteTreeData data
    255: optional base.BaseResp BaseResp
}

/***************************** bpm回调 相关 *****************************/
// API豁免表单类型
enum ExemptFormType{
    ByteTree = 1
    GPTAK = 2
    MaasAK = 3
}
struct CheckExemptFormInfoRequest {
    1: ExemptFormType exempt_form_type
    2: i64 space_id (api.js_conv='true' agw.js_conv="str")

    100: optional string jwt_token (api.header = "x-jwt-token"), // jwt token
    255: base.Base Base
}

struct CheckExemptFormInfo {
    1: bool pass
}

struct CheckExemptFormInfoResponse {
    1: CheckExemptFormInfo data

    253: bool             code
    254: string           msg
    255: base.BaseResp BaseResp (api.none="true")
}


struct FormDetail { // 表单详情
    1: string background // 业务背景
    2: string expected_at // 预计上线时间
}

struct SetByteTreeForSpaceRequest {
    1: i64    space_id            (api.js_conv='true' agw.js_conv="str")
    2: string byte_tree_node_id
    3: string byte_tree_node_name
    4: optional FormDetail form_detail    // 用于埋点上报的信息
    5: i64 record_id                      // 工单id

    100: optional string jwt_token (api.header = "x-jwt-token"), // jwt token
    255: base.Base Base
}

struct SetByteTreeForSpaceResponse {
    253: i64              code
    254: string           msg
    255: base.BaseResp BaseResp (api.none="true")
}

enum ModelVendor {
    GPTOpenAPI = 1
    Maas = 2
    LLMFlow = 3
    Merlin = 4
}

struct GetModelCapabilityRequest {
    1: required ModelVendor vendor
    2: required string      model_arch  //方舟是接入点、openAPI平台是模型名称
    3: optional string      maas_model_name  //火山方舟模型名称（非接入点名称）
    4: optional string      maas_model_version //火山方舟模型版本
    5: optional string      maas_customer_id //火山方舟用户微调模型ID

    100: optional string jwt_token (api.header = "x-jwt-token"), // jwt token
    255: base.Base Base
}

struct ModelCapability{
    1: optional i64       token_limit               // 上下文长度
    2: optional i64       upper_limit_of_max_token  // 最大输出的上限
    3: optional bool      function_call              // 是否支持functioncall
    4: optional bool      multi_modal                // 是否支持多模态
    5: optional list<string>  multi_modal_types       // 多模态支持的文件类型，遵循 MIME 标准
}

struct GetModelCapabilityResponse{
    1: ModelCapability data

    253: i64              code
    254: string           msg
    255: base.BaseResp BaseResp (api.none="true")
}

struct CreatePrivateModelRequest {
    1: i64    space_id    (api.js_conv='true' agw.js_conv="str")
    2: ModelVendor model_vendor
    3: string model_show_name
    4: string model_arch // 方舟为ep_id,openAPI平台是模型名称
    5: string ak
    6: optional i64 token_limit (api.js_conv='true' agw.js_conv="str")
    7: optional i64 upper_limit_of_max_token (api.js_conv='true' agw.js_conv="str")
    8: optional bool function_call
    9: optional bool multimodal
    10: optional list<string> multimodal_types //多模态支持的文件类型，遵循 MIME 标准
    11: optional FormDetail form_detail    // 用于埋点上报的信息
    12: i64 record_id
    13: optional string maas_model_name // 方舟模型名称（非接入点名称）
    14: optional string maas_model_version // 方舟模型版本
    15: optional string maas_model_customer_id // 方舟用户微调模型ID
    16: ModelFamily model_family

    100: optional string jwt_token (api.header = "x-jwt-token"), // jwt token
    255: base.Base Base
}

enum ModelFamily {
    GPT             = 1
    Claude          = 3
    Gemini          = 11 // gemini(google)
    Moonshot        = 12
    GLM             = 13 // 智谱
    QWen            = 15
    DeekSeek        = 19 // deep seek
    StepFun         = 23
}

struct PrivateModelInfo {
    1: i64 model_id (api.js_conv='true' agw.js_conv="str")
}

struct CreatePrivateModelResponse {
    1: PrivateModelInfo data

    253: i64                code
    254: string             msg
    255: base.BaseResp BaseResp (api.none="true")
}



service PlaygroundService {
    // draft bot
    DraftBotCreateResponse DraftBotCreate(1:DraftBotCreateRequest request)
    GetDraftBotInfoResponse GetDraftBotInfo(1:GetDraftBotInfoRequest request) // 前端使用
    UpdateDraftBotResponse UpdateDraftBot(1:UpdateDraftBotRequest request)
    PublishDraftBotResponse PublishDraftBot(1:PublishDraftBotRequest request)
    DuplicateDraftBotResponse DuplicateDraftBot(1:DuplicateDraftBotRequest request)
    RevertDraftBotResponse RevertDraftBot(1:RevertDraftBotRequest request)
    GetBotDraftListResponse GetBotDraftList(1:GetBotDraftListRequest request)
    ListDraftBotHistoryResponse ListDraftBotHistory(1:ListDraftBotHistoryRequest request)
    DeleteDraftBotResponse DeleteDraftBot(1:DeleteDraftBotRequest request)
    ExecuteDraftBotResponse ExecuteDraftBot(1:ExecuteDraftBotRequest request)
    CreateDraftBotHistoryResponse CreateDraftBotHistory(1:CreateDraftBotHistoryRequest request)
    GetLatestDraftHistoryInfoResponse GetLatestDraftHistoryInfo(1:GetLatestDraftHistoryInfoRequest request)
    GetLatestPublishTimeResponse GetLatestPublishTime(1:GetLatestPublishTimeRequest request)
    GetLatestPublishRecordResponse GetLatestPublishRecord(1:GetLatestPublishRecordRequest request)
    DraftScriptResponse DraftScript(1:DraftScriptRequest request) // 执行脚本，慎用
    GetExploreBotListResponse GetExploreBotList(1:GetExploreBotListRequest request)
    GetExploreCategoryListResponse GetExploreCategoryList(1:GetExploreCategoryListRequest request)
    DuplicateBotToSpaceResponse DuplicateBotToSpace(1:DuplicateBotToSpaceRequest request)
    UpdateExploreBotResponse UpdateExploreBot(1:UpdateExploreBotRequest request)
    CheckDraftBotCommitResponse CheckDraftBotCommit(1:CheckDraftBotCommitRequest request)
    CommitDraftBotResponse CommitDraftBot(1:CommitDraftBotRequest request)
    DraftBotCollaborationResponse DraftBotCollaboration(1:DraftBotCollaborationRequest request)(api.post='/api/playground_api/draftbot/collaboration', api.category="draftbot",agw.preserve_base="true")
    GetBotCollaborationQuotaResponse GetBotCollaborationQuota(1:GetBotCollaborationQuotaRequest request)(api.post='/api/playground_api/draftbot/collaboration_quota', api.category="draftbot",agw.preserve_base="true")
    GenerateDescriptionResponse GenerateDescription (1:GenerateDescriptionRequest request)(api.post='/api/playground_api/draftbot/generate_description', api.gateway="draftbot",agw.preserve_base="true")
    GenerateStoreCategoryResponse GenerateStoreCategory (1:GenerateStoreCategoryRequest request)(api.post='/api/playground_api/draftbot/generate_store_category', api.gateway="draftbot",agw.preserve_base="true")
    DraftBotPublishHistoryDetailResponse DraftBotPublishHistoryDetail(1:DraftBotPublishHistoryDetailRequest request)(api.post='/api/playground_api/draftbot/publish_history_detail', api.category="draftbot",agw.preserve_base="true")

    GetDraftBotInfoAgwResponse GetDraftBotInfoAgw(1:GetDraftBotInfoAgwRequest request)(api.post='/api/playground_api/draftbot/get_draft_bot_info', api.category="draftbot",agw.preserve_base="true")
    UpdateDraftBotInfoAgwResponse UpdateDraftBotInfoAgw(1:UpdateDraftBotInfoAgwRequest request)(api.post='/api/playground_api/draftbot/update_draft_bot_info', api.category="draftbot",agw.preserve_base="true")
    CommitDraftBotInfoAgwResponse CommitDraftBotInfoAgw(1:CommitDraftBotInfoAgwRequest request)(api.post='/api/playground_api/draftbot/commit_draft_bot_info', api.category="draftbot",agw.preserve_base="true")

    GetBotBasicInfoResponse GetBotBasicInfo(1:GetBotBasicInfoRequest request)
    GetBotEvaluationVersionResponse GetBotEvaluationVersion(1:GetBotEvaluationVersionRequest request)

    // 修复explore bot上架问题
    UpdateExploreBotFixResponse UpdateExploreBotFix(1:UpdateExploreBotFixRequest request)

    GetBotMigrateProgressResponse GetBotMigrateProgress(1:GetBotMigrateProgressRequest request)
    MigrateDraftBotResponse MigrateDraftBot(1:MigrateDraftBotRequest request)
    RetryMigTaskResponse RetryMigTask(1:RetryMigTaskRequest request)

    GetOpAllBotListResponse GetOpAllBotList(1:GetOpAllBotListRequest request)
    GetOpSpaceListResponse GetOpSpaceList(1:GetOpSpaceListRequest request)
    GetExploreBotInfoResponse GetExploreBotInfo(1:GetExploreBotInfoRequest request)
    // 获取分类列表
    GetCategoryListResponse GetCategoryList(1: GetCategoryListRequest request)
    // 保存分类
    SaveCategoryResponse SaveCategory(1: SaveCategoryRequest request)
    PingResponse Ping(1: PingRequest req)
    ListPlaygroundHistoryInfoResponse ListPlaygroundHistoryInfo(1: ListPlaygroundHistoryInfoRequest req)
    GetPlaygroundRecordResponse GetPlaygroundRecord(1: GetPlaygroundRecordRequest req)
    SavePlaygroundRecordResponse SavePlaygroundRecord(1:SavePlaygroundRecordRequest request)
    AddTaskResponse AddTask(1:AddTaskRequest request)
    ListTaskResponse ListTask(1:ListTaskRequest request)
    UpdateTaskResponse UpdateTask(1:UpdateTaskRequest request)
    DuplicateTaskResponse DuplicateTask(1:DuplicateTaskRequest request)
    GetBotInfoResponse GetBotInfo(1:GetBotInfoRequest request)
    SubmitBotTaskResponse SubmitBotTask(1:SubmitBotTaskRequest request)
    GetOnboardingResponse GetOnboarding(1:GetOnboardingRequest request)
    RevertPlaygroundRecordResponse RevertPlaygroundRecord(1:RevertPlaygroundRecordRequest request)
    GetTaskInfoResponse GetTaskInfo(1: GetTaskInfoRequest request)
    GetUploadAuthTokenResponse GetUploadAuthToken(1: GetUploadAuthTokenRequest request)
    CheckWorkInfoResponse CheckWorkInfo(1: CheckWorkInfoRequest request)
    GetDraftBotDisplayInfoResponse GetDraftBotDisplayInfo(1: GetDraftBotDisplayInfoRequest request)
    UpdateDraftBotDisplayInfoResponse UpdateDraftBotDisplayInfo(1: UpdateDraftBotDisplayInfoRequest request)

    // -------------------- bot version相关 --------------------
    SaveDraftBotResponse SaveDraftBot(1: SaveDraftBotRequest request) // 保存草稿bot
    GetBotInfoV2Response GetBotInfoV2(1:GetBotInfoV2Request request) // 获取 bot 信息
    GetBotLatestVersionWithMultiConnectorResponse GetBotLatestVersionWithMultiConnector(1:GetBotLatestVersionWithMultiConnectorRequest request) // 根据id,connector查询bot最新版本信息
    GetBotVersionV2Response GetBotVersionV2(1:GetBotVersionV2Request request) // 查询线上bot信息
    GetPublishedBotListResponse GetPublishedBotList(1:GetPublishedBotListRequest request) (api.post='/api/playground_api/bot_version/get_published_bot_list', api.category="bot_version", agw.preserve_base="true") // 查询已发布bot的最新版本
    GetBotVersionInfoResponse GetBotVersionInfo(1:GetBotVersionInfoRequest request) (api.post='/api/playground_api/bot_version/get_bot_version_info', api.category="bot_version", agw.preserve_base="true") // 查询线上bot详情

    GetLatestBotDraftInfoResponse GetLatestBotDraftInfo(1:GetLatestBotDraftInfoRequest request)
    GetUserBotAuthResponse GetUserBotAuth(1:GetUserBotAuthRequest request)

    TimeCapsuleInvokeEventResponse TimeCapsuleInvokeEvent (1:TimeCapsuleInvokeEventRequest request) (api.post='/api/playground_api/timecapsule_invoke_event', api.category="playground_api", agw.preserve_base="true") // 主动生成timecapsule

    // --------------------frontier相关--------------------------------
    FrontierAuthResponse Auth(1: FrontierAuthRequest request) // 长链接鉴权
    FrontierSendMessageResponse SendMessage(1: FrontierSendMessageRequest reqest) // 上行消息处理
    SendEventResponse SendEvent(1: SendEventRequest req)
    ACKMessageResponse ACKMessage(1: ACKMessageRequest req)


    PushCozeEventResponse PushCozeEvent(1: PushCozeEventRequest request) // coze event处理

    // --------------------space相关--------------------------------

    SaveSpaceResponse SaveSpace(1:SaveSpaceRequest request)
    SaveSpaceV2Response SaveSpaceV2(1:SaveSpaceV2Request request)(api.post='/api/playground_api/space/save', api.category="space",agw.preserve_base="true")

    DeleteSpaceResponse DeleteSpace(1:DeleteSpaceRequest request)
    DeleteSpaceV2Response DeleteSpaceV2(1:DeleteSpaceV2Request request)(api.post='/api/playground_api/space/delete', api.category="space",agw.preserve_base="true")

    GetSpaceListResponse GetSpaceList(1:GetSpaceListRequest request)
    GetSpaceListV2Response GetSpaceListV2(1:GetSpaceListV2Request request)(api.post='/api/playground_api/space/list', api.category="space",agw.preserve_base="true")

    GetInternalSpaceInfoResponse GetInternalSpaceInfo (1:GetInternalSpaceInfoRequest request)
    UpdateInternalSpaceResponse UpdateInternalSpace (1:UpdateInternalSpaceRequest request)
    // 运营平台
    GetOperationSpaceListResponse GetOperationSpaceList(1:GetOperationSpaceListRequest request)
    GetModelConfigListResponse GetModelConfigList(1:GetModelConfigListRequest request)
    AddModelConfigResponse AddModelConfig(1:AddModelConfigRequest request)
    UpdateModelConfigResponse UpdateModelConfig(1:UpdateModelConfigRequest request)
    SetByteTreeResponse SetByteTree(1: SetByteTreeRequest request)

    GetSpaceInfoResponse GetSpaceInfo(1:GetSpaceInfoRequest request)
    GetSpaceInfoV2Response GetSpaceInfoV2(1:GetSpaceInfoV2Request request)(api.post='/api/playground_api/space/info', api.category="space" ,agw.preserve_base="true")

    SearchMemberResponse SearchMember(1:SearchMemberRequest request)
    SearchMemberV2Response SearchMemberV2(1:SearchMemberV2Request request) (api.post='/api/playground_api/space/member/search', api.category="space" ,agw.preserve_base="true")
    AddSpaceMemberResponse AddSpaceMember(1:AddSpaceMemberRequest request)
    AddSpaceMemberV2Response AddBotSpaceMemberV2(1:AddSpaceMemberV2Request request)(api.post='/api/playground_api/space/member/add', api.category="space" ,agw.preserve_base="true")

    UpdateSpaceMemberResponse UpdateSpaceMember(1:UpdateSpaceMemberRequest request)
    UpdateSpaceMemberV2Response UpdateSpaceMemberV2(1:UpdateSpaceMemberV2Request request)(api.post='/api/playground_api/space/member/update', api.category="space" ,agw.preserve_base="true")
    CheckSpaceMemberResponse CheckSpaceMember(1:CheckSpaceMemberRequest request)
    SpaceMemberDetailResponse SpaceMemberDetail(1:SpaceMemberDetailRequest request)
    SpaceMemberDetailV2Response SpaceMemberDetailV2(1:SpaceMemberDetailV2Request request)(api.post='/api/playground_api/space/member/detail', api.category="space" ,agw.preserve_base="true")

    RemoveSpaceMemberResponse RemoveSpaceMember(1:RemoveSpaceMemberRequest request)
    RemoveSpaceMemberV2Response RemoveSpaceMemberV2(1:RemoveSpaceMemberV2Request request)(api.post='/api/playground_api/space/member/remove', api.category="space" ,agw.preserve_base="true")

    ExitSpaceResponse ExitSpace(1:ExitSpaceRequest request)
    ExitSpaceV2Response ExitSpaceV2(1:ExitSpaceV2Request request)(api.post='/api/playground_api/space/member/exit', api.category="space" ,agw.preserve_base="true")

    TransferSpaceResponse TransferSpace(1:TransferSpaceRequest request)
    TransferSpaceV2Response TransferSpaceV2(1:TransferSpaceV2Request request)(api.post='/api/playground_api/space/member/transfer', api.category="space" ,agw.preserve_base="true")
    GetSpaceMemberResponse GetSpaceMember(1:GetSpaceMemberRequest request)
    MultiGetSpaceMemberResponse MultiGetSpaceMember(1:MultiGetSpaceMemberRequest request)

    CreateInviteResponse CreateInvite(1:CreateInviteRequest request)
    InviteMemberLinkV2Response InviteMemberLinkV2(1: InviteMemberLinkV2Request request)(api.post='/api/playground_api/space/invite', api.category="space" ,agw.preserve_base="true")

    JoinSpaceV2Response JoinSpaceV2(1:JoinSpaceV2Request request)(api.post='/api/playground_api/space/join', api.category="space" ,agw.preserve_base="true")

    // 获取空间邀请管理列表
    GetSpaceInviteManageListResponse GetSpaceInviteManageList(1:GetSpaceInviteManageListRequest request)(api.get='/api/playground_api/space/invite_manage_list', api.category="space" ,agw.preserve_base="true")
    // 撤销空间邀请
    RevocateSpaceInviteResponse RevocateSpaceInvite(1:RevocateSpaceInviteRequest request)(api.get='/api/playground_api/space/revocate_invite', api.category="space" ,agw.preserve_base="true")

    BindVolcanoTrnResponse BindVolcanoTrn(1:BindVolcanoTrnRequest request)(api.post='/api/playground_api/space/bind_volcano_trn', api.category="space" ,agw.preserve_base="true")
    UnbindVolcanoTrnResponse UnbindVolcanoTrn(1:UnbindVolcanoTrnRequest request)(api.post='/api/playground_api/space/unbind_volcano_trn', api.category="space" ,agw.preserve_base="true")

    CloseInviteResponse CloseInvite(1:CloseInviteRequest request)
    GetInviteInfoResponse GetInviteInfo(1:GetInviteInfoRequest request)
    // 通过task关联的资源进行反查task数量
    GetTaskListByResourceIdResponse GetTaskListByResourceId(1: GetTaskListByResourceIdRequest request)
    MGetSpaceInfoResponse MGetSpaceInfo(1:MGetSpaceInfoRequest request)

    //生图相关
    GeneratePicResponse GeneratePic(1:GeneratePicRequest request)(api.post='/api/playground_api/gen_img/generate_pic', api.category="gen_img" ,agw.preserve_base="true")
    CancelGenerateGifResponse CancelGenerateGif(1:CancelGenerateGifRequest request)(api.post='/api/playground_api/gen_img/cancel_generate_gif', api.category="gen_img" ,agw.preserve_base="true")
    MarkReadNoticeResponse MarkReadNotice(1:MarkReadNoticeRequest request)(api.post='/api/playground_api/gen_img/mark_read_notice', api.category="gen_img" ,agw.preserve_base="true")
    GetPicTaskResponse GetPicTask(1:GetPicTaskRequest request)(api.post='/api/playground_api/gen_img/get_pic_task', api.category="gen_img" ,agw.preserve_base="true")
    GetGenPicTimesResponse GetGenPicTimes(1:GetGenPicTimesRequest request)(api.post='/api/playground_api/gen_img/get_gen_pic_times', api.category="gen_img" ,agw.preserve_base="true")
    ListStyleResponse ListStyle(1:ListStyleRequest request)(api.post='/api/playground_api/gen_img/list_style', api.category="gen_img" ,agw.preserve_base="true")
    OnCompleteGenGifResponse OnCompleteGenGif(1:OnCompleteGenGifRequest request)


    // ---------------------------wait list --------------------------------
    ListWaitingQueueResponse ListWaitingQueue (1:ListWaitingQueueRequest request)
    GetWaitListConfigResponse GetWaitListConfigRequest (1:GetWaitListConfigRequest request)
    GrantBotQualificationResponse GrantBotQualification (1:GrantBotQualificationRequest request)
    GetWaitListStatisticalResponse GetWaitListStatistical(1: GetWaitListStatisticalRequest request)
    AddWaitListUserResponse AddWaitListUser (1: AddWaitListUserRequest request)

    // 存储备份用户勾选的cookie banner
    StoreCookieBannerResponse StoreCookieBanner(1: StoreCookieBannerRequest request)


    // --------------------------用户相关--------------------------------
    MGetUserBasicInfoResponse MGetUserBasicInfo(1: MGetUserBasicInfoRequest request) (api.post='/api/playground_api/mget_user_info', api.category="playground_api",agw.preserve_base="true")
    AccountCancelResponse AccountCancel(1: AccountCancelRequest request)
    GetBotUserInfoResponse GetBotUserInfo(1: GetBotUserInfoRequest request )
    SaveBotUserInfoResponse SaveBotUserInfo(1:SaveBotUserInfoRequest request )
    GetCozeProRightsResponse GetCozeProRights(1: GetCozeProRightsRequest request ) (api.post='/api/playground_api/get_coze_pro_rights', api.category="playground_api",agw.preserve_base="true")
    // 用户注销回调
    // 文档参考 https://bytedance.feishu.cn/docs/doccnhPAQF5wX9y8rLnhzSmzGJd#qhhkmD
    UCenterGetAllUserDataResponse GetAllUserData(1: UCenterGetAllUserDataRequest request)             // 备份的时候使用
    UCenterDeleteUserDataResponse SoftDeleteUserData(1: UCenterDeleteUserDataRequest request)         // 用户提交申请时触发
    UCenterDeleteUserDataResponse HardDeleteUserData(1: UCenterDeleteUserDataRequest request)         // 用户提交申请完，经过了缓存期，真正执行物理删除时触发
    UCenterRestoreUserDataResponse RestoreUserData(1: UCenterRestoreUserDataRequest request)          // 用户取消注销时触发、系统恢复用户时触发
    UCenterVerifyUserDataResponse VerifyUserData(1: UCenterVerifyUserDataRequest request)             // 校验用户数据删除是否完成

    // 火山账号注销 - 踢登用户
    VolcanoAccountLogoutResponse VolcanoAccountLogout(1: VolcanoAccountLogoutRequest request)
    // 火山账号注销检查
    CanUserApplyCloseResponse CanUserApplyClose(1: CanUserApplyCloseRequest request)(api.get='/api/playground_api/coze_pro/can_user_apply_close', api.category="coze_pro", agw.preserve_base="true")

    // coze专业版
    CozeProCopyGenerateAuthLinkResponse CozeProCopyGenerateAuthLink(1: CozeProCopyGenerateAuthLinkRequest request)(api.post='/api/playground_api/coze_pro/generate_auth_link', api.category="coze_pro", agw.preserve_base="true")
    CozeProCopyGetLinkMetaInfoResponse CozeProCopyGetLinkMetaInfo(1: CozeProCopyGetLinkMetaInfoRequest request)(api.post='/api/playground_api/coze_pro/get_link_meta_info', api.category="coze_pro", agw.preserve_base="true")
    CozeProCopyTaskConfirmResponse CozeProCopyTaskConfirm(1: CozeProCopyTaskConfirmRequest request)(api.post='/api/playground_api/coze_pro/copy_task_confirm', api.category="coze_pro", agw.preserve_base="true")

    // 保存火山用户管理信息
    SaveVolcanoUserManageInfoResponse SaveVolcanoUserManageInfo(1: SaveVolcanoUserManageInfoRequest request)(api.post='/api/playground_api/coze_pro/save_volcano_user_manage_info', api.category="coze_pro", agw.preserve_base="true")
    // 获取火山用户管理信息
    GetVolcanoUserManageInfoResponse GetVolcanoUserManageInfo(1: GetVolcanoUserManageInfoRequest request)(api.post='/api/playground_api/coze_pro/get_volcano_user_manage_info', api.category="coze_pro", agw.preserve_base="true")

    // 获取模型信息
    GetModelListResponse GetModelList(1: GetModelListRequest request )

    // 用户相关event事件回调
    AccountEventCallBackResponse AccountEventCallBack(1: AccountEventCallBackRequest request)

    // 用户登录自定义阻塞接口
    CheckBlockBySceneResponse CheckBlockByScene(1:CheckBlockBySceneRequest req)


    // prompt自动优化
    PromptOptimizeResponse PromptOptimize(1: PromptOptimizeRequest request)

    // --------------------chat flow--------------------------------
    CreateAgentResponse CreateAgent(1: CreateAgentRequest request)
    CopyAgentResponse CopyAgent(1: CopyAgentRequest request)

    ReportProduceRecordResponse ReportProduceRecord(1: ReportProduceRecordRequest request)
    SwitchAgentVersionResponse SwitchAgentVersion(1: SwitchAgentVersionRequest request) (api.post='/api/playground_api/switch_agent_version', api.category="playground_api", agw.preserve_base="true")
    UpdateMultiAgentResponse UpdateMultiAgent(1: UpdateMultiAgentRequest request) (api.post='/api/playground_api/update_multi_agent', api.category="playground_api", agw.preserve_base="true")
    // --------------------voice--------------------------------
    GetVoiceConfigResponse GetVoiceConfig(1: GetVoiceConfigRequest req)
    GetVoiceTokenResponse GetVoiceToken(1: GetVoiceTokenRequest req)
    SupportVoiceCallResponse SupportVoiceCall(1:SupportVoiceCallRequest request)(api.post='/api/playground_api/support_voice_call', api.category="playground_api",agw.preserve_base="true")

    GetSupportLanguageResponse GetSupportLanguage(1: GetSupportLanguageRequest req) (api.get='/api/playground_api/get_support_language', api.category="playground_api", agw.preserve_base="true")
    GetOpVoiceListResponse GetOpVoiceList(1: GetOpVoiceListRequest req) (api.post='/api/playground_api/get_op_voice_list', api.category="playground_api",agw.preserve_base="true")
    SynchronizeVoiceListResponse SynchronizeVoiceList(1: SynchronizeVoiceListRequest req) (api.get='/api/playground_api/synchronize_voice_list', api.category="playground_api",agw.preserve_base="true")
    GenerateAudioResponse GenerateAudio(1: GenerateAudioRequest req)
    UpdateOpVoiceResponse UpdateOpVoice(1: UpdateOpVoiceRequest req)

    // --------------------agentflow support bot api--------------------------------
    GetPublishBotListResponse GetPublishBotList(1: GetPublishBotListRequest request) (api.get='/api/playground_api/get_publish_bot_list', api.category="playground_api", agw.preserve_base="true")
    BatchCreateAgentResponse BatchCreateAgent(1: BatchCreateAgentRequest request)  (api.post='/api/playground_api/batch_create_agent', api.category="playground_api", agw.preserve_base="true")
    UpdateAgentResponse UpdateAgent(1: UpdateAgentRequest request)  (api.post='/api/playground_api/update_agent', api.category="playground_api", agw.preserve_base="true")
    //结构化接口
    UpdateAgentV2Response UpdateAgentV2(1: UpdateAgentV2Request request)  (api.post='/api/playground_api/update_agent_v2', api.category="playground_api", agw.preserve_base="true")
    CopyAgentV2Response CopyAgentV2(1: CopyAgentV2Request request) (api.post='/api/playground_api/copy_agent_v2', api.category="playground_api", agw.preserve_base="true")
    CreateAgentV2Response CreateAgentV2(1: CreateAgentV2Request request) (api.post='/api/playground_api/create_agent_v2', api.category="playground_api", agw.preserve_base="true")
    BatchCreateAgentV2Response BatchCreateAgentV2(1: BatchCreateAgentV2Request request)  (api.post='/api/playground_api/batch_create_agent_v2', api.category="playground_api", agw.preserve_base="true")


    MGetBotByVersionResponse MGetBotByVersion(1:MGetBotByVersionRequest request)(api.post='/api/playground_api/mget_bot_by_version', api.category="playground_api", agw.preserve_base="true")
    BotLastPublishInfoResponse BotLastPublishInfo(1:BotLastPublishInfoRequest request)(api.get='/api/playground_api/bot_last_publish_info', api.category="playground_api", agw.preserve_base="true")

    // --------------------agentflow support bot rpc--------------------------------
    BotLastVersionProcessResponse  BotLastVersionProcess(1: BotLastVersionProcessRequest request)

    // --------------------bot produce------------------------------
    ProduceBotResponse ProduceBot(1: ProduceBotRequest request)(api.post='/api/playground_api/produce/create_bot', api.category="produce", agw.preserve_base="true")
    UpdateProducedBotResponse UpdateProducedBot(1: UpdateProducedBotRequest request)(api.post='/api/playground_api/produce/update_bot', api.category="produce", agw.preserve_base="true")

    // --------------------conversation--------------------------------
    GetConversationResponse GetConversation(1: GetConversationRequest req)
    GetConversationInfoByIdResponse GetConversationInfoById(1: GetConversationInfoByIdRequest req)
    DeleteConversationInfoResponse DeleteConversationInfo(1: DeleteConversationInfoRequest req)
    MgetHomeConversationResponse MgetHomeConversation(1: MgetHomeConversationRequest req)

    // --------------------pack uri--------------------------------
    PackResourceResponse PackResource(1: PackResourceRequest req)

    DuplicateBotVersionToSpaceResponse DuplicateBotVersionToSpace (1:DuplicateBotVersionToSpaceRequest request)(api.post='/api/playground_api/dup_bot_version', api.category="produce",agw.preserve_base="true")
    GetImagexShortUrlResponse GetImagexShortUrl (1:GetImagexShortUrlRequest request)(api.post='/api/playground_api/get_imagex_url', api.category="file",agw.preserve_base="true")
    GetCozeMessageListResponse GetCozeMessageList (1:GetCozeMessageListRequest request)

    // -------------------- bot audit 相关 --------------------
    BotInfoAuditResponse BotInfoAudit(1:BotInfoAuditRequest request)(api.post='/api/playground_api/audit/bot_info', api.category="audit",agw.preserve_base="true")
    BotInfoCheckResponse BotInfoCheck(1:BotInfoCheckRequest request)(api.post='/api/playground_api/check/bot_info_check', api.category="check",agw.preserve_base="true")

    // 基于botCommon的编辑态模型的读取和更新接口
    UpdateDraftBotInfoV2Response UpdateDraftBotInfoV2(1:UpdateDraftBotInfoV2Request request)
    GetDraftBotInfoV2Response   GetDraftBotInfoV2(1: GetDraftBotInfoV2Request request)

    GetUserRiskAlertInfoResponse GetUserRiskAlertInfo (1:GetUserRiskAlertInfoRequest request)(api.post='/api/playground_api/get_user_risk_alert_info', api.category="account",agw.preserve_base="true")
    UpdateUserRiskAlertInfoResponse UpdateUserRiskAlertInfo (1:UpdateUserRiskAlertInfoRequest request)(api.post='/api/playground_api/update_user_risk_alert_info', api.category="account",agw.preserve_base="true")

    GetUserRiskAlertInfoResponse GetUserConfig (1:GetUserRiskAlertInfoRequest request)(api.post='/api/playground_api/get_user_config', api.category="account",agw.preserve_base="true")
    UpdateUserRiskAlertInfoResponse UpdateUserConfig (1:UpdateUserRiskAlertInfoRequest request)(api.post='/api/playground_api/update_user_config', api.category="account",agw.preserve_base="true")


    // 消息迁移过程使用 不支持业务调用 接口已废弃
    GetDraftMessageInfoResponse   GetDraftMessageInfo(1: GetDraftMessageInfoRequest request)

    // 基于bot_connector表的读取接口
    GetVersionByBotVersionResponse GetVersionByBotVersion (1:GetVersionByBotVersionRequest request)

    GetBotPopupInfoResponse GetBotPopupInfo (1:GetBotPopupInfoRequest request)(api.post='/api/playground_api/operate/get_bot_popup_info', api.category="account",agw.preserve_base="true")
    UpdateBotPopupInfoResponse UpdateBotPopupInfo (1:UpdateBotPopupInfoRequest request)(api.post='/api/playground_api/operate/update_bot_popup_info', api.category="account",agw.preserve_base="true")


    // llm接入coze内部token鉴权接口
    GetCozeInnerTokenResponse GetCozeInnerToken(1: GetCozeInnerTokenRequest request)
    CheckCozeInnerTokenResponse CheckCozeInnerToken(1: CheckCozeInnerTokenRequest request)

    // tts asr 相关接口
    LangDetectResponse LangDetect(1:LangDetectRequest request)(api.post='/api/playground_api/audio/lang/detect', api.category="audio",agw.preserve_base="true")

    // 文件相关
    UploadFileResp UploadFile(1: UploadFileReq request)

    // 获取 bot 开发模式
    GetBotDevelopModeResponse GetBotDevelopMode(1: GetBotDevelopModeRequest request)
    // 切换 bot 开发模式
    SwitchBotDevelopModeResponse SwitchBotDevelopMode(1: SwitchBotDevelopModeRequest request)

      // tcs审核的回调
    /**
     * bactch get object data, aka read interface / read callback
     */
    MGetObjectDataRsp mget_object_data(1: MGetObjectDataReq req)
    /**
     * bacth update task result, aka write interface / write callback
     */
    MSetTaskResultRsp mset_task_result(1: MSetTaskResultReq req)

    // plugin、workflow告知bot审核结果
    BotAuditCallbackResponse BotAuditCallback(1: BotAuditCallbackRequest req)
    GetBotAuditRecordResponse GetBotAuditRecord (1: GetBotAuditRecordRequest req)

    // Bot平台通用配置接口
    GetPlatformCommonConfigResponse GetPlatformCommonConfig(1: GetPlatformCommonConfigRequest request)(api.get='/api/playground_api/get_platform_common_config', api.category="playground_api", agw.preserve_base="true")

    // 创建快捷指令
    shortcut_command.CreateShortcutCommandResponse CreateShortcutCommand(1: shortcut_command.CreateShortcutCommandRequest req)(api.post='/api/playground_api/create_shortcut_command', api.category="playground_api", agw.preserve_base="true")
    GetShortcutAvailNodesResponse GetShortcutAvailNodes(1: GetShortcutAvailNodesRequest req) (api.post='/api/playground_api/get_shortcut_avail_nodes', api.category="playground_api", agw.preserve_base="true")
    shortcut_command.CreateUpdateShortcutCommandResponse CreateUpdateShortcutCommand(1: shortcut_command.CreateUpdateShortcutCommandRequest req)(api.post='/api/playground_api/create_update_shortcut_command', api.category="playground_api", agw.preserve_base="true")

    // 用户标签相关接口
    // 显示所有标签
    GetAllUserLabelResponse GetAllUserLabel(1: GetAllUserLabelRequest request)
    // 创建或更新标签
    SaveUserLabelResponse SaveUserLabel(1: SaveUserLabelRequest request)
    // 删除标签
    DeleteUserLabelResponse DeleteUserLabel(1: DeleteUserLabelRequest request)
    // 显示已配置标签的用户
    GetLabelledUserResponse GetLabelledUser(1: GetLabelledUserRequest request)
    // 根据ID或者Name查找用户信息
    MGetUserLabelInfoResponse MGetUserLabelInfo(1: MGetUserLabelInfoRequest request)
    // 更新用户标签
    UpdateUserLabelResponse UpdateUserLabel(1: UpdateUserLabelRequest request)

    // 移动bot
    MoveDraftBotResponse MoveDraftBot(1: MoveDraftBotRequest request)(api.post='/api/playground_api/move_draft_bot', api.category="playground_api", agw.preserve_base="true")

    // 处罚执行&解除
    punish_center.CozePunishResponse CozePunish(1:punish_center.CozePunishRequest request)
    punish_center.CozeUnPunishResponse CozeUnPunish(1:punish_center.CozeUnPunishRequest request)

    // 会话链路能力开放相关
    // File 相关 OpenAPI
    UploadFileOpenResponse UploadFileOpen(1: UploadFileOpenRequest request)(api.post = "/v1/files/upload", api.category="file", api.tag="openapi", agw.preserve_base="true")
    RetrieveFileOpenResponse RetrieveFileOpen(1: RetrieveFileOpenRequest request)(api.get = "/v1/files/retrieve", api.category="file", api.tag="openapi", agw.preserve_base="true")
    RetrieveFileContentOpenResponse RetrieveFileContentOpen(1: RetrieveFileContentOpenRequest request)(api.get = "/v1/files/content/retrieve", agw.preserve_base="true")

    UploadFileAtomicResponse UploadFileAtomic(1: UploadFileAtomicRequest request)
    RetrieveFileAtomicResponse RetrieveFileAtomic(1: RetrieveFileAtomicRequest request)
    ListFilesAtomicResponse ListFilesAtomic(1: ListFilesAtomicRequest request)
    RetrieveFileContentAtomicResponse RetrieveFileContentAtomic(1: RetrieveFileContentAtomicRequest request)
    ImageXUploadImageResponse ImageXUploadImage(1:ImageXUploadImageRequest request)


    // 根据场景获取图片列表
    GetFileUrlsResponse GetFileUrls(1: GetFileUrlsRequest req)(api.post='/api/playground_api/get_file_list', api.category="playground_api", agw.preserve_base="true")

    CheckEntityInConfigListResponse CheckEntityInConfigList(1: CheckEntityInConfigListRequest request)

    // 用户query收集
    GetUserQueryCollectOptionResponse GetUserQueryCollectOption(1:GetUserQueryCollectOptionRequest request)(api.get='/api/playground_api/draftbot/get_user_query_collect_option', api.category="query_collect",agw.preserve_base="true")
    GenerateUserQueryCollectPolicyResponse GenerateUserQueryCollectPolicy(1:GenerateUserQueryCollectPolicyRequest request)(api.post='/api/playground_api/draftbot/generate_user_query_collect_policy', api.category="query_collect",agw.preserve_base="true")
    GetPolicyContentResponse GetPolicyContent(1:GetPolicyContentRequest request)(api.get='/api/playground_api/private_policy/:secret', api.category="query_collect")

    //workflow是否被workflow模式下bot绑定
    WorkflowBindedCheckResponse WorkflowBindedCheck(1:WorkflowBindedCheckRequest request)
    GetBannerListResponse GetBannerList(1:GetBannerListRequest request)
    UpdateBannerResponse UpdateBanner(1:UpdateBannerRequest request)

    // 运营后台查询 用户信息
    op.OpGetUserInfoResponse OpGetUserInfo(1:op.OpGetUserInfoRequest request)


    // 开放api 查询工作空间列表
    open_api_playground.OpenSpaceListResponse OpenSpaceList(1:open_api_playground.OpenSpaceListRequest request)(api.get = "/v1/workspaces",api.category="workspace", api.tag="openapi", agw.preserve_base="true")

    // 获取bot内所有的模型id和插件id
    GetBotAllModelPluginIdsResponse GetBotAllModelPluginIds(1:GetBotAllModelPluginIdsRequest request)
    CheckBotAllModelPluginIdsResponse CheckBotAllModelPluginIds(1: CheckBotAllModelPluginIdsRequest request)(api.post='/api/playground_api/draftbot/check_bot_all_model_plugin_ids', api.category="draftbot",agw.preserve_base="true")

    // notice 通知中心
    GetNoticeListResponse GetNoticeList(1:GetNoticeListRequest request)(api.post='/api/playground_api/notice/get_list', api.category="notice",agw.preserve_base="true")
    GetNoticeUnreadCountResponse GetNoticeUnreadCount(1:GetNoticeUnreadCountRequest request)(api.post='/api/playground_api/notice/get_unread_count', api.category="notice",agw.preserve_base="true")
    NoticeMarkReadResponse NoticeMarkRead(1:NoticeMarkReadRequest request)(api.post='/api/playground_api/notice/mark_read', api.category="notice",agw.preserve_base="true")

    // home banner配置
    CreateHomeBannerTaskResponse CreateHomeBannerTask(1:CreateHomeBannerTaskRequest request)
    UpdateHomeBannerTaskResponse UpdateHomeBannerTask(1:UpdateHomeBannerTaskRequest request)
    GetHomeBannerTaskListResponse GetHomeBannerTaskList(1:GetHomeBannerTaskListRequest request)

    GetRecentDraftBotListResponse GetRecentDraftBotList(1:GetRecentDraftBotListRequest request)(api.post='/api/playground_api/draftbot/get_recent_draft_bot', api.category="draftbot",agw.preserve_base="true")

    // 用户行为上报
    ReportUserBehaviorResponse ReportUserBehavior(1:ReportUserBehaviorRequest request)(api.post='/api/playground_api/report_user_behavior', api.category="playground_api",agw.preserve_base="true")

    // prompt resource
    prompt_resource.GetOfficialPromptResourceListResponse GetOfficialPromptResourceList(1:prompt_resource.GetOfficialPromptResourceListRequest request)(api.post='/api/playground_api/get_official_prompt_list', api.category="prompt_resource",agw.preserve_base="true")
    prompt_resource.GetPromptResourceInfoResponse GetPromptResourceInfo(1:prompt_resource.GetPromptResourceInfoRequest request)(api.get='/api/playground_api/get_prompt_resource_info', api.category="prompt_resource",agw.preserve_base="true")
    prompt_resource.UpsertPromptResourceResponse UpsertPromptResource(1:prompt_resource.UpsertPromptResourceRequest request)(api.post='/api/playground_api/upsert_prompt_resource', api.category="prompt_resource",agw.preserve_base="true")
    prompt_resource.DeletePromptResourceResponse DeletePromptResource(1:prompt_resource.DeletePromptResourceRequest request)(api.post='/api/playground_api/delete_prompt_resource', api.category="prompt_resource",agw.preserve_base="true")
    GetPromptReferenceInfoResponse GetPromptReferenceInfo(1:GetPromptReferenceInfoRequest request)(api.post='/api/playground_api/get_prompt_reference_info', api.category="prompt_resource",agw.preserve_base="true")
    prompt_resource.SyncPromptResourceToEsResponse SyncPromptResourceToEs(1:prompt_resource.SyncPromptResourceToEsRequest request)(api.category="prompt_resource")
    prompt_resource.MGetDisplayResourceInfoResponse MGetDisplayResourceInfo(1: prompt_resource.MGetDisplayResourceInfoRequest req)(api.category="prompt_resource") // 复用Library资源列表，资源实现方需要实现的接口，for前端展示

    // BPM流程回调接口
    GetByteTreeByNameResp GetByteTreeByName(1: GetByteTreeByNameReq request)(api.get='/api/playground_api/bpm/search_byte_tree', api.category="bpm",agw.preserve_base="true")                           // 获取服务树节点
    CheckExemptFormInfoResponse CheckExemptFormInfo(1: CheckExemptFormInfoRequest request)(api.post='/api/playground_api/bpm/check_exempt_form_info', api.category="bpm",agw.preserve_base="true")      // 校验豁免表单的基本信息
    SetByteTreeForSpaceResponse SetByteTreeForSpace(1: SetByteTreeForSpaceRequest request)(api.post='/api/playground_api/bpm/set_byte_tree_for_space', api.category="bpm",agw.preserve_base="true")     // 空间绑定服务树
    GetModelCapabilityResponse GetModelCapability(1: GetModelCapabilityRequest request)(api.post='/api/playground_api/bpm/get_model_capability', api.category="bpm",agw.preserve_base="true")           // 获取模型能力
    CreatePrivateModelResponse CreatePrivateModel(1: CreatePrivateModelRequest request)(api.post='/api/playground_api/bpm/create_private_model', api.category="bpm",agw.preserve_base="true")           // 创建私有模型

    // 抖音分身
    douyin_fenshen.DouYinCallbackResponse DouYinCallback(1: douyin_fenshen.DouYinCallbackRequest request)(api.category="douyin")
    douyin_fenshen.GetDouYinAuthCodeResponse GetDouYinAuthCode(1: douyin_fenshen.GetDouYinAuthCodeRequest request)(api.get='/api/playground_api/douyin/get_auth_qr_code', api.category="douyin",agw.preserve_base="true")
    douyin_fenshen.DouYinAuthUserListResponse DouYinAuthUserList(1: douyin_fenshen.DouYinAuthUserListRequest request)(api.post='/api/playground_api/douyin/auth_user_list', api.category="douyin",agw.preserve_base="true")
    douyin_fenshen.DebugDouYinResponse DebugDouYin(1: douyin_fenshen.DebugDouYinRequest request)(api.post='/api/playground_api/douyin/debug', api.category="douyin",agw.preserve_base="true")
    douyin_fenshen.DebugDouYinResponse GetDebugDouYinStatus(1: douyin_fenshen.DebugDouYinRequest request)(api.post='/api/playground_api/douyin/get_debug_status', api.category="douyin",agw.preserve_base="true")
    douyin_fenshen.GetDouYinAppAuthTokenResponse GetDouYinAppAuthToken(1: douyin_fenshen.GetDouYinAppAuthTokenRequest request)(api.category="douyin")
    douyin_fenshen.GetDouyinAvatarInfoResponse GetDouyinAvatarInfo(1: douyin_fenshen.GetDouyinAvatarInfoRequest request)(api.post='/api/playground_api/douyin/v1/get_avatar_info', api.category="douyin",agw.preserve_base="true")
}
