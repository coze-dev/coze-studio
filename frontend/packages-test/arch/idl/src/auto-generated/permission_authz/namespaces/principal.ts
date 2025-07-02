/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum AuthType {
  /** 用户直接访问 */
  Session = 1,
  /** Personal access token */
  PAT = 2,
  /** App Itself */
  AppItself = 3,
  /** App JWT Flow */
  JWT = 4,
  /** Auth Code Flow */
  AuthCode = 5,
  /** PKCE Flow */
  PKCE = 6,
  /** Device code */
  DeviceCode = 7,
  /** Impersonate */
  Impersonate = 8,
  /** Token Exchange Impersonate */
  TokenExchangeImpersonate = 9,
}

export enum PrincipalType {
  User = 1,
  Service = 2,
}

export interface PrincipalIdentifier {
  /** 主体类型 */
  type: PrincipalType;
  /** 主体Id */
  id: string;
}
/* eslint-enable */
