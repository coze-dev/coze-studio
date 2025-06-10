/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface Operation {
  /** 指标名称，参考 */
  operation_type: string;
  /** 指标的值 */
  operation_value: string;
  /** 指标的周期 */
  operation_period?: string;
  /** 指标空间id */
  space_id?: string;
  /** 指标空间id */
  psm?: string;
  /** 指标环境online or boe */
  fornax_env?: string;
  /** 模型id */
  model_id?: string;
  /** graph id */
  graph_uid?: string;
}
/* eslint-enable */
