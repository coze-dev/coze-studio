/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';
import * as common from './common';

export type Int64 = string | number;

export interface GetConfigRequest {
  storage_config_id: string;
  Base?: base.Base;
}

export interface GetConfigResponse {
  config: common.OpenSearchConfig;
  BaseResp?: base.BaseResp;
}

export interface GetInstancesRequest {
  region: string;
  Base?: base.Base;
}

export interface GetInstancesResponse {
  configs: Array<common.OpenSearchConfig>;
  BaseResp?: base.BaseResp;
}

export interface OpenPublicAddressRequest {
  config: common.OpenSearchConfig;
  Base?: base.Base;
}

export interface OpenPublicAddressResponse {
  BaseResp?: base.BaseResp;
}

export interface SetConfigRequest {
  storage_config_id: string;
  /** 只有用户名密码的修改会生效 */
  config: common.OpenSearchConfig;
  Base?: base.Base;
}

export interface SetConfigResponse {
  BaseResp?: base.BaseResp;
}

export interface TestConnectionRequest {
  config: common.OpenSearchConfig;
  Base?: base.Base;
}

export interface TestConnectionResponse {
  BaseResp?: base.BaseResp;
}
/* eslint-enable */
