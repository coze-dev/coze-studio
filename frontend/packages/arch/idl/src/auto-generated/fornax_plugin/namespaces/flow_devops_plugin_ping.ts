/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';

export type Int64 = string | number;

export interface PingReq {
  ping_message: string;
  base?: base.Base;
}

export interface PingResp {
  pong_message: string;
  base_resp?: base.BaseResp;
}
/* eslint-enable */
