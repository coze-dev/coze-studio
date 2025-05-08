namespace go passport

struct PassportGoapiResponsePackerConnectInfo {
    1: i64 expired_time
    2: i64 modify_time
    3: string profile_image_url
    4: i64 expires_in
    5: string extra
    6: string platform
    7: string platform_screen_name
    8: string platform_uid
    9: string sec_platform_uid
    10: i64 user_id
    11: string access_token // looki add
}

struct PassportWebUsernameRegisterPostRequest {
    6: required string birthday
    7: required string password
    9: required string username
}

struct PassportWebUsernameRegisterPostResponseData {
    1: string description
    2: string email
    3: bool user_verified
    4: list<PassportGoapiResponsePackerConnectInfo> connects
    5: i64 is_kids_mode
    6: string sec_user_id
    7: string session_key
    8: i64 user_device_record_status
    9: i64 error_code
    10: string old_user_id_str
    11: string sec_old_user_id
    12: string captcha
    13: string mobile
    14: i64 need_device_create
    15: i64 new_user
    16: string avatar_url
    18: i64 has_password
    19: string name
    20: i64 need_ttwid_migration
    21: i64 user_id
    23: string desc_url
    24: bool is_only_bind_ins
    25: string screen_name
    26: string user_id_str
    27: i64 country_code
    28: i64 old_user_id
}

struct PassportWebUsernameRegisterPostResponse {
    1: required string message
    2: required PassportWebUsernameRegisterPostResponseData data
}

struct PassportWebEmailRegisterV2PostRequest {
    11: required string password
    16: string type
    23: string email
}

struct PassportWebEmailRegisterV2PostResponseData {
    1: string verify_center_decision_conf
    2: string captcha
    3: string desc_url
    4: required string description
    5: i64 error_code
}

struct PassportWebEmailRegisterV2PostResponse {
    1: required PassportWebEmailRegisterV2PostResponseData data
    2: required string message
}

struct PassportWebEmailRegisterVerifyLoginPostRequest {
    1: required string type
    4: string birthday
    8: required string email
    11: string email_logic_type
    13: required string code
}

struct PassportWebEmailRegisterVerifyLoginPostResponseData {
    1: string captcha
    2: string desc_url
    3: string description
    4: i64 error_code
    5: string verify_center_decision_conf
    6: string email // looki add
    7: string mobile
}

struct PassportWebEmailRegisterVerifyLoginPostResponse {
    1: required PassportWebEmailRegisterVerifyLoginPostResponseData data
    2: required string message
}

struct PassportWebEmailRegisterVerifyRequest {}
struct PassportWebEmailRegisterVerifyResponse {}

struct PassportWebLogoutGetRequest {
    1: required string _next (api.query="next")
}

struct PassportWebLogoutGetResponseData {
    1: required string captcha
    2: required string desc_url
    3: required string description
    4: required i64 error_code
}

struct PassportWebLogoutGetResponse {
    1: required PassportWebLogoutGetResponseData data
    2: required string message
}


struct PassportWebEmailLoginPostRequest {
    6: required string email
    7: required string password
    11: string _t
}

struct PassportWebEmailLoginPostResponseDataMedia {
    1: i64 entry_id
    2: i64 id
    3: string name
    4: bool user_verified
    5: string avatar_url
    6: i64 display_app_ocr_entrance
}

struct PassportWebEmailLoginPostResponseData {
    2: required string description
    3: i64 error_code
    4: i64 country_code
    5: string desc_url
    7: string mobile
    11: bool is_only_bind_ins
    12: string email
    13: string old_user_id_str
    15: string captcha
    18: string screen_name
    22: list<PassportGoapiResponsePackerConnectInfo> connects
    23: i64 user_device_record_status
    26: PassportWebEmailLoginPostResponseDataMedia media
    27: i64 old_user_id
    28: string sec_user_id
    29: string user_id_str
    36: i64 user_id
    39: i64 has_password
    40: i64 need_device_create
    41: i64 new_user
    42: string session_key
    46: string sec_old_user_id
    47: bool user_verified
    48: string avatar_url
    50: i64 is_kids_mode
    55: string name
    56: i64 need_ttwid_migration
}

struct PassportWebEmailLoginPostResponse {
    1: required PassportWebEmailLoginPostResponseData data
    2: required string message
}

struct PassportWebUserLoginPostRequest {
    2: string email
    3: string is_sso
    4: string not_login_ticket
    5: string username
    7: string mobile
    8: required string password
    10: string account
    13: string host
    15: string verify_ticket
}

