/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';

export type Int64 = string | number;

export interface SyncBamApiByPsmRequest {
  /** 要同步接口的psm */
  psm: string;
  /** 分支 */
  branch?: string;
  Base?: base.Base;
}

export interface SyncBamApiByPsmResponse {
  /** 同步psm接过 */
  sync_result: boolean;
  BaseResp?: base.BaseResp;
}
/* eslint-enable */
