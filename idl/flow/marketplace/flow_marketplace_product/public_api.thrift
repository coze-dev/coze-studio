include "../../../base.thrift"
include "product_common.thrift"
include "../marketplace_common.thrift"

namespace go flow.marketplace.product_public_api

service PublicProductService {
    GetProductListResponse PublicGetProductList(1: GetProductListRequest req)(api.get = "/api/marketplace/product/list", api.category = "PublicAPI")
}

struct GetProductListRequest {
    1  : optional product_common.ProductEntityType  entity_type         (api.query = "entity_type")                                                                     ,
    2  : optional i64                            category_id         (api.query = "category_id", api.js_conv="true"),
    3  : required product_common.SortType           sort_type           (api.query = "sort_type")                                                                       ,
    4  : required i32                               page_num            (api.query = "page_num")                                                                        ,
    5  : required i32                               page_size           (api.query = "page_size")                                                                       ,
    6  : optional string                            keyword            (api.query = "keyword")                                                                         , // 不为空则搜索
    7  : optional product_common.ProductPublishMode publish_mode        (api.query = "publish_mode")                                                                    , // 公开方式：1-开源；2-闭源                                                                                    , // 公开方式
    8  : optional list<i64>                         publish_platform_ids  // 发布渠道
    9  : optional product_common.ProductListSource  source                                                                                     , // 列表页 tab; 1-运营推荐
    // 个性化推荐场景, 传入当前的实体信息, 获取推荐的商品
    10: optional product_common.ProductEntityType current_entity_type (api.query = "current_entity_type")                                                                , // 当前实体类型
    11: optional i64 current_entity_id (api.query = "current_entity_id", api.js_conv="true")                                                                                                 , // 当前实体 ID
    12: optional i64 current_entity_version (api.query = "current_entity_version", api.js_conv="true")                                              , // 当前实体版本
    // 专题场景
    13 : optional i64                               topic_id            (api.query = "topic_id", api.js_conv="true")            ,
    14 : optional string                            preview_topic_id     (agw.key = "preview_topic_id")                                                                  ,
    15 : optional bool is_official (api.query = "is_official") , // 是否需要过滤出官方商品
    16 : optional bool need_extra (api.query = "need_extra") , // 是否需要返回额外信息
    17 : optional list<product_common.ProductEntityType> entity_types (api.query = "entity_types"), // 商品类型列表, 优先使用该参数，其次使用 EntityType
    18 : optional bool is_free (api.query = "is_free"), // true = 筛选免费的；false = 筛选付费的；不传则不区分免费和付费
    19 : optional product_common.PluginType plugin_type (api.query = "plugin_type") , // 插件类型
    101: optional string                            client_ip           (api.header="Tt-Agw-Client-Ip")                                                                 ,
    255: optional base.Base                         Base                                                                                                               ,
}

struct GetProductListResponse {
    1  : required i32                code     (agw.key = "code")   ,
    2  : required string             message  (agw.key = "message"),
    3  :          GetProductListData data     (agw.key = "data")   ,
    255: optional base.BaseResp      BaseResp                      ,
}

struct GetProductListData{
    1: optional list<ProductInfo> products (agw.key = "products"),
    2:          bool              has_more  (agw.key = "has_more"),
    3:          i32               total    (agw.key = "total")   ,
}

struct ProductInfo {
    1 : required ProductMetaInfo meta_info    (agw.key = "meta_info")   ,
    2 : optional UserBehaviorInfo user_behavior (agw.key = "user_behavior"),
    3 : optional product_common.CommercialSetting commercial_setting (agw.key = "commercial_setting"),
    20: optional PluginExtraInfo plugin_extra (agw.key = "plugin_extra"),
    21: optional BotExtraInfo    bot_extra    (agw.key = "bot_extra")   ,
    22: optional WorkflowExtraInfo workflow_extra (agw.key = "workflow_extra"),
    23: optional SocialSceneExtraInfo social_scene_extra (agw.key = "social_scene_extra"),
    24: optional ProjectExtraInfo project_extra (agw.key = "project_extra"),
}

struct SellerInfo {
    1: i64    id        (api.js_conv="true",  agw.cli_conv="str", agw.key = "id"),
    2: string name      (agw.key = "name")                                      ,
    3: string avatar_url (agw.key = "avatar_url", agw.key="avatar_url")          ,
}

