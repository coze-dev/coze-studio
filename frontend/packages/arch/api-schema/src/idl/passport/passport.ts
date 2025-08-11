import { createAPI } from './../../api/config';
export interface AppUserInfo {
  user_unique_name: string
}
export interface User {
  /** 与原接口字段名对齐 */
  user_id_str: string,
  name: string,
  user_unique_name: string,
  email: string,
  description: string,
  avatar_url: string,
  screen_name?: string,
  app_user_info?: AppUserInfo,
  locale?: string,
  /** unix timestamp in seconds */
  user_create_time: number,
}
export interface PassportWebEmailRegisterV2PostRequest {
  password: string,
  email: string,
}
export interface PassportWebEmailRegisterV2PostResponse {
  data: User,
  code: number,
  msg: string,
}
export interface PassportWebLogoutGetRequest {}
export interface PassportWebLogoutGetResponse {
  redirect_url: string,
  code: number,
  msg: string,
}
export interface PassportWebEmailLoginPostRequest {
  email: string,
  password: string,
}
export interface PassportWebEmailLoginPostResponse {
  data: User,
  code: number,
  msg: string,
}
export interface PassportWebEmailPasswordResetGetRequest {
  password: string,
  code: string,
  email: string,
}
export interface PassportWebEmailPasswordResetGetResponse {
  code: number,
  msg: string,
}
export interface PassportAccountInfoV2Request {}
export interface PassportAccountInfoV2Response {
  data: User,
  code: number,
  msg: string,
}
export interface UserUpdateAvatarRequest {
  avatar: Blob
}
export interface UserUpdateAvatarResponseData {
  web_uri: string
}
export interface UserUpdateAvatarResponse {
  data: UserUpdateAvatarResponseData,
  code: number,
  msg: string,
}
export interface UserUpdateProfileRequest {
  name?: string,
  user_unique_name?: string,
  description?: string,
  locale?: string,
}
export interface UserUpdateProfileResponse {
  code: number,
  msg: string,
}
/** 邮箱密码注册 */
export const PassportWebEmailRegisterV2Post = /*#__PURE__*/createAPI<PassportWebEmailRegisterV2PostRequest, PassportWebEmailRegisterV2PostResponse>({
  "url": "/api/passport/web/email/register/v2/",
  "method": "POST",
  "name": "PassportWebEmailRegisterV2Post",
  "reqType": "PassportWebEmailRegisterV2PostRequest",
  "reqMapping": {
    "body": ["password", "email"]
  },
  "resType": "PassportWebEmailRegisterV2PostResponse",
  "schemaRoot": "api://schemas/idl_passport_passport",
  "service": "passport"
});
/** 退出登录 */
export const PassportWebLogoutGet = /*#__PURE__*/createAPI<PassportWebLogoutGetRequest, PassportWebLogoutGetResponse>({
  "url": "/api/passport/web/logout/",
  "method": "GET",
  "name": "PassportWebLogoutGet",
  "reqType": "PassportWebLogoutGetRequest",
  "reqMapping": {},
  "resType": "PassportWebLogoutGetResponse",
  "schemaRoot": "api://schemas/idl_passport_passport",
  "service": "passport"
});
/** 邮箱帐密登录 */
export const PassportWebEmailLoginPost = /*#__PURE__*/createAPI<PassportWebEmailLoginPostRequest, PassportWebEmailLoginPostResponse>({
  "url": "/api/passport/web/email/login/",
  "method": "POST",
  "name": "PassportWebEmailLoginPost",
  "reqType": "PassportWebEmailLoginPostRequest",
  "reqMapping": {
    "body": ["email", "password"]
  },
  "resType": "PassportWebEmailLoginPostResponse",
  "schemaRoot": "api://schemas/idl_passport_passport",
  "service": "passport"
});
/** 通过邮箱重置密码 */
export const PassportWebEmailPasswordResetGet = /*#__PURE__*/createAPI<PassportWebEmailPasswordResetGetRequest, PassportWebEmailPasswordResetGetResponse>({
  "url": "/api/passport/web/email/password/reset/",
  "method": "GET",
  "name": "PassportWebEmailPasswordResetGet",
  "reqType": "PassportWebEmailPasswordResetGetRequest",
  "reqMapping": {
    "query": ["password", "code", "email"]
  },
  "resType": "PassportWebEmailPasswordResetGetResponse",
  "schemaRoot": "api://schemas/idl_passport_passport",
  "service": "passport"
});
/** 账号信息 */
export const PassportAccountInfoV2 = /*#__PURE__*/createAPI<PassportAccountInfoV2Request, PassportAccountInfoV2Response>({
  "url": "/api/passport/account/info/v2/",
  "method": "POST",
  "name": "PassportAccountInfoV2",
  "reqType": "PassportAccountInfoV2Request",
  "reqMapping": {},
  "resType": "PassportAccountInfoV2Response",
  "schemaRoot": "api://schemas/idl_passport_passport",
  "service": "passport"
});
export const UserUpdateAvatar = /*#__PURE__*/createAPI<UserUpdateAvatarRequest, UserUpdateAvatarResponse>({
  "url": "/api/web/user/update/upload_avatar/",
  "method": "POST",
  "name": "UserUpdateAvatar",
  "reqType": "UserUpdateAvatarRequest",
  "reqMapping": {
    "body": ["avatar"]
  },
  "resType": "UserUpdateAvatarResponse",
  "schemaRoot": "api://schemas/idl_passport_passport",
  "service": "passport",
  "serializer": "form"
});
export const UserUpdateProfile = /*#__PURE__*/createAPI<UserUpdateProfileRequest, UserUpdateProfileResponse>({
  "url": "/api/user/update_profile",
  "method": "POST",
  "name": "UserUpdateProfile",
  "reqType": "UserUpdateProfileRequest",
  "reqMapping": {
    "body": ["name", "user_unique_name", "description", "locale"]
  },
  "resType": "UserUpdateProfileResponse",
  "schemaRoot": "api://schemas/idl_passport_passport",
  "service": "passport"
});