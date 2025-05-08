namespace go ocean.cloud.playground
include "../base.thrift"

struct GetOfficialPromptResourceListRequest {
    1: optional string Keyword (api.body = "keyword")

    255: base.Base Base (api.none="true")
}

struct PromptResource {
    1: optional i64 ID (agw.js_conv="str",api.js_conv="true",api.body="id")
    2: optional i64 SpaceID (agw.js_conv="str",api.js_conv="true",api.body="space_id")
    3: optional string Name (api.body="name")
    4: optional string Description (api.body="description")
    5: optional string PromptText (api.body="prompt_text")
}

struct GetOfficialPromptResourceListResponse {
    1: list<PromptResource> PromptResourceList (api.body="data")

    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct GetPromptResourceInfoRequest {
    1: required i64 PromptResourceID (agw.js_conv="str",api.js_conv="true",api.body="prompt_resource_id")

    255: base.Base Base (api.none="true")
}

struct GetPromptResourceInfoResponse {
    1: optional PromptResource Data (api.body="data")

    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp
}


struct UpsertPromptResourceRequest {
    1: required PromptResource Prompt (api.body="prompt")

    255: base.Base Base (api.none="true")
}

struct UpsertPromptResourceResponse {
    1: optional ShowPromptResource data
    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp
}

struct ShowPromptResource {
    1: i64 ID (agw.js_conv="str",api.js_conv="true",api.body="id")
}

struct DeletePromptResourceRequest {
    1: required i64 PromptResourceID (agw.js_conv="str",api.js_conv="true",api.body="prompt_resource_id")

    255: base.Base Base (api.none="true")
}

struct DeletePromptResourceResponse {

    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp
}

// 参数优先级从上往下
struct SyncPromptResourceToEsRequest {
    1: optional bool SyncAll
    2: optional list<i64> PromptResourceIDList
    3: optional list<i64> SpaceIDList

    255: base.Base        Base
}

struct SyncPromptResourceToEsResponse {

    255: required base.BaseResp BaseResp
}


struct MGetDisplayResourceInfoRequest {
    1 : list<i64> ResIDs,    // 最大传一页的数量，实现方可以限制最大100个
    2 : i64 CurrentUserID,   // 当前的用户，实现方用于判断权限
    255: base.Base Base  ,
}

struct MGetDisplayResourceInfoResponse {
    1  : list<DisplayResourceInfo> ResourceList,
    255: required base.BaseResp BaseResp,
}

enum ActionKey{
    Copy    = 1,        //复制
    Delete  = 2,        //删除
    EnableSwitch = 3,   //启用/禁用
    Edit = 4,   //编辑
    CrossSpaceCopy = 10, // 跨空间复制
}

struct ResourceAction{
    // 一个操作对应一个唯一的key，key由资源侧约束
    1 : required ActionKey Key (go.tag = "json:\"key\""),
    //ture=可以操作该Action，false=置灰
    2 : required bool Enable (go.tag = "json:\"enable\""),
}

// 展示用，实现方提供展示信息
struct DisplayResourceInfo{
    1 : optional i64    ResID,    // 资源id
    5 : optional string Desc,// 资源描述
    6 : optional string Icon,// 资源Icon，完整url
    12 : optional i32   BizResStatus, // 资源状态，各类型资源自身定义
    13 : optional bool  CollaborationEnable, // 是否开启多人编辑
    16 : optional map<string, string> BizExtend,  // 业务携带的扩展信息，以res_type区分，每个res_type定义的schema和含义不一样，使用前需要判断res_type
    17 : optional list<ResourceAction> Actions,  // 不同类型的不同操作按钮，由资源实现方和前端约定。返回则展示，要隐藏某个按钮，则不要返回；
    18 : optional bool DetailDisable,  // 是否禁止进详情页
    19 : optional string Name // 资源名称
    20 : optional ResourcePublishStatus   PublishStatus, // 资源发布状态，1-未发布，2-已发布
    21 : optional i64 EditTime,  // 最近编辑时间, unix秒级时间戳
}

enum ResourcePublishStatus{
    UnPublished    = 1,        //未发布
    Published    = 2,        //已发布
}