/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface AppendMemoryRequest {
  keyword: string;
  value: string;
}

export interface AppendMemoryResponse {
  status?: string;
  reason?: string;
}

export interface GetKVMemoryRequest {
  /** 查询关键字列表 */
  keywords?: Array<string>;
}

export interface GetKVMemoryResponse {
  status?: string;
  reason?: string;
  data?: Array<KVItem>;
}

export interface KVItem {
  keyword: string;
  value: string;
}

export interface KVListItem {
  keyword: string;
  value?: Array<string>;
}

export interface ListMemoryRequest {
  keywords?: Array<string>;
}

export interface ListMemoryResponse {
  status?: string;
  reason?: string;
  data?: Array<KVListItem>;
}

export interface SetKVMemoryRequest {
  data?: Array<KVItem>;
}

export interface SetKVMemoryResponse {
  status?: string;
  reason?: string;
}
/* eslint-enable */
