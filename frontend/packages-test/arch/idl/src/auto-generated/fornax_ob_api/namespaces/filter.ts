/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as flow_devops_fornaxob_common from './flow_devops_fornaxob_common';

export type Int64 = string | number;

export interface FilterField {
  field_name?: string;
  field_type?: string;
  values?: Array<string>;
  query_type?: string;
  query_and_or?: string;
  sub_filter?: FilterFields;
  /** 临时新增，预期不应该存在 */
  hidden?: boolean;
}

export interface FilterFields {
  query_and_or?: string;
  filter_fields: Array<FilterField>;
}

export interface SpanFilters {
  /** Span 过滤条件 */
  filters?: FilterFields;
  /** 平台类型，不填默认是fornax */
  platform_type?: flow_devops_fornaxob_common.PlatformType;
  /** 查询的 span 标签页类型，不填默认是 root span */
  span_list_type?: flow_devops_fornaxob_common.SpanListType;
}

export interface TaskFilterField {
  field_name?: string;
  field_type?: string;
  values?: Array<string>;
  query_type?: string;
  query_and_or?: string;
  sub_filter?: TaskFilterField;
}

export interface TaskFilterFields {
  query_and_or?: string;
  filter_fields: Array<TaskFilterField>;
}
/* eslint-enable */
