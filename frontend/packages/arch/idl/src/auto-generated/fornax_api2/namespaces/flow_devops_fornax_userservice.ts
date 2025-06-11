/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';
import * as user from './user';

export type Int64 = string | number;

export interface AuthComponentSDKRequest {
  /** 一个随机字符串，由数字、字母组成 */
  noncestr?: string;
  /** 时间戳（毫秒） */
  timestamp?: Int64;
  /** 组件页面url */
  url?: string;
  Base?: base.Base;
}

export interface AuthComponentSDKResponse {
  signature?: string;
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface GetSessionInfoRequest {
  Base?: base.Base;
}

export interface GetSessionInfoResponse {
  /** 登录用户信息 */
  user_info?: user.UserInfoDetail;
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface GetUserInfoRequest {
  /** 选填用户ID */
  user_id?: string;
  /** 选填用户名 */
  user_name?: string;
  Base?: base.Base;
}

export interface GetUserInfoResponse {
  /** 用户信息 */
  user_info?: user.UserInfoDetail;
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface KickUserReq {
  extUserID: string;
  'Zti-Token': string;
  Base?: base.Base;
}

export interface KickUserResp {
  BaseResp?: base.BaseResp;
}

export interface LoginRequest {
  /** 登录授权码 */
  code?: string;
  /** 登录流程重定向uri */
  state?: string;
  /** 指定 sessionID */
  session_id?: string;
  Base?: base.Base;
}

export interface LoginResponse {
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface LogoutRequest {
  Base?: base.Base;
}

export interface LogoutResponse {
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface MGetUserInfoRequest {
  /** fornax UserID列表 */
  user_ids?: Array<string>;
  /** SsoUserName列表 */
  user_names?: Array<string>;
  /** 飞书UserID列表 */
  ext_user_ids?: Array<string>;
  Base?: base.Base;
}

export interface MGetUserInfoResponse {
  /** 用户信息列表 */
  user_infos?: Array<user.UserInfoDetail>;
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface QueryUserInfoRequest {
  /** 用户名模糊搜索 */
  name_like: string;
  /** 分页大小，默认为20 */
  page_size?: number;
  /** 分页Token */
  page_token?: string;
  Base?: base.Base;
}

export interface QueryUserInfoResponse {
  /** 用户信息列表 */
  user_infos?: Array<user.UserInfoDetail>;
  /** 分页Token */
  page_token?: string;
  /** 是否还有下一页 */
  has_more?: boolean;
  code?: number;
  msg?: string;
  BaseResp?: base.BaseResp;
}
/* eslint-enable */
