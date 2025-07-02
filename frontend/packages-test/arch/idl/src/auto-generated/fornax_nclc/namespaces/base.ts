/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface Base {
  log_i_d?: string;
  caller?: string;
  addr?: string;
  client?: string;
  traffic_env?: TrafficEnv;
  extra?: Record<string, string>;
}

export interface BaseResp {
  status_message?: string;
  status_code?: number;
  extra?: Record<string, string>;
}

export interface TrafficEnv {
  open?: boolean;
  env?: string;
}
/* eslint-enable */
