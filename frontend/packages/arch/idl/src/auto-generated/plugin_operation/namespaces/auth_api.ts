/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as plugin_common from './plugin_common';
import * as base from './base';

export type Int64 = string;

export interface CreateRecordData {
  /** 工单id */
  record_id?: number;
}

export interface CreateRecordRequest {
  /** 素材id */
  material_id: string;
  /** 类别id */
  category_id?: string;
  /** 操作类型 */
  operate_type: plugin_common.ListUnlistType;
  /** cookie */
  Cookie?: string;
  Base?: base.Base;
}

export interface CreateRecordResponse {
  code?: number;
  msg?: string;
  data?: CreateRecordData;
  BaseResp?: base.BaseResp;
}
/* eslint-enable */
