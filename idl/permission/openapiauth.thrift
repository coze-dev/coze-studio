include "../base.thrift"

namespace go permission.openapiauth

typedef string PatSearchOption
const PatSearchOption all = "all"
const PatSearchOption others = "others"
const PatSearchOption owned = "owned"


typedef string UserStatus
const UserStatus active = "active"
const UserStatus deactivated = "deactivated"
const UserStatus offboarded = "offboarded"

struct CreatePersonalAccessTokenAndPermissionRequest {
    1: required string name // PAT名称
    2: i64 expire_at // PAT自定义过期时间
    3: string duration_day // PAT用户枚举过期时间 1、30、60、90、180、365、permanent
    4: string organization_id // organization id
}


struct PersonalAccessToken {
    1: required i64 id (api.js_conv="true")
    2: required string name
    3: required i64 created_at
    4: required i64 updated_at
    5: required i64 last_used_at // -1 表示未使用
    6: required i64 expire_at // -1 表示无限期
}

struct CreatePersonalAccessTokenAndPermissionResponseData {
    1: required PersonalAccessToken personal_access_token
    2: required string token // PAT token 明文
}

struct CreatePersonalAccessTokenAndPermissionResponse {
    1: required CreatePersonalAccessTokenAndPermissionResponseData data
    2: required i32 code
    3: required string msg
}


struct ListPersonalAccessTokensRequest {
    1: optional string organization_id (api.query="organization_id") // organization id
    2: optional i64 page (api.query="page") // zero-indexed
    3: optional i64 size (api.query="size") // page size
    4: optional PatSearchOption search_option (api.query="search_option") // search option
}


struct PersonalAccessTokenWithCreatorInfo {
    1: required i64 id (api.js_conv="true")
    2: required string name
    3: required i64 created_at
    4: required i64 updated_at
    5: required i64 last_used_at // -1 表示未使用
    6: required i64 expire_at // -1 表示无限期
    7: string creator_name
    8: string creator_unique_name
    9: string creator_avatar_url
    10: string creator_icon_url
    11: bool locked
    12: UserStatus creator_status
}

struct ListPersonalAccessTokensResponse {
    1: required ListPersonalAccessTokensResponseData data
    2: required i32 code
    3: required string msg
}

struct ListPersonalAccessTokensResponseData {
    1: required list<PersonalAccessTokenWithCreatorInfo> personal_access_tokens // PAT 列表
    2: bool has_more // 是否还有更多数据
}


struct DeletePersonalAccessTokenAndPermissionRequest {
    1: required i64 id  (api.js_conv="true")// PAT Id
}

struct DeletePersonalAccessTokenAndPermissionResponse {
    1: required i32 code
    2: required string msg
}

struct GetPersonalAccessTokenAndPermissionRequest {
    1: required i64 id (api.query="id", api.js_conv="true") // PAT Id
}

struct GetPersonalAccessTokenAndPermissionResponseData {
    1: required PersonalAccessToken personal_access_token
}

struct GetPersonalAccessTokenAndPermissionResponse {
    1: required GetPersonalAccessTokenAndPermissionResponseData data
    2: required i32 code
    3: required string msg
}

struct UpdatePersonalAccessTokenAndPermissionRequest {
    1: required i64 id (api.js_conv="true") // PAT Id
    2: string name // PAT 名称
}

struct UpdatePersonalAccessTokenAndPermissionResponse {
    1: required i32 code
    2: required string msg
}




