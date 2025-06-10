/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface Base {
  LogID?: string;
  Caller?: string;
  Addr?: string;
  Client?: string;
  TrafficEnv?: TrafficEnv;
  Extra?: Record<string, string>;
}

export interface BaseResp {
  StatusMessage?: string;
  StatusCode?: number;
  Extra?: Record<string, string>;
}

export interface EmptyData {}

export interface EmptyReq {}

export interface EmptyResp {
  code?: Int64;
  msg?: string;
  data?: EmptyData;
}

export interface EmptyRpcReq {
  Base?: Base;
}

export interface EmptyRpcResp {
  BaseResp?: BaseResp;
}

export interface TrafficEnv {
  Open?: boolean;
  Env?: string;
}
/* eslint-enable */
