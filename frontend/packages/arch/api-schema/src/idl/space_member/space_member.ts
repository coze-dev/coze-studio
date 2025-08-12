/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createAPI } from './../../api/config';
/** 用户基本信息 */
export interface UserInfo {
  user_id: number,
  name: string,
  unique_name: string,
  email: string,
  avatar_url?: string,
  created_at: number,
}
/** 空间成员信息 */
export interface SpaceMember {
  id: number,
  space_id: number,
  user_id: number,
  user_info: UserInfo,
  /** 1=owner, 2=admin, 3=member */
  role_type: number,
  role_name: string,
  created_at: number,
  updated_at: number,
}
/** 获取空间成员列表 - 请求 */
export interface GetSpaceMembersRequest {
  space_id: number,
  page?: number,
  page_size?: number,
  role_type?: number,
}
/** 获取空间成员列表 - 响应 */
export interface GetSpaceMembersResponse {
  code: number,
  msg: string,
  data: SpaceMember[],
  total: number,
  page: number,
  page_size: number,
}
/** 搜索用户 - 请求 */
export interface SearchUsersRequest {
  keyword: string,
  space_id: number,
  limit?: number,
}
/** 搜索用户 - 响应 */
export interface SearchUsersResponse {
  code: number,
  msg: string,
  data: UserInfo[],
}
/** 邀请成员 - 请求 */
export interface InviteMemberRequest {
  space_id: number,
  user_id: number,
  /** 默认为3(member) */
  role_type?: number,
}
/** 邀请成员 - 响应 */
export interface InviteMemberResponse {
  code: number,
  msg: string,
  data: SpaceMember,
}
/** 更新成员角色 - 请求 */
export interface UpdateMemberRoleRequest {
  space_id: number,
  user_id: number,
  role_type: number,
}
/** 更新成员角色 - 响应 */
export interface UpdateMemberRoleResponse {
  code: number,
  msg: string,
  data: SpaceMember,
}
/** 移除成员 - 请求 */
export interface RemoveMemberRequest {
  space_id: number,
  user_id: number,
}
/** 移除成员 - 响应 */
export interface RemoveMemberResponse {
  code: number,
  msg: string,
}
/** 检查用户权限 - 请求 */
export interface CheckMemberPermissionRequest {
  space_id: number,
  user_id: number,
}
/** 检查用户权限 - 响应 */
export interface CheckMemberPermissionResponse {
  code: number,
  msg: string,
  is_member: boolean,
  role_type: number,
  can_invite: boolean,
  can_manage: boolean,
}
/** 获取空间成员列表 */
export const GetSpaceMembers = /*#__PURE__*/createAPI<GetSpaceMembersRequest, GetSpaceMembersResponse>({
  "url": "/api/space/{space_id}/members",
  "method": "GET",
  "name": "GetSpaceMembers",
  "reqType": "GetSpaceMembersRequest",
  "reqMapping": {
    "path": ["space_id"],
    "query": ["page", "page_size", "role_type"]
  },
  "resType": "GetSpaceMembersResponse",
  "schemaRoot": "api://schemas/idl_space_member_space_member",
  "service": "space_member"
});
/** 搜索用户(用于添加成员时搜索) */
export const SearchUsers = /*#__PURE__*/createAPI<SearchUsersRequest, SearchUsersResponse>({
  "url": "/api/space/search-users",
  "method": "GET",
  "name": "SearchUsers",
  "reqType": "SearchUsersRequest",
  "reqMapping": {
    "query": ["keyword", "space_id", "limit"]
  },
  "resType": "SearchUsersResponse",
  "schemaRoot": "api://schemas/idl_space_member_space_member",
  "service": "space_member"
});
/** 邀请成员加入空间 */
export const InviteMember = /*#__PURE__*/createAPI<InviteMemberRequest, InviteMemberResponse>({
  "url": "/api/space/{space_id}/members",
  "method": "POST",
  "name": "InviteMember",
  "reqType": "InviteMemberRequest",
  "reqMapping": {
    "path": ["space_id"],
    "body": ["user_id", "role_type"]
  },
  "resType": "InviteMemberResponse",
  "schemaRoot": "api://schemas/idl_space_member_space_member",
  "service": "space_member"
});
/** 更新成员角色 */
export const UpdateMemberRole = /*#__PURE__*/createAPI<UpdateMemberRoleRequest, UpdateMemberRoleResponse>({
  "url": "/api/space/{space_id}/members/{user_id}/role",
  "method": "PUT",
  "name": "UpdateMemberRole",
  "reqType": "UpdateMemberRoleRequest",
  "reqMapping": {
    "path": ["space_id", "user_id"],
    "body": ["role_type"]
  },
  "resType": "UpdateMemberRoleResponse",
  "schemaRoot": "api://schemas/idl_space_member_space_member",
  "service": "space_member"
});
/** 移除空间成员 */
export const RemoveMember = /*#__PURE__*/createAPI<RemoveMemberRequest, RemoveMemberResponse>({
  "url": "/api/space/{space_id}/members/{user_id}",
  "method": "DELETE",
  "name": "RemoveMember",
  "reqType": "RemoveMemberRequest",
  "reqMapping": {
    "path": ["space_id", "user_id"]
  },
  "resType": "RemoveMemberResponse",
  "schemaRoot": "api://schemas/idl_space_member_space_member",
  "service": "space_member"
});
/** 检查用户在空间中的权限 */
export const CheckMemberPermission = /*#__PURE__*/createAPI<CheckMemberPermissionRequest, CheckMemberPermissionResponse>({
  "url": "/api/space/{space_id}/permission",
  "method": "GET",
  "name": "CheckMemberPermission",
  "reqType": "CheckMemberPermissionRequest",
  "reqMapping": {
    "path": ["space_id"],
    "query": ["user_id"]
  },
  "resType": "CheckMemberPermissionResponse",
  "schemaRoot": "api://schemas/idl_space_member_space_member",
  "service": "space_member"
});