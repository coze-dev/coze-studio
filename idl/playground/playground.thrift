include "../base.thrift"
include "../bot_common/bot_common.thrift"
include "shortcut_command.thrift"


namespace go ocean.cloud.playground

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

// 分支
enum Branch {
    Undefined     = 0
    PersonalDraft = 1 // 草稿
    Base          = 2 // space草稿
    Publish       = 3 // 线上版本,diff场景下使用
}


struct UpdateDraftBotInfoAgwRequest {
    1: optional bot_common.BotInfoForUpdate bot_info
    2: optional i64   base_commit_version (api.js_conv='true',agw.js_conv="str")

    255: base.Base Base (api.none="true")
}

struct GetDraftBotInfoAgwRequest {
    1: required i64  bot_id  (api.js_conv='true',agw.js_conv="str") // 草稿bot_id
    2: optional string  version  // 查历史记录，历史版本的id，对应 bot_draft_history的id
    3: optional string  commit_version // 查询指定commit_version版本，预发布使用，貌似和version是同一个东西，但是获取逻辑有区别

    255: base.Base Base (api.none="true")
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


enum DataSetType {
    Text = 0 // 文本
    Table = 1 // 表格
    Image = 2 // 图片
}


enum BotMarketStatus {
    Offline = 0 // 下架
    Online  = 1 // 上架
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


struct BotCollaboratorStatus {
    1: bool commitable    // 当前用户是否可以提交
    2: bool operateable   // 当前用户是否可运维
    3: bool manageable    // 当前用户是否可管理协作者
}

struct AuditInfo {
    1: optional AuditStatus audit_status
    2: optional string publish_id
    3: optional string commit_version
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


// Onboarding json结构
struct OnboardingContent {
    1: optional string       prologue            // 开场白（C端使用场景，只有1个；后台场景，可能为多个）
    2: optional list<string> suggested_questions // 建议问题
    3: optional bot_common.SuggestedQuestionsShowMode suggested_questions_show_mode
}

service PlaygroundService {
    UpdateDraftBotInfoAgwResponse UpdateDraftBotInfoAgw(1:UpdateDraftBotInfoAgwRequest request)(api.post='/api/playground_api/draftbot/update_draft_bot_info', api.category="draftbot",agw.preserve_base="true")
    GetDraftBotInfoAgwResponse GetDraftBotInfoAgw(1:GetDraftBotInfoAgwRequest request)(api.post='/api/playground_api/draftbot/get_draft_bot_info', api.category="draftbot",agw.preserve_base="true")
}
