/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as common from './common';

export type Int64 = string | number;

export interface CheckEmailVerifyCodeData {
  status?: common.VerifyStatus;
  /** 验证票据，用于验证 Email 是否真正完成了校验 */
  ticket?: string;
}

export interface CheckEmailVerifyCodeRequest {
  message_id?: string;
  verify_code?: string;
  email_address?: string;
}

export interface CheckEmailVerifyCodeResponse {
  code?: number;
  message?: string;
  data?: CheckEmailVerifyCodeData;
}

export interface CheckMobileVerifyCodeData {
  status?: common.VerifyStatus;
  /** 验证票据，用于验证 Mobile 是否真正完成了校验 */
  ticket?: string;
}

export interface CheckMobileVerifyCodeRequest {
  message_id?: string;
  verify_code?: string;
  mobile?: string;
}

export interface CheckMobileVerifyCodeResponse {
  code?: number;
  message?: string;
  data?: CheckMobileVerifyCodeData;
}

export interface SendEmailVerifyCodeRequest {
  'Tt-Agw-Client-Ip'?: string;
  email_address?: string;
}

export interface SendEmailVerifyCodeResponse {
  code?: number;
  message?: string;
  data?: SendEmailVerifyData;
}

export interface SendEmailVerifyData {
  message_id?: string;
}

export interface SendMobileVerifyCodeRequest {
  'Tt-Agw-Client-Ip'?: string;
  mobile?: string;
}

export interface SendMobileVerifyCodeResponse {
  code?: number;
  message?: string;
  data?: SendMobileVerifyData;
}

export interface SendMobileVerifyData {
  message_id?: string;
}
/* eslint-enable */
