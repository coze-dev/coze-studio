/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';
import * as flow_devops_coze_evaluation_entity from './flow_devops_coze_evaluation_entity';
import * as flow_devops_evaluation_evaluator from './flow_devops_evaluation_evaluator';

export type Int64 = string | number;

export enum ObjectType {
  Bot = 1,
  Workflow = 2,
  Model = 3,
}

export interface JudgePromptTemplate {
  name: string;
  desc?: string;
  content: string;
}

export interface OptimizeJudgePromptRequest {
  space_id: Int64;
  prompt: string;
  batch_task_id?: Int64;
  Base?: base.Base;
}

export interface OptimizeJudgePromptResponse {
  id?: string;
  event?: flow_devops_coze_evaluation_entity.SSEEvent;
  content?: string;
  /** Usage 尾包设置 */
  usage?: flow_devops_coze_evaluation_entity.Usage;
  code: number;
  msg: string;
  BaseResp?: base.BaseResp;
}

export interface OverwriteRuleRequest {
  space_id: Int64;
  batch_task_id: Int64;
  rule: flow_devops_evaluation_evaluator.Rule;
  cid?: string;
  Base?: base.Base;
}

export interface OverwriteRuleResponse {
  rule?: flow_devops_evaluation_evaluator.Rule;
  code: number;
  msg: string;
  BaseResp?: base.BaseResp;
}

export interface PullJudgePromptTemplateRequest {
  space_id: Int64;
  cursor: Int64;
  limit: Int64;
  object_type?: ObjectType;
}

export interface PullJudgePromptTemplateResponse {
  templates: Array<JudgePromptTemplate>;
  next_cursor?: Int64;
  has_more?: boolean;
  code: number;
  msg: string;
  BaseResp?: base.BaseResp;
}
/* eslint-enable */
