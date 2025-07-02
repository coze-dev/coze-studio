/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface CreateTwitterRequest {
  content: string;
}

export interface CreateTwitterResponse {
  twitter_url?: string;
}

export interface DeleteTwitterRequest {
  twitter_id: string;
}

export interface DeleteTwitterResponse {
  code?: number;
  msg?: string;
}
/* eslint-enable */