struct ProductCategory {
    1: i64    id            (api.js_conv="true", agw.cli_conv="str", agw.key = "id"),
    2: string name          (agw.key = "name")                                     ,
    3: string icon_url       (agw.key = "icon_url")                                 ,
    4: string active_icon_url (agw.key = "active_icon_url")                          ,
    5: i32    index         (agw.key = "index")                                    ,
    6: i32    count         (agw.key = "count")                                    ,
}

struct ProductLabel{
    1: string name (agw.key = "name"),
}

struct ProductMetaInfo {
    1 :          i64                              id            (api.js_conv="true",  agw.cli_conv="str", agw.key = "id")            ,
    2 :          string                           name          (agw.key = "name")                                                  , // 商品/模板名称
    3 :          i64                              entity_id      (api.js_conv="true",  agw.cli_conv="str", agw.key = "entity_id")     , // 素材 ID，由 entity_type 来决定是 bot/plugin 的ID
    4 :          product_common.ProductEntityType entity_type    (agw.key = "entity_type")                                           , // 商品素材类型
    5 :          string                           icon_url       (agw.key = "icon_url", agw.key="icon_url")                          , // 商品/模板头像
    6 :          i32                              heat          (agw.key = "heat")                                                  , // 热度：模板热度=复制量（用于卡片展示/排序）；商品热度=不同商品有独立的计算逻辑（仅用于排序）—— heat的计算有一定延迟
    7 :          i32                              favorite_count (agw.key = "favorite_count")                                        ,
    8 :          SellerInfo                       seller        (agw.key = "seller")                                                , // 废弃,使用UserInfo代替
    9 :          string                           description   (agw.key = "description")                                           , // 商品描述
    10:          i64                              listed_at      (api.js_conv="true",  agw.cli_conv="str", agw.key = "listed_at")     ,
    11:          product_common.ProductStatus     status        (agw.key = "status")                                                ,
    12: optional ProductCategory                  category      (agw.key = "category")                                              , // 商品/模板分类信息
    13:          bool                             is_favorited   (agw.key = "is_favorited")                                          , // 是否收藏
    14:          bool                             is_free        (agw.key = "is_free")                                               ,
    15:          string                           readme        (agw.key = "readme")                                                , // 模板介绍/插件介绍（目前是富文本格式）
    16: optional i64                              entity_version (api.js_conv="true",  agw.cli_conv="str", agw.key = "entity_version"),
    17: optional list<ProductLabel>               labels        (agw.key = "labels")                                                ,
    18:          product_common.UserInfo          user_info      (agw.key = "user_info")                                             ,
    19:          string                           medium_icon_url (agw.key = "medium_icon_url")                                       ,
    20:          string                           origin_icon_url (agw.key = "origin_icon_url")                                       ,
    21: optional list<product_common.ImageInfo>   covers        (agw.key = "covers")                                                , // 模板封面
    22: optional bool                             is_professional (agw.key = "is_professional")                                      , // 是否专业版特供
    23:          bool                             is_template    (agw.key = "is_template")                                           , // 是否为模板
    24:          bool                             is_official    (agw.key = "is_official")                                           , // 是否官方商品
    25: optional marketplace_common.Price         price (agw.key = "price")                                                         , // 价格，当前只有模板有
}

struct UserBehaviorInfo {
// 用户主页需要返回最近浏览/使用商品的时间
    1: optional i64                              viewed_at (api.js_conv="true",  agw.cli_conv="str", agw.key = "viewed_at") , // 最近浏览时间戳
    2: optional i64                              used_at (api.js_conv="true",  agw.cli_conv="str", agw.key = "used_at") ,     // 最近使用时间戳
}

