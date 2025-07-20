include "../base.thrift"
include  "common_struct/task_struct.thrift"

struct DraftProjectInnerTaskListRequest {
    1 : required i64 project_id (agw.js_conv="str", api.js_conv="true")

    255: optional base.Base Base (api.none="true")
}

struct DraftProjectInnerTaskListResponse {
    1: DraftProjectInnerTaskListData data

    253: required i64 code,
    254: required string msg,
    255: optional base.BaseResp BaseResp (api.none="true")
}

struct DraftProjectInnerTaskListData {
    1: list<task_struct.ProjectInnerTaskInfo> task_list
}