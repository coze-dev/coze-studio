/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as principal from './principal';

export type Int64 = string | number;

export enum RoleCode {
  BotEditor = 1,
  BotDeveloper = 2,
  BotOperator = 3,
  WorkflowEditor = 4,
  ProjectEditor = 5,
}

export enum RoleType {
  /** 预定义角色 */
  Predefined = 1,
  /** 自定义角色 */
  Custom = 2,
}

export interface CollaboratorExistInfo {
  /** 当前principla是否为协作者 */
  principal_is_collaborator: boolean;
  /** 当前资源上是否有协作者 */
  resource_has_collaborator: boolean;
}

export interface RoleAttachment {
  /** 角色Code */
  code: string;
  /** 主体 */
  principal: principal.PrincipalIdentifier;
  /** 创建时间 */
  create_time: Int64;
  enum_code: RoleCode;
}

export interface UpgradeInfo {
  /** 是否能升级 */
  can_upgrade: boolean;
  /** 当前计划的协作者人数限制 */
  current_collaborator_limit: number;
}
/* eslint-enable */
