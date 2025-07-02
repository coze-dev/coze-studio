/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface DataSourceAuthorizeRequest {
  code?: string;
  state?: string;
}

export interface DataSourceAuthorizeResponse {
  code?: Int64;
  msg?: string;
}
/* eslint-enable */
