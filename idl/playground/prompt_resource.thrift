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

// Parameter priority from top to bottom
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
    1 : list<i64> ResIDs,    // The maximum number of one page can be transferred, and the implementer can limit the maximum to 100.
    2 : i64 CurrentUserID,   // The current user, the implementation is used to determine the authority
    255: base.Base Base  ,
}

struct MGetDisplayResourceInfoResponse {
    1  : list<DisplayResourceInfo> ResourceList,
    255: required base.BaseResp BaseResp,
}

enum ActionKey{
    Copy    = 1,        //copy
    Delete  = 2,        //delete
    EnableSwitch = 3,   //enable/disable
    Edit = 4,   //edit
    CrossSpaceCopy = 10, //Cross-space copy
}

struct ResourceAction{
    // An operation corresponds to a unique key, and the key is constrained by the resource side
    1 : required ActionKey Key (go.tag = "json:\"key\""),
    //ture = can operate this Action, false = grey out
    2 : required bool Enable (go.tag = "json:\"enable\""),
}

// For display, the implementer provides display information
struct DisplayResourceInfo{
    1 : optional i64    ResID,    // Resource ID
    5 : optional string Desc,// resource description
    6 : optional string Icon,// Resource Icon, full url
    12 : optional i32   BizResStatus, // Resource status, each type of resource defines itself
    13 : optional bool  CollaborationEnable, // Whether to enable multi-person editing
    16 : optional map<string, string> BizExtend,  // Business carry extended information to res_type distinguish, each res_type defined schema and meaning is not the same, need to judge before use res_type
    17 : optional list<ResourceAction> Actions,  // Different types of different operation buttons are agreed upon by the resource implementer and the front end. Return is displayed, if you want to hide a button, do not return;
    18 : optional bool DetailDisable,  // Whether to ban entering the details page
    19 : optional string Name // resource name
    20 : optional ResourcePublishStatus   PublishStatus, // Resource release status, 1 - unpublished, 2 - published
    21 : optional i64 EditTime,  // Last edited, unix timestamp
}

enum ResourcePublishStatus{
    UnPublished    = 1,        //unpublished
    Published    = 2,        //Published
}