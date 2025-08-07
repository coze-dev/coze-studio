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
    1: string URI (api.body = "uri"),                  // 文件URI
    2: i64 Bytes (api.body = "bytes"),               // 文件字节数
    3: i64 CreatedAt (agw.key = "created_at"),        // 上传时间戳，单位s
    4: string FileName (api.body = "file_name"),     // 文件名
    5: string URL (api.body = "url")
}

// resp
struct GetBotOnlineInfoResp {
    1: required i32 code
    2: required string msg
    3: required bot_common.OpenAPIBotInfo data
}

service BotOpenApiService {
    OauthAuthorizationCodeResp OauthAuthorizationCode(1: OauthAuthorizationCodeReq request)(api.get='/api/oauth/authorization_code', api.category="oauth", api.gen_path="oauth")

    //openapi
    GetBotOnlineInfoResp GetBotOnlineInfo(1: GetBotOnlineInfoReq request)(api.get='/v1/bot/get_online_info', api.category="bot", api.tag="openapi", api.gen_path="personal_api")
    // File related OpenAPI
    UploadFileOpenResponse UploadFileOpen(1: UploadFileOpenRequest request)(api.post = "/v1/files/upload", api.category="file", api.tag="openapi", agw.preserve_base="true")
}