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
    1: optional bool   has_change       // Is there any change?
    2:          bool   check_not_pass   // True: The machine audit verification failed
    3: optional Branch branch           // Which branch is it currently on?
    4: optional bool   same_with_online
    5: optional string check_not_pass_msg // The machine audit verification failed the copy.
}

// branch
enum Branch {
    Undefined     = 0
    PersonalDraft = 1 // draft
    Base          = 2 // Space draft
    Publish       = 3 // Online version, used in diff scenarios
}

struct UpdateDraftBotInfoAgwRequest {
    1: optional bot_common.BotInfoForUpdate bot_info
    2: optional i64   base_commit_version (api.js_conv='true',agw.js_conv="str")

    255: base.Base Base (api.none="true")
}

struct GetDraftBotInfoAgwRequest {
    1: required i64  bot_id  (api.js_conv='true',agw.js_conv="str") // Draft bot_id
    2: optional string  version  // Check the history, the id of the historical version, corresponding to the id of the bot_draft_history
    3: optional string  commit_version // Query specifies commit_version version, pre-release use, seems to be the same thing as version, but the acquisition logic is different

    255: base.Base Base (api.none="true")
}

struct GetDraftBotInfoAgwResponse {
    1: required GetDraftBotInfoAgwData data,

    253: required i64                   code,
    254: required string                msg,
    255: required base.BaseResp BaseResp (api.none="true")
}

struct GetDraftBotInfoAgwData {
    1: required bot_common.BotInfo bot_info // core bot data
    2: optional BotOptionData bot_option_data // bot option information
    3: optional bool            has_unpublished_change // Are there any unpublished changes?
    4: optional BotMarketStatus bot_market_status      // The product status after the bot is put on the shelves
    5: optional bool            in_collaboration       // Is the bot in multiplayer cooperative mode?
    6: optional bool            same_with_online       // Is the content committed consistent with the online content?
    7: optional bool            editable               // For frontend, permission related, can the current user edit this bot
    8: optional bool            deletable              // For frontend, permission related, can the current user delete this bot
    9: optional UserInfo        publisher              // Is the publisher of the latest release version
    10:         bool has_publish // Has it been published?
    11:         i64 space_id    (api.js_conv='true',agw.js_conv="str")  // Space ID
    12:         list<BotConnectorInfo> connectors    // Published business line details
    13: optional Branch              branch          // What branch did you get the content of?
    14: optional string              commit_version  // If branch=PersonalDraft, the version number of checkout/rebase; if branch = base, the committed version
    15: optional string              committer_name  // For the front end, the most recent author
    16: optional string              commit_time     // For frontend, commit time
    17: optional string              publish_time    // For frontend, release time
    18: optional BotCollaboratorStatus collaborator_status // Multi-person collaboration related operation permissions
    19: optional AuditInfo           latest_audit_info // Details of the most recent review
    20: optional string              app_id // Douyin's doppelganger bot will have appId.
}

struct BotOptionData {
    1: optional map<i64,ModelDetail>        model_detail_map      // model details
    2: optional map<i64,PluginDetal>        plugin_detail_map     // plugin details
    3: optional map<i64,PluginAPIDetal>     plugin_api_detail_map // Plugin API Details
    4: optional map<i64,WorkflowDetail>     workflow_detail_map   // Workflow Details
    5: optional map<string,KnowledgeDetail> knowledge_detail_map  // Knowledge Details
    6: optional list<shortcut_command.ShortcutCommand>   shortcut_command_list  // Quick command list
}


struct ModelDetail {
    1: optional string name           // Model display name (to the user)
    2: optional string model_name     // Model name (for internal)
    3: optional i64    model_id       (agw.js_conv="str" api.js_conv="true") // Model ID
    4: optional i64    model_family   // Model Category
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
    6: optional string                sub_type       // If Type is an array, there is a subtype
    7: optional i64                   assist_type
}

struct WorkflowDetail {
    1: optional i64    id          (agw.js_conv="str" api.js_conv="true")
    2: optional string name
    3: optional string description
    4: optional string icon_url
    5: optional i64    status
    6: optional i64    type        // Type 1: Official Template
    7: optional i64    plugin_id   (agw.js_conv="str" api.js_conv="true") // Plugin ID corresponding to workfklow
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
    Text = 0 // Text
    Table = 1 // table
    Image = 2 // image
}


enum BotMarketStatus {
    Offline = 0 // offline
    Online  = 1 // put on the shelves
}

struct UserInfo {
    1: i64    user_id   (api.js_conv='true',agw.js_conv="str")  // user id
    2: string name     // user name
    3: string icon_url // user icon
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
    1: bool commitable    // Can the current user submit?
    2: bool operateable   // Is the current user operable?
    3: bool manageable    // Can the current user manage collaborators?
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
    Auditing = 0, // Under review.
    Success  = 1, // approved
    Failed   = 2, // audit failed
}


// Onboarding json structure
struct OnboardingContent {
    1: optional string       prologue            // Introductory remarks (C-end usage scenarios, only 1; background scenarios, possibly multiple)
    2: optional list<string> suggested_questions // suggestion question
    3: optional bot_common.SuggestedQuestionsShowMode suggested_questions_show_mode
}

enum ScopeType {
    All  = 0 // All under the enterprise (effective under the enterprise)
    Self = 1 // I joined (both companies and individuals are valid, no default self is passed on)
}

