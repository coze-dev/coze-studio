/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as flow_devops_fornaxob_common from './flow_devops_fornaxob_common';
import * as operation from './operation';

export type Int64 = string | number;

export enum AggregationType {
  Day = 0,
  Week = 1,
  Month = 2,
  Quarter = 3,
  Year = 4,
}

export enum OperationType {
  Token = 0,
}

export interface GetCommonOperationAggregationRequest {
  space_id: string;
  /** 聚合键 */
  aggregation_keys: Array<string>;
  /** 查询环境类型，默认为全部 */
  fornax_env?: flow_devops_fornaxob_common.EnvType;
}

export interface GetCommonOperationAggregationResponse {
  /** 通用指标 */
  operation_aggregations: Array<OperationAggregation>;
  /** 仅供http请求使用; 内部RPC不予使用，统一通过BaseResp获取Code和Msg */
  code?: number;
  /** 仅供http请求使用; 内部RPC不予使用，统一通过BaseResp获取Code和Msg */
  msg?: string;
}

export interface OperationAggregation {
  key: string;
  data: Array<string>;
}

export interface QueryOperationRequest {
  space_id: string;
  /** 指标类型 */
  operation_type: string;
  /** 开始时间。时间戳，精确到毫秒 */
  start_time: Int64;
  /** 结束时间。时间戳，精确到毫秒 */
  end_time: Int64;
  /** psm列表 */
  psm?: Array<string>;
  /** 聚合类型，默认为天 */
  aggregation_type?: AggregationType;
  /** 模型id */
  model_id?: Array<string>;
  /** 查询环境类型，默认为全部 */
  fornax_env?: flow_devops_fornaxob_common.EnvType;
}

export interface QueryOperationResponse {
  operations: Array<operation.Operation>;
  /** 指标类型 */
  operation_type: string;
  /** 指标累加值 */
  total?: string;
  /** 1天对比 */
  one_day_comparison?: number;
  /** 往前一周期对比 */
  one_period_comparison?: number;
  /** 仅供http请求使用; 内部RPC不予使用，统一通过BaseResp获取Code和Msg */
  code?: number;
  /** 仅供http请求使用; 内部RPC不予使用，统一通过BaseResp获取Code和Msg */
  msg?: string;
}
/* eslint-enable */
