namespace go space_member

// 用户基本信息
struct UserInfo {
    1: required i64 user_id
    2: required string name
    3: required string unique_name
    4: required string email
    5: optional string avatar_url
    6: required i64 created_at
}

// 空间成员信息
struct SpaceMember {
    1: required i64 id
    2: required i64 space_id
    3: required i64 user_id
    4: required UserInfo user_info
    5: required i32 role_type  // 1=owner, 2=admin, 3=member
    6: required string role_name
    7: required i64 created_at
    8: required i64 updated_at
}

// 获取空间成员列表 - 请求
struct GetSpaceMembersRequest {
    1: required i64 space_id (api.path="space_id")
    2: optional i32 page (api.query="page")
    3: optional i32 page_size (api.query="page_size")
    4: optional i32 role_type (api.query="role_type")
}

// 获取空间成员列表 - 响应
struct GetSpaceMembersResponse {
    253: required i32 code
    254: required string msg
    1: required list<SpaceMember> data
    2: required i32 total
    3: required i32 page
    4: required i32 page_size
}

// 搜索用户 - 请求
struct SearchUsersRequest {
    1: required string keyword (api.query="keyword")
    2: required i64 space_id (api.query="space_id")
    3: optional i32 limit (api.query="limit")
}

// 搜索用户 - 响应
struct SearchUsersResponse {
    253: required i32 code
    254: required string msg
    1: required list<UserInfo> data
}

// 邀请成员 - 请求
struct InviteMemberRequest {
    1: required i64 space_id (api.path="space_id")
    2: required i64 user_id (api.body="user_id")
    3: optional i32 role_type (api.body="role_type")  // 默认为3(member)
}

// 邀请成员 - 响应
struct InviteMemberResponse {
    253: required i32 code
    254: required string msg
    1: required SpaceMember data
}

// 更新成员角色 - 请求
struct UpdateMemberRoleRequest {
    1: required i64 space_id (api.path="space_id")
    2: required i64 user_id (api.path="user_id")
    3: required i32 role_type (api.body="role_type")
}

// 更新成员角色 - 响应
struct UpdateMemberRoleResponse {
    253: required i32 code
    254: required string msg
    1: required SpaceMember data
}

// 移除成员 - 请求
struct RemoveMemberRequest {
    1: required i64 space_id (api.path="space_id")
    2: required i64 user_id (api.path="user_id")
}

// 移除成员 - 响应
struct RemoveMemberResponse {
    253: required i32 code
    254: required string msg
}

// 检查用户权限 - 请求
struct CheckMemberPermissionRequest {
    1: required i64 space_id (api.path="space_id")
    2: required i64 user_id (api.query="user_id")
}

// 检查用户权限 - 响应
struct CheckMemberPermissionResponse {
    253: required i32 code
    254: required string msg
    1: required bool is_member
    2: required i32 role_type
    3: required bool can_invite
    4: required bool can_manage
}

// 服务定义
service SpaceMemberService {
    // 获取空间成员列表
    GetSpaceMembersResponse GetSpaceMembers(1: GetSpaceMembersRequest req) (api.get="/api/space/{space_id}/members")
    
    // 搜索用户(用于添加成员时搜索)
    SearchUsersResponse SearchUsers(1: SearchUsersRequest req) (api.get="/api/space/search-users")
    
    // 邀请成员加入空间
    InviteMemberResponse InviteMember(1: InviteMemberRequest req) (api.post="/api/space/{space_id}/members")
    
    // 更新成员角色
    UpdateMemberRoleResponse UpdateMemberRole(1: UpdateMemberRoleRequest req) (api.put="/api/space/{space_id}/members/{user_id}/role")
    
    // 移除空间成员
    RemoveMemberResponse RemoveMember(1: RemoveMemberRequest req) (api.delete="/api/space/{space_id}/members/{user_id}")
    
    // 检查用户在空间中的权限
    CheckMemberPermissionResponse CheckMemberPermission(1: CheckMemberPermissionRequest req) (api.get="/api/space/{space_id}/permission")
}