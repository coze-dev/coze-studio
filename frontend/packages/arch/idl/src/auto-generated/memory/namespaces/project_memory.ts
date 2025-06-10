/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';

export type Int64 = string | number;

export enum AttributeValueType {
  Unknown = 0,
  String = 1,
  Boolean = 2,
  StringList = 11,
  BooleanList = 12,
}

export enum ResourceType {
  Account = 1,
  Workspace = 2,
  App = 3,
  Bot = 4,
  Plugin = 5,
  Workflow = 6,
  Knowledge = 7,
  PersonalAccessToken = 8,
  Connector = 9,
  Card = 10,
  CardTemplate = 11,
  Conversation = 12,
  File = 13,
  ServicePrincipal = 14,
  Enterprise = 15,
  MigrateTask = 16,
  Prompt = 17,
  UI = 18,
  Project = 19,
  Database = 23,
}

export enum VariableChannel {
  Custom = 1,
  System = 2,
  Location = 3,
  Feishu = 4,
  /** 项目变量 */
  APP = 5,
}

export enum VariableConnector {
  Bot = 1,
  Project = 2,
}

export enum VariableType {
  KVVariable = 1,
  ListVariable = 2,
}

export interface AttributeValue {
  Type: AttributeValueType;
  Value: string;
}

export interface GetMemoryVariableMetaReq {
  ConnectorID?: string;
  ConnectorType?: VariableConnector;
  version?: string;
  Base?: base.Base;
}

export interface GetMemoryVariableMetaResp {
  VariableMap?: Record<VariableChannel, Array<Variable>>;
  BaseResp: base.BaseResp;
}

export interface GetProjectVariableListReq {
  ProjectID?: string;
  UserID?: Int64;
  version?: string;
  Base?: base.Base;
}

export interface GetProjectVariableListResp {
  VariableList?: Array<Variable>;
  CanEdit?: boolean;
  GroupConf?: Array<GroupVariableInfo>;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface GroupVariableInfo {
  GroupName?: string;
  GroupDesc?: string;
  GroupExtDesc?: string;
  VarInfoList?: Array<Variable>;
  SubGroupList?: Array<GroupVariableInfo>;
  IsReadOnly?: boolean;
  DefaultChannel?: VariableChannel;
}

export interface ResourceIdentifier {
  /** 资源类型 */
  Type: ResourceType;
  /** 资源Id */
  Id: string;
}

export interface UpdateProjectVariableReq {
  ProjectID?: string;
  UserID?: Int64;
  VariableList?: Array<Variable>;
  Base?: base.Base;
}

export interface UpdateProjectVariableResp {
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface Variable {
  Keyword?: string;
  DefaultValue?: string;
  VariableType?: VariableType;
  Channel?: VariableChannel;
  Description?: string;
  Enable?: boolean;
  /** 生效渠道 */
  EffectiveChannelList?: Array<string>;
  /** 新老数据都会有schema，除项目变量外其他默认为string */
  Schema?: string;
  IsReadOnly?: boolean;
}
/* eslint-enable */
