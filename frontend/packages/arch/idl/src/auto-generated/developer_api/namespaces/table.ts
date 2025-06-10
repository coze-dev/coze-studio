/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum FieldItemType {
  /** 文本 */
  Text = 1,
  /** 数字 */
  Number = 2,
  /** 时间 */
  Date = 3,
  /** float */
  Float = 4,
  /** bool */
  Boolean = 5,
}

export interface AddTableRequest {
  bot_id: string;
  name: string;
  desc: string;
  field_list?: Array<FieldItem>;
}

export interface AddTableResponse {
  code?: Int64;
  msg?: string;
  table_id?: string;
}

export interface AlterTableRequest {
  bot_id: string;
  table_id: string;
  name: string;
  desc: string;
  field_list?: Array<FieldItem>;
}

export interface AlterTableResponse {
  code?: Int64;
  msg?: string;
  table_id?: string;
}

export interface DeleteTableRequest {
  bot_id: string;
  table_id: string;
}

export interface DeleteTableResponse {
  code?: Int64;
  msg?: string;
  table_id?: string;
}

export interface FieldItem {
  name?: string;
  desc?: string;
  type?: FieldItemType;
  must_required?: boolean;
  /** 字段Id 新增为0 */
  id?: Int64;
}

export interface ListTableRequest {
  bot_id: string;
  table_id: Array<string>;
}

export interface ListTableResponse {
  code?: Int64;
  msg?: string;
  table_infos?: Array<TableInfo>;
}

export interface TableInfo {
  table_id?: string;
  name?: string;
  desc?: string;
  field_list?: Array<FieldItem>;
}

export interface TableInfoAddRequest {
  bot_id?: string;
  table_id?: string;
  data_list?: Array<Record<string, string>>;
}

export interface TableInfoAddResponse {
  code?: Int64;
  msg?: string;
  table_id?: string;
}

export interface TableInfoDeleteRequest {
  bot_id?: string;
  table_id?: string;
  data_ids?: Array<string>;
}

export interface TableInfoDeleteResponse {
  code?: Int64;
  msg?: string;
  table_id?: string;
  data_ids?: Array<string>;
}

export interface TableInfoQueryRequest {
  keyword?: string;
  bot_id?: string;
  table_id?: string;
  offset?: Int64;
  limit?: Int64;
}

export interface TableInfoQueryResponse {
  code?: Int64;
  msg?: string;
  data_list?: Array<Record<string, string>>;
}

export interface TableInfoUpdateRequest {
  bot_id?: string;
  table_id?: string;
  data_list?: Array<Record<string, string>>;
}

export interface TableInfoUpdateResponse {
  code?: Int64;
  msg?: string;
  table_id?: string;
}
/* eslint-enable */
