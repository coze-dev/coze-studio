include "../base.thrift"
namespace go ocean.cloud.bot_open_api

struct OauthAuthorizationCodeReq {
    1: string code  (api.query='code') ,
    2: string state (api.query='state'),
}

struct OauthAuthorizationCodeResp {
    255: required base.BaseResp BaseResp,
}

service BotOpenApiService {
    OauthAuthorizationCodeResp OauthAuthorizationCode(1: OauthAuthorizationCodeReq request)(api.get='/api/oauth/authorization_code', api.category="oauth", api.gen_path="oauth")
}