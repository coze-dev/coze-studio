/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';

export type Int64 = string | number;

export enum ConnectorAuditStatus {
  /** 未知、无审核 */
  Unknown = 0,
  /** 审核中 */
  Progress = 1,
  /** 审核通过 */
  Audited = 2,
  /** 审核拒绝 */
  Reject = 3,
}

export interface OpenAPIBindConnectorUserConfigRequest {
  connector_id?: string;
  configs?: Array<UserConfig>;
  Base: base.Base;
}

export interface OpenAPIBindConnectorUserConfigResponse {
  code?: number;
  msg?: string;
  BaseResp: base.BaseResp;
}

export interface OpenAPIInstallConnectorToWorkspaceRequest {
  workspace_id?: string;
  connector_id?: string;
  Base: base.Base;
}

export interface OpenAPIInstallConnectorToWorkspaceResponse {
  code?: number;
  msg?: string;
  BaseResp: base.BaseResp;
}

export interface OpenAPIUpdateConnectorBotRequest {
  bot_id?: string;
  audit_status?: ConnectorAuditStatus;
  reason?: string;
  share_link?: string;
  connector_id?: string;
  Base: base.Base;
}

export interface OpenAPIUpdateConnectorBotResponse {
  code?: number;
  msg?: string;
  BaseResp: base.BaseResp;
}

export interface UserConfig {
  key?: string;
  enums?: Array<UserConfigEnum>;
}

export interface UserConfigEnum {
  value?: string;
  label?: string;
}
/* eslint-enable */
