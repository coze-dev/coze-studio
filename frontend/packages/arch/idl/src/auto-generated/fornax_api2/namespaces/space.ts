/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as auth from './auth';

export type Int64 = string | number;

export enum GrayReleaseStrategy {
  /** 不开启灰度 */
  None = 0,
  /** 实例灰度 */
  InstanceGrayRelease = 1,
}

/** 空间角色类型 */
export enum SpaceRoleType {
  Undefined = 0,
  /** 负责人 */
  Owner = 1,
  /** 开发者 */
  Developer = 2,
  /** 测试人员 */
  Tester = 3,
}

/** 空间类型 */
export enum SpaceType {
  Undefined = 0,
  Personal = 1,
  Team = 2,
  /** 官方空间 */
  Official = 3,
}

export interface ByteTreeNode {
  id?: string;
  name?: string;
  i18nName?: string;
  path?: string;
  i18nPath?: string;
  levelID?: Int64;
  isLeaf?: boolean;
  type?: string;
}

export interface CozeBotFeatureConfig {
  enabled: boolean;
  botIDAllowList?: Array<Int64>;
}

/** 空间配置 */
export interface FeatureConfig {
  /** 开启特性的空间ID */
  EnabledSpaceIDList?: Array<Int64>;
  /** 是否全量开启 */
  EnableAll?: boolean;
}

export interface ReleaseApprovalConfig {
  /** 是否开启审核 */
  enable?: boolean;
  /** 灰度策略 */
  gray_release_strategy?: GrayReleaseStrategy;
}

/** 空间 */
export interface Space {
  /** 空间ID */
  id?: Int64;
  /** 空间名称 */
  name?: string;
  /** 空间描述 */
  description?: string;
  /** 空间类型 */
  space_type?: SpaceType;
  /** 空间创建人 */
  creator?: string;
  /** 创建时间 */
  create_tsms?: Int64;
  /** 更新时间 */
  update_tsms?: Int64;
  /** 发布审核配置 */
  release_approval_config?: ReleaseApprovalConfig;
  /** 空间来源 */
  space_origin?: string;
  /** 服务树节点ID */
  tree_node_id?: string;
}

/** 空间成员 */
export interface SpaceMember {
  /** 空间ID */
  space_id?: Int64;
  /** 成员 */
  member?: auth.AuthPrincipal;
  /** 空间角色类型 */
  space_role_type?: SpaceRoleType;
}
/* eslint-enable */
