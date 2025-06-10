/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as fornaxob_domain_common from './fornaxob_domain_common';

export type Int64 = string | number;

export interface Annotation {
  id: string;
  annotation_type: string;
  key: string;
  value_type: string;
  value: string;
  status: string;
  auto_evaluate?: AutoEvaluate;
  /** 基础信息 */
  base_info?: fornaxob_domain_common.BaseInfo;
}

export interface AutoEvaluate {
  evaluator_version_id: string;
  evaluator_name: string;
  evaluator_version: string;
  evaluator_result?: EvaluatorResult;
  record_id: string;
  task_id: string;
}

export interface Correction {
  /** 人工校准得分 */
  score?: number;
  /** 人工校准理由 */
  explain?: string;
  /** 基础信息 */
  base_info?: fornaxob_domain_common.BaseInfo;
}

export interface EvaluatorResult {
  /** 打分 */
  score?: number;
  /** 校准打分 */
  correction?: Correction;
  /** 推理过程 */
  reasoning?: string;
}
/* eslint-enable */
