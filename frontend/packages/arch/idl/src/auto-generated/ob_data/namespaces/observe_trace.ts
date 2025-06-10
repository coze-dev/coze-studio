/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as common from './common';
import * as ob_trace from './ob_trace';

export type Int64 = string | number;

export interface BatchGetTracesAdvanceInfoV2Request {
  /** space id */
  space_id: string;
  /** 场景参数  不同场景使用的通用参数 */
  scene_param: common.SceneCommonParam;
  traces: Array<ob_trace.TraceQueryParams>;
}

export interface BatchGetTracesAdvanceInfoV2Response {
  data: ob_trace.BatchGetTracesAdvanceInfoData;
  /** 仅供http请求使用; 内部RPC不予使用，统一通过BaseResp获取Code和Msg */
  code: number;
  /** 仅供http请求使用; 内部RPC不予使用，统一通过BaseResp获取Code和Msg */
  msg: string;
}

export interface GetTraceV2Request {
  /** space id */
  space_id: string;
  /** 场景参数  不同场景使用的通用参数 */
  scene_param: common.SceneCommonParam;
  trace_id: string;
  start_time: string;
  end_time: string;
}

export interface GetTraceV2Response {
  data: ob_trace.GetTraceData;
  /** 仅供http请求使用; 内部RPC不予使用，统一通过BaseResp获取Code和Msg */
  code: number;
  /** 仅供http请求使用; 内部RPC不予使用，统一通过BaseResp获取Code和Msg */
  msg: string;
}
/* eslint-enable */
