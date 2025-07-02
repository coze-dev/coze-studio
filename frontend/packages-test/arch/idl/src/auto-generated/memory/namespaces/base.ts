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

export interface TrafficEnv {
  Open?: boolean;
  Env?: string;
}
/* eslint-enable */
