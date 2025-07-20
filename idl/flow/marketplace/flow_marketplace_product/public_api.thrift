include "../../../base.thrift"
include "product_common.thrift"
include "../marketplace_common.thrift"

namespace go flow.marketplace.product_public_api

service PublicProductService {
    GetProductListResponse PublicGetProductList(1: GetProductListRequest req)(api.get = "/api/marketplace/product/list", api.category = "PublicAPI")
    GetProductDetailResponse PublicGetProductDetail(1: GetProductDetailRequest req)(api.get ="/api/marketplace/product/detail", api.category = "PublicAPI")

    FavoriteProductResponse PublicFavoriteProduct(1: FavoriteProductRequest req)(api.post = "/api/marketplace/product/favorite", api.category = "PublicAPI")
    GetUserFavoriteListV2Response PublicGetUserFavoriteListV2(1: GetUserFavoriteListV2Request req)(api.get = "/api/marketplace/product/favorite/list.v2", api.category = "PublicAPI")
    DuplicateProductResponse PublicDuplicateProduct (1: DuplicateProductRequest req) (api.post = "/api/marketplace/product/duplicate", api.category = "PublicAPI")
}

struct FavoriteProductResponse {
    1  : required i32           Code            (agw.key = "code", api.body = "code")             ,
    2  : required string        Message         (agw.key = "message", api.body = "message")          ,
    3  : optional bool          IsFirstFavorite (agw.key = "is_first_favorite", api.body = "is_first_favorite"),

    255: optional base.BaseResp BaseResp                                       ,
}


struct FavoriteProductRequest {
    1  : optional i64                              ProductID  (agw.js_conv="str", api.js_conv="true", api.body = "product_id"),
    2  : required product_common.ProductEntityType EntityType (api.body = "entity_type")                                      ,
    3  : optional bool                             IsCancel   (api.body = "is_cancel")                                        ,
    4  : optional i64                              EntityID   (agw.js_conv="str", api.js_conv="true", api.body = "entity_id") ,
    5  : optional i64                              TopicID    (agw.js_conv="str", api.js_conv="true", api.body = "topic_id")  ,

    100: optional string                           Cookie     (agw.source = "header", agw.key = "Cookie", go.tag="jsonlog:\"-\" json:\"-\"" ),

    255: optional base.Base                        Base                                                                       ,
}


struct GetProductListRequest {
    1  : optional product_common.ProductEntityType  EntityType         (api.body = "entity_type")                                                                     ,
    2  : optional i64                               CategoryID         (agw.js_conv="str", api.js_conv="true",  agw.cli_conv="str", api.query = "category_id", agw.key="category_id")      ,
    3  : required product_common.SortType           SortType           (api.body = "sort_type")                                                                       ,
    4  : required i32                               PageNum            (api.body = "page_num")                                                                        ,
    5  : required i32                               PageSize           (api.body = "page_size")                                                                       ,
    6  : optional string                            Keyword            (api.body = "keyword")                                                                         , // 不为空则搜索
    7  : optional product_common.ProductPublishMode PublishMode        (api.body = "publish_mode")                                                                    , // 公开方式：1-开源；2-闭源                                                                                    , // 公开方式
    8  : optional list<i64>                         PublishPlatformIDs (agw.js_conv="str", api.js_conv="true",  agw.cli_conv="str", agw.source = "query", agw.key = "publish_platform_ids"), // 发布渠道
    9  : optional product_common.ProductListSource  Source             (agw.key = "source", api.body= "source")                                                                            , // 列表页 tab; 1-运营推荐
    // 个性化推荐场景, 传入当前的实体信息, 获取推荐的商品
    10: optional product_common.ProductEntityType CurrentEntityType (api.body = "current_entity_type")                                                                , // 当前实体类型
    11: optional i64 CurrentEntityID (agw.js_conv="str", api.js_conv="true",  agw.cli_conv="str", api.query = "current_entity_id", agw.key="current_entity_id")                                                                                                 , // 当前实体 ID
    12: optional i64 CurrentEntityVersion (agw.js_conv="str", api.js_conv="true",  agw.cli_conv="str", api.query = "current_entity_version", agw.key="current_entity_version")                                              , // 当前实体版本
    // 专题场景
    13 : optional i64                               TopicID            (agw.js_conv="str", api.js_conv="true",  agw.cli_conv="str", api.query = "topic_id", agw.key="topic_id")            ,
    14 : optional string                            PreviewTopicID     (agw.key = "preview_topic_id", api.body= "preview_topic_id")                                                                  ,
    15 : optional bool IsOfficial (api.body = "is_official") , // 是否需要过滤出官方商品
    16 : optional bool NeedExtra (api.body = "need_extra") , // 是否需要返回额外信息
    17 : optional list<product_common.ProductEntityType> EntityTypes (api.body = "entity_types"), // 商品类型列表, 优先使用该参数，其次使用 EntityType
    18 : optional bool IsFree (api.body = "is_free"), // true = 筛选免费的；false = 筛选付费的；不传则不区分免费和付费
    19 : optional product_common.PluginType PluginType (api.body = "plugin_type") , // 插件类型
    101: optional string                            ClientIP           (api.header="Tt-Agw-Client-Ip")                                                                 ,
    255: optional base.Base                         Base                                                                                                               ,
}

