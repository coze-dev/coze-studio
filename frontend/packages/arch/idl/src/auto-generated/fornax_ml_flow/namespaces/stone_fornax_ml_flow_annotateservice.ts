/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as ai_annotate from './ai_annotate';
import * as base from './base';

export type Int64 = string | number;

export interface CreateAIAnnotateTaskReq {
  name?: string;
  datasetID?: string;
  datasetColumnName?: string;
  promptID?: string;
  promptVersion?: string;
  userPromptColumnName?: string;
  promptVariables?: Array<ai_annotate.PromptVariable>;
  space_id?: string;
  base?: base.Base;
}

export interface CreateAIAnnotateTaskResp {
  id?: string;
  baseResp?: base.BaseResp;
}

export interface DeleteAIAnnotateTaskReq {
  task_id?: string;
  space_id?: string;
  base?: base.Base;
}

export interface DeleteAIAnnotateTaskResp {
  baseResp?: base.BaseResp;
}

export interface DryRunAIAnnotateResp {
  items?: Array<ai_annotate.AIAnnotateResultItem>;
  baseResp?: base.BaseResp;
}

export interface DryRunAIAnnotateTaskReq {
  datasetID?: string;
  datasetColumnName?: string;
  promptID?: string;
  promptVersion?: string;
  userPromptColumnName?: string;
  promptVariables?: Array<ai_annotate.PromptVariable>;
  /** 不指定则默认读取数据集前5条样本数据 */
  sampleCount?: Int64;
  space_id?: string;
  base?: base.Base;
}

export interface GetAIAnnotateTaskReq {
  task_id?: string;
  space_id?: string;
  base?: base.Base;
}

export interface GetAIAnnotateTaskResp {
  task?: ai_annotate.AIAnnotateTask;
  baseResp?: base.BaseResp;
}

export interface GetAIAnnotateTaskRunReq {
  task_id?: string;
  task_run_id?: string;
  space_id?: string;
  base?: base.Base;
}

export interface GetAIAnnotateTaskRunResp {
  taskRun?: ai_annotate.AIAnnotateTaskRun;
  baseResp?: base.BaseResp;
}

export interface ListAIAnnotateTaskReq {
  dataset_id?: string;
  space_id?: string;
  base?: base.Base;
}

export interface ListAIAnnotateTaskResp {
  tasks?: Array<ai_annotate.AIAnnotateTask>;
  baseResp?: base.BaseResp;
}

export interface RunAIAnnotateReq {
  task_id?: string;
  taskRunType?: ai_annotate.AIAnnotateTaskRunType;
  space_id?: string;
  base?: base.Base;
}

export interface RunAIAnnotateResp {
  runID?: string;
  baseResp?: base.BaseResp;
}

export interface TerminateAIAnnotateTaskRunReq {
  task_id?: string;
  task_run_id?: string;
  space_id?: string;
  base?: base.Base;
}

export interface TerminateAIAnnotateTaskRunResp {
  baseResp?: base.BaseResp;
}

export interface UpdateAIAnnotateTaskReq {
  task_id?: string;
  name?: string;
  promptID?: string;
  promptVersion?: string;
  userPromptColumnName?: string;
  promptVariables?: Array<ai_annotate.PromptVariable>;
  space_id?: string;
  base?: base.Base;
}

export interface UpdateAIAnnotateTaskResp {
  baseResp?: base.BaseResp;
}
/* eslint-enable */
