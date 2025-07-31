include "../marketplace_common.thrift"

namespace go flow.marketplace.product_common

enum ProductEntityType {
    Bot              = 1 ,
    Plugin           = 2 ,
    // Workflow = 3 ,
    SocialScene      = 4,
    Project          = 6,
    WorkflowTemplate = 13, // History workflow, no more in the future (abandoned)
    ImageflowTemplate = 15, // Historical image stream template, no more in the future (obsolete)
    TemplateCommon      = 20, // Template universal identification, only used to bind template-related configurations, not bind products
    BotTemplate         = 21, // Bot template
    WorkflowTemplateV2  = 23, // workflow template
    ImageflowTemplateV2 = 25, // Image stream template (this type has been offline and merged into workflow, but historical data will be preserved, and the front end will be treated as workflow display)
    ProjectTemplate     = 26, // project template
    CozeToken        = 50, // Coze token products, theoretically there will only be one
    MsgCredit        = 55, // Subscribe to the traffic package of credit, theoretically there will only be one
    SubsMsgCredit    = 60, // There is only one subscription product in theory
    Common           = 99,
    Topic = 101 // Special Topics (Compatible with previous designs)
}

enum SortType {
    Heat         = 1,
    Newest       = 2,
    FavoriteTime = 3, // collection time
    Relative = 4, // Correlation, only for search scenarios
}

enum ProductPublishMode {
    OpenSource   = 1,
    ClosedSource = 2,
}

enum ProductListSource {
    Recommend           = 1, // recommended list page
    CustomizedRecommend = 2, // personalized recommendation
}

enum PluginType {
    CLoudPlugin           = 0 , // default
    LocalPlugin           = 1 ,
}

enum ProductPaidType {
    Free = 0;
    Paid = 1;
}

struct CommercialSetting {
    1: required ProductPaidType commercial_type (agw.key = "commercial_type", api.body= "commercial_type")
}

enum ProductStatus {
    NeverListed = 0, // NeverListed
    Listed      = 1,
    Unlisted    = 2,
    Banned      = 3,
}

struct UserLabel {
    1: string label_id   (agw.key = "label_id", api.body= "label_id")  ,
    2: string label_name (agw.key = "label_name", api.body= "label_name"),
    3: string icon_uri   (agw.key = "icon_uri", api.body= "icon_uri")  ,
    4: string icon_url   (agw.key = "icon_url", api.body= "icon_url")  ,
    5: string jump_link  (agw.key = "jump_link", api.body= "jump_link") ,
}

struct UserInfo {
    1:          i64                           user_id     (agw.js_conv="str",api.js_conv="true",agw.cli_conv="str", agw.key = "user_id", api.body= "user_id"),
    2:          string                        user_name   (agw.key = "user_name", api.body= "user_name")                                      ,
    3:          string                        name       (agw.key = "name", api.body= "name")                                           ,
    4:          string                        avatar_url  (agw.key = "avatar_url", api.body= "avatar_url")                                     ,
    5: optional UserLabel                     user_label  (agw.key = "user_label", api.body= "user_label")                                     ,
    6: optional marketplace_common.FollowType follow_type (agw.key = "follow_type", api.body= "follow_type")                                    ,
}

struct ImageInfo {
    1: string uri   (agw.key = "uri", api.body= "uri"),
    2: string url   (agw.key = "url", api.body= "url"),
}

enum ProductDraftStatus {
    Default   = 0, // default
    Pending   = 1, // Under review.
    Approved  = 2, // approved
    Rejected  = 3, // The review failed.
    Abandoned = 4, // Abandoned
}

typedef ProductDraftStatus AuditStatus

struct OpeningDialog {  // Bot OpeningDialog
    1: string content (agw.key = "content", api.body= "content"),
}

enum InputType {
    String  = 1,
    Integer = 2,
    Boolean = 3,
    Double  = 4,
    List    = 5,
    Object  = 6,
}

