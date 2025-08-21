namespace go app.bot_open_api
include "../base.thrift"
include "bot_common.thrift"

struct OauthAuthorizationCodeReq {
    1: string code  (api.query='code') ,
    2: string state (api.query='state'),
}

struct OauthAuthorizationCodeResp {
    255: required base.BaseResp BaseResp,
}

struct GetBotOnlineInfoReq {
    1 : required i64 bot_id  (api.js_conv="true")           // botId
    2:  optional string connector_id // Keep it first, don't expose it, and don't use the field
    3 : optional string version        // bot version, get the latest version if you don't pass it on.
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
    1: string URI (api.body = "uri"),                  // URI
    2: i64 Bytes (api.body = "bytes"),               // bytes
    3: i64 CreatedAt (agw.key = "created_at"),        // create at
    4: string FileName (api.body = "file_name"),     // file name
    5: string URL (api.body = "url")
    6: string ID (api.body = "id")
}

// resp
struct GetBotOnlineInfoResp {
    1: required i32 code
    2: required string msg
    3: required bot_common.OpenAPIBotInfo data
}

struct WorkspacePermission {
    1: list<string> workspace_id_list
    2: list<string> permission_list
}

struct AccountPermission {
    1: list<string> permission_list
}

struct Scope {
    1: WorkspacePermission workspace_permission
    2: AccountPermission account_permission
}

struct ImpersonateCozeUserRequest {
    1: i64 duration_seconds
    2: Scope scope
}

struct ImpersonateCozeUserResponse {
    1: required i32 code
    2: required string msg
    3: ImpersonateCozeUserResponseData data
}

struct ImpersonateCozeUserResponseData {
    1: required string access_token
    2: required i64 expires_in
    3: required string token_type
}

struct OpenGetBotInfoRequest {
    1:     i64                        bot_id                    (api.js_conv="true", agw.js_conv="str", agw.cli_conv="str",api.path = "bot_id")
    2:     optional bool              is_published              (api.query = "is_published")
    3:     optional i64             connector_id                 (api.query = "connector_id", api.js_conv="true")
    255:   optional base.Base         Base (api.none="true")
}

struct OpenGetBotInfoResponse {
    1: bot_common.OpenAPIBotInfo           data

    253: i64 code
    254: string msg
    255: optional base.BaseResp BaseResp
}

service BotOpenApiService {
    OauthAuthorizationCodeResp OauthAuthorizationCode(1: OauthAuthorizationCodeReq request)(api.get='/api/oauth/authorization_code', api.category="oauth", api.gen_path="oauth")

    //openapi
    GetBotOnlineInfoResp GetBotOnlineInfo(1: GetBotOnlineInfoReq request)(api.get='/v1/bot/get_online_info', api.category="bot", api.tag="openapi", api.gen_path="personal_api")
    
    OpenGetBotInfoResponse OpenGetBotInfo(1: OpenGetBotInfoRequest request)(api.get='/v1/bots/:bot_id', api.category="bot", api.tag="openapi", agw.preserve_base="true")
    
    ImpersonateCozeUserResponse ImpersonateCozeUser (1: ImpersonateCozeUserRequest request) (api.post="/api/permission_api/coze_web_app/impersonate_coze_user")
    
    // File related OpenAPI
    UploadFileOpenResponse UploadFileOpen(1: UploadFileOpenRequest request)(api.post = "/v1/files/upload", api.category="file", api.tag="openapi", agw.preserve_base="true")
}