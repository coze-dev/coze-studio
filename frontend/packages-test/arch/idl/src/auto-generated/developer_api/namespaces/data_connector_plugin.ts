/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface GetNotionDocumentInfoRequest {
  document_url?: string;
  /** 表格内容获取数量 */
  block_search_size?: Int64;
}

export interface GetNotionDocumentInfoResponse {
  code?: Int64;
  msg?: string;
  Title?: string;
  Content?: string;
}
/* eslint-enable */
