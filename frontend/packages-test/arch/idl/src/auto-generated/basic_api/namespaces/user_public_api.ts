/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as user_common from './user_common';

export type Int64 = string | number;

export interface GetUserProfileData {
  /** 名字（唯一） */
  user_name?: string;
  /** 昵称 */
  name?: string;
  avatar?: string;
  user_id?: string;
  /** 签名 */
  signature?: string;
  /** 是否有正在审核的字段 */
  audit_status?: user_common.PassportAuditStatus;
  share_id?: string;
  /** 审核的细节 */
  audit_detail?: user_common.AuditDetail;
  /** 用户标签 */
  user_label?: user_common.UserLabel;
}

export interface GetUserProfileRequest {
  user_id?: string;
  bid?: string;
  Cookie?: string;
}

export interface GetUserProfileResponse {
  code: number;
  message: string;
  data?: GetUserProfileData;
}

export interface UpdateUserProfileCheckRequest {
  user_unique_name?: string;
}

export interface UpdateUserProfileCheckResponse {
  code: number;
  message: string;
}

export interface UpdateUserProfileRequest {
  user_unique_name?: string;
  name?: string;
  avatar?: string;
  signature?: string;
  Cookie?: string;
}

export interface UpdateUserProfileResponse {
  code: number;
  message: string;
}
/* eslint-enable */
