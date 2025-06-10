/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as space from './space';
import * as base from './base';
import * as auth from './auth';

export type Int64 = string | number;

export interface AddSpaceMemberOApiReq {
  /** 空间ID */
  space_id?: Int64;
  /** 添加空间成员 */
  space_members?: Array<space.SpaceMember>;
  /** FornaxSDK 鉴权 https://bytedance.larkoffice.com/wiki/WF25wdNLniOEnckibBOc6FFuneh */
  Authorization?: string;
  Base?: base.Base;
}

export interface AddSpaceMemberOApiResp {
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface AddSpaceMemberRequest {
  /** 空间ID */
  space_id: Int64;
  /** 添加空间成员 */
  space_members?: Array<space.SpaceMember>;
  Base?: base.Base;
}

export interface AddSpaceMemberResponse {
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface CreateSpaceRequest {
  /** 空间名称 */
  name: string;
  /** 空间描述 */
  description?: string;
  space_type?: space.SpaceType;
  /** 服务树节点 ID */
  byte_tree_node_id?: Int64;
  Base?: base.Base;
}

export interface CreateSpaceResponse {
  /** 创建空间 */
  space?: space.Space;
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface GetByteTreeNodeByIDRequest {
  /** 服务树节点ID */
  node_id: Int64;
  'x-jwt-token'?: string;
  Base?: base.Base;
}

export interface GetByteTreeNodeByIDResponse {
  /** 服务树节点信息 */
  node?: space.ByteTreeNode;
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface GetFeatureConfigBySpaceIDReq {
  spaceID: string;
}

export interface GetFeatureConfigBySpaceIDResp {
  cozeBot?: space.CozeBotFeatureConfig;
  featureSwitchMap?: Record<string, boolean>;
  IsRelatedToDoubao?: boolean;
  /** 功能黑名单，该列表代表这些功能要被隐藏 */
  BlockFeatureList?: Array<string>;
}

export interface GetSpaceRequest {
  /** 空间ID */
  space_id: Int64;
  Base?: base.Base;
}

export interface GetSpaceResponse {
  /** 空间 */
  space?: space.Space;
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface GetUserSpaceRolesRequest {
  /** 空间ID */
  space_id: Int64;
  Base?: base.Base;
}

export interface GetUserSpaceRolesResponse {
  roles?: Array<auth.AuthRole>;
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface HasPermByteTreeNodeRequest {
  /** 服务树节点ID */
  byte_tree_node_id: string;
  'x-jwt-token'?: string;
  Base?: base.Base;
}

export interface HasPermByteTreeNodeResponse {
  /** 是否有权限 */
  has_permission?: boolean;
  /** 无权限时展示申请工单链接 */
  applyTicketURL?: string;
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface ListUserSpaceRequest {
  Base?: base.Base;
}

export interface ListUserSpaceResponse {
  /** 空间列表 */
  spaces?: Array<space.Space>;
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface QuerySpaceMemberRequest {
  /** 空间ID */
  space_id: Int64;
  role_type?: space.SpaceRoleType;
  page?: number;
  page_size?: number;
  Base?: base.Base;
}

export interface QuerySpaceMemberResponse {
  /** 空间成员 */
  space_members?: Array<space.SpaceMember>;
  total?: number;
  /** 成员租户分布，去重 */
  member_tenant?: Array<auth.TenantType>;
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface RemoveSpaceMemberOApiReq {
  /** 空间ID */
  space_id: Int64;
  /** 移除空间成员 */
  space_members?: Array<space.SpaceMember>;
  /** FornaxSDK 鉴权 https://bytedance.larkoffice.com/wiki/WF25wdNLniOEnckibBOc6FFuneh */
  Authorization?: string;
  Base?: base.Base;
}

export interface RemoveSpaceMemberOApiResp {
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface RemoveSpaceMemberRequest {
  /** 空间ID */
  space_id: Int64;
  /** 移除空间成员 */
  space_members?: Array<space.SpaceMember>;
  Base?: base.Base;
}

export interface RemoveSpaceMemberResponse {
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface UpdateSpaceRequest {
  /** 空间ID */
  space_id: Int64;
  /** 空间名称 */
  name?: string;
  /** 空间描述 */
  description?: string;
  /** 发布审批配置 */
  release_approval_config?: space.ReleaseApprovalConfig;
  /** 服务树节点ID */
  byte_tree_node_id?: Int64;
  'x-jwt-token'?: string;
  Base?: base.Base;
}

export interface UpdateSpaceResponse {
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}
/* eslint-enable */
