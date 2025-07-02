/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum InviteCodeStatus {
  Unactivated = 1,
  Activated = 2,
}

export interface CheckInviteCodeData {
  is_first_invited?: boolean;
}

export interface CheckInviteCodeRequest {
  code?: string;
}

export interface CheckInviteCodeResponse {
  code?: Int64;
  msg?: string;
  data?: CheckInviteCodeData;
}

export interface CheckInWaitListData {
  is_in_wait_list?: boolean;
}

export interface CheckInWaitListRequest {}

export interface CheckInWaitListResponse {
  code?: Int64;
  msg?: string;
  data?: CheckInWaitListData;
}

export interface GetInviteInfoData {
  pass_invite_check?: boolean;
  is_overload?: boolean;
  invite_code_list?: Array<InviteCodeInfo>;
  is_invite_code_locked?: boolean;
}

export interface GetInviteInfoRequest {}

export interface GetInviteInfoResponse {
  code?: Int64;
  msg?: string;
  data?: GetInviteInfoData;
}

export interface InviteCodeInfo {
  code?: string;
  status?: InviteCodeStatus;
  activate_time?: Int64;
}

export interface JoinWaitListRequest {}

export interface JoinWaitListResponse {
  code?: Int64;
  msg?: string;
}
/* eslint-enable */
