/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';

export type Int64 = string | number;

export interface PingReq {
  'FlowDevops-Agw-UserId'?: string;
  ping_message: string;
  'FlowDevops-Agw-AppId'?: number;
  /** added by agw end */
  Base?: base.Base;
}

export interface PingResp {
  pong_message: string;
  BaseResp?: base.BaseResp;
}
/* eslint-enable */
