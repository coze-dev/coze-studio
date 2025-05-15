include "../marketplace_common.thrift"

namespace go flow.marketplace.product_common

enum ProductEntityType {
    Bot              = 1 ,
    Plugin           = 2 ,
    // Workflow = 3 ,
    SocialScene      = 4,
    Project          = 6,
    WorkflowTemplate = 13, // 历史工作流，后续不会再有（废弃）
    ImageflowTemplate = 15, // 历史图像流模板，后续不会再有（废弃）
    TemplateCommon      = 20, // 模板通用标识，仅用于绑定模板相关的配置，不绑定商品
    BotTemplate         = 21, // Bot 模板
    WorkflowTemplateV2  = 23, // 工作流模板
    ImageflowTemplateV2 = 25, // 图像流模板（该类型已下线，合并入 workflow，但历史数据会保留，前端视作 workflow 展示）
    ProjectTemplate     = 26, // 项目模板
    CozeToken        = 50, // coze token 类商品，理论上只会有一个
    MsgCredit        = 55, // 订阅 credit 的流量包，理论上只会有一个
    SubsMsgCredit    = 60, // 消息订阅类商品，理论上只有一个
    Common           = 99,
    Topic = 101 // 专题（兼容之前的设计）
}

enum SortType {
    Heat         = 1,
    Newest       = 2,
    FavoriteTime = 3, // 收藏时间
    Relative = 4, // 相关性，只用于搜索场景
}

enum ProductPublishMode {
    OpenSource   = 1,
    ClosedSource = 2,
}

enum ProductListSource {
    Recommend           = 1, // 推荐列表页
    CustomizedRecommend = 2, // 个性化推荐
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
    1: required ProductPaidType CommercialType (agw.key = "commercial_type")
}

enum ProductStatus {
    NeverListed = 0, // 从未上架
    Listed      = 1,
    Unlisted    = 2,
    Banned      = 3,
}

struct UserLabel {
    1: string LabelID   (agw.key = "label_id")  ,
    2: string LabelName (agw.key = "label_name"),
    3: string IconURI   (agw.key = "icon_uri")  ,
    4: string IconURL   (agw.key = "icon_url")  ,
    5: string JumpLink  (agw.key = "jump_link") ,
}

struct UserInfo {
    1:          i64                           UserID     (agw.js_conv="str",  agw.cli_conv="str", agw.key = "user_id"),
    2:          string                        UserName   (agw.key = "user_name")                                      ,
    3:          string                        Name       (agw.key = "name")                                           ,
    4:          string                        AvatarURL  (agw.key = "avatar_url")                                     ,
    5: optional UserLabel                     UserLabel  (agw.key = "user_label")                                     ,
    6: optional marketplace_common.FollowType FollowType (agw.key = "follow_type")                                    ,
}

struct ImageInfo {
    1: string URI   (agw.key = "uri"),
    2: string URL   (agw.key = "url"),
}

enum ProductDraftStatus {
    Default   = 0, // 默认
    Pending   = 1, // 审核中
    Approved  = 2, // 审核通过
    Rejected  = 3, // 审核不通过
    Abandoned = 4, // 已废弃
}

typedef ProductDraftStatus AuditStatus

struct OpeningDialog {  // Bot开场白
    1: string Content (agw.key = "content"),
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
    Start       = 1 , // 开始
    End         = 2 , // 结束
    LLM         = 3 , // 大模型
    Api         = 4 , // 插件
    Code        = 5 , // 代码
    Dataset     = 6 , // 知识库
    If          = 8 , // 选择器
    SubWorkflow = 9 , // 工作流
    Variable    = 11, // 变量
    Database    = 12, // 数据库
    Message     = 13, // 消息
}

enum SocialSceneRoleType {
    Host       = 1
	PresetBot  = 2
	Custom     = 3
}

enum UIPreviewType { // UI 预览类型，定义对齐 UI Builder，目前用于 Project
    Web = 1,    // 网页端
    Client = 2, // 移动端
}