enum PluginParamTypeFormat {
    ImageUrl = 1,
}

enum WorkflowNodeType {
    Start       = 1 , // start
    End         = 2 , // end
    LLM         = 3 , // Large model
    Api         = 4 , // plugin
    Code        = 5 , // code
    Dataset     = 6 , // Knowledge Base
    If          = 8 , // selector
    SubWorkflow = 9 , // Workflow
    Variable    = 11, // variable
    Database    = 12, // database
    Message     = 13, // message
}

enum SocialSceneRoleType {
    Host       = 1
	PresetBot  = 2
	Custom     = 3
}

enum UIPreviewType { // UI preview type, defining alignment UI Builder, currently used in Project
    Web = 1,    // web page
    Client = 2, // mobile end
}

struct ChargeSKUExtra{
    1: i64 Quantity    (agw.js_conv="str", api.js_conv="true", agw.cli_conv="str", agw.key = "quantity", api.body= "quantity"),
    2: bool IsSelfDefine (agw.key = "is_self_define", api.body= "is_self_define")
}

enum FavoriteListSource {
    CreatedByMe = 1, // Created by users themselves
}

struct FavoriteEntity {
    1 :          i64                  EntityID           (agw.js_conv="str", agw.cli_conv="str", agw.key = "entity_id", api.body="entity_id", api.js_conv="true")  ,
    2 :          ProductEntityType    EntityType         (agw.key = "entity_type", api.body="entity_type")                                        ,
    4 :          string               Name               (agw.key = "name", api.body="name")                                               ,
    5 :          string               IconURL            (agw.key = "icon_url", api.body="icon_url")                                           ,
    6 :          string               Description        (agw.key = "description", api.body="description")                                        ,
    7 :          SellerInfo           Seller             (agw.key = "seller", api.body="seller")                                             , // Abandoned, using UserInfo
    8 :          i64                  SpaceID            (agw.js_conv="str",  agw.cli_conv="str", agw.key = "space_id", api.body="space_id", api.js_conv="true")   , // Use to jump to the bot edit page
    9 :          bool                 HasSpacePermission (agw.key = "has_space_permission", api.body="has_space_permission")                               , // Does the user have permissions to the space where the entity is located?
    10:          i64                  FavoriteAt         (agw.js_conv="str",  agw.cli_conv="str", agw.key = "favorite_at", api.body="favorite_at", api.js_conv="true"), // collection time

    11: optional FavoriteProductExtra ProductExtra       (agw.key = "product_extra", api.body="product_extra")                                      ,
    12:          UserInfo             UserInfo           (agw.key = "user_info", api.body="user_info")                                          ,
    13: optional FavoritePluginExtra  PluginExtra        (agw.key = "plugin_extra", api.body="plugin_extra")                                       ,
}

struct SellerInfo {
    1: i64    UserID    (agw.js_conv="str",  agw.cli_conv="str", agw.key = "user_id", api.body="user_id", api.js_conv="true"),
    2: string UserName  (agw.key = "user_name", api.body="user_name")                                      ,
    3: string AvatarURL (agw.key = "avatar_url", agw.key="avatar_url", api.body="avatar_url")               ,
}

struct FavoriteProductExtra {
    1: i64           ProductID     (agw.js_conv="str",  agw.cli_conv="str", agw.key = "product_id", api.body="product_id", api.js_conv="true"),
    2: ProductStatus ProductStatus (agw.key="product_status", api.body="product_status")                                      ,
}

struct FavoritePluginExtra {
    1: list<PluginTool> Tools (agw.key="tools", api.body="tools"),
}

struct PluginTool {
    1: i64    ID (agw.js_conv="str",  agw.cli_conv="str", agw.key = "id", api.body="id", api.js_conv="true"),
    2: string Name (agw.key="name", api.body="name"),
    3: string Description (agw.key="description", api.body="description"),
}