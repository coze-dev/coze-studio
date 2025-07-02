/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export interface AuthorizeConsentRequest {
  authorize_key: string;
  consent: boolean;
}

export interface AuthorizeConsentRequest2 {
  authorize_key: string;
  consent: boolean;
}

export interface AuthorizeConsentResponse {
  data: AuthorizeConsentResponseData;
}

export interface AuthorizeConsentResponse2 {
  code: number;
  msg: string;
  data: AuthorizeConsentResponseData;
}

export interface AuthorizeConsentResponseData {
  redirect_uri?: string;
}

export interface DeviceVerificationRequest {
  user_code: string;
}

export interface DeviceVerificationRequest2 {
  user_code: string;
}

export interface DeviceVerificationResponse {
  data: DeviceVerificationResponseData;
}

export interface DeviceVerificationResponse2 {
  code: number;
  msg: string;
  data: DeviceVerificationResponseData;
}

export interface DeviceVerificationResponseData {
  redirect_uri: string;
}

export interface InlineResponse200 {
  code: number;
  msg: string;
  data: AuthorizeConsentResponseData;
}

export interface InlineResponse2001 {
  code: number;
  msg: string;
  data: DeviceVerificationResponseData;
}

export interface RespBaseModel {
  code: number;
  msg: string;
}
/* eslint-enable */
