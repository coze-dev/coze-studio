/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as flow_devops_fornaxob_common from './flow_devops_fornaxob_common';
import * as base from './base';

export type Int64 = string | number;

export enum AttributeValueType {
  Unknown = 0,
  String = 1,
  Boolean = 2,
  StringList = 11,
  BooleanList = 12,
}

export enum ResourceType {
  Account = 1,
  Workspace = 2,
  LoopTraceView = 31,
  LoopTask = 34,
}

export interface AttributeValue {
  Type: AttributeValueType;
  Value: string;
}

export interface CreateViewRequest {
  enterprise_id: string;
  fornax_space_id: string;
  view_name: string;
  /** 平台类型,数据来源 */
  platform_type: flow_devops_fornaxob_common.PlatformType;
  /** 查询的 span 标签页类型 */
  span_list_type: flow_devops_fornaxob_common.SpanListType;
  filters: string;
  base?: base.Base;
}

export interface CreateViewResponse {
  id: string;
  baseResp?: base.BaseResp;
}

export interface DeleteViewRequest {
  id: string;
  fornax_space_id: string;
  base?: base.Base;
}

export interface DeleteViewResponse {
  baseResp?: base.BaseResp;
}

export interface ListViewsRequest {
  enterprise_id: string;
  fornax_space_id: string;
  view_name?: string;
  base?: base.Base;
}

export interface ListViewsResponse {
  views: Array<View>;
  baseResp?: base.BaseResp;
}

export interface ResourceIdentifier {
  /** 资源类型 */
  Type: ResourceType;
  /** 资源Id */
  Id: string;
}

export interface UpdateViewRequest {
  id: string;
  fornax_space_id: string;
  view_name?: string;
  /** 平台类型,数据来源 */
  platform_type?: flow_devops_fornaxob_common.PlatformType;
  /** 查询的 span 标签页类型 */
  span_list_type?: flow_devops_fornaxob_common.SpanListType;
  filters?: string;
  base?: base.Base;
}

export interface UpdateViewResponse {
  baseResp?: base.BaseResp;
}

export interface View {
  id: string;
  enterprise_id?: string;
  fornax_space_id?: string;
  view_name: string;
  /** 平台类型,数据来源 */
  platform_type?: flow_devops_fornaxob_common.PlatformType;
  /** 查询的 span 标签页类型 */
  span_list_type?: flow_devops_fornaxob_common.SpanListType;
  filters: string;
  /** 是否是系统视图，系统视图不可删除修改，只能应用另存为 */
  is_system: boolean;
}
/* eslint-enable */