struct PassportWebUserLoginPostResponseDataVerifyWays {
    1: string mobile
    2: string verify_way
}

struct PassportWebUserLoginPostResponseData {
    1: string mobile
    2: string session_key
    3: string verify_center_decision_conf
    4: bool is_only_bind_ins
    5: list<PassportGoapiResponsePackerConnectInfo> connects
    6: i64 error_code
    7: i64 old_user_id
    8: string sec_info
    9: i64 user_device_record_status
    10: bool user_verified
    12: bool need_show_verify_tab
    13: string sec_old_user_id
    14: string user_id_str
    15: string verify_scene_desc
    16: list<PassportWebUserLoginPostResponseDataVerifyWays> verify_ways
    17: i64 is_kids_mode
    18: string desc_url
    19: bool is_optional_verify
    20: string sec_user_id
    21: string alert_text
    22: string captcha
    24: string email
    25: string screen_name
    26: i64 ban_close_time
    27: string avatar_url
    28: i64 country_code
    29: i64 need_ttwid_migration
    30: string user_nick_name
    31: i64 appealStatus
    32: string old_user_id_str
    33: i64 has_password
    34: string description
    35: string name
    36: i64 need_device_create
    37: i64 new_user
    38: string reason
    39: i64 user_id
    40: string verify_ticket
    41: string default_verify_way
}

struct PassportWebUserLoginPostResponse {
    1: required PassportWebUserLoginPostResponseData data
    2: required string message
}

struct PassportWebEmailPasswordResetGetRequest {
    1: string password
    2: string code
    3: string email
}

struct PassportWebEmailPasswordResetGetResponseData {
    1: required string captcha
    2: required string desc_url
    3: required string description
    4: required i64 error_code
}

struct PassportWebEmailPasswordResetGetResponse {
    1: required PassportWebEmailPasswordResetGetResponseData data
    2: required string message
}

struct PassportAccountInfoV2Request {}
struct PassportAccountInfoV2Response {}

struct UserUpdateAvatarRequest {}
struct UserUpdateAvatarResponse {}

struct UserUpdateProfileRequest {}
struct UserUpdateProfileResponse {}

service PassportService {

//    // 用户名注册
//    PassportWebUsernameRegisterPostResponse PassportWebUsernameRegisterPost(1: PassportWebUsernameRegisterPostRequest req) (api.post="/passport/web/username/register/")
//    PassportWebUsernameRegisterPostResponse PassportWebUsernameRegisterGet(1: PassportWebUsernameRegisterPostRequest req) (api.get="/passport/web/username/register/")

    // 邮箱密码注册
    PassportWebEmailRegisterV2PostResponse PassportWebEmailRegisterV2Post(1: PassportWebEmailRegisterV2PostRequest req) (api.post="/api/passport/web/email/register/v2/")

//    // 邮箱验证码注册并登录
//    PassportWebEmailRegisterVerifyLoginPostResponse PassportWebEmailRegisterVerifyLoginPost(1: PassportWebEmailRegisterVerifyLoginPostRequest req) (api.post="/passport/web/email/register_verify_login/")
//    PassportWebEmailRegisterVerifyResponse PassportWebEmailRegisterVerify(1: PassportWebEmailRegisterVerifyRequest req) (api.post="/passport/web/email/register_verify/")

    // 退出登录
    PassportWebLogoutGetResponse PassportWebLogoutGet(1: PassportWebLogoutGetRequest req) (api.get="/api/passport/web/logout/")

    // 邮箱帐密登录
    PassportWebEmailLoginPostResponse PassportWebEmailLoginPost(1: PassportWebEmailLoginPostRequest req) (api.post="/api/passport/web/email/login/")

//    // 三合一帐密登录
//    PassportWebUserLoginPostResponse PassportWebUserLoginPost(1: PassportWebUserLoginPostRequest req) (api.get="/passport/web/user/login/")

    // 通过邮箱重置密码
    PassportWebEmailPasswordResetGetResponse PassportWebEmailPasswordResetGet(1: PassportWebEmailPasswordResetGetRequest req) (api.get="/api/passport/web/email/password/reset/")

    // 账号信息
    PassportAccountInfoV2Response PassportAccountInfoV2(1: PassportAccountInfoV2Request req) (api.post="/api/passport/account/info/v2/")


    UserUpdateAvatarResponse UserUpdateAvatar(1: UserUpdateAvatarRequest req) (api.post="/apiweb/user/update/upload_avatar/")

    UserUpdateProfileResponse UserUpdateProfile(1: UserUpdateProfileRequest req) (api.post="/apiapi/user/update_profile")
}