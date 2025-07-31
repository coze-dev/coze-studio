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
    1: required string name // PAT name
    2: i64 expire_at // PAT custom expiration time
    3: string duration_day // PAT user enumeration expiration time 1, 30, 60, 90, 180, 365, permanent
    4: string organization_id // organization id
}


struct PersonalAccessToken {
    1: required i64 id (api.js_conv="true")
    2: required string name
    3: required i64 created_at
    4: required i64 updated_at
    5: required i64 last_used_at // -1 means unused
    6: required i64 expire_at // -1 means indefinite
}

struct CreatePersonalAccessTokenAndPermissionResponseData {
    1: required PersonalAccessToken personal_access_token
    2: required string token // PAT token plaintext
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
    5: required i64 last_used_at // -1 means unused
    6: required i64 expire_at // -1 means indefinite
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
    1: required list<PersonalAccessTokenWithCreatorInfo> personal_access_tokens // PAT list
    2: bool has_more // Is there any more data?
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
    2: string name // PAT name
}

struct UpdatePersonalAccessTokenAndPermissionResponse {
    1: required i32 code
    2: required string msg
}




