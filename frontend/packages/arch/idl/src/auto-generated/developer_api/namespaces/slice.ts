/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum SliceStatus {
  /** 未向量化 */
  PendingVectoring = 0,
  /** 已向量化 */
  FinishVectoring = 1,
  /** 禁用 */
  Deactive = 9,
}

export interface ChangeSliceStatusReq {
  slice_id: string;
  status: SliceStatus;
}

export interface CreateSliceData {
  slice_id?: string;
}

export interface CreateSliceReq {
  document_id: string;
  /** 限制2000字 */
  content: string;
}

export interface CreateSliceResp {
  code?: number;
  msg?: string;
  data?: CreateSliceData;
}

export interface DelSliceReq {
  slice_id: string;
}

export interface GetSliceListData {
  data?: Array<SliceInfo>;
  total?: number;
}

export interface GetSliceListReq {
  doc_id?: string;
  /** 序号 */
  sequence?: number;
  /** 查询关键字 */
  key_word?: string;
  /** 从1开始 */
  page_no?: number;
  /** 数量 */
  page_size?: number;
  sort_field?: string;
  is_asc?: boolean;
}

export interface GetSliceListResp {
  code?: number;
  msg?: string;
  data?: GetSliceListData;
}

export interface SliceInfo {
  slice_id?: string;
  /** 如果为 table 类型，内容为 json 格式 */
  content?: string;
  /** 状态 */
  status?: SliceStatus;
  /** 命中次数 */
  hit_count?: number;
  /** 字符数 */
  char_count?: number;
  /** token数 */
  token_count?: number;
  /** 序号 */
  sequence?: number;
}

export interface UpdateSliceContentReq {
  slice_id: string;
  /** 限制2000字 */
  content: string;
}
/* eslint-enable */
