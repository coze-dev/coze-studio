namespace go ocean.cloud.playground
include "../base.thrift"

struct DouYinCallbackRequest {
    1: required string EventName
    2: required string EventMsgBody

    255: base.Base Base (api.none="true")
}

struct DouYinCallbackResponse {

    253: required i64    code
    254: required string msg
    255: base.BaseResp BaseResp
}


struct GetDouYinAuthCodeRequest {

    255: base.Base Base (api.none="true")
}

struct GetDouYinAuthCodeResponse {
    1: GetDouYinAuthCodeData Data (api.body="data")

    253: required i64    code
    254: required string msg
    255: base.BaseResp BaseResp
}

struct GetDouYinAuthCodeData {
    1: required string QrCodePicBase64 (agw.key="qr_code_pic_base64") // 授权码链接对应的二维码，使用base64转换成图片后扫码
    2: required i64 ExpiresIn (agw.js_conv="str",api.js_conv="true",agw.key="expires_in") // 授权二维码过期时间，秒级时间戳
}

enum DouYinFenShenBindStatus {
    All = 0 //全部状态
    Bind = 1 //绑定状态
    UnBind = 2 //未绑定状态
}

enum DouYinFenShenOrderBy {
    CreateTime  = 0
    UpdateTime  = 1
}
struct DouYinAuthUserListRequest {
    1: required i32        PageIndex (agw.key="page_index") //从1开始
    2: required i32        PageSize  (agw.key="page_size") //最大50
    3: optional DouYinFenShenBindStatus BindStatus (agw.key="bind_status") //绑定状态，默认全部
    4: optional DouYinFenShenOrderBy OrderBy (agw.key="order_by") //排序，默认按照创建时间
    255: base.Base Base (api.none="true")
}

struct DouYinAuthUserListData{
  1: list<DouYinAuthUserInfo> List (agw.key="list")
  2: i64               Total (agw.key="total")
}


struct DouYinAuthUserListResponse {
    1: DouYinAuthUserListData Data (api.body="data")
    253: required i64    code
    254: required string msg
    255: base.BaseResp BaseResp
}

struct DouYinAuthUserInfo {
    1: required string Nickname  (agw.key="nickname") // 抖音昵称
    2: required string Icon      (agw.key="icon") // 抖音头像
    3: required string AppId     (agw.key="app_id") // 分身应用appId
    4: required string CreateTime (agw.key="create_time") //授权时间
    5: required DouYinFenShenBindStatus BindStatus  (agw.key="bind_status") //绑定状态 1绑定 2未绑定
}

struct DebugDouYinRequest {
    1: required i64 BotId (agw.js_conv="str",api.js_conv="true",agw.key="bot_id")

    255: base.Base Base (api.none="true")
}

struct DebugDouYinResponse {
    1: DebugDouYinData Data (api.body="data")

    253: required i64    code
    254: required string msg
    255: base.BaseResp BaseResp
}

struct DebugDouYinData {
    1: required DouYinDeployStatus DeployStatus (agw.key="deploy_status")
    2: optional string DeployQrCode            (agw.key="deploy_qr_code")
}

enum DouYinDeployStatus {
    Deploying = 0 // 部署中
    Successful = 1 // 部署成功
    Failed = 2 // 部署失败
}


struct GetDouyinAvatarInfoRequest {
    1 : string    app_id (agw.source = "header", agw.key = "Open-Platform-App-ID")// 分身应用app_id 从请求的header = Open-Platform-App-ID 中解出
    2 : bool    is_draft // 是否草稿
    3 : binary  body (agw.source = "raw_body")
    4 : string  signature (agw.source = "header", agw.key = "Byte-Signature")
    5 : string  sig_timestamp (agw.source = "header", agw.key = "Byte-Timestamp")
    6 : string  sig_nonce (agw.source = "header", agw.key = "Byte-Nonce-Str")

    255: optional base.Base Base (api.none="true")
}

struct GetDouyinAvatarInfoResponse {
    1 : required GetDouyinAvatarInfoData data


    253: required i64                   code,
    254: required string                msg,
    255: optional base.BaseResp BaseResp (api.none="true"),
}

struct GetDouyinAvatarInfoData{
    1: string bot_info // bot_common.botInfo 的 json string
    2: map<string,string> model_info // 模型映射 key = model_id value = 抖音ep_name
    3: map<string, string> model_desc // 模型能力 key = model_id value = model_manage返回的model_desc结构序列化
}

struct GetDouYinAppAuthTokenRequest {
    1: required i64 AssociateEntityId // 抖音分身关联的对象ID
    2: optional string AppId // 抖音分身ID

    255: base.Base Base (api.none="true")
}

struct GetDouYinAppAuthTokenResponse {
    1: string Token
    2: string AppId

    253: required i64    code
    254: required string msg
    255: base.BaseResp BaseResp
}

