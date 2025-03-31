include "../base.thrift"

namespace go prompt

struct PromptResource {
    1: optional i64 ID (api.body = 'id', api.js_conv='true')
    2: optional i64 SpaceID (api.body = 'space_id', api.js_conv='true')
    3: optional string Name (api.body="name")
    4: optional string Description (api.body="description")
    5: optional string PromptText (api.body="prompt_text")
}

struct UpsertPromptResourceRequest {
    1: required PromptResource Prompt (api.body="prompt")

    255: base.Base Base (api.none="true")
}

struct UpsertPromptResourceResponse {
    1: optional ShowPromptResource data (api.body = 'data')
    253: required i32    code (api.body = 'code')
    254: required string msg (api.body = 'msg')
    255: required base.BaseResp BaseResp 
}

struct ShowPromptResource {
    1: i64 ID (api.body="id", api.js_conv='true')
}
