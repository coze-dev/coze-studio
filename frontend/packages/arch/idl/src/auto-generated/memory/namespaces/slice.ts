/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';
import * as common from './common';

export type Int64 = string | number;

export enum SliceSource {
  bot = 1,
  hit_test = 2,
}

export interface BatchDeleteSliceRequest {
  slice_id_list: Array<string>;
  document_id: string;
  Base?: base.Base;
}

export interface BatchDeleteSliceResponse {
  code: Int64;
  msg: string;
}

export interface ChangeSliceStatusReq {
  slice_id: string;
  creator_id: string;
  status: common.SliceStatus;
  Base?: base.Base;
}

export interface ChangeSliceStatusResp {
  code: Int64;
  msg: string;
  BaseResp?: base.BaseResp;
}

export interface CreateSliceReq {
  document_id: string;
  creator_id?: string;
  content: string;
  Base?: base.Base;
}

export interface CreateSliceResp {
  slice_id?: string;
  code: Int64;
  msg: string;
  BaseResp?: base.BaseResp;
}

export interface DelSliceReq {
  slice_id: string;
  creator_id?: string;
  Base?: base.Base;
}

export interface DelSliceResp {
  code: Int64;
  msg: string;
  BaseResp?: base.BaseResp;
}

export interface GetSliceListReq {
  doc_id?: string;
  /** 序号 */
  sequence?: string;
  /** 查询关键字 */
  key_word?: string;
  creator_id?: string;
  /** 从1开始 */
  page_no?: string;
  page_size?: string;
  sort_field?: string;
  is_asc?: boolean;
  Base?: base.Base;
}

export interface GetSliceListResp {
  slice_list?: Array<common.SliceInfo>;
  total?: string;
  code: Int64;
  msg: string;
  BaseResp?: base.BaseResp;
}

export interface UpdateSliceContentReq {
  slice_id: string;
  creator_id?: string;
  /** 限制2000字 */
  content: string;
  Base?: base.Base;
}

export interface UpdateSliceContentResp {
  code: Int64;
  msg: string;
  BaseResp?: base.BaseResp;
}
/* eslint-enable */
