include "../../base.thrift"

struct CreateSubLinkDiscoveryTaskRequest {
    1: string url
    2: i64       creator_id
    255: optional base.Base Base
}

struct CreateSubLinkDiscoveryTaskResponse {
    1: i64 task_id (api.js_conv="true")
    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

struct GetSubLinkDiscoveryTaskRequest {
    1: i64 task_id (api.js_conv="true")
    255: optional base.Base Base
}

struct GetSubLinkDiscoveryTaskResponse {
    1: list<string> urls
    2: SubLinkDiscoveryTaskStatus status
    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

enum SubLinkDiscoveryTaskStatus {
    SUB_LINK_DISCOVERY_TASK_STATUS_UNKNOWN = 0
    SUB_LINK_DISCOVERY_TASK_STATUS_RUNNING = 1
    SUB_LINK_DISCOVERY_TASK_STATUS_SUCCESS = 2
    SUB_LINK_DISCOVERY_TASK_STATUS_ABORTED = 3
    SUB_LINK_DISCOVERY_TASK_STATUS_FINISHED_WITH_ERROR = 4
}

struct AbortSubLinkDiscoveryTaskRequest {
    1: i64 task_id (api.js_conv="true")
    255: optional base.Base Base
}

struct AbortSubLinkDiscoveryTaskResponse {
    253: required i64 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}