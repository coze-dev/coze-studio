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

/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as bot_open_api from './bot_open_api';

export type Int64 = string | number;

export interface ListBotVersionsData {
  items?: Array<OpenBotVersionInfo>;
  has_more?: boolean;
}

export interface OpenAddSpaceMemberData {
  /** 成功添加的成员列表 */
  added_success_user_ids?: Array<string>;
  /** 成功邀请的成员列表 */
  invited_success_user_ids?: Array<string>;
  /** 不存在的用户列表 */
  not_exist_user_ids?: Array<string>;
  /** 已经加入空间的用户不进行处理 */
  already_joined_user_ids?: Array<string>;
  /** 已经发起邀请的用户不进行处理 */
  already_invited_user_ids?: Array<string>;
}

export interface OpenAddSpaceMemberRequest {
  /** 空间ID */
  workspace_id?: string;
  /** 要添加的成员，数量最多20 */
  users?: Array<OpenSpaceMember>;
}

export interface OpenAddSpaceMemberResponse {
  data?: OpenAddSpaceMemberData;
  code: Int64;
  msg: string;
}

export interface OpenApplyJoinSpaceData {
  /** 成功申请的用户列表 */
  applied_success_user_ids?: Array<string>;
  /** 申请失败的用户列表 */
  applied_failed_user_ids?: Array<string>;
}

export interface OpenApplyJoinSpaceRequest {
  /** 空间ID */
  workspace_id?: string;
  /** 用户ID列表 */
  user_ids?: Array<string>;
}

export interface OpenApplyJoinSpaceResponse {
  data?: OpenApplyJoinSpaceData;
  code: Int64;
  msg: string;
}

export interface OpenBotVersionInfo {
  version?: string;
  created_at?: Int64;
  creator?: OpenCreatorInfo;
  publish_status?: string;
  /** 发布时用户输入的记录信息 */
  changelog?: string;
}

export interface OpenCreateSpaceRequest {
  /** 空间名称 */
  name?: string;
  /** 空间描述 */
  description?: string;
  /** 空间图标，通过上传接口https://www.coze.cn/open/docs/developer_guides/upload_files，未指定文件ID则使用默认头像 */
  icon_file_id?: string;
  /** 组织id */
  coze_account_id?: string;
  /** 空间所有者id，不传则为当前用户 */
  owner_uid?: string;
}

export interface OpenCreateSpaceResponse {
  data?: OpenCreateSpaceRet;
  code: Int64;
  msg: string;
}

export interface OpenCreateSpaceRet {
  /** 空间id */
  id?: string;
}

export interface OpenCreatorInfo {
  id?: string;
  /** 昵称 */
  name?: string;
}

export interface OpenGetBotInfoRequest {
  bot_id?: string;
  is_published?: boolean;
  /** 发布查最新 */
  connector_id?: string;
}

export interface OpenGetBotInfoResponse {
  data?: bot_open_api.BotInfo;
  code?: Int64;
  msg?: string;
}

export interface OpenListBotVersionsRequest {
  bot_id?: string;
  page_num?: number;
  page_size?: number;
  publish_status?: string;
  connector_id?: string;
}

export interface OpenListBotVersionsResponse {
  data?: ListBotVersionsData;
  code?: Int64;
  msg?: string;
}

export interface OpenRemoveSpaceMemberData {
  /** 成功移除的成员列表 */
  removed_success_user_ids?: Array<string>;
  /** 不在空间的用户不进行处理 */
  not_in_workspace_user_ids?: Array<string>;
  /** 空间所有者不进行处理 */
  owner_not_support_remove_user_ids?: Array<string>;
}

export interface OpenRemoveSpaceMemberRequest {
  /** 空间ID */
  workspace_id?: string;
  /** 要移除的成员，数量最多5 */
  user_ids?: Array<string>;
}

export interface OpenRemoveSpaceMemberResponse {
  data?: OpenRemoveSpaceMemberData;
  code: Int64;
  msg: string;
}

export interface OpenRemoveSpaceRequest {
  /** 空间ID */
  workspace_id?: string;
}

export interface OpenRemoveSpaceResponse {
  code: Int64;
  msg: string;
}

export interface OpenSpace {
  /** 空间 id */
  id?: string;
  /** 空间名称 */
  name?: string;
  /** 空间图标 url */
  icon_url?: string;
  /** 当前用户角色, 枚举值: owner, admin, member */
  role_type?: string;
  /** 工作空间类型, 枚举值: personal, team */
  workspace_type?: string;
  /** 企业 id */
  enterprise_id?: string;
  joined_status?: string;
  /** 空间描述 */
  description?: string;
  owner_uid?: string;
  /** 空间管理员 id 列表 */
  admin_uids?: Array<string>;
}

export interface OpenSpaceData {
  workspaces?: Array<OpenSpace>;
  /** 空间总数 */
  total_count?: Int64;
}

/** *  plagyground 开放api idl文件
 * */
export interface OpenSpaceListRequest {
  page_num?: Int64;
  page_size?: Int64;
  enterprise_id?: string;
  user_id?: string;
  coze_account_id?: string;
  /** 不传默认 "joined" */
  scope?: string;
}

export interface OpenSpaceListResponse {
  data?: OpenSpaceData;
  code: Int64;
  msg: string;
}

export interface OpenSpaceMember {
  /** 用户ID */
  user_id?: string;
  /** 昵称（添加成员时不用传） */
  user_nickname?: string;
  /** 用户名（添加成员时不用传） */
  user_unique_name?: string;
  /** 头像 （添加成员时不用传） */
  avatar_url?: string;
  /** 当前用户角色 */
  role_type?: string;
}

export interface OpenSpaceMemberListData {
  items?: Array<OpenSpaceMember>;
  /** 空间成员总数 */
  total_count?: Int64;
}

export interface OpenSpaceMemberListRequest {
  /** 空间ID */
  workspace_id?: string;
  /** 页数，默认为1 */
  page_num?: number;
  /** 每页大小，默认为20，最大50 */
  page_size?: number;
}

export interface OpenSpaceMemberListResponse {
  data?: OpenSpaceMemberListData;
  code: Int64;
  msg: string;
}

export interface OpenSwitchBotDevelopModeRequest {
  bot_id?: string;
  collaboration_mode?: string;
}

export interface OpenSwitchBotDevelopModeResponse {
  code?: Int64;
  msg?: string;
}

export interface OpenUpdateSpaceMemberRequest {
  /** 空间id */
  workspace_id?: string;
  /** 更新用户id */
  user_id?: string;
  /** 更新的用户角色(不允许修改owner，只允许变更member/admin -> member/admin) */
  role_type?: string;
}

export interface OpenUpdateSpaceMemberResponse {
  code?: Int64;
  msg?: string;
}
/* eslint-enable */
