/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as intelligence_common_struct from './intelligence_common_struct';
import * as common_struct from './common_struct';
import * as base from './base';
import * as ocean_project_common_struct from './ocean_project_common_struct';

export type Int64 = string | number;

export enum BotMode {
  SingleMode = 0,
  MultiMode = 1,
  WorkflowMode = 2,
}

export enum OceanProjectOrderBy {
  UpdateTime = 0,
  CreateTime = 1,
}

export enum OrderBy {
  UpdateTime = 0,
  CreateTime = 1,
  PublishTime = 2,
}

export enum PublishStatus {
  All = 0,
  Publish = 1,
  NoPublish = 2,
}

export enum SearchScope {
  All = 0,
  CreateByMe = 1,
}

export interface DraftIntelligenceListData {
  intelligences?: Array<IntelligenceData>;
  total?: number;
  has_more?: boolean;
  next_cursor_id?: string;
}

export interface FavoriteInfo {
  /** 是否收藏；收藏列表使用 */
  is_fav?: boolean;
  /** 收藏时间；收藏列表使用 */
  fav_time?: string;
}

export interface GetDraftIntelligenceInfoData {
  intelligence_type?: intelligence_common_struct.IntelligenceType;
  basic_info?: intelligence_common_struct.IntelligenceBasicInfo;
  publish_info?: IntelligencePublishInfo;
  owner_info?: common_struct.User;
}

export interface GetDraftIntelligenceInfoRequest {
  intelligence_id?: string;
  intelligence_type?: intelligence_common_struct.IntelligenceType;
  /** 预览版本时传入 */
  version?: string;
  Base?: base.Base;
}

