/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as flow_devops_evaluation_callback_common from './flow_devops_evaluation_callback_common';

export type Int64 = string | number;

export enum AIAnnotateTaskItemStatus {
  NotStarted = 0,
  Running = 1,
  Succeeded = 2,
  Failed = 3,
}

export enum AIAnnotateTaskRunType {
  Undefined = 0,
  RunAllWithOverwrite = 1,
  RunEmpty = 2,
}

export enum AIAnnotateTaskStatus {
  Undefined = 0,
  NotStarted = 1,
  Running = 2,
  Finished = 3,
  Failed = 4,
  Terminated = 5,
}

export enum ErrorType {
  Undefined = 0,
  SystemError = 1,
  UserError = 2,
}

export enum PromptVariableValueType {
  Undefined = 0,
  /** 固定值 */
  Fixed = 1,
  /** 数据集列，使用数据集列的值 */
  useColumn = 2,
}

export interface AIAnnotateResultItem {
  /** key: 变量名，value: 变量值 */
  variables?: Record<string, string>;
  userPromptColumnValue?: flow_devops_evaluation_callback_common.Content;
  /** 执行结果 */
  output?: string;
  /** 执行错误，为空表示执行成功 */
  error?: string;
}

export interface AIAnnotateTask {
  id?: string;
  name?: string;
  datasetID?: string;
  datasetColumnName?: string;
  promptID?: string;
  promptVersion?: string;
  userPromptColumnName?: string;
  promptVariables?: Array<PromptVariable>;
  latestTaskRunID?: string;
  /** 创建人ID */
  createdBy?: string;
  /** 创建时间，ms */
  createdAt?: string;
  /** 更新人ID */
  updatedBy?: string;
  /** 更新时间，ms */
  updatedAt?: string;
}

export interface AIAnnotateTaskRun {
  id?: string;
  taskID?: string;
  taskRunType?: AIAnnotateTaskRunType;
  status?: AIAnnotateTaskStatus;
  totalCount?: Int64;
  /** 执行成功的数量 */
  succeedCount?: Int64;
  /** 执行失败的数量 */
  failedCount?: Int64;
  /** 成功插入的数量 */
  updatedCount?: Int64;
  taskRunErrorInfos?: Array<TaskRunErrorInfo>;
  taskBrief?: AIAnnotateTask;
  LastOutputCursor?: Int64;
  /** 创建人ID */
  createdBy?: string;
  /** 创建时间，ms */
  createdAt?: string;
  /** 更新人ID */
  updatedBy?: string;
  /** 更新时间，ms */
  updatedAt?: string;
}

export interface ErrorInfo {
  errorType?: ErrorType;
  errorMessage?: string;
}

export interface PromptVariable {
  name?: string;
  valueType?: PromptVariableValueType;
  value?: string;
  datasetColumnName?: string;
}

export interface TaskRunErrorInfo {
  rowGroupID?: string;
  errorInfo?: ErrorInfo;
}
/* eslint-enable */