struct PluginExtraInfo {
    1: optional list<PluginToolInfo> tools               (agw.key = "tools")                ,
    2:          i32                  total_api_count       (agw.key = "total_api_count")      ,
    3:          i32                  bots_use_count        (agw.key = "bots_use_count")       ,
    4: optional bool                 has_private_statement (agw.key = "has_private_statement"), // 是否有隐私声明, 目前只有 PublicGetProductDetail 会取数据
    5: optional string               private_statement    (agw.key = "private_statement")    , // 隐私声明, 目前只有 PublicGetProductDetail 会取数据
    6: i32 associated_bots_use_count (agw.key = "associated_bots_use_count"),
    7: bool is_premium (agw.key="is_premium"),
    8: bool is_official (agw.key="is_official"),
    9: optional i32 call_amount (agw.key = "call_amount") // 调用量
    10: optional double success_rate (agw.key = "success_rate") // 成功率
    11: optional double avg_exec_time (agw.key = "avg_exec_time") // 平均执行时长
    12: optional bool is_default_icon (agw.key = "is_default_icon"),
    13: optional i64 space_id (agw.key = "space_id", api.js_conv="true",  agw.cli_conv="str"),
    14: optional i64 material_id (agw.key = "material_id", api.js_conv="true",  agw.cli_conv="str"),
    15: list<PluginConnectorInfo> connectors (agw.key = "connectors"),
    16: optional product_common.PluginType plugin_type (agw.key = "plugin_type"),
}

struct ToolParameter {
    1:          string              name         (agw.key = "name")       ,
    2:          bool                required   (agw.key = "required")   ,
    3:          string              description  (agw.key = "description"),
    4:          string              type         (agw.key = "type")       ,
    5: optional list<ToolParameter> sub_params (agw.key = "sub_params") ,
}

struct CardInfo {
    1: string   card_url (agw.key = "card_url"),
    // 以下只有详情页返回
    2: i64          card_id (api.js_conv="true",  agw.cli_conv="str", agw.key = "card_id"),
    3: string       mapping_rule (agw.key = "mapping_rule"),
    4: i64          max_display_rows (api.js_conv="true",  agw.cli_conv="str", agw.key = "max_display_rows"),
    5: i64          card_version (api.js_conv="true",  agw.cli_conv="str", agw.key = "card_version"),
}

struct PluginToolExample{
    1: string req_example (agw.key = "req_example"),
    2: string resp_example (agw.key = "resp_example"),
}

enum PluginRunMode {
    DefaultToSync = 0
    Sync          = 1
    Async         = 2
    Streaming     = 3
}

struct PluginToolInfo{
    1:          i64                 id          (api.js_conv="true",  agw.cli_conv="str", agw.key="id"),
    2:          string              name        (agw.key = "name")                                    ,
    3:          string              description (agw.key = "description")                             ,
    4: optional list<ToolParameter> parameters  (agw.key = "parameters")                              ,
    5: optional CardInfo            card_info    (agw.key = "card_info"),
    6: optional PluginToolExample example (agw.key = "example"),
    7: optional i32 call_amount (agw.key = "call_amount") // 调用量
    8: optional double success_rate (agw.key = "success_rate") // 成功率
    9: optional double avg_exec_time (agw.key = "avg_exec_time") // 平均执行时长
    10: optional i32 bots_use_count (agw.key = "bots_use_count") // tool 被bot引用数
    11: optional PluginRunMode run_mode (agw.key = "run_mode"), // 运行模式
}

struct PluginConnectorInfo {
    1: i64 id (api.js_conv="true",  agw.cli_conv="str", agw.key = "id"),
    2: string name (agw.key = "name"),
    3: string icon (agw.key = "icon"),
}

struct BotPublishPlatform {
    1: i64    id          (api.js_conv="true", agw.cli_conv="str", agw.key = "id"),
    2: string icon_url     (agw.key = "icon_url")                                 ,
    3: string url (agw.key = "url")                                      ,
    4: string name        (agw.key = "name")                                     ,
}

struct ProductMaterial {
    1: string name    (agw.key = "name")    ,
    2: string icon_url (agw.key = "icon_url"),
}

struct BotVoiceInfo {
    1: i64    id      (api.js_conv="true", agw.cli_conv="str", agw.key = "id"),
    2: string language_code (agw.key="language_code")                              ,
    3: string language_name (agw.key="language_name")                              ,
    4: string name         (agw.key="name")                                       ,
    5: string style_id      (agw.key="style_id")                                   ,
    6: bool   is_support_voice_call (agw.key = "is_support_voice_call"),
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
    1:          bool      is_collected       (agw.key="is_collected")   , // 是否开启收集开关
    2:          string    private_policy     (agw.key="private_policy") , // 隐私协议链接
}

