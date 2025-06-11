/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';

export type Int64 = string | number;

export interface HasKaniAuthRequest {
  user_id?: string;
  api_path?: string;
  frontend_url?: string;
  Base?: base.Base;
}

export interface HasKaniAuthResponse {
  is_allowed?: boolean;
  kaniAuthResp?: KaniAuthResp;
  BaseResp?: base.BaseResp;
}

export interface KaniAuthResp {
  app_id?: string;
  resource?: string;
  region?: string;
  action?: Array<string>;
}

export interface LoginAuthResp {
  redirect_uri?: string;
}
/* eslint-enable */
