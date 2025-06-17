namespace go resource

include "../base.thrift"
include "resource_common.thrift"

struct LibraryResourceListRequest {
    1  : optional i32          user_filter          , // 是否由当前用户创建，0-不筛选，1-当前用户
    2  : optional list<resource_common.ResType>    res_type_filter      , // [4,1]   0代表不筛选
    3  : optional string       name                 , // 名称
    4  : optional resource_common.PublishStatus          publish_status_filter, // 发布状态，0-不筛选，1-未发布，2-已发布
    5  : required i64          space_id (agw.js_conv="str", api.js_conv="true"), // 用户所在空间ID
    7  : optional i32          size                 , // 一次读取的数据条数，默认10，最大100.
    9  : optional string       cursor               , // 游标，用于分页，默认0，第一次请求可以不传，后续请求需要带上上次返回的cursor
    10 : optional list<string> search_keys          , // 用来指定自定义搜索的字段 不填默认只name匹配，eg []string{name,自定} 匹配name和自定义字段full_text
    11 : optional bool         is_get_imageflow     , // 当res_type_filter为[2 workflow]时，是否需要返回图片流
    255:          base.Base    Base                 ,
}

struct LibraryResourceListResponse {
    1  :          i64                                code         ,
    2  :          string                             msg          ,
    3  :          list<resource_common.ResourceInfo> resource_list,
    5  : optional string                             cursor       , // 游标，用于下次请求的cursor
    6  :          bool                               has_more     , // 是否还有数据待拉取
    255: required base.BaseResp                      BaseResp     ,
}

struct ProjectResourceListRequest {
    1 : required i64 project_id (agw.js_conv="str", api.js_conv="true"), // 项目ID
    2 : i64 space_id (agw.js_conv="str", api.js_conv="true"), // 用户所在space id
    3 : optional string project_version, // 指定获取某个版本的project的资源
    255: base.Base Base  ,
}

struct ProjectResourceListResponse {
    1  : i64 code,
    2  : string msg,
    3  : list<resource_common.ProjectResourceGroup> resource_groups,
    255: required base.BaseResp BaseResp,
}

struct ResourceCopyDispatchRequest {
    // 场景，只支持单资源的操作
    1 : resource_common.ResourceCopyScene scene,
    // 被用户选择复制/移动的资源ID
    2 : i64 res_id (api.js_conv="true", api.body="res_id")
    3 : resource_common.ResType res_type
    // 所在项目ID
    4 : optional i64 project_id (api.js_conv="true", api.body="project_id")
    5 : optional string res_name
    6 : optional i64 target_space_id (api.js_conv="true", api.body="target_space_id") // 跨空间复制的目标space id
    255: base.Base Base,
}

struct ResourceCopyDispatchResponse {
    1  : i64 code,
    2  : string msg,
    3  : optional string task_id, // 复制任务id, 用于查询任务状态或取消、重试任务
    // 不可以进行操作的原因，返回多语言文本
    4  : optional list<resource_common.ResourceCopyFailedReason> failed_reasons,
    255: required base.BaseResp BaseResp,
}


struct ResourceCopyDetailRequest {
    1  : string task_id, // 复制任务id, 用于查询任务状态或取消、重试任务
    255: base.Base Base,
}

struct ResourceCopyDetailResponse {
    1  : i64 code,
    2  : string msg,
    3  : optional resource_common.ResourceCopyTaskDetail task_detail,
    255: required base.BaseResp BaseResp,
}


struct ResourceCopyRetryRequest {
    1  : string task_id, // 复制任务id, 用于查询任务状态或取消、重试任务
    255: base.Base Base,
}

struct ResourceCopyRetryResponse {
    1  : i64 code,
    2  : string msg,
    // 不可以进行操作的原因，返回多语言文本
    4  : optional list<resource_common.ResourceCopyFailedReason> failed_reasons,
    255: required base.BaseResp BaseResp,
}

struct ResourceCopyCancelRequest {
    1  : string task_id, // 复制任务id, 用于查询任务状态或取消、重试任务
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
    // 复制Library资源到项目、复制项目资源到Library、移动项目资源到Library、项目内单复制资源
    ResourceCopyDispatchResponse ResourceCopyDispatch (1: ResourceCopyDispatchRequest req) (api.post='/api/plugin_api/resource_copy_dispatch', api.category="resource", api.gen_path="resource", agw.preserve_base="true")
    ResourceCopyDetailResponse ResourceCopyDetail (1: ResourceCopyDetailRequest req) (api.post='/api/plugin_api/resource_copy_detail', api.category="resource", api.gen_path="resource", agw.preserve_base="true")
    ResourceCopyRetryResponse ResourceCopyRetry (1: ResourceCopyRetryRequest req) (api.post='/api/plugin_api/resource_copy_retry', api.category="resource", api.gen_path="resource", agw.preserve_base="true")
    ResourceCopyCancelResponse ResourceCopyCancel (1: ResourceCopyCancelRequest req) (api.post='/api/plugin_api/resource_copy_cancel', api.category="resource", api.gen_path="resource", agw.preserve_base="true")
}