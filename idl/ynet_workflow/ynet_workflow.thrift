namespace go ynet_workflow

include "../base.thrift"

// Version History API - 版本历史相关结构

struct VersionHistoryListRequest {
    1: required string space_id      (api.body="space_id", go.tag="json:\"space_id\"")
    2: required string workflow_id   (api.body="workflow_id", go.tag="json:\"workflow_id\"")
    3: required i32 type             (api.body="type", go.tag="json:\"type\"")
    4: required i32 limit            (api.body="limit", go.tag="json:\"limit\"")
    5: optional string last_commit_id (api.body="last_commit_id", go.tag="json:\"last_commit_id\"")
    255: optional base.Base Base
}

struct UserInfo {
    1: required string user_name     (go.tag="json:\"user_name\"")
    2: optional string user_avatar   (go.tag="json:\"user_avatar\"")
}

struct VersionMetaInfo {
    1: required string commit_id     (go.tag="json:\"commit_id\"")
    2: required string version       (go.tag="json:\"version\"")
    3: required i64 created_at       (go.tag="json:\"created_at\"")
    4: required string creator_name  (go.tag="json:\"creator_name\"")
    5: optional string description   (go.tag="json:\"description\"")
    6: optional bool offline         (go.tag="json:\"offline\"")
    7: optional i64 create_time      (go.tag="json:\"create_time\"")
    8: optional string desc          (go.tag="json:\"desc\"")
    9: optional i32 type             (go.tag="json:\"type\"")
    10: optional UserInfo user       (go.tag="json:\"user\"")
    11: optional string submit_commit_id (go.tag="json:\"submit_commit_id\"")
    12: optional string env           (go.tag="json:\"env\"")
    13: optional i64 update_time      (go.tag="json:\"update_time\"")
}

struct VersionHistoryListResponse {
    1: required list<VersionMetaInfo> version_list (go.tag="json:\"version_list\"")
    2: required bool has_more        (go.tag="json:\"has_more\"")
    3: optional string cursor        (go.tag="json:\"cursor\"")
    253: required i32 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

// Revert Draft API - 版本回滚相关结构
struct RevertDraftRequest {
    1: required string space_id      (api.body="space_id", go.tag="json:\"space_id\"")
    2: required string workflow_id   (api.body="workflow_id", go.tag="json:\"workflow_id\"")
    3: required string commit_id     (api.body="commit_id", go.tag="json:\"commit_id\"")
    4: required i32 type             (api.body="type", go.tag="json:\"type\"")
    5: optional string env           (api.body="env", go.tag="json:\"env\"")
    255: optional base.Base Base
}

struct RevertDraftResponse {
    1: required bool success         (go.tag="json:\"success\"")
    2: optional string message       (go.tag="json:\"message\"")
    253: required i32 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

// Get Version Schema API - 版本历史查看相关结构
struct GetVersionSchemaRequest {
    1: required string space_id      (api.body="space_id", go.tag="json:\"space_id\"")
    2: required string workflow_id   (api.body="workflow_id", go.tag="json:\"workflow_id\"")
    3: required string commit_id     (api.body="commit_id", go.tag="json:\"commit_id\"")
    4: required i32 type             (api.body="type", go.tag="json:\"type\"") // 1: 草稿, 2: 发布版本
    5: optional string env           (api.body="env", go.tag="json:\"env\"")
    255: optional base.Base Base
}

struct GetVersionSchemaResponse {
    1: required string schema        (go.tag="json:\"schema\"")
    2: required string name          (go.tag="json:\"name\"")
    3: optional string description   (go.tag="json:\"description\"")
    4: optional string icon_url      (go.tag="json:\"icon_url\"")
    5: required string version       (go.tag="json:\"version\"")
    6: required string commit_id     (go.tag="json:\"commit_id\"")
    7: required i64 created_at       (go.tag="json:\"created_at\"")
    8: optional string input_params  (go.tag="json:\"input_params\"")
    9: optional string output_params (go.tag="json:\"output_params\"")
    10: required i32 flow_mode       (go.tag="json:\"flow_mode\"")
    253: required i32 code
    254: required string msg
    255: optional base.BaseResp BaseResp
}

service YnetWorkflowService {
    // Version History API
    VersionHistoryListResponse VersionHistoryList(1: VersionHistoryListRequest request) (
        api.post="/api/workflow_api/version_list",
        api.category="ynet_workflow",
        api.gen_path="ynet_workflow"
    )
    
    // Revert Draft API
    RevertDraftResponse RevertDraft(1: RevertDraftRequest request) (
        api.post="/api/workflow_api/revert_draft",
        api.category="ynet_workflow",
        api.gen_path="ynet_workflow"
    )
    
    // Get Version Schema API
    GetVersionSchemaResponse GetVersionSchema(1: GetVersionSchemaRequest request) (
        api.post="/api/workflow_api/get_version_schema",
        api.category="ynet_workflow",
        api.gen_path="ynet_workflow"
    )
}