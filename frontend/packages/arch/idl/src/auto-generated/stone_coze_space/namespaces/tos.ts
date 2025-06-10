/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface GetUrlRequest {
  uri: string;
  /** Expiration time in seconds, default 3600 seconds, max 7 days, range [1, 604800] */
  expire_seconds?: Int64;
}

export interface GetUrlResponse {
  code?: Int64;
  msg?: string;
  data?: GetUrlResponseData;
}

export interface GetUrlResponseData {
  url?: string;
}
/* eslint-enable */
