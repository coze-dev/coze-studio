/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

/** *************************** audit ********************************* */
export enum AuditStatus {
  /** 审核中 */
  Auditing = 0,
  /** 审核通过 */
  Success = 1,
  /** 审核失败 */
  Failed = 2,
}

/** *************************** publish ********************************* */
export enum ConnectorDynamicStatus {
  Normal = 0,
  Offline = 1,
  TokenDisconnect = 2,
}

export enum OrderByType {
  Asc = 1,
  Desc = 2,
}

export enum PermissionType {
  /** 不能查看详情 */
  NoDetail = 1,
  /** 可以查看详情 */
  Detail = 2,
  /** 可以查看和操作 */
  Operate = 3,
}

export enum ResourceType {
  Plugin = 1,
  Workflow = 2,
  Imageflow = 3,
  Knowledge = 4,
  UI = 5,
  Prompt = 6,
  Database = 7,
  Variable = 8,
}

export enum SpaceStatus {
  Valid = 1,
  Invalid = 2,
}

/** 审核结果 */
export interface AuditData {
  /** true：机审校验不通过 */
  check_not_pass?: boolean;
  /** 机审校验不通过文案 */
  check_not_pass_msg?: string;
}

export interface AuditInfo {
  audit_status?: AuditStatus;
  publish_id?: string;
  commit_version?: string;
}

export interface ConnectorInfo {
  id?: string;
  name?: string;
  icon?: string;
  connector_status?: ConnectorDynamicStatus;
  share_link?: string;
}

export interface Space {
  id?: Int64;
  owner_id?: Int64;
  status?: SpaceStatus;
  name?: string;
}

export interface User {
  user_id?: string;
  /** 用户昵称 */
  nickname?: string;
  /** 用户头像 */
  avatar_url?: string;
  /** 用户名 */
  user_unique_name?: string;
  /** 用户标签 */
  user_label?: UserLabel;
}

/** *************************** user ********************************* */
export interface UserLabel {
  label_id?: string;
  label_name?: string;
  icon_uri?: string;
  icon_url?: string;
  jump_link?: string;
}

export interface Variable {
  /** 变量名 */
  keyword?: string;
  /** 默认值 */
  default_value?: string;
  /** 变量类型 */
  variable_type?: string;
  /** 变量来源 */
  channel?: string;
  /** 变量描述 */
  description?: string;
  /** 是否启用 */
  enable?: boolean;
  /** 变量默认支持在Prompt中访问，取消勾选后将不支持在Prompt中访问（仅能在Workflow中访问 */
  prompt_enable?: boolean;
}
/* eslint-enable */
