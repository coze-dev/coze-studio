/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface DelProfileMemoryRequest {
  bot_id?: string;
  keywords?: Array<string>;
}

export interface DelProfileMemoryResponse {
  code?: Int64;
  msg?: string;
}

export interface GetProfileMemoryData {
  memories?: Array<KVItem>;
}

export interface GetProfileMemoryRequest {
  bot_id?: string;
  task_id?: string;
  space_id?: string;
}

export interface GetProfileMemoryResponse {
  code?: Int64;
  msg?: string;
  data?: GetProfileMemoryData;
}

export interface KVItem {
  keyword?: string;
  value?: string;
  create_time?: string;
  update_time?: string;
}

export interface UpsertProfileMemoryRequest {
  bot_id?: Int64;
  profile?: Array<KVItem>;
}

export interface UpsertProfileMemoryResponse {
  code?: Int64;
  msg?: string;
}
/* eslint-enable */
