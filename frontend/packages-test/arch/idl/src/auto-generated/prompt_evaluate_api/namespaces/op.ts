/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';

export type Int64 = string | number;

/** 运营后台idl */
export interface OpGetUserInfoRequest {
  user_id?: string;
  Base?: base.Base;
}

export interface OpGetUserInfoResponse {
  /** 用户信息 */
  user_info?: OpUserInfo;
  BaseResp: base.BaseResp;
}

export interface OpUserInfo {
  /** 用户基本信息 */
  basic_info?: UserbasicInfo;
  /** 付费信息 */
  payment_info?: UserPaymentInfo;
  /** 专业版信息 */
  professional_info?: UserProfessionalInfo;
}

export interface UserbasicInfo {
  user_id?: string;
  /** 用户名 */
  user_name?: string;
  /** 邮箱 */
  email?: string;
  /** 用户类型  内部用户/外部用户 */
  user_type?: string;
  /** 注册时间 */
  registration_time?: string;
}

/** 用户普通版付费信息 */
export interface UserPaymentInfo {
  /** 是否订阅 */
  is_in_subscribe?: string;
}

/** 用户专业版信息 */
export interface UserProfessionalInfo {
  /** 是否专业版用户 */
  is_professional?: string;
  /** 火山ID */
  volcano_openId?: string;
}
/* eslint-enable */
