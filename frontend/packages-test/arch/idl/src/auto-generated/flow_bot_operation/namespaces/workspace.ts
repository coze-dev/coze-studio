/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';
import * as common from './common';

export type Int64 = string | number;

export enum ModelStatus {
  enable = 0,
  disable = 1,
}

export interface AddModelConfigData {
  config_id?: string;
}

export interface AddModelConfigRequest {
  space_id?: string;
  key_name?: string;
  endpoint_id?: string;
  model_name?: string;
  model_id?: string;
  Base?: base.Base;
}

export interface AddModelConfigResponse {
  data?: AddModelConfigData;
  code?: Int64;
  msg?: string;
}

export interface GetModelConfigListRequest {
  space_id?: string;
  Base?: base.Base;
}

export interface GetModelConfigListResponse {
  data?: ModelConfigData;
  code?: Int64;
  msg?: string;
}

export interface GetSpaceListRequest {
  space_id?: string;
  owner_uid?: string;
  space_type?: Int64;
  page?: Int64;
  size?: Int64;
  Base?: base.Base;
}

export interface GetSpaceListResponse {
  data?: SpaceListData;
  code?: Int64;
  msg?: string;
}

export interface ModelConfig {
  model_name?: string;
  /** 2:  string key_name */
  model_status?: ModelStatus;
  is_default_model?: boolean;
  model_id?: string;
  config_id?: string;
}

export interface ModelConfigData {
  configs?: Array<ModelConfig>;
}

export interface SetByteTreeRequest {
  space_id?: string;
  byte_tree_node_id?: string;
  byte_tree_node_name?: string;
  Base?: base.Base;
}

export interface SetByteTreeResponse {
  data?: common.EmptyData;
  code?: Int64;
  msg?: string;
}

export interface SetWorkSpaceMemberLimitRequest {
  space_id?: string;
  limit_num?: number;
  Base?: base.Base;
}

export interface SetWorkSpaceMemberLimitResponse {
  data?: common.EmptyData;
  code?: Int64;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface SpaceItem {
  space_id?: string;
  space_name?: string;
  owner_uid?: string;
  space_type?: Int64;
  remain_token?: Int64;
  user_count?: Int64;
  create_time?: string;
  description?: string;
  icon_url?: string;
  byte_tree_node_id?: string;
  byte_tree_node_name?: string;
  limit_num?: number;
}

export interface SpaceListData {
  workspace_list?: Array<SpaceItem>;
  total?: Int64;
}

export interface UpdateModelConfigRequest {
  config_id?: string;
  model_status?: ModelStatus;
  is_default_model?: boolean;
  Base?: base.Base;
}

export interface UpdateModelConfigResponse {
  data?: common.EmptyData;
  code?: Int64;
  msg?: string;
}
/* eslint-enable */