struct GetSpaceListV2Request {
    1: optional string search_word                      // Search term
    2: optional i64 enterprise_id (api.js_conv='true',agw.js_conv="str") // Enterprise ID
    3: optional i64 organization_id (api.js_conv='true',agw.js_conv="str") // organization id
    4: optional ScopeType scope_type                    // range type
    5: optional i32 page                                // paging information
    6: optional i32 size                                // Paging size -- if page and size are not passed on, it is considered not paging

    255: optional base.Base Base (api.none="true")
}

enum SpaceType {
    Personal = 1 // individual
    Team     = 2 // group
}

enum SpaceMode {
    Normal = 0
    DevMode = 1
}

enum SpaceTag {
    Professional  =  1  // Professional Edition
}

enum SpaceRoleType {
    Default = 0 // default
    Owner   = 1 // owner
    Admin   = 2 // administrator
    Member  = 3 // ordinary member
}

// Application management list
enum SpaceApplyStatus {
    All              =  0     // all
    Joined           =  1     // Joined
    Confirming       =  2     // Confirming
    Rejected         =  3     // Rejected
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
    1: i64                 id (api.js_conv='true',agw.js_conv="str") // Space id, newly created as 0
    2: list<AppIDInfo>     app_ids        // publishing platform
    3: string              name           // space name
    4: string              description    // spatial description
    5: string              icon_url       // icon url
    6: SpaceType           space_type     // space type
    7: list<ConnectorInfo> connectors     // publishing platform
    8: bool                hide_operation // Whether to hide New, Copy Delete buttons
    9: i32                 role_type      // Role in team 1-owner 2-admin 3-member
    10: optional SpaceMode space_mode     // Spatial Mode
    11: bool               display_local_plugin // Whether to display the end-side plug-in creation entry
    12: SpaceRoleType      space_role_type // Role type, enumeration
    13: optional SpaceTag  space_tag       // spatial label
    14: optional i64    enterprise_id (api.js_conv='true',agw.js_conv="str") // Enterprise ID
    15: optional i64    organization_id (api.js_conv='true',agw.js_conv="str") // organization id
    16: optional i64    owner_user_id (api.js_conv='true',agw.js_conv="str") // Space owner uid
    17: optional string    owner_name      // Space owner nickname
    18: optional string    owner_user_name // Space owner username
    19: optional string    owner_icon_url  // Space owner image
    20: optional SpaceApplyStatus space_apply_status // The current visiting user joins the space status
    21: optional i64       total_member_num // The total number of space members, only the organization space can be queried.
}

struct SpaceInfo {
    1: list<BotSpaceV2> bot_space_list     // User joins space list
    2: bool             has_personal_space // Is there any personal space available?
    3: i32              team_space_num     // Number of team spaces created by individuals
    4: i32              max_team_space_num // The maximum number of spaces an individual can create
    5: list<BotSpaceV2> recently_used_space_list // list of recently used spaces
    6: optional i32 total                        // Effective when paging
    7: optional bool has_more                    // Effective when paging
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
    1: map<string,UrlInfo>   url_info //Audit status, key uri, value url and, audit status

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
    3: required string               Username       (api.body="user_name") // nickname
    4: required string               UserAvatar     (api.body="user_avatar") // avatar
    5: optional string               UserUniqueName (api.body="user_unique_name") // user name
    6: optional bot_common.UserLabel UserLabel      (api.body="user_label") // user tag
    7: optional i64                  CreateTime     (api.body="create_time") // user creation time
}

struct MGetUserBasicInfoRequest {
    1 : required list<string> UserIds (agw.js_conv="str", api.js_conv="true", api.body="user_ids")
    2 : optional bool NeedUserStatus (api.body="need_user_status")
    3 : optional bool NeedEnterpriseIdentity (api.body="need_enterprise_identity") // Whether enterprise authentication information is required, the default is true when the front end is called through AGW
    4 : optional bool NeedVolcanoUserName (api.body="need_volcano_user_name") // Do you need a volcano username?

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
    4: optional i64 SpaceID (agw.js_conv="str",api.js_conv="true",api.body="space_id",agw.key="space_id") // This requirement must be passed on

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
    1: required string ContentType (api.header = "Content-Type", agw.source = "header", agw.key = "Content-Type"), // file type
    2: required binary Data (api.raw_body = ""),          // binary data
    255: base.Base Base
}


struct UploadFileOpenResponse {
    1: optional File File (api.body = "data")
    253: required i64 code
    254: required string msg
    255: base.BaseResp BaseResp
}

struct File{
    1: string URI (api.body = "uri"),                  // File URI
    2: i64 Bytes (api.body = "bytes"),               // file bytes
    3: i64 CreatedAt (agw.key = "created_at"),        // Upload timestamp in s
    4: string FileName (api.body = "file_name"),     // file name
    5: string URL (api.body = "url")
}

struct GetBotOnlineInfoReq {
    1 : required i64 bot_id  (api.js_conv="true")           // botId
    2:  optional string connector_id // Keep it first, don't expose it, and don't use the field
    3 : optional string version        // bot version, get the latest version if you don't pass it on.
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

   // Create shortcut instructions
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

    // File related OpenAPI
    UploadFileOpenResponse UploadFileOpen(1: UploadFileOpenRequest request)(api.post = "/v1/files/upload", api.category="file", api.tag="openapi", agw.preserve_base="true")
}