struct BotConfig {
    1: optional list<ProductMaterial> models                 (agw.key = "models")                  , // 模型
    2: optional list<ProductMaterial> plugins                (agw.key = "plugins")                 , // 插件
    3: optional list<ProductMaterial> knowledges             (agw.key = "knowledges")              , // 知识库
    4: optional list<ProductMaterial> workflows              (agw.key = "workflows")               , // 工作流
    5: optional i32                   private_plugins_count    (agw.key = "private_plugins_count")   , // 私有插件数量
    6: optional i32                   private_knowledges_count (agw.key = "private_knowledges_count"), // 私有知识库数量
    7: optional i32                   private_workflows_count  (agw.key = "private_workflows_count") , // 私有工作流数量
    8: optional bool                  has_bot_agent            (agw.key = 'has_bot_agent')           , // 判断 multiagent 是否有 bot 节点
    9: optional list<BotVoiceInfo>    bot_voices              (agw.key = 'bot_voices')              , // bot 配置的声音列表
    10: optional i32                  total_plugins_count    (agw.key = "total_plugins_count")   , // 所有插件数量
    11: optional i32                  total_knowledges_count (agw.key = "total_knowledges_count"), // 所有知识库数量
    12: optional i32                  total_workflows_count  (agw.key = "total_workflows_count") , // 所有工作流数量
    13: optional TimeCapsuleMode time_capsule_mode (agw.key = "time_capsule_mode") // 时间胶囊模式
    14: optional FileboxInfoMode filebox_mode (agw.key = "filebox_mode") // 文件盒模式
    15: optional i32 private_image_workflow_count (agw.key = "private_image_workflow_count"), // 私有图片工作流数量
    16: optional UserQueryCollectConf user_query_collect_conf (agw.key = "user_query_collect_conf") // 用户qeury收集配置
    17: optional bool is_close_voice_call (agw.key = "is_close_voice_call"), // 是否关闭语音通话（默认是打开）
}

// 消息涉及的bot信息,在home分享场景,消息属于多个bot
struct ConversationRelateBot {
    1: i64    id         (api.js_conv="true",  agw.cli_conv="str", agw.key = "id"),
    2: string name       (agw.key = "name")                                     ,
    3: string Descridescriptionption (agw.key = "description")                              ,
    4: string icon_url    (agw.key = "icon_url")                                 ,
}

// 消息涉及的user信息,在home分享场景,消息属于多个user
struct ConversationRelateUser {
    1: optional product_common.UserInfo user_info (agw.key = "user_info")
}

struct Conversation {
    1: optional list<string>                 snippets      (agw.key = "snippets")                                , // 对话示例
    2: optional string                       title         (agw.key = "title")                                   , // 对话标题
    3: optional i64                          id            (api.js_conv="true",  agw.cli_conv="str", agw.key="id"), // 对话ID，idGen生成
    4: optional bool                         gen_title      (agw.key = "gen_title")                               , // 是否需要生成对话
    5: optional product_common.AuditStatus   audit_status   (agw.key = "audit_status")                            , // 对话审核状态
    6: optional product_common.OpeningDialog opening_dialog (agw.key = "opening_dialog")                          , // 开场白
    7: optional map<string,ConversationRelateBot>        relate_bots     (agw.key = "relate_bots")                              , // 消息涉及的bot信息,key bot_id
    8: optional map<string,ConversationRelateUser>       relate_users    (agw.key = "relate_users")                             , // 消息涉及的user信息,key user_id
}

struct BotExtraInfo {
    1:          list<BotPublishPlatform>          publish_platforms      (agw.key = "publish_platforms")                                              , // 发布渠道
    2:          i32                               user_count             (agw.key = "user_count")                                                     , // 用户数
    3:          product_common.ProductPublishMode publish_mode           (agw.key = "publish_mode")                                                   , // 公开方式
// 详情页特有
    4: optional list<list<string>>                conversation_snippets  (agw.key = "conversation_snippets")                                          , // 对话示例, 废弃
    5: optional BotConfig                         config                (agw.key = "config")                                                         , // 配置
    6: optional bool                              is_inhouse_user         (agw.key = "is_inhouse_user")                                                , // 白名单
    7: optional i32                               duplicate_bot_count     (agw.key = 'duplicate_bot_count')                                            , // 复制创建 bot 数量
    8: optional list<Conversation>                conversations         (agw.key = "conversations")                                                  , // 分享对话
    9: optional i64 chat_conversation_count (api.js_conv="true",  agw.cli_conv="str", agw.key = "chat_conversation_count"), // 与 Bot 聊天的对话数
    10: optional i64 related_product_count (api.js_conv="true",  agw.cli_conv="str", agw.key = "related_product_count"), // 关联商品数
}

