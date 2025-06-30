include "../base.thrift"
include "../bot_common/bot_common.thrift"
include "shortcut_command.thrift"
include "prompt_resource.thrift"

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
    5: optional i64    plugin_type (agw.js_conv="str" api.js_conv="true")
    6: optional i64    plugin_status (agw.js_conv="str" api.js_conv="true")
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

enum ScopeType {
    All  = 0 // 企业下所有的（企业下生效）
    Self = 1 // 我加入的（企业&个人都生效，不传默认Self）
}

struct GetSpaceListV2Request {
    1: optional string search_word                      // 搜索词
    2: optional i64 enterprise_id (api.js_conv='true',agw.js_conv="str") // 企业id
    3: optional i64 organization_id (api.js_conv='true',agw.js_conv="str") // 组织id
    4: optional ScopeType scope_type                    // 范围类型
    5: optional i32 page                                // 分页信息
    6: optional i32 size                                // 分页大小 -- page 和 size不传则认为不分页

    255: optional base.Base Base (api.none="true")
}

enum SpaceType {
    Personal = 1 // 个人
    Team     = 2 // 小组
}

enum SpaceMode {
    Normal = 0
    DevMode = 1
}

enum SpaceTag {
    Professional  =  1  // 专业版
}

enum SpaceRoleType {
    Default = 0 // 默认
    Owner   = 1 // owner
    Admin   = 2 // 管理员
    Member  = 3 // 普通成员
}

// 申请管理列表
enum SpaceApplyStatus {
    All              =  0     // 所有
    Joined           =  1     // 已加入
    Confirming       =  2     // 确认中
    Rejected         =  3     // 已拒绝
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

struct BotSpaceV2 {
    1: i64                 id (api.js_conv='true',agw.js_conv="str") // 空间id，新建为0
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
    14: optional i64    enterprise_id (api.js_conv='true',agw.js_conv="str") // 企业id
    15: optional i64    organization_id (api.js_conv='true',agw.js_conv="str") // 组织id
    16: optional i64    owner_user_id (api.js_conv='true',agw.js_conv="str") // 空间owner uid
    17: optional string    owner_name      // 空间owner昵称
    18: optional string    owner_user_name // 空间owner用户名
    19: optional string    owner_icon_url  // 空间owner图像
    20: optional SpaceApplyStatus space_apply_status // 当前访问用户加入空间状态
    21: optional i64       total_member_num // 空间成员总数，只有组织空间才查询
}

struct SpaceInfo {
    1: list<BotSpaceV2> bot_space_list     // 用户加入空间列表
    2: bool             has_personal_space // 是否有个人空间
    3: i32              team_space_num     // 个人创建team空间数量
    4: i32              max_team_space_num // 个人最大能创建的空间数量
    5: list<BotSpaceV2> recently_used_space_list // 最近使用空间列表
    6: optional i32 total                        // 分页时生效
    7: optional bool has_more                    // 分页时生效
}

struct GetSpaceListV2Response {
    1:   SpaceInfo       data
    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct GetImagexShortUrlResponse{
    1             :      GetImagexShortUrlData data
    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp (api.none="true")
}

struct GetImagexShortUrlData {
    1: map<string,UrlInfo>   url_info //审核状态，key uri，value url 和 审核状态

}

struct UrlInfo {
    1: string url
    2: bool   review_status

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



struct UserBasicInfo {
    1: required i64                  UserId         (api.js_conv='true',agw.js_conv="str", api.body="user_id")
    3: required string               Username       (api.body="user_name") // 昵称
    4: required string               UserAvatar     (api.body="user_avatar") // 头像
    5: optional string               UserUniqueName (api.body="user_unique_name") // 用户名
    6: optional bot_common.UserLabel UserLabel      (api.body="user_label") // 用户标签
    7: optional i64                  CreateTime     (api.body="create_time") // 用户创建时间
}

struct MGetUserBasicInfoRequest {
    1 : required list<string> UserIds (agw.js_conv="str", api.js_conv="true", api.body="user_ids")
    2 : optional bool NeedUserStatus (api.body="need_user_status")
    3 : optional bool NeedEnterpriseIdentity (api.body="need_enterprise_identity") // 是否需要企业认证信息，前端通过AGW调用时默认为true
    4 : optional bool NeedVolcanoUserName (api.body="need_volcano_user_name") // 是否需要火山用户名

    255: optional base.Base Base (api.none="true")
}

struct MGetUserBasicInfoResponse {
    1 : optional map<string, UserBasicInfo> UserBasicInfoMap (api.body="id_user_info_map")

    253:          i64           code
    254:          string        msg

    255: optional base.BaseResp BaseResp (api.none="true")
}

struct GetBotPopupInfoRequest {
    1: required list<BotPopupType> bot_popup_types
    2: required i64                bot_id          (agw.js_conv="str" api.js_conv="true")

    255: base.Base Base (api.none="true")
}

struct GetBotPopupInfoResponse {
    1:   required BotPopupInfoData data

    253: required i64              code
    254: required string           msg
    255: required base.BaseResp BaseResp (api.none="true")
}

struct BotPopupInfoData {
    1: required map<BotPopupType,i64> bot_popup_count_info
}

enum BotPopupType {
    AutoGenBeforePublish = 1
}


struct UpdateBotPopupInfoResponse {
    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp (api.none="true")
}


struct UpdateBotPopupInfoRequest {
    1: required BotPopupType bot_popup_type
    2: required i64          bot_id         (agw.js_conv="str" api.js_conv="true")

    255: base.Base Base (api.none="true")
}

struct ReportUserBehaviorRequest {
    1: required i64 ResourceID (api.body = "resource_id",api.js_conv="true")
    2: required SpaceResourceType ResourceType (api.body="resource_type")
    3: required BehaviorType BehaviorType (api.body="behavior_type")
    4: optional i64 SpaceID (agw.js_conv="str",api.js_conv="true",api.body="space_id",agw.key="space_id") // 本需求必传

