/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum QueriesOperation {
  Contains = 0,
  IsNull = 1,
}

export enum QueriesValueType {
  String = 0,
  Enum = 1,
  /** 级联，多级枚举 */
  MultiLevelEnum = 2,
}

export interface FieldMeta {
  /** 支持的筛选动作，如contains, is_null */
  operations?: Array<QueriesOperation>;
  /** value类型，如string, enum */
  value_type?: QueriesValueType;
  /** value结果 */
  value_options?: Array<ParentQueriesValueOption>;
}

export interface ParentQueriesValueOption {
  /** 前端用来筛选的传参 */
  key?: string;
  /** 给前端展示的内容 */
  value?: string;
  /** 级联时的嵌套关系 */
  children?: Array<QueriesValueOption>;
}

export interface QueriesData {
  /** 意图 */
  intent?: string;
  session_id?: string;
  input?: string;
  output?: string;
  /** unix时间戳，ms */
  start_time?: string;
  /** 渠道名，通过starling转换而来 */
  channel?: string;
}

export interface QueriesFilter {
  /** ValueType=String时，在此处传值 */
  string_value?: string;
  /** ValueType=Enum，在此处传值 */
  enums?: Array<string>;
}

export interface QueriesValueOption {
  /** 前端用来筛选的传参 */
  key?: string;
  /** 给前端展示的内容 */
  value?: string;
}
/* eslint-enable */