struct WorkflowParameter {
    1: string                   name         (agw.key = "name")
    2: string                   desc         (agw.key = "desc")
    3: bool                     is_required   (agw.key = "is_required")
    4: product_common.InputType input_type    (agw.key = "input_type")
    5: list<WorkflowParameter>  sub_parameters(agw.key = "sub_parameters")
    6: product_common.InputType sub_type      (agw.key = "sub_type") // 如果Type是数组，则有subtype
    7: optional string          value        (agw.key = "value")    // 如果入参是用户手输 就放这里
    8: optional product_common.PluginParamTypeFormat format (agw.key = "format")
    9: optional string          from_node_id   (agw.key = "from_node_id")
    10:	optional list<string>   from_output   (agw.key = "from_output")
    11: optional i64            assist_type   (agw.key = "assist_type")// InputType (+ AssistType) 定义一个变量的最终类型，仅需透传
    12: optional string         show_name     (agw.key = "show_name") // 展示名称（ store 独有的，用于详情页 GUI 展示参数）
    13: optional i64            sub_assist_type (agw.key = "sub_assist_type") // 如果InputType是数组，则有subassisttype
    14: optional string         component_config (agw.key = "component_config") // 组件配置，由前端解析并渲染
    15: optional string         component_type   (agw.key = "component_type") // 组件配置类型，前端展示需要
}

struct WorkflowTerminatePlan {
    1: i32 terminate_plan_type (agw.key = "terminate_plan_type") // 对应 workflow 结束节点的回答模式：1-返回变量，由Bot生成回答；2-使用设定的内容直接回答
    2: string content (agw.key = "content") // 对应 terminate_plan_type = 2 的场景配置的返回内容
}

struct WorkflowNodeParam {
    1: optional list<WorkflowParameter> input_parameters (agw.key = "input_parameters")
    2: optional WorkflowTerminatePlan terminate_plan (agw.key = "terminate_plan")
    3: optional list<WorkflowParameter> output_parameters (agw.key = "output_parameters")
}

struct WorkflowNodeInfo {
    1: string                          node_id   (agw.key = "node_id")
    2: product_common.WorkflowNodeType node_type (agw.key = "node_type")
    3: optional WorkflowNodeParam      node_param (agw.key = "node_param")
    4: string                          node_icon_url (agw.key = "node_icon_url") // 节点icon
    5: optional string                 show_name    (agw.key = "show_name"), // 展示名称（ store 独有的，用于详情页 GUI 展示消息节点的名称）
}

struct WorkflowEntity {
    1 : i64                              product_id     (api.js_conv="true",  agw.cli_conv="str", agw.key = "product_id")            , // 商品ID
    2 : string                           name          (agw.key = "name")                                                  ,
    3 : i64                              entity_id      (api.js_conv="true",  agw.cli_conv="str", agw.key = "entity_id")     ,
    4 : product_common.ProductEntityType entity_type    (agw.key = "entity_type")                                           ,
    5 : i64                              entity_version (api.js_conv="true",  agw.cli_conv="str", agw.key = "entity_version"),
    6 : string                           icon_url       (agw.key = "icon_url", agw.key="icon_url")                          ,
    7 : string                           entity_name    (agw.key = "entity_name")
    8 : string                           readme        (agw.key = "readme")
    9 : ProductCategory                  category      (agw.key = "category")
    10: optional ProductCategory         recommended_category   (agw.key = "recommended_category")// 推荐分类                        ,
    11: optional list<WorkflowNodeInfo>  nodes         (agw.key = "nodes")
    12: string                           desc          (agw.key = "desc")
    13: optional string                  case_input_icon_url  (agw.key = "case_input_icon_url")  // 入参 图片icon
    14: optional string                  case_output_icon_url (agw.key = "case_output_icon_url") // 出参 图片icon
    15: optional string                  latest_publish_commit_id  (agw.key = "latest_publish_commit_id")
}