    255: base.Base Base (api.none="true")
}

struct ReportUserBehaviorResponse {
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

struct FileInfo {
    1 : string url
    2 : string uri
}
enum GetFileUrlsScene {
    shorcutIcon = 1
}
struct GetFileUrlsRequest {
    1 :  GetFileUrlsScene scene
    255: base.Base Base
}

struct GetFileUrlsResponse {
    1 : list<FileInfo> file_list
    253: i64 code
    254: string msg
    255: base.BaseResp BaseResp
}

struct UploadFileOpenRequest {
    1: required string ContentType (api.header = "Content-Type", agw.source = "header", agw.key = "Content-Type"), // 文件类型
    2: required binary Data (api.raw_body = ""),          // 二进制数据
    255: base.Base Base
}


struct UploadFileOpenResponse {
    1: optional File File (api.body = "data")
    253: required i64 code
    254: required string msg
    255: base.BaseResp BaseResp
}

struct File{
    1: string URI (api.body = "uri"),                  // 文件URI
    2: i64 Bytes (api.body = "bytes"),               // 文件字节数
    3: i64 CreatedAt (agw.key = "created_at"),        // 上传时间戳，单位s
    4: string FileName (api.body = "file_name"),     // 文件名
    5: string URL (api.body = "url")
}

struct GetBotOnlineInfoReq {
    1 : required i64 bot_id  (api.js_conv="true")           // botId
    2:  optional string connector_id // 先保留，不暴露且不使用该字段
    3 : optional string version        // bot版本，不传则获取最新版本
}

// resp
struct GetBotOnlineInfoResp {
    1: required i32 code
    2: required string msg
    3: required bot_common.OpenAPIBotInfo data
}

service PlaygroundService {
    UpdateDraftBotInfoAgwResponse UpdateDraftBotInfoAgw(1:UpdateDraftBotInfoAgwRequest request)(api.post='/api/playground_api/draftbot/update_draft_bot_info', api.category="draftbot",agw.preserve_base="true")
    GetDraftBotInfoAgwResponse GetDraftBotInfoAgw(1:GetDraftBotInfoAgwRequest request)(api.post='/api/playground_api/draftbot/get_draft_bot_info', api.category="draftbot",agw.preserve_base="true")
    GetImagexShortUrlResponse GetImagexShortUrl (1:GetImagexShortUrlRequest request)(api.post='/api/playground_api/get_imagex_url', api.category="file",agw.preserve_base="true")

    // public popup_info
    GetBotPopupInfoResponse GetBotPopupInfo (1:GetBotPopupInfoRequest request)(api.post='/api/playground_api/operate/get_bot_popup_info', api.category="account",agw.preserve_base="true")
    UpdateBotPopupInfoResponse UpdateBotPopupInfo (1:UpdateBotPopupInfoRequest request)(api.post='/api/playground_api/operate/update_bot_popup_info', api.category="account",agw.preserve_base="true")
    ReportUserBehaviorResponse ReportUserBehavior(1:ReportUserBehaviorRequest request)(api.post='/api/playground_api/report_user_behavior', api.category="playground_api",agw.preserve_base="true")

   // 创建快捷指令
    shortcut_command.CreateUpdateShortcutCommandResponse CreateUpdateShortcutCommand(1: shortcut_command.CreateUpdateShortcutCommandRequest req)(api.post='/api/playground_api/create_update_shortcut_command', api.category="playground_api", agw.preserve_base="true")
    GetFileUrlsResponse GetFileUrls(1: GetFileUrlsRequest req)(api.post='/api/playground_api/get_file_list', api.category="playground_api", agw.preserve_base="true")


    // prompt resource
    prompt_resource.GetOfficialPromptResourceListResponse GetOfficialPromptResourceList(1:prompt_resource.GetOfficialPromptResourceListRequest request)(api.post='/api/playground_api/get_official_prompt_list', api.category="prompt_resource",agw.preserve_base="true")
    prompt_resource.GetPromptResourceInfoResponse GetPromptResourceInfo(1:prompt_resource.GetPromptResourceInfoRequest request)(api.get='/api/playground_api/get_prompt_resource_info', api.category="prompt_resource",agw.preserve_base="true")
    prompt_resource.UpsertPromptResourceResponse UpsertPromptResource(1:prompt_resource.UpsertPromptResourceRequest request)(api.post='/api/playground_api/upsert_prompt_resource', api.category="prompt_resource",agw.preserve_base="true")
    prompt_resource.DeletePromptResourceResponse DeletePromptResource(1:prompt_resource.DeletePromptResourceRequest request)(api.post='/api/playground_api/delete_prompt_resource', api.category="prompt_resource",agw.preserve_base="true")

    GetSpaceListV2Response GetSpaceListV2(1:GetSpaceListV2Request request)(api.post='/api/playground_api/space/list', api.category="space",agw.preserve_base="true")
    MGetUserBasicInfoResponse MGetUserBasicInfo(1: MGetUserBasicInfoRequest request) (api.post='/api/playground_api/mget_user_info', api.category="playground_api",agw.preserve_base="true")

    //openapi
    GetBotOnlineInfoResp GetBotOnlineInfo(1: GetBotOnlineInfoReq request)(api.get='/v1/bot/get_online_info', api.category="bot", api.tag="openapi", api.gen_path="personal_api")

    // File 相关 OpenAPI
    UploadFileOpenResponse UploadFileOpen(1: UploadFileOpenRequest request)(api.post = "/v1/files/upload", api.category="file", api.tag="openapi", agw.preserve_base="true")
}
