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

import * as base from './../base';
export { base };
import { createAPI } from './../../api/config';
/** 空间类型 */
export enum SpaceType {
  /** 个人空间 */
  Personal = 1,
  /** 团队空间 */
  Team = 2,
}
/** 空间状态 */
export enum SpaceStatus {
  /** 活跃 */
  Active = 1,
  /** 不活跃 */
  Inactive = 2,
  /** 已归档 */
  Archived = 3,
}
/** 成员角色类型 */
export enum MemberRoleType {
  /** 拥有者 */
  Owner = 1,
  /** 管理员 */
  Admin = 2,
  /** 普通成员 */
  Member = 3,
}
/** 基础空间信息 */
export interface SpaceInfo {
  space_id: string,
  name: string,
  description?: string,
  icon_url?: string,
  space_type: SpaceType,
  status: SpaceStatus,
  owner_id: string,
  creator_id: string,
  created_at: number,
  updated_at?: number,
  member_count?: number,
  current_user_role?: MemberRoleType,
}
/** 创建空间请求 */
export interface CreateSpaceRequest {
  name: string,
  description?: string,
  icon_url?: string,
  space_type: SpaceType,
}
export interface CreateSpaceResponse {
  code: number,
  msg: string,
  data: SpaceInfo,
}
/** 获取空间列表请求 */
export interface GetSpaceListRequest {
  /** 页码，默认1 */
  page?: number,
  /** 页大小，默认20 */
  page_size?: number,
  /** 空间类型过滤 */
  space_type?: SpaceType,
  /** 状态过滤 */
  status?: SpaceStatus,
  /** 搜索关键词 */
  search_keyword?: string,
}
export interface GetSpaceListResponse {
  code: number,
  msg: string,
  data: SpaceInfo[],
  total: number,
  page: number,
  page_size: number,
}
/** 获取空间详情请求 */
export interface GetSpaceDetailRequest {
  space_id: string
}
export interface GetSpaceDetailResponse {
  code: number,
  msg: string,
  data: SpaceInfo,
}
/** 更新空间请求 */
export interface UpdateSpaceRequest {
  space_id: string,
  name?: string,
  description?: string,
  icon_url?: string,
  status?: SpaceStatus,
}
export interface UpdateSpaceResponse {
  code: number,
  msg: string,
  data: SpaceInfo,
}
/** 删除空间请求 */
export interface DeleteSpaceRequest {
  space_id: string
}
export interface DeleteSpaceResponse {
  code: number,
  msg: string,
}
/** 成员信息 */
export interface SpaceMemberInfo {
  user_id: string,
  username: string,
  nickname?: string,
  avatar_url?: string,
  role: MemberRoleType,
  joined_at: number,
  last_active_at?: number,
}
/** 获取空间成员列表请求 */
export interface GetSpaceMembersRequest {
  space_id: string,
  /** 页码，默认1 */
  page?: number,
  /** 页大小，默认20 */
  page_size?: number,
  /** 角色过滤 */
  role?: MemberRoleType,
  /** 搜索关键词 */
  search_keyword?: string,
}
export interface GetSpaceMembersResponse {
  code: number,
  msg: string,
  data: SpaceMemberInfo[],
  total: number,
  page: number,
  page_size: number,
}
/** 邀请成员请求 */
export interface InviteMemberRequest {
  space_id: string,
  user_ids: string[],
  role: MemberRoleType,
}
export interface InviteMemberResponse {
  code: number,
  msg: string,
  /** 成功邀请的成员列表 */
  data: SpaceMemberInfo[],
}
/** 更新成员角色请求 */
export interface UpdateMemberRoleRequest {
  space_id: string,
  user_id: string,
  role: MemberRoleType,
}
export interface UpdateMemberRoleResponse {
  code: number,
  msg: string,
  data: SpaceMemberInfo,
}
/** 移除成员请求 */
export interface RemoveMemberRequest {
  space_id: string,
  user_id: string,
}
export interface RemoveMemberResponse {
  code: number,
  msg: string,
}
/** 空间CRUD操作 */
export const CreateSpace = /*#__PURE__*/createAPI<CreateSpaceRequest, CreateSpaceResponse>({
  "url": "/api/space/create",
  "method": "POST",
  "name": "CreateSpace",
  "reqType": "CreateSpaceRequest",
  "reqMapping": {
    "body": ["name", "description", "icon_url", "space_type"]
  },
  "resType": "CreateSpaceResponse",
  "schemaRoot": "api://schemas/idl_space_space_management",
  "service": "space_management"
});
export const GetSpaceList = /*#__PURE__*/createAPI<GetSpaceListRequest, GetSpaceListResponse>({
  "url": "/api/space/list",
  "method": "GET",
  "name": "GetSpaceList",
  "reqType": "GetSpaceListRequest",
  "reqMapping": {
    "query": ["page", "page_size", "space_type", "status", "search_keyword"]
  },
  "resType": "GetSpaceListResponse",
  "schemaRoot": "api://schemas/idl_space_space_management",
  "service": "space_management"
});
export const GetSpaceDetail = /*#__PURE__*/createAPI<GetSpaceDetailRequest, GetSpaceDetailResponse>({
  "url": "/api/space/{space_id}",
  "method": "GET",
  "name": "GetSpaceDetail",
  "reqType": "GetSpaceDetailRequest",
  "reqMapping": {
    "path": ["space_id"]
  },
  "resType": "GetSpaceDetailResponse",
  "schemaRoot": "api://schemas/idl_space_space_management",
  "service": "space_management"
});
export const UpdateSpace = /*#__PURE__*/createAPI<UpdateSpaceRequest, UpdateSpaceResponse>({
  "url": "/api/space/{space_id}",
  "method": "PUT",
  "name": "UpdateSpace",
  "reqType": "UpdateSpaceRequest",
  "reqMapping": {
    "path": ["space_id"],
    "body": ["name", "description", "icon_url", "status"]
  },
  "resType": "UpdateSpaceResponse",
  "schemaRoot": "api://schemas/idl_space_space_management",
  "service": "space_management"
});
export const DeleteSpace = /*#__PURE__*/createAPI<DeleteSpaceRequest, DeleteSpaceResponse>({
  "url": "/api/space/{space_id}",
  "method": "DELETE",
  "name": "DeleteSpace",
  "reqType": "DeleteSpaceRequest",
  "reqMapping": {
    "path": ["space_id"]
  },
  "resType": "DeleteSpaceResponse",
  "schemaRoot": "api://schemas/idl_space_space_management",
  "service": "space_management"
});
/** 空间成员管理 */
export const GetSpaceMembers = /*#__PURE__*/createAPI<GetSpaceMembersRequest, GetSpaceMembersResponse>({
  "url": "/api/space/{space_id}/members",
  "method": "GET",
  "name": "GetSpaceMembers",
  "reqType": "GetSpaceMembersRequest",
  "reqMapping": {
    "path": ["space_id"],
    "query": ["page", "page_size", "role", "search_keyword"]
  },
  "resType": "GetSpaceMembersResponse",
  "schemaRoot": "api://schemas/idl_space_space_management",
  "service": "space_management"
});
export const InviteMember = /*#__PURE__*/createAPI<InviteMemberRequest, InviteMemberResponse>({
  "url": "/api/space/{space_id}/members",
  "method": "POST",
  "name": "InviteMember",
  "reqType": "InviteMemberRequest",
  "reqMapping": {
    "path": ["space_id"],
    "body": ["user_ids", "role"]
  },
  "resType": "InviteMemberResponse",
  "schemaRoot": "api://schemas/idl_space_space_management",
  "service": "space_management"
});
export const UpdateMemberRole = /*#__PURE__*/createAPI<UpdateMemberRoleRequest, UpdateMemberRoleResponse>({
  "url": "/api/space/{space_id}/members/{user_id}",
  "method": "PUT",
  "name": "UpdateMemberRole",
  "reqType": "UpdateMemberRoleRequest",
  "reqMapping": {
    "path": ["space_id", "user_id"],
    "body": ["role"]
  },
  "resType": "UpdateMemberRoleResponse",
  "schemaRoot": "api://schemas/idl_space_space_management",
  "service": "space_management"
});
export const RemoveMember = /*#__PURE__*/createAPI<RemoveMemberRequest, RemoveMemberResponse>({
  "url": "/api/space/{space_id}/members/{user_id}",
  "method": "DELETE",
  "name": "RemoveMember",
  "reqType": "RemoveMemberRequest",
  "reqMapping": {
    "path": ["space_id", "user_id"]
  },
  "resType": "RemoveMemberResponse",
  "schemaRoot": "api://schemas/idl_space_space_management",
  "service": "space_management"
});