export interface GetDraftIntelligenceInfoResponse {
  data?: GetDraftIntelligenceInfoData;
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface GetDraftIntelligenceListOption {
  /** 是否需要个人版本Bot数据 */
  need_replica?: boolean;
}

export interface GetDraftIntelligenceListRequest {
  space_id: string;
  name?: string;
  has_published?: boolean;
  status?: Array<intelligence_common_struct.IntelligenceStatus>;
  types?: Array<intelligence_common_struct.IntelligenceType>;
  search_scope?: SearchScope;
  is_fav?: boolean;
  recently_open?: boolean;
  option?: GetDraftIntelligenceListOption;
  order_by?: OrderBy;
  cursor_id?: string;
  size?: number;
  Base?: base.Base;
}

export interface GetDraftIntelligenceListResponse {
  data?: DraftIntelligenceListData;
  code?: number;
  msg?: string;
}

export interface GetOceanProjectInfoRequest {
  project_id: string;
  Base?: base.Base;
}

export interface GetOceanProjectInfoResponse {
  data: OceanProjectInfoData;
  code?: number;
  msg?: string;
}

export interface GetOceanProjectListRequest {
  space_id: string;
  status?: Array<ocean_project_common_struct.OceanProjectStatus>;
  search_scope?: SearchScope;
  /** 这里只有创建时间和更新时间 */
  order_by?: OceanProjectOrderBy;
  page_index?: number;
  page_size?: number;
  Base?: base.Base;
}

export interface GetOceanProjectListResponse {
  data?: OceanProjectListData;
  code?: number;
  msg?: string;
}

export interface GetOpIntelligenceData {
  /** 最近发布项目的信息 */
  BasicInfo?: intelligence_common_struct.IntelligenceBasicInfo;
  /** 智能体类型 */
  Type?: intelligence_common_struct.IntelligenceType;
  UserInfo?: common_struct.User;
  SpaceInfo?: common_struct.Space;
}

export interface GetProjectPublishSummaryData {
  connector_ids?: Array<string>;
  version_map?: Record<Int64, string>;
  template_project_id?: string;
  template_project_version?: string;
}

export interface GetProjectPublishSummaryRequest {
  project_id: string;
}

export interface GetProjectPublishSummaryResponse {
  data?: GetProjectPublishSummaryData;
  code?: Int64;
  msg?: string;
}

export interface GetUserRecentlyEditIntelligenceData {
  intelligence_info_list?: Array<IntelligenceData>;
}

export interface GetUserRecentlyEditIntelligenceRequest {
  size?: number;
  types?: Array<intelligence_common_struct.IntelligenceType>;
  /** 企业id */
  enterprise_id?: string;
  /** 组织id */
  organization_id?: string;
  Base?: base.Base;
}

export interface GetUserRecentlyEditIntelligenceResponse {
  data?: GetUserRecentlyEditIntelligenceData;
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface Intelligence {
  /** 基本信息 */
  basic_info?: intelligence_common_struct.IntelligenceBasicInfo;
  /** 智能体类型 */
  type?: intelligence_common_struct.IntelligenceType;
  /** 智能体发布信息，可选 */
  publish_info?: IntelligencePublishInfo;
  /** 智能体所有者信息，可选 */
  owner_info?: common_struct.User;
  /** 当前用户对智能体的权限信息，可选 */
  permission_info?: IntelligencePermissionInfo;
}

/** For前端 */
export interface IntelligenceData {
  basic_info?: intelligence_common_struct.IntelligenceBasicInfo;
  type?: intelligence_common_struct.IntelligenceType;
  publish_info?: IntelligencePublishInfo;
  permission_info?: IntelligencePermissionInfo;
  owner_info?: common_struct.User;
  latest_audit_info?: common_struct.AuditInfo;
  favorite_info?: FavoriteInfo;
  other_info?: OtherInfo;
}

export interface IntelligenceInfoOptions {
  need_permission_info?: boolean;
  need_owner_info?: boolean;
  need_publish_info?: boolean;
}

export interface IntelligenceItem {
  intelligence_id?: Int64;
  intelligence_type?: intelligence_common_struct.IntelligenceType;
}

export interface IntelligencePermissionInfo {
  in_collaboration?: boolean;
  /** 当前用户是否可删除 */
  can_delete?: boolean;
  /** 当前用户是否可查看，当前判断逻辑为用户是否在bot所在空间 */
  can_view?: boolean;
}

export interface IntelligencePublishInfo {
  publish_time?: string;
  has_published?: boolean;
  connectors?: Array<common_struct.ConnectorInfo>;
}

/** For前端 */
export interface OceanProjectData {
  basic_info?: ocean_project_common_struct.OceanProjectBasicInfo;
  owner_info?: common_struct.User;
  permission_info?: OceanProjectPermissionInfo;
  publish_info?: OceanProjectPublishInfo;
}

export interface OceanProjectInfoData {
  project_id: string;
  basic_info: ocean_project_common_struct.OceanProjectBasicInfo;
}

export interface OceanProjectListData {
  ocean_projects?: Array<OceanProjectData>;
  total?: number;
}

/** Ocean Project start */
export interface OceanProjectPermissionInfo {
  in_collaboration?: boolean;
  /** 当前用户是否可删除 */
  can_delete?: boolean;
  /** 当前用户是否可查看，当前判断逻辑为用户是否在bot所在空间 */
  can_view?: boolean;
}

export interface OceanProjectPublishInfo {
  publish_time?: string;
  has_published?: boolean;
}

export interface OtherInfo {
  /** 最近打开时间；最近打开筛选时使用 */
  recently_open_time?: string;
  /** 仅bot类型返回 */
  bot_mode?: BotMode;
}

export interface PublishIntelligenceData {
  /** 最近发布项目的信息 */
  basic_info?: intelligence_common_struct.IntelligenceBasicInfo;
  user_info?: common_struct.User;
  /** 已发布渠道聚合 */
  connectors?: Array<common_struct.ConnectorInfo>;
  /** 截止昨天总token消耗 纯数字 */
  total_token?: string;
  permission_type?: common_struct.PermissionType;
  /** 是否有触发器 */
  trigger?: boolean;
}

export interface PublishIntelligenceListData {
  intelligences?: Array<PublishIntelligenceData>;
  total?: number;
  has_more?: boolean;
  next_cursor_id?: string;
}

export interface PublishIntelligenceListRequest {
  intelligence_type: intelligence_common_struct.IntelligenceType;
  space_id: string;
  /** 筛选项 */
  owner_id?: string;
  /** 搜索项：智能体or作者name */
  name?: string;
  order_last_publish_time?: common_struct.OrderByType;
  order_total_token?: common_struct.OrderByType;
  size: Int64;
  cursor_id?: string;
  intelligence_ids?: Array<string>;
}

export interface PublishIntelligenceListResponse {
  data?: PublishIntelligenceListData;
  code?: Int64;
  msg?: string;
}
/* eslint-enable */
