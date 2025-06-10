/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as modeleval from './modeleval';

export type Int64 = string | number;

export interface CreateOfflineEvalTaskRequest {
  task?: modeleval.OfflineEvalTask;
  userJwtToken?: string;
  /** 空间ID */
  space_id?: string;
}

export interface CreateOfflineEvalTaskResponse {
  id?: string;
}

export interface GetOfflineEvalTaskRequest {
  task_id?: string;
  userJwtToken?: string;
  /** 空间ID */
  space_id?: string;
}

export interface GetOfflineEvalTaskResponse {
  task?: modeleval.OfflineEvalTask;
}

export interface ListOfflineEvalTaskRequest {
  nameKeyword?: string;
  id?: string;
  creatorID?: string;
  userJwtToken?: string;
  pageSize?: Int64;
  pageNum?: Int64;
  /** 空间ID */
  space_id?: string;
}

export interface ListOfflineEvalTaskResponse {
  task?: Array<modeleval.OfflineEvalTask>;
  hasMore?: boolean;
  total?: Int64;
}

export interface ParseMerlinSeedModelConfigRequest {
  checkpointHdfsPath?: string;
  modelSid?: string;
  trainingJobRunID?: string;
  userJwtToken?: string;
  /** 空间ID */
  space_id?: string;
}

export interface ParseMerlinSeedModelConfigResponse {
  checkPointHdfsPath?: string;
  networkParamConfigContext?: string;
  paramConfigType?: string;
  quantParamConfigContext?: string;
  tokenizerHdfsPath?: string;
  xperfParamConfigContext?: string;
}

export interface TerminateOfflineEvalTaskRequest {
  taskID?: string;
  userJwtToken?: string;
  /** 空间ID */
  space_id?: string;
}

export interface TerminateOfflineEvalTaskResponse {}
/* eslint-enable */
