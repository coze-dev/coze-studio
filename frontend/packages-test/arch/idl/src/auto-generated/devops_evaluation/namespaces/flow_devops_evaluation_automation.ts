/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as flow_devops_evaluation_task from './flow_devops_evaluation_task';

export type Int64 = string | number;

export enum AutomationObjectType {
  Unknown = 0,
  CozeBot = 1,
  FornaxApp = 2,
}

export enum BatchExecCaseTaskOp {
  Unknown = 0,
  Create = 1,
  Delete = 2,
}

export enum EvalRunEventTaskOp {
  Unknown = 0,
  Create = 1,
  Delete = 2,
}

export interface AutomationObject {
  Type: AutomationObjectType;
  CozeBot?: CozeBot;
  FornaxApp?: FornaxApp;
}

/** AutomationTask 用户创建的自动化任务信息 */
export interface AutomationTask {
  /** 自动化任务ID */
  TaskID: Int64;
  /** 创建自动化任务的用户ID，鉴权需要 */
  UserID: Int64;
  SpaceID: Int64;
}

export interface CozeBot {
  BotID: Int64;
}

export interface FornaxApp {
  PSM: string;
  Env?: string;
  Cluster?: string;
  Region: string;
}

export interface SubTaskSummary {
  TaskID: Int64;
  CaseID: Int64;
  Status?: flow_devops_evaluation_task.TaskStatus;
}
/* eslint-enable */
