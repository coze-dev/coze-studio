namespace go resource

include "../base.thrift"
include "resource_common.thrift"

struct LibraryResourceListRequest {
    1  : optional i32          user_filter          , // Whether created by the current user, 0 - unfiltered, 1 - current user
    2  : optional list<resource_common.ResType>    res_type_filter      , // [4,1] 0 means do not filter
    3  : optional string       name                 , // name
    4  : optional resource_common.PublishStatus          publish_status_filter, // Published status, 0 - unfiltered, 1 - unpublished, 2 - published
    5  : required i64          space_id (agw.js_conv="str", api.js_conv="true"), // User's space ID
    7  : optional i32          size                 , // The number of data bars read at one time, the default is 10, and the maximum is 100.
    9  : optional string       cursor               , // Cursor, used for paging, default 0, the first request can not be passed, subsequent requests need to bring the last returned cursor
    10 : optional list<string> search_keys          , // The field used to specify the custom search, do not fill in the default only name matches, eg [] string {name, custom} matches the name and custom fields full_text
    11 : optional bool         is_get_imageflow     , // Do you need to return image review when the res_type_filter is [2 workflow]
    255:          base.Base    Base                 ,
}

struct LibraryResourceListResponse {
    1  :          i64                                code         ,
    2  :          string                             msg          ,
    3  :          list<resource_common.ResourceInfo> resource_list,
    5  : optional string                             cursor       , // Cursor, the cursor for the next request
    6  :          bool                               has_more     , // Is there still data to be pulled?
    255: required base.BaseResp                      BaseResp     ,
}

struct ProjectResourceListRequest {
    1 : required i64 project_id (agw.js_conv="str", api.js_conv="true"), // Project ID
    2 : i64 space_id (agw.js_conv="str", api.js_conv="true"), // User space id
    3 : optional string project_version, // Specify the resources to obtain a version of the project
    255: base.Base Base  ,
}

struct ProjectResourceListResponse {
    1  : i64 code,
    2  : string msg,
    3  : list<resource_common.ProjectResourceGroup> resource_groups,
    255: required base.BaseResp BaseResp,
}

struct ResourceCopyDispatchRequest {
    // Scenario, only supports the operation of a single resource
    1 : resource_common.ResourceCopyScene scene,
    // The resource ID selected by the user to copy/move
    2 : i64 res_id (api.js_conv="true", api.body="res_id")
    3 : resource_common.ResType res_type
    // Project ID
    4 : optional i64 project_id (api.js_conv="true", api.body="project_id")
    5 : optional string res_name
    6 : optional i64 target_space_id (api.js_conv="true", api.body="target_space_id") // Target space id for cross-space copy
    255: base.Base Base,
}

struct ResourceCopyDispatchResponse {
    1  : i64 code,
    2  : string msg,
    3  : optional string task_id, // Copy task ID, used to query task status or cancel or retry tasks
    // The reason why the operation cannot be performed is to return multilingual text
    4  : optional list<resource_common.ResourceCopyFailedReason> failed_reasons,
    255: required base.BaseResp BaseResp,
}


struct ResourceCopyDetailRequest {
    1  : string task_id, // Copy task ID, used to query task status or cancel or retry tasks
    255: base.Base Base,
}

struct ResourceCopyDetailResponse {
    1  : i64 code,
    2  : string msg,
    3  : optional resource_common.ResourceCopyTaskDetail task_detail,
    255: required base.BaseResp BaseResp,
}


struct ResourceCopyRetryRequest {
    1  : string task_id, // Copy task ID, used to query task status or cancel or retry tasks
    255: base.Base Base,
}

struct ResourceCopyRetryResponse {
    1  : i64 code,
    2  : string msg,
    // The reason why the operation cannot be performed is to return multilingual text
    4  : optional list<resource_common.ResourceCopyFailedReason> failed_reasons,
    255: required base.BaseResp BaseResp,
}

struct ResourceCopyCancelRequest {
    1  : string task_id, // Copy task ID, used to query task status or cancel or retry tasks
    255: base.Base Base,
}

struct ResourceCopyCancelResponse {
    1  : i64 code,
    2  : string msg,
    255: required base.BaseResp BaseResp,
}

service ResourceService {
    LibraryResourceListResponse LibraryResourceList(1: LibraryResourceListRequest request)(api.post='/api/plugin_api/library_resource_list', api.category="resource", api.gen_path="resource", agw.preserve_base="true")
    ProjectResourceListResponse ProjectResourceList(1: ProjectResourceListRequest request)(api.post='/api/plugin_api/project_resource_list', api.category="resource", api.gen_path="resource", agw.preserve_base="true")
    // Copy Library resources to projects, copy project resources to libraries, move project resources to libraries, and copy resources within projects
    ResourceCopyDispatchResponse ResourceCopyDispatch (1: ResourceCopyDispatchRequest req) (api.post='/api/plugin_api/resource_copy_dispatch', api.category="resource", api.gen_path="resource", agw.preserve_base="true")
    ResourceCopyDetailResponse ResourceCopyDetail (1: ResourceCopyDetailRequest req) (api.post='/api/plugin_api/resource_copy_detail', api.category="resource", api.gen_path="resource", agw.preserve_base="true")
    ResourceCopyRetryResponse ResourceCopyRetry (1: ResourceCopyRetryRequest req) (api.post='/api/plugin_api/resource_copy_retry', api.category="resource", api.gen_path="resource", agw.preserve_base="true")
    ResourceCopyCancelResponse ResourceCopyCancel (1: ResourceCopyCancelRequest req) (api.post='/api/plugin_api/resource_copy_cancel', api.category="resource", api.gen_path="resource", agw.preserve_base="true")
}