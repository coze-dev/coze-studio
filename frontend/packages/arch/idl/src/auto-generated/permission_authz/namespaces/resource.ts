/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

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
  EvaluationDataset = 20,
  EvaluationTask = 21,
  Evaluator = 22,
  Database = 23,
  OceanProject = 24,
}

export interface AccountInfo {
  /** Account的Id */
  id: string;
  /** Account属性JsonStr */
  attributes?: string;
}

export interface ResourceIdentifier {
  /** 资源类型 */
  type: ResourceType;
  /** 资源Id */
  id: string;
}

export interface ResourceInAccountInfo {
  /** 资源标识 */
  resource_identifier: ResourceIdentifier;
  /** Account的Id */
  account_id: string;
  /** 资源的Owner */
  owner_id: string;
  /** 资源属性JsonStr */
  attributes?: string;
}

export interface ResourceInfo {
  /** 资源标识 */
  resource_identifier: ResourceIdentifier;
  /** 空间标识 */
  workspace_id: string;
  /** 资源的Owner */
  owner_id: string;
  /** 资源属性JsonStr */
  attributes?: string;
}
/* eslint-enable */
