/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as eval_target from './eval_target';
import * as base from './base';

export type Int64 = string | number;

export interface BatchGetEvalTargetBySourceRequest {
  space_id: Int64;
  source_target_ids?: Array<string>;
  eval_target_type?: eval_target.EvalTargetType;
  need_source_info?: boolean;
  Base?: base.Base;
}

export interface BatchGetEvalTargetBySourceResponse {
  eval_targets?: Array<eval_target.EvalTarget>;
  BaseResp?: base.BaseResp;
}

export interface BatchGetEvalTargetRecordRequest {
  space_id: Int64;
  eval_target_record_ids?: Array<Int64>;
  Base?: base.Base;
}

export interface BatchGetEvalTargetRecordResponse {
  eval_target_records: Array<eval_target.EvalTargetRecord>;
  BaseResp?: base.BaseResp;
}

export interface BatchGetEvalTargetVersionRequest {
  space_id: Int64;
  eval_target_version_ids?: Array<Int64>;
  need_source_info?: boolean;
  Base?: base.Base;
}

export interface BatchGetEvalTargetVersionResponse {
  eval_targets?: Array<eval_target.EvalTarget>;
  BaseResp?: base.BaseResp;
}

export interface CreateEvalTargetParam {
  source_target_id?: string;
  source_target_version?: string;
  eval_target_type?: eval_target.EvalTargetType;
  bot_info_type?: eval_target.CozeBotInfoType;
  /** 如果是发布版本则需要填充这个字段 */
  bot_publish_version?: string;
}

export interface CreateEvalTargetRequest {
  space_id: Int64;
  param?: CreateEvalTargetParam;
  Base?: base.Base;
}

export interface CreateEvalTargetResponse {
  id?: Int64;
  version_id?: Int64;
  BaseResp?: base.BaseResp;
}

export interface ExecuteEvalTargetRequest {
  space_id: Int64;
  eval_target_id: Int64;
  eval_target_version_id: Int64;
  input_data: eval_target.EvalTargetInputData;
  experiment_run_id?: Int64;
  Base?: base.Base;
}

export interface ExecuteEvalTargetResponse {
  eval_target_record: eval_target.EvalTargetRecord;
  BaseResp?: base.BaseResp;
}

export interface GetEvalTargetRecordRequest {
  space_id: Int64;
  eval_target_record_id: Int64;
  Base?: base.Base;
}

export interface GetEvalTargetRecordResponse {
  eval_target_record?: eval_target.EvalTargetRecord;
  BaseResp?: base.BaseResp;
}

export interface GetEvalTargetVersionRequest {
  space_id: Int64;
  eval_target_version_id?: Int64;
  Base?: base.Base;
}

export interface GetEvalTargetVersionResponse {
  eval_target?: eval_target.EvalTarget;
  BaseResp?: base.BaseResp;
}

export interface ListSourceEvalTargetRequest {
  space_id: Int64;
  target_type?: eval_target.EvalTargetType;
  /** 用户模糊搜索bot名称、promptkey */
  name?: string;
  page_size?: number;
  cursor?: string;
  Base?: base.Base;
}

export interface ListSourceEvalTargetResponse {
  eval_targets?: Array<eval_target.EvalTarget>;
  next_cursor?: string;
  has_more?: boolean;
  BaseResp?: base.BaseResp;
}

export interface ListSourceEvalTargetVersionRequest {
  space_id: Int64;
  source_target_id: string;
  target_type?: eval_target.EvalTargetType;
  page_size?: number;
  cursor?: string;
  Base?: base.Base;
}

export interface ListSourceEvalTargetVersionResponse {
  versions?: Array<eval_target.EvalTargetVersion>;
  next_cursor?: string;
  has_more?: boolean;
  BaseResp?: base.BaseResp;
}
/* eslint-enable */
