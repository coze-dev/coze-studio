include "../base.thrift"

namespace go space

// 空间类型
enum SpaceType {
    Personal = 1 // 个人空间
    Team     = 2 // 团队空间
}

// 空间状态
enum SpaceStatus {
    Active   = 1 // 活跃
    Inactive = 2 // 不活跃
    Archived = 3 // 已归档
}

// 成员角色类型
enum MemberRoleType {
    Owner  = 1 // 拥有者
    Admin  = 2 // 管理员
    Member = 3 // 普通成员
}

// 基础空间信息
struct SpaceInfo {
    1: required i64 space_id (api.js_conv='true',agw.js_conv="str")
    2: required string name
    3: optional string description
    4: optional string icon_url
    5: required SpaceType space_type
    6: required SpaceStatus status
    7: required i64 owner_id (api.js_conv='true',agw.js_conv="str")
    8: required i64 creator_id (api.js_conv='true',agw.js_conv="str")
    9: required i64 created_at
    10: optional i64 updated_at
    11: optional i32 member_count
    12: optional MemberRoleType current_user_role
}

// 创建空间请求
struct CreateSpaceRequest {
    1: required string name (api.body="name")
    2: optional string description (api.body="description")
    3: optional string icon_url (api.body="icon_url")
    4: required SpaceType space_type (api.body="space_type")
    
    255: base.Base Base (api.none="true")
}

struct CreateSpaceResponse {
    253: required i32 code
    254: required string msg
    1: required SpaceInfo data
    255: required base.BaseResp BaseResp (api.none="true")
}

// 获取空间列表请求
struct GetSpaceListRequest {
    1: optional i32 page (api.query="page") // 页码，默认1
    2: optional i32 page_size (api.query="page_size") // 页大小，默认20
    3: optional SpaceType space_type (api.query="space_type") // 空间类型过滤
    4: optional SpaceStatus status (api.query="status") // 状态过滤
    5: optional string search_keyword (api.query="search_keyword") // 搜索关键词
    
    255: base.Base Base (api.none="true")
}

struct GetSpaceListResponse {
    253: required i32 code
    254: required string msg
    1: required list<SpaceInfo> data
    2: required i32 total
    3: required i32 page
    4: required i32 page_size
    255: required base.BaseResp BaseResp (api.none="true")
}

// 获取空间详情请求
struct GetSpaceDetailRequest {
    1: required i64 space_id (api.path="space_id", api.js_conv='true',agw.js_conv="str")
    
    255: base.Base Base (api.none="true")
}

struct GetSpaceDetailResponse {
    253: required i32 code
    254: required string msg
    1: required SpaceInfo data
    255: required base.BaseResp BaseResp (api.none="true")
}

// 更新空间请求
struct UpdateSpaceRequest {
    1: required i64 space_id (api.path="space_id", api.js_conv='true',agw.js_conv="str")
    2: optional string name (api.body="name")
    3: optional string description (api.body="description")
    4: optional string icon_url (api.body="icon_url")
    5: optional SpaceStatus status (api.body="status")
    
    255: base.Base Base (api.none="true")
}

struct UpdateSpaceResponse {
    253: required i32 code
    254: required string msg
    1: required SpaceInfo data
    255: required base.BaseResp BaseResp (api.none="true")
}

// 删除空间请求
struct DeleteSpaceRequest {
    1: required i64 space_id (api.path="space_id", api.js_conv='true',agw.js_conv="str")
    
    255: base.Base Base (api.none="true")
}

struct DeleteSpaceResponse {
    253: required i32 code
    254: required string msg
    255: required base.BaseResp BaseResp (api.none="true")
}

// 成员信息
struct SpaceMemberInfo {
    1: required i64 user_id (api.js_conv='true',agw.js_conv="str")
    2: required string username
    3: optional string nickname
    4: optional string avatar_url
    5: required MemberRoleType role
    6: required i64 joined_at
    7: optional i64 last_active_at
}

// 获取空间成员列表请求
struct GetSpaceMembersRequest {
    1: required i64 space_id (api.path="space_id", api.js_conv='true',agw.js_conv="str")
    2: optional i32 page (api.query="page") // 页码，默认1
    3: optional i32 page_size (api.query="page_size") // 页大小，默认20
    4: optional MemberRoleType role (api.query="role") // 角色过滤
    5: optional string search_keyword (api.query="search_keyword") // 搜索关键词
    
    255: base.Base Base (api.none="true")
}

struct GetSpaceMembersResponse {
    253: required i32 code
    254: required string msg
    1: required list<SpaceMemberInfo> data
    2: required i32 total
    3: required i32 page
    4: required i32 page_size
    255: required base.BaseResp BaseResp (api.none="true")
}

