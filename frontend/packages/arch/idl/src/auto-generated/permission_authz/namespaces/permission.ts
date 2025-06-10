/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as resource from './resource';

export type Int64 = string | number;

export enum Decision {
  /** 允许 */
  Allow = 1,
  /** 拒绝 */
  Deny = 2,
}

export enum WorkspacePermissionOption {
  Select = 1,
  All = 2,
}

export interface AccountPermission {
  permission_list: Array<string>;
}

export interface ActionAndResource {
  /** 操作 */
  action: string;
  /** 资源标识 */
  resource_identifier: resource.ResourceIdentifier;
  /** 请求上下文 */
  context?: string;
  /** 授权码 */
  capability_code?: string;
}

export interface AdaptorForBotResourceInfo {
  resource_id?: string;
  owner_id?: string;
  workspace_id?: string;
  connector_id?: string;
}

export interface AttributeConstraint {
  connector_bot_chat_attribute?: ConnectorBotChatAttribute;
  connector_bot_update_profile_attribute?: ConnectorBotUpdateProfileAttribute;
}

export interface ConnectorBotChatAttribute {
  bot_id_list?: Array<string>;
}

export interface ConnectorBotUpdateProfileAttribute {
  bot_id_list?: Array<string>;
}

export interface ConnectorPermission {
  connector_id_list: Array<string>;
  permission_list: Array<string>;
}

export interface Permission {
  connector_permission?: ConnectorPermission;
  workspace_permission?: WorkspacePermission;
  account_permission?: AccountPermission;
  attribute_constraint?: AttributeConstraint;
  project_permission?: ProjectPermission;
  workflow_permission?: WorkflowPermission;
}

export interface ProjectPermission {
  project_id_list: Array<string>;
  permission_list: Array<string>;
}

export interface WorkflowPermission {
  workflow_id_list: Array<string>;
  permission_list: Array<string>;
}

export interface WorkspacePermission {
  workspace_id_list: Array<string>;
  permission_list: Array<string>;
}

export interface WorkspacePermissions {
  option: WorkspacePermissionOption;
  workspace_id_list?: Array<string>;
  permission_list: Array<WorkspaceResourcePermission>;
}

export interface WorkspaceResourcePermission {
  resource_type: string;
  actions: Array<string>;
}
/* eslint-enable */
