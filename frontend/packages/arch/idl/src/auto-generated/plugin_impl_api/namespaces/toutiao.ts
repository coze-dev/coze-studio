/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface InputSearchRequest {
  input_query: string;
  search_id?: string;
  count?: number;
  cursor?: number;
}

export interface InputSearchResponse {
  ok: boolean;
  errcode: Int64;
  errmsg: string;
  data: SearchLinkResp;
}

export interface LinkInfo {
  sitename?: string;
  summary?: string;
  title?: string;
  url: string;
}

export interface ReadLinkResp {
  content: string;
  title: string;
}

export interface SearchLinkResp {
  cursor: number;
  doc_results?: Array<LinkInfo>;
  has_more: boolean;
  search_id: string;
}

export interface UrlSearchRequest {
  url: string;
  prompt?: string;
}

export interface UrlSearchResponse {
  ok: boolean;
  errcode: Int64;
  errmsg: string;
  data: ReadLinkResp;
}
/* eslint-enable */
