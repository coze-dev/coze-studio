include "../base.thrift"
include "../agent/common.thrift"

namespace go agent

// 分支
enum Branch {
    Undefined     = 0
    Base          = 2 // space草稿
    Publish       = 3 // 线上版本,diff场景下使用
}

struct UpdateDraftBotInfoData {
    1: optional bool   has_change       // 是否有变更
}


struct UpdateDraftBotInfoResponse {
    1: required UpdateDraftBotInfoData data,

    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}

struct UpdateDraftBotInfoRequest {
    1: optional common.BotInfoForUpdate bot_info(api.body = 'bot_info')
    2: optional i64   base_commit_version (api.js_conv='true')

    255: base.Base Base (api.none="true")
}

// Onboarding json结构
struct OnboardingContent {
    1: optional string       prologue            // 开场白（C端使用场景，只有1个；后台场景，可能为多个）
    2: optional list<string> suggested_questions // 建议问题
    3: optional common.SuggestedQuestionsShowMode suggested_questions_show_mode
}


struct DraftBotCreateRequest {
    1: required i64           space_id (api.js_conv='true')
    2:          string         name
    3:          string         description
    4:          string         icon_uri
    6: optional MonetizationConf monetization_conf
    7: optional string         create_from, // 创建来源  navi:导航栏 space:空间    
}

struct MonetizationConf {
    1: optional bool is_enable
}


struct DraftBotCreateResponse {
    1:          i64                code
    2:          string             msg
    3: required DraftBotCreateData data
}

struct DraftBotCreateData {
    1:          string bot_id
}


struct GetDraftBotInfoRequest {
    1: required i64  bot_id  (api.js_conv='true') // 草稿bot_id
    2: optional string  version  // 查历史记录，历史版本的id，对应 bot_draft_history的id
    3: optional string  commit_version // 查询指定commit_version版本，预发布使用，貌似和version是同一个东西，但是获取逻辑有区别

    255: base.Base Base (api.none="true")
}



struct GetDraftBotInfoResponse {
    1: required GetDraftBotInfoData data,

    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}



struct GetDraftBotInfoData {
    1: required common.BotInfo bot_info // 核心bot数据
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
}


struct BotOptionData {
    1: optional map<i64,ModelDetail>        model_detail_map      // 模型详情
    2: optional map<i64,PluginDetal>        plugin_detail_map     // 插件详情
    3: optional map<i64,PluginAPIDetal>     plugin_api_detail_map // 插件API详情
    4: optional map<i64,WorkflowDetail>     workflow_detail_map   // workflow详情
    5: optional map<i64,KnowledgeDetail>    knowledge_detail_map (agw.js_conv="str" api.js_conv="true") // knowledge详情
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
    1: optional i64    id (agw.js_conv="str" api.js_conv="true")
    2: optional string name
    3: optional string icon_url
    4: DataSetType format_type
}


enum BotMarketStatus {
    Offline = 0 // 下架
    Online  = 1 // 上架
}


struct UserInfo {
    1: i64    user_id   (api.js_conv='true')  // 用户id
    2: string name     // 用户名称
    3: string icon_url // 用户图标
}

struct BotConnectorInfo {
    1:          i64                    id (agw.js_conv="str" api.js_conv="true")
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

enum DataSetType {
    Text = 0 // 文本
    Table = 1 // 表格
    Image = 2 // 图片
}