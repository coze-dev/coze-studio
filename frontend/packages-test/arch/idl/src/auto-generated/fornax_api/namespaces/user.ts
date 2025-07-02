/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as auth from './auth';

export type Int64 = string | number;

export interface UserInfo {
  ssoUserName?: string;
  userID?: string;
  email?: string;
  tenant?: auth.TenantType;
}

/** UserInfoDetail 用户详细信息，包含姓名、头像等 */
export interface UserInfoDetail {
  /** 姓名 */
  name?: string;
  /** 英文名称 */
  en_name?: string;
  /** 用户头像url */
  avatar_url?: string;
  /** 72 * 72 头像 */
  avatar_thumb?: string;
  /** 用户应用内唯一标识 */
  open_id?: string;
  /** 用户应用开发商内唯一标识 */
  union_id?: string;
  /** 企业标识 */
  tenant_key?: string;
  /** 用户在租户内的唯一标识（目前实际返给前端时都转成了fornax UserID） */
  user_id?: string;
  /** 用户邮箱 */
  email?: string;
  /** 租户 */
  tenant?: auth.TenantType;
  /** 飞书UserID */
  ext_user_id?: string;
  /** sso_user_name，来自DB，如果是懂车帝租户，会带有__dcar后缀 */
  sso_user_name?: string;
}
/* eslint-enable */