struct GetProductListResponse {
    1  : required i32                Code     (agw.key = "code", api.body= "code")   ,
    2  : required string             Message  (agw.key = "message", api.body= "message"),
    3  :          GetProductListData Data     (agw.key = "data", api.body= "data")   ,
    255: optional base.BaseResp      BaseResp                      ,
}

struct GetProductListData{
    1: optional list<ProductInfo> Products (agw.key = "products", api.body= "products"),
    2:          bool              HasMore  (agw.key = "has_more", api.body= "has_more"),
    3:          i32               Total    (agw.key = "total", api.body= "total")   ,
}

struct ProductInfo {
    1 : required ProductMetaInfo MetaInfo    (agw.key = "meta_info", api.body= "meta_info")   ,
    2 : optional UserBehaviorInfo UserBehavior (agw.key = "user_behavior", api.body= "user_behavior"),
    3 : optional product_common.CommercialSetting CommercialSetting (agw.key = "commercial_setting", api.body= "commercial_setting"),
    20: optional PluginExtraInfo PluginExtra (agw.key = "plugin_extra", api.body= "plugin_extra"),
    21: optional BotExtraInfo    BotExtra    (agw.key = "bot_extra", api.body= "bot_extra")   ,
    22: optional WorkflowExtraInfo WorkflowExtra (agw.key = "workflow_extra", api.body= "workflow_extra"),
    23: optional SocialSceneExtraInfo SocialSceneExtra (agw.key = "social_scene_extra", api.body= "social_scene_extra"),
    24: optional ProjectExtraInfo ProjectExtra (agw.key = "project_extra", api.body= "project_extra"),
}

struct SellerInfo {
    1: i64    ID        (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "id", api.body= "id"),
    2: string Name      (agw.key = "name", api.body= "name")                                      ,
    3: string AvatarURL (agw.key = "avatar_url", api.body= "avatar_url")          ,
}

struct ProductCategory {
    1: i64    ID            (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "id", api.body= "id"),
    2: string Name          (agw.key = "name", api.body= "name")                                     ,
    3: string IconURL       (agw.key = "icon_url", api.body= "icon_url")                                 ,
    4: string ActiveIconURL (agw.key = "active_icon_url", api.body= "active_icon_url")                          ,
    5: i32    Index         (agw.key = "index", api.body= "index")                                    ,
    6: i32    Count         (agw.key = "count", api.body= "count")                                    ,
}

struct ProductLabel{
    1: string Name (agw.key = "name", api.body= "name"),
}

struct ProductMetaInfo {
    1 :          i64                              ID            (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "id", api.body= "id")            ,
    2 :          string                           Name          (agw.key = "name", api.body= "name")                                                  , // 商品/模板名称
    3 :          i64                              EntityID      (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "entity_id", api.body= "entity_id")     , // 素材 ID，由 entity_type 来决定是 bot/plugin 的ID
    4 :          product_common.ProductEntityType EntityType    (agw.key = "entity_type", api.body= "entity_type")                                           , // 商品素材类型
    5 :          string                           IconURL       (agw.key = "icon_url", agw.key="icon_url", api.body= "icon_url")                          , // 商品/模板头像
    6 :          i32                              Heat          (agw.key = "heat", api.body= "heat")                                                  , // 热度：模板热度=复制量（用于卡片展示/排序）；商品热度=不同商品有独立的计算逻辑（仅用于排序）—— heat的计算有一定延迟
    7 :          i32                              FavoriteCount (agw.key = "favorite_count", api.body= "favorite_count")                                        ,
    8 :          SellerInfo                       Seller        (agw.key = "seller", api.body= "seller")                                                , // 废弃,使用UserInfo代替
    9 :          string                           Description   (agw.key = "description", api.body= "description")                                           , // 商品描述
    10:          i64                              ListedAt      (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "listed_at", api.body= "listed_at")     ,
    11:          product_common.ProductStatus     Status        (agw.key = "status", api.body= "status")                                                ,
    12: optional ProductCategory                  Category      (agw.key = "category", api.body= "category")                                              , // 商品/模板分类信息
    13:          bool                             IsFavorited   (agw.key = "is_favorited", api.body= "is_favorited")                                          , // 是否收藏
    14:          bool                             IsFree        (agw.key = "is_free", api.body= "is_free")                                               ,
    15:          string                           Readme        (agw.key = "readme", api.body= "readme")                                                , // 模板介绍/插件介绍（目前是富文本格式）
    16: optional i64                              EntityVersion (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "entity_version", api.body= "entity_version"),
    17: optional list<ProductLabel>               Labels        (agw.key = "labels", api.body= "labels")                                                ,
    18:          product_common.UserInfo          UserInfo      (agw.key = "user_info", api.body= "user_info")                                             ,
    19:          string                           MediumIconURL (agw.key = "medium_icon_url", api.body= "medium_icon_url")                                       ,
    20:          string                           OriginIconURL (agw.key = "origin_icon_url", api.body= "origin_icon_url")                                       ,
    21: optional list<product_common.ImageInfo>   Covers        (agw.key = "covers", api.body= "covers")                                                , // 模板封面
    22: optional bool                             IsProfessional (agw.key = "is_professional", api.body= "is_professional")                                      , // 是否专业版特供
    23:          bool                             IsTemplate    (agw.key = "is_template", api.body= "is_template")                                           , // 是否为模板
    24:          bool                             IsOfficial    (agw.key = "is_official", api.body= "is_official")                                           , // 是否官方商品
    25: optional marketplace_common.Price         Price (agw.key = "price", api.body= "price")                                                         , // 价格，当前只有模板有
}