struct WorkflowGUIConfig { // 用于将 workflow 的输入/输出/中间消息节点节点转为用户可视化配置
    1: WorkflowNodeInfo start_node (agw.key = "start_node"),
    2: WorkflowNodeInfo end_node (agw.key = "end_node"),
    3: optional list<WorkflowNodeInfo> message_nodes (agw.key = "message_nodes"), // 消息节点会输出中间过程，也需要展示
}

struct WorkflowExtraInfo {
    1: list<WorkflowEntity>            related_workflows (agw.key = "related_workflows")
    2: optional i32                    duplicate_count (agw.key = "duplicate_count")
    3: optional string                 workflow_schema (agw.key = "workflow_schema") // workflow画布信息
    // /api/workflowV2/query  schema_json
    4: optional ProductCategory        recommended_category (agw.key = "recommended_category")// 推荐分类
    5: optional list<WorkflowNodeInfo> nodes (agw.key = "nodes")
    6: optional WorkflowNodeInfo       start_node (agw.key = "start_node")
    7: optional string                 entity_name (agw.key = "entity_name") // 实体名称(用于展示)
    8: optional string                 case_input_icon_url (agw.key = "case_input_icon_url") // 用例图入参
    9: optional string                 case_output_icon_url (agw.key = "case_output_icon_url") // 用例图出参
    10: optional i64                   case_execute_id (api.js_conv="true",  agw.cli_conv="str", agw.key = "case_execute_id")  // 案例执行ID
    11: optional string                hover_text (agw.key = "hover_text")
    12: optional string                latest_publish_commit_id  (agw.key = "latest_publish_commit_id")
    13: optional i32                   used_count (agw.key = "used_count") // 试运行次数，从数仓取
    14: optional WorkflowGUIConfig     gui_config (agw.key = "gui_config") // 用于将 workflow 的输入/输出/中间消息节点节点转为用户可视化配置
}

struct SocialScenePlayerInfo {
    1: i64  id (api.js_conv="true",  agw.cli_conv="str", agw.key="id"),
    2: string name (agw.key = "name")
    3: product_common.SocialSceneRoleType role_type (agw.key = "role_type")
}

struct SocialSceneExtraInfo {
    1: optional list<SocialScenePlayerInfo> players (agw.key = "players") // 角色
    2: i64 used_count (api.js_conv="true",  agw.cli_conv="str", agw.key = "used_count") // 使用过的人数
    3: i64 started_count (api.js_conv="true",  agw.cli_conv="str", agw.key = "started_count") // 开始过的次数
    4: product_common.ProductPublishMode publish_mode (agw.key = "publish_mode") // 开闭源
}

struct ProjectConfig {
    1: i32 plugin_count (agw.key = "plugin_count"), // 插件数量
    2: i32 workflow_count (agw.key = "workflow_count"), // 工作流数量
    3: i32 knowledge_count (agw.key = "knowledge_count"), // 知识库数量
    4: i32 database_count (agw.key = "database_count"), // 数据库数量
}

struct ProjectExtraInfo {
     // Project 上架为模板前生成一个模板副本，使用或者复制模板，需要用 TemplateProjectID 和 TemplateProjectVersion
     1: i64 template_project_id                    (api.js_conv="true",  agw.cli_conv="str", agw.key="template_project_id"),
     2: i64 template_project_version               (api.js_conv="true",  agw.cli_conv="str", agw.key="template_project_version"),
     3: list<product_common.UIPreviewType> preview_types (agw.key = "preview_types") // Project 绑定的 UI 支持的预览类型
     4: i32 user_count (agw.key="user_count"), // 用户数
     5: i32 execute_count (agw.key="execute_count"), // 运行数
     6: list<BotPublishPlatform> publish_platforms (agw.key = "publish_platforms"), // 发布渠道
     7: i32 duplicate_count (agw.key = "duplicate_count"), // 近实时复制量，从数仓接口获取（复制 - 上报埋点 - 数仓计算落库）
     8: optional ProjectConfig config (agw.key = "config"), // 配置
}