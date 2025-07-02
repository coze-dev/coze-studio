/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface CozeSpaceUserInfo {
  /** 是否近期活跃 */
  is_recently_active?: boolean;
}

export interface GetCozeSpaceUserInfoRequest {}

export interface GetCozeSpaceUserInfoResponse {
  code?: Int64;
  msg?: string;
  data?: CozeSpaceUserInfo;
}
/* eslint-enable */