// 邀请成员请求
struct InviteMemberRequest {
    1: required i64 space_id (api.path="space_id", api.js_conv='true',agw.js_conv="str")
    2: required list<string> user_ids (api.body="user_ids")
    3: required MemberRoleType role (api.body="role")
    
    255: base.Base Base (api.none="true")
}

struct InviteMemberResponse {
    253: required i32 code
    254: required string msg
    1: required list<SpaceMemberInfo> data // 成功邀请的成员列表
    255: required base.BaseResp BaseResp (api.none="true")
}

// 更新成员角色请求
struct UpdateMemberRoleRequest {
    1: required i64 space_id (api.path="space_id", api.js_conv='true',agw.js_conv="str")
    2: required i64 user_id (api.path="user_id", api.js_conv='true',agw.js_conv="str")
    3: required MemberRoleType role (api.body="role")
    
    255: base.Base Base (api.none="true")
}

struct UpdateMemberRoleResponse {
    253: required i32 code
    254: required string msg
    1: required SpaceMemberInfo data
    255: required base.BaseResp BaseResp (api.none="true")
}

// 移除成员请求
struct RemoveMemberRequest {
    1: required i64 space_id (api.path="space_id", api.js_conv='true',agw.js_conv="str")
    2: required i64 user_id (api.path="user_id", api.js_conv='true',agw.js_conv="str")
    
    255: base.Base Base (api.none="true")
}

struct RemoveMemberResponse {
    253: required i32 code
    254: required string msg
    255: required base.BaseResp BaseResp (api.none="true")
}

// 用户信息
struct UserInfo {
    1: required i64 user_id (api.js_conv='true',agw.js_conv="str")
    2: required string name
    3: required string unique_name
    4: optional string email
    5: optional string avatar_url
    6: required i64 created_at
}

// 搜索用户请求
struct SearchUsersRequest {
    1: required string keyword (api.query="keyword") // 搜索关键词
    2: optional i64 exclude_space_id (api.query="exclude_space_id", api.js_conv='true',agw.js_conv="str") // 排除已在该空间的用户
    3: optional i32 limit (api.query="limit") // 限制结果数量，默认10
    
    255: base.Base Base (api.none="true")
}

struct SearchUsersResponse {
    253: required i32 code
    254: required string msg
    1: required list<UserInfo> data
    255: required base.BaseResp BaseResp (api.none="true")
}

// 检查成员权限请求
struct CheckMemberPermissionRequest {
    1: required i64 space_id (api.path="space_id", api.js_conv='true',agw.js_conv="str")
    
    255: base.Base Base (api.none="true")
}

struct MemberPermission {
    1: required bool can_invite // 可以邀请成员
    2: required bool can_manage // 可以管理成员
    3: required MemberRoleType role_type // 当前用户角色
}

struct CheckMemberPermissionResponse {
    253: required i32 code
    254: required string msg
    1: required MemberPermission data
    255: required base.BaseResp BaseResp (api.none="true")
}

// 空间管理服务
service SpaceManagementService {
    // 空间CRUD操作
    CreateSpaceResponse CreateSpace(1: CreateSpaceRequest req) (api.post="/api/space/create")
    GetSpaceListResponse GetSpaceList(1: GetSpaceListRequest req) (api.get="/api/space/list") 
    GetSpaceDetailResponse GetSpaceDetail(1: GetSpaceDetailRequest req) (api.get="/api/space/{space_id}")
    UpdateSpaceResponse UpdateSpace(1: UpdateSpaceRequest req) (api.put="/api/space/{space_id}")
    DeleteSpaceResponse DeleteSpace(1: DeleteSpaceRequest req) (api.delete="/api/space/{space_id}")
    
    // 空间成员管理
    GetSpaceMembersResponse GetSpaceMembers(1: GetSpaceMembersRequest req) (api.get="/api/space/{space_id}/members")
    InviteMemberResponse InviteMember(1: InviteMemberRequest req) (api.post="/api/space/{space_id}/members")
    UpdateMemberRoleResponse UpdateMemberRole(1: UpdateMemberRoleRequest req) (api.put="/api/space/{space_id}/members/{user_id}")
    RemoveMemberResponse RemoveMember(1: RemoveMemberRequest req) (api.delete="/api/space/{space_id}/members/{user_id}")
    
    // 用户搜索和权限
    SearchUsersResponse SearchUsers(1: SearchUsersRequest req) (api.get="/api/space/search-users")
    CheckMemberPermissionResponse CheckMemberPermission(1: CheckMemberPermissionRequest req) (api.get="/api/space/{space_id}/permission")
}