struct UserBehaviorInfo {
// 用户主页需要返回最近浏览/使用商品的时间
    1: optional i64                              ViewedAt (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "viewed_at", api.body= "viewed_at") , // 最近浏览时间戳
    2: optional i64                              UsedAt (agw.js_conv="str", api.js_conv="true",  agw.cli_conv="str", agw.key = "used_at", api.body= "used_at") ,     // 最近使用时间戳
}

enum PluginAuthMode {
    NoAuth     = 0, // 不需要授权
    Required   = 1, // 需要授权，但无授权配置
    Configured = 2, // 需要授权，且已经配置
    Supported  = 3, // 需要授权，但授权配置可能是用户级别，可由用户自己配置
}

struct PluginExtraInfo {
    1: optional list<PluginToolInfo> Tools               (agw.key = "tools", api.body= "tools")                ,
    2:          i32                  TotalAPICount       (agw.key = "total_api_count", api.body= "total_api_count")      ,
    3:          i32                  BotsUseCount        (agw.key = "bots_use_count", api.body= "bots_use_count")       ,
    4: optional bool                 HasPrivacyStatement (agw.key = "has_private_statement", api.body= "has_private_statement"), // 是否有隐私声明, 目前只有 PublicGetProductDetail 会取数据
    5: optional string               PrivacyStatement    (agw.key = "private_statement", api.body= "private_statement")    , // 隐私声明, 目前只有 PublicGetProductDetail 会取数据
    6: i32 AssociatedBotsUseCount (agw.key = "associated_bots_use_count", api.body= "associated_bots_use_count"),
    7: bool IsPremium (agw.key="is_premium", api.body= "is_premium"),
    8: bool IsOfficial (agw.key="is_official", api.body= "is_official"),
    9: optional i32 CallAmount (agw.key = "call_amount", api.body= "call_amount") // 调用量
    10: optional double SuccessRate (agw.key = "success_rate", api.body= "success_rate") // 成功率
    11: optional double AvgExecTime (agw.key = "avg_exec_time", api.body= "avg_exec_time") // 平均执行时长
    12: optional bool IsDefaultIcon (agw.key = "is_default_icon", api.body= "is_default_icon"),
    13: optional i64 SpaceID (agw.key = "space_id", agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", api.body= "space_id"),
    14: optional i64 MaterialID (agw.key = "material_id", agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", api.body= "material_id"),
    15: list<PluginConnectorInfo> Connectors (agw.key = "connectors", api.body= "connectors"),
    16: optional product_common.PluginType PluginType (agw.key = "plugin_type", api.body= "plugin_type"),

    // for opencoze
    50: optional PluginAuthMode AuthMode (agw.key = "auth_mode", api.body= "auth_mode"),
}

struct ToolParameter {
    1:          string              Name         (agw.key = "name", api.body= "name")       ,
    2:          bool                IsRequired   (agw.key = "required", api.body= "required")   ,
    3:          string              Description  (agw.key = "description", api.body= "description"),
    4:          string              Type         (agw.key = "type", api.body= "type")       ,
    5:  list<ToolParameter> SubParameter (agw.key = "sub_params", api.body= "sub_params") ,
}

struct CardInfo {
    1: string   CardURL (agw.key = "card_url", api.body= "card_url"),
    // 以下只有详情页返回
    2: i64          CardID (agw.js_conv="str", api.js_conv="true"  agw.cli_conv="str", agw.key = "card_id", api.body= "card_id"),
    3: string       MappingRule (agw.key = "mapping_rule"),
    4: i64          MaxDisplayRows (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "max_display_rows", api.body= "max_display_rows"),
    5: i64          CardVersion (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "card_version", api.body= "card_version"),
}

struct PluginToolExample{
    1: string ReqExample (agw.key = "req_example", api.body= "req_example"),
    2: string RespExample (agw.key = "resp_example", api.body= "resp_example"),
}

enum PluginRunMode {
    DefaultToSync = 0
    Sync          = 1
    Async         = 2
    Streaming     = 3
}

struct PluginToolInfo{
    1:          i64                 ID          (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key="id", api.body= "id"),
    2:          string              Name        (agw.key = "name", api.body= "name")                                    ,
    3:          string              Description (agw.key = "description", api.body= "description")                             ,
    4: optional list<ToolParameter> Parameters  (agw.key = "parameters", api.body= "parameters")                              ,
    5: optional CardInfo            CardInfo    (agw.key = "card_info", api.body= "card_info"),
    6: optional PluginToolExample Example (agw.key = "example", api.body= "example"),
    7: optional i32 CallAmount (agw.key = "call_amount", api.body= "call_amount") // 调用量
    8: optional double SuccessRate (agw.key = "success_rate", api.body= "success_rate") // 成功率
    9: optional double AvgExecTime (agw.key = "avg_exec_time", api.body= "avg_exec_time") // 平均执行时长
    10: optional i32 BotsUseCount (agw.key = "bots_use_count", api.body= "bots_use_count") // tool 被bot引用数
    11: optional PluginRunMode RunMode (agw.key = "run_mode", api.body= "run_mode"), // 运行模式
}

struct PluginConnectorInfo {
    1: i64 ID (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "id", api.body= "id"),
    2: string Name (agw.key = "name", api.body= "name"),
    3: string Icon (agw.key = "icon", api.body= "icon"),
}

struct BotPublishPlatform {
    1: i64    ID          (agw.js_conv="str", api.js_conv="true",agw.cli_conv="str", agw.key = "id", api.body= "id"),
    2: string IconURL     (agw.key = "icon_url", api.body= "icon_url")                                 ,
    3: string PlatformURL (agw.key = "url", api.body= "url")                                      ,
    4: string Name        (agw.key = "name", api.body= "name")                                     ,
}

struct ProductMaterial {
    1: string Name    (agw.key = "name", api.body= "name")    ,
    2: string IconURL (agw.key = "icon_url", api.body= "icon_url"),
}

struct BotVoiceInfo {
    1: i64    VoiceID      (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "id", api.body= "id"),
    2: string LanguageCode (agw.key="language_code", api.body= "language_code")                              ,
    3: string LanguageName (agw.key="language_name", api.body= "language_name")                              ,
    4: string Name         (agw.key="name", api.body= "name")                                       ,
    5: string StyleID      (agw.key="style_id", api.body= "style_id")                                   ,
    6: bool   IsSupportVoiceCall (agw.key = "is_support_voice_call", api.body= "is_support_voice_call"),
}

enum TimeCapsuleMode {
    Off = 0
    On = 1
}

enum FileboxInfoMode {
    Off = 0
    On = 1
}

struct UserQueryCollectConf { // bot用户query收集配置
    1:          bool      IsCollected       (agw.key="is_collected", api.body= "is_collected")   , // 是否开启收集开关
    2:          string    PrivatePolicy     (agw.key="private_policy", api.body= "private_policy") , // 隐私协议链接
}

struct BotConfig {
    1: optional list<ProductMaterial> Models                 (agw.key = "models", api.body= "models")                  , // 模型
    2: optional list<ProductMaterial> Plugins                (agw.key = "plugins", api.body= "plugins")                 , // 插件
    3: optional list<ProductMaterial> Knowledges             (agw.key = "knowledges", api.body= "knowledges")              , // 知识库
    4: optional list<ProductMaterial> Workflows              (agw.key = "workflows", api.body= "workflows")               , // 工作流
    5: optional i32                   PrivatePluginsCount    (agw.key = "private_plugins_count", api.body= "private_plugins_count")   , // 私有插件数量
    6: optional i32                   PrivateKnowledgesCount (agw.key = "private_knowledges_count", api.body= "private_knowledges_count"), // 私有知识库数量
    7: optional i32                   PrivateWorkflowsCount  (agw.key = "private_workflows_count", api.body= "private_workflows_count") , // 私有工作流数量
    8: optional bool                  HasBotAgent            (agw.key = 'has_bot_agent', api.body= "has_bot_agent")           , // 判断 multiagent 是否有 bot 节点
    9: optional list<BotVoiceInfo>    BotVoices              (agw.key = 'bot_voices', api.body= "bot_voices")              , // bot 配置的声音列表
    10: optional i32                  TotalPluginsCount    (agw.key = "total_plugins_count", api.body= "total_plugins_count")   , // 所有插件数量
    11: optional i32                  TotalKnowledgesCount (agw.key = "total_knowledges_count", api.body= "total_knowledges_count"), // 所有知识库数量
    12: optional i32                  TotalWorkflowsCount  (agw.key = "total_workflows_count", api.body= "total_workflows_count") , // 所有工作流数量
    13: optional TimeCapsuleMode TimeCapsuleMode (agw.key = "time_capsule_mode", api.body= "time_capsule_mode") // 时间胶囊模式
    14: optional FileboxInfoMode FileboxMode (agw.key = "filebox_mode", api.body= "filebox_mode") // 文件盒模式
    15: optional i32 PrivateImageWorkflowCount (agw.key = "private_image_workflow_count", api.body= "private_image_workflow_count"), // 私有图片工作流数量
    16: optional UserQueryCollectConf UserQueryCollectConf (agw.key = "user_query_collect_conf", api.body= "user_query_collect_conf") // 用户qeury收集配置
    17: optional bool IsCloseVoiceCall (agw.key = "is_close_voice_call", api.body= "is_close_voice_call"), // 是否关闭语音通话（默认是打开）
}

// 消息涉及的bot信息,在home分享场景,消息属于多个bot
struct ConversationRelateBot {
    1: i64    ID         (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "id", api.body= "id"),
    2: string Name       (agw.key = "name", api.body= "name")                                     ,
    3: string Description (agw.key = "description", api.body= "description")                              ,
    4: string IconURL    (agw.key = "icon_url", api.body= "icon_url")                                 ,
}

// 消息涉及的user信息,在home分享场景,消息属于多个user
struct ConversationRelateUser {
    1: optional product_common.UserInfo UserInfo (agw.key = "user_info", api.body= "user_info")
}

struct Conversation {
    1: optional list<string>                 Snippets      (agw.key = "snippets", api.body= "snippets")                                , // 对话示例
    2: optional string                       Title         (agw.key = "title", api.body= "title")                                   , // 对话标题
    3: optional i64                          ID            (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key="id", api.body= "id"), // 对话ID，idGen生成
    4: optional bool                         GenTitle      (agw.key = "gen_title", api.body= "gen_title")                               , // 是否需要生成对话
    5: optional product_common.AuditStatus   AuditStatus   (agw.key = "audit_status", api.body= "audit_status")                            , // 对话审核状态
    6: optional product_common.OpeningDialog OpeningDialog (agw.key = "opening_dialog", api.body= "opening_dialog")                          , // 开场白
    7: optional map<string,ConversationRelateBot>        RelateBots     (agw.key = "relate_bots", api.body= "relate_bots")                              , // 消息涉及的bot信息,key bot_id
    8: optional map<string,ConversationRelateUser>       RelateUsers    (agw.key = "relate_users", api.body= "relate_users")                             , // 消息涉及的user信息,key user_id
}

struct BotExtraInfo {
    1:          list<BotPublishPlatform>          PublishPlatforms      (agw.key = "publish_platforms", api.body= "publish_platforms")                                              , // 发布渠道
    2:          i32                               UserCount             (agw.key = "user_count", api.body= "user_count")                                                     , // 用户数
    3:          product_common.ProductPublishMode PublishMode           (agw.key = "publish_mode", api.body= "publish_mode")                                                   , // 公开方式
// 详情页特有
    4: optional list<list<string>>                ConversationSnippets  (agw.key = "conversation_snippets", api.body= "conversation_snippets")                                          , // 对话示例, 废弃
    5: optional BotConfig                         Config                (agw.key = "config", api.body= "config")                                                         , // 配置
    6: optional bool                              IsInhouseUser         (agw.key = "is_inhouse_user", api.body= "is_inhouse_user")                                                , // 白名单
    7: optional i32                               DuplicateBotCount     (agw.key = 'duplicate_bot_count', api.body= "duplicate_bot_count")                                            , // 复制创建 bot 数量
    8: optional list<Conversation>                Conversations         (agw.key = "conversations", api.body= "conversations")                                                  , // 分享对话
    9: optional i64 ChatConversationCount (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "chat_conversation_count", api.body= "chat_conversation_count"), // 与 Bot 聊天的对话数
    10: optional i64 RelatedProductCount (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "related_product_count", api.body= "related_product_count"), // 关联商品数
}

struct WorkflowParameter {
    1: string                   Name         (agw.key = "name", api.body= "name")
    2: string                   Desc         (agw.key = "desc", api.body= "desc")
    3: bool                     IsRequired   (agw.key = "is_required", api.body= "is_required")
    4: product_common.InputType InputType    (agw.key = "input_type", api.body= "input_type")
    5: list<WorkflowParameter>  SubParameters(agw.key = "sub_parameters", api.body= "sub_parameters")
    6: product_common.InputType SubType      (agw.key = "sub_type", api.body= "sub_type") // 如果Type是数组，则有subtype
    7: optional string          Value        (agw.key = "value", api.body= "value")    // 如果入参是用户手输 就放这里
    8: optional product_common.PluginParamTypeFormat Format (agw.key = "format", api.body= "format")
    9: optional string          FromNodeId   (agw.key = "from_node_id", api.body= "from_node_id")
    10:	optional list<string>   FromOutput   (agw.key = "from_output", api.body= "from_output")
    11: optional i64            AssistType   (agw.key = "assist_type", api.body= "assist_type")// InputType (+ AssistType) 定义一个变量的最终类型，仅需透传
    12: optional string         ShowName     (agw.key = "show_name", api.body= "show_name") // 展示名称（ store 独有的，用于详情页 GUI 展示参数）
    13: optional i64            SubAssistType (agw.key = "sub_assist_type", api.body= "sub_assist_type") // 如果InputType是数组，则有subassisttype
    14: optional string         ComponentConfig (agw.key = "component_config", api.body= "component_config") // 组件配置，由前端解析并渲染
    15: optional string         ComponentType   (agw.key = "component_type", api.body= "component_type") // 组件配置类型，前端展示需要
}

struct WorkflowTerminatePlan {
    1: i32 TerminatePlanType (agw.key = "terminate_plan_type", api.body= "terminate_plan_type") // 对应 workflow 结束节点的回答模式：1-返回变量，由Bot生成回答；2-使用设定的内容直接回答
    2: string Content (agw.key = "content", api.body= "content") // 对应 terminate_plan_type = 2 的场景配置的返回内容
}

struct WorkflowNodeParam {
    1: optional list<WorkflowParameter> InputParameters (agw.key = "input_parameters", api.body= "input_parameters")
    2: optional WorkflowTerminatePlan TerminatePlan (agw.key = "terminate_plan", api.body= "terminate_plan")
    3: optional list<WorkflowParameter> OutpurParameters (agw.key = "output_parameters", api.body= "output_parameters")
}

struct WorkflowNodeInfo {
    1: string                          NodeID   (agw.key = "node_id", api.body= "node_id")
    2: product_common.WorkflowNodeType NodeType (agw.key = "node_type", api.body= "node_type")
    3: optional WorkflowNodeParam      NodeParam (agw.key = "node_param", api.body= "node_param")
    4: string                          NodeIconURL (agw.key = "node_icon_url", api.body= "node_icon_url") // 节点icon
    5: optional string                 ShowName    (agw.key = "show_name", api.body= "show_name"), // 展示名称（ store 独有的，用于详情页 GUI 展示消息节点的名称）
}

struct WorkflowEntity {
    1 : i64                              ProductID     (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "product_id", api.body= "product_id")            , // 商品ID
    2 : string                           Name          (agw.key = "name", api.body= "name")                                                  ,
    3 : i64                              EntityID      (agw.js_conv="str", api.js_conv="true",  agw.cli_conv="str", agw.key = "entity_id", api.body= "entity_id")     ,
    4 : product_common.ProductEntityType EntityType    (agw.key = "entity_type", api.body= "entity_type")                                           ,
    5 : i64                              EntityVersion (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "entity_version", api.body= "entity_version"),
    6 : string                           IconURL       (agw.key = "icon_url", agw.key="icon_url", api.body= "icon_url")                          ,
    7 : string                           EntityName    (agw.key = "entity_name", api.body= "entity_name")
    8 : string                           Readme        (agw.key = "readme", api.body= "readme")
    9 : ProductCategory                  Category      (agw.key = "category", api.body= "category")
    10: optional ProductCategory         RecommendedCategory   (agw.key = "recommended_category", api.body= "recommended_category")// 推荐分类                        ,
    11: optional list<WorkflowNodeInfo>  Nodes         (agw.key = "nodes", api.body= "nodes")
    12: string                           Desc          (agw.key = "desc", api.body= "desc")
    13: optional string                  CaseInputIconURL  (agw.key = "case_input_icon_url", api.body= "case_input_icon_url")  // 入参 图片icon
    14: optional string                  CaseOutputIconURL (agw.key = "case_output_icon_url", api.body= "case_output_icon_url") // 出参 图片icon
    15: optional string                  LatestPublishCommitID  (agw.key = "latest_publish_commit_id", api.body= "latest_publish_commit_id")
}

struct WorkflowGUIConfig { // 用于将 workflow 的输入/输出/中间消息节点节点转为用户可视化配置
    1: WorkflowNodeInfo StartNode (agw.key = "start_node", api.body= "start_node"),
    2: WorkflowNodeInfo EndNode (agw.key = "end_node", api.body= "end_node"),
    3: optional list<WorkflowNodeInfo> MessageNodes (agw.key = "message_nodes", api.body= "message_nodes"), // 消息节点会输出中间过程，也需要展示
}

struct WorkflowExtraInfo {
    1: list<WorkflowEntity>            RelatedWorkflows (agw.key = "related_workflows", api.body= "related_workflows")
    2: optional i32                    DuplicateCount (agw.key = "duplicate_count", api.body= "duplicate_count")
    3: optional string                 WorkflowSchema (agw.key = "workflow_schema", api.body= "workflow_schema") // workflow画布信息
    // /api/workflowV2/query  schema_json
    4: optional ProductCategory        RecommendedCategory (agw.key = "recommended_category", api.body= "recommended_category")// 推荐分类
    5: optional list<WorkflowNodeInfo> Nodes (agw.key = "nodes", api.body= "nodes")
    6: optional WorkflowNodeInfo       StartNode (agw.key = "start_node", api.body= "start_node")
    7: optional string                 EntityName (agw.key = "entity_name", api.body= "entity_name") // 实体名称(用于展示)
    8: optional string                 CaseInputIconURL (agw.key = "case_input_icon_url", api.body= "case_input_icon_url") // 用例图入参
    9: optional string                 CaseOutputIconURL (agw.key = "case_output_icon_url", api.body= "case_output_icon_url") // 用例图出参
    10: optional i64                   CaseExecuteID (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "case_execute_id", api.body= "case_execute_id")  // 案例执行ID
    11: optional string                HoverText (agw.key = "hover_text", api.body= "hover_text")
    12: optional string                LatestPublishCommitID  (agw.key = "latest_publish_commit_id", api.body= "latest_publish_commit_id")
    13: optional i32                   UsedCount (agw.key = "used_count", api.body= "used_count") // 试运行次数，从数仓取
    14: optional WorkflowGUIConfig     GUIConfig (agw.key = "gui_config", api.body= "gui_config") // 用于将 workflow 的输入/输出/中间消息节点节点转为用户可视化配置
}

struct SocialScenePlayerInfo {
    1: i64  ID (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key="id", api.body= "id"),
    2: string Name (agw.key = "name", api.body= "name")
    3: product_common.SocialSceneRoleType RoleType (agw.key = "role_type", api.body= "role_type")
}

struct SocialSceneExtraInfo {
    1: optional list<SocialScenePlayerInfo> Players (agw.key = "players", api.body= "players") // 角色
    2: i64 UsedCount (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "used_count", api.body= "used_count") // 使用过的人数
    3: i64 StartedCount (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "started_count", api.body= "started_count") // 开始过的次数
    4: product_common.ProductPublishMode PublishMode (agw.key = "publish_mode", api.body= "publish_mode") // 开闭源
}

struct ProjectConfig {
    1: i32 PluginCount (agw.key = "plugin_count", api.body= "plugin_count"), // 插件数量
    2: i32 WorkflowCount (agw.key = "workflow_count", api.body= "workflow_count"), // 工作流数量
    3: i32 KnowledgeCount (agw.key = "knowledge_count", api.body= "knowledge_count"), // 知识库数量
    4: i32 DatabaseCount (agw.key = "database_count", api.body= "database_count"), // 数据库数量
}

struct ProjectExtraInfo {
     // Project 上架为模板前生成一个模板副本，使用或者复制模板，需要用 TemplateProjectID 和 TemplateProjectVersion
     1: i64 TemplateProjectID                    (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key="template_project_id", api.body= "template_project_id"),
     2: i64 TemplateProjectVersion               (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key="template_project_version", api.body= "template_project_version"),
     3: list<product_common.UIPreviewType> PreviewTypes (agw.key = "preview_types", api.body= "preview_types") // Project 绑定的 UI 支持的预览类型
     4: i32 UserCount (agw.key="user_count", api.body= "user_count"), // 用户数
     5: i32 ExecuteCount (agw.key="execute_count", api.body= "execute_count"), // 运行数
     6: list<BotPublishPlatform> PublishPlatforms (agw.key = "publish_platforms", api.body= "publish_platforms"), // 发布渠道
     7: i32 DupliacateCount (agw.key = "duplicate_count", api.body= "duplicate_count"), // 近实时复制量，从数仓接口获取（复制 - 上报埋点 - 数仓计算落库）
     8: optional ProjectConfig Config (agw.key = "config", api.body= "config"), // 配置
}

struct GetProductDetailRequest{
    1  : optional i64                              ProductID       (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", api.query = "product_id", agw.key="product_id"),
    2  : optional product_common.ProductEntityType EntityType      (api.body = "entity_type")                                                             ,
    3  : optional i64                              EntityID        (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", api.query = "entity_id", agw.key="entity_id")  ,
    4  : optional bool                             NeedAuditFailed (api.body = "need_audit_failed")                                                       , // 是否查看最新的审核失败草稿
    101: optional string                           ClientIP        (api.header="Tt-Agw-Client-Ip")                                                         ,
    255: optional base.Base                        Base                                                                                                    ,
}

struct GetProductDetailResponse {
    1  : required i32                  Code     (agw.key = "code", api.body= "code")   ,
    2  : required string               Message  (agw.key = "message", api.body= "message"),
    3  :          GetProductDetailData Data     (agw.key = "data", api.body= "data")   ,
    255: optional base.BaseResp        BaseResp                      ,
}

struct Price{
    1: i32    Value        (agw.key = "value", api.body= "value")        ,
    2: string Currency     (agw.key = "currency", api.body= "currency")     ,
    3: string DisplayPrice (agw.key = "display_price", api.body= "display_price"),
}

struct SKUInfo {
    1: i64                            ID          (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "id", api.body= "id"),
    2: list<Price>                    Price       (agw.key = "price", api.body= "price")                                     , // 待废弃
    3: string                         Description (agw.key = "description", api.body= "description")                               ,
    4: list<marketplace_common.Price> PriceV2     (agw.key = "price_v2", api.body= "price_v2")                                  ,
    5: optional product_common.ChargeSKUExtra ChargeInfoExtra (agw.key = "charge_sku_info", api.body= "charge_sku_info"),
}

struct SellAttrValue {
    1: i64    ID    (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "id", api.body= "id"),
    2: string Value (agw.key = "value", api.body= "value")                                     ,
}

struct SellAttr {
    1: string              DisplayName (agw.key = "display_name", api.body= "display_name"),
    2: string              Key         (agw.key = "key", api.body= "key")         ,
    3: list<SellAttrValue> Values      (agw.key = "values", api.body= "values")      ,
}

struct SellInfo{
    1: map<i64,SKUInfo> SKUs       (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "skus", api.body= "skus")        ,
    2: list<SellAttr>   Attr       (agw.key = "attr", api.body= "attr")                                                ,
    3: map<string,i64>  SKUAttrRef (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "sku_attr_ref", api.body= "sku_attr_ref"), // Key 是 attrkey:attrvalue 路径，value 是 skuID
}

struct Topic {
    1: i64    ID              (agw.key = "id", agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", api.body= "id"),
    2: string Name            (agw.key = "name", api.body= "name")                                     ,
    3: string Description     (agw.key = "description", api.body= "description")                              ,
    4: string BannerURL       (agw.key = "banner_url", api.body= "banner_url")                               ,
    5: string BannerURLSmall  (agw.key = "banner_url_small", api.body= "banner_url_small")                         , // 背景小图，前端优先加载
    6: string Reason          (agw.key = "reason", api.body= "reason")                                   ,
    7: string IntroductionURL (agw.key = "introduction_url", api.body= "introduction_url")                         , // 运营提供的专题介绍文档，用户可见
    8: bool   IsFavorite      (agw.key = "is_favorite", api.body= "is_favorite")                              , // 用户是否收藏专题
}

struct ProductDataIndicator { // 数据分析指标，来源数仓，比如模板购买量、复制量等
    1: optional i32 PurchaseCount (agw.key = "purchase_count", api.body= "purchase_count"), // 购买量
}

struct GetProductDetailData { // 下架的商品只返回非 optional 字段
    1 : required ProductMetaInfo                   MetaInfo    (agw.key = "meta_info", api.body= "meta_info")                                       ,
    2 : required bool                              IsOwner     (agw.key = "is_owner", api.body= "is_owner")                                        , // 用以区分主/客态
    3 :          product_common.ProductDraftStatus AuditStatus (agw.key = "audit_status", api.body= "audit_status")                                    , // 审核状态，主态下返回需要关注，如果主态且审核中，需要展示审核中状态
    4 : optional SellInfo                          SellInfo    (agw.key = "sell_info", api.body= "sell_info")                                       ,
    5 : optional i64                               SpaceID     (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "space_id", api.body= "space_id"),
    6 : optional Topic                             Topic       (agw.key = "topic", api.body= "topic")                                           , // 详情页返回
    7 : optional bool                              CanDuplicate     (agw.key = "can_duplicate", api.body= "can_duplicate")                                        , // 详情页返回
    8 : optional product_common.CommercialSetting CommercialSetting (agw.key = "commercial_setting", api.body= "commercial_setting")
    20: optional PluginExtraInfo                   PluginExtra (agw.key = "plugin_extra", api.body= "plugin_extra")                                    ,
    21: optional BotExtraInfo                      BotExtra    (agw.key = "bot_extra", api.body= "bot_extra")
    22: optional WorkflowExtraInfo                 WorkflowExtra (agw.key = "workflow_extra", api.body= "workflow_extra"),
    23: optional SocialSceneExtraInfo              SocialSceneExtra (agw.key = "social_scene_extra", api.body= "social_scene_extra"),
    24: optional ProjectExtraInfo                  ProjectExtra (agw.key = "project_extra", api.body= "project_extra"),
    25: optional ProductDataIndicator              DataIndicator (agw.key = "data_indicator", api.body= "data_indicator"),
}

struct GetUserFavoriteListV2Request {
    1  : optional string                            CursorID   (api.query = "cursor_id")  , // 第一页不传，后续调用时传上一次返回的cursor_id
    2  : required i32                               PageSize   (api.query = "page_size")  ,

    3  : optional product_common.ProductEntityType  EntityType (api.query = "entity_type"),
    4  : required product_common.SortType           SortType   (api.query = "sort_type")  ,
    5  : optional string                            Keyword    (api.query = "keyword")    , // 不为空则搜索
    6  : optional product_common.FavoriteListSource Source     (api.query = "source")     , // 列表页 tab
    7  : optional bool                              NeedUserTriggerConfig (api.query = "need_user_trigger_config") // 是否需要查询用户对Bot的触发器配置，为true时，才会返回EntityUserTriggerConfig
    8  : optional i64                               BeginAt    (api.query = "begin_at", api.js_conv="true")   , // 筛选收藏时间
    9  : optional i64                               EndAt      (api.query = "end_at", api.js_conv="true")     , // 筛选收藏时间
    10 : optional list<product_common.ProductEntityType> EntityTypes (api.query = "entity_types"),
    11 : optional i64                               OrganizationID    (agw.js_conv="str",  agw.cli_conv="str", api.query = "organization_id"), // 组织ID，企业版想获取用户收藏的所有内容时需传递

    255: optional base.Base                         Base                                  ,
}


struct GetUserFavoriteListV2Response {
    1  : required i32                       Code     (agw.key = "code")   ,
    2  : required string                    Message  (agw.key = "message"),
    3  : optional GetUserFavoriteListDataV2 Data     (agw.key = "data")   ,

    255: optional base.BaseResp             BaseResp                      ,
}

struct GetUserFavoriteListDataV2{
    1: list<product_common.FavoriteEntity> FavoriteEntities (agw.key = "favorite_entities", api.body="favorite_entities"),
    2: string                              CursorID         (agw.key = "cursor_id", api.body="cursor_id")        ,
    3: bool                                HasMore          (agw.key = "has_more", api.body="has_more")         ,
    // 用户定时任务配置，对应flow.bot.task服务的TriggerEnabled
    4: map<i64, UserTriggerConfig>         EntityUserTriggerConfig (agw.key = "entity_user_trigger_config", api.body="entity_user_trigger_config"), // key: entity_id; value: UserTriggerConfig
}

struct UserTriggerConfig {
    1: TriggerEnable TriggerEnabled (agw.key = "trigger_enabled")
}

enum TriggerEnable {
    Init = 0
    Open = 1
    Close = 2
}

struct DuplicateProductRequest {
    1: required i64 ProductID (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", api.body = "product_id")
    2: required product_common.ProductEntityType EntityType (api.body = "entity_type")
    3: optional i64 SpaceID   (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", api.body = "space_id")
    4: optional string Name (api.body = "name")

    100: optional string Cookie     (agw.source = "header", agw.key = "Cookie", go.tag="jsonlog:\"-\" json:\"-\"" ),
    255: optional base.Base Base

}

struct DuplicateProductResponse {
    1: required i32           Code     (agw.key = "code", api.body= "code"),
    2: required string        Message  (agw.key = "message", api.body= "message"),
    3: DuplicateProductData   Data (agw.key = "data", api.body= "data"),
    255: optional base.BaseResp BaseResp
}

struct DuplicateProductData {
    // 复制后的新id
    1: i64 NewEntityID (agw.js_conv="str", api.js_conv="str", agw.cli_conv="str", api.body = "new_entity_id")
    2: optional i64 NewPluginID (agw.js_conv="str", api.js_conv="str", agw.cli_conv="str", api.body = "new_plugin_id") // workflow对应的插件id
}