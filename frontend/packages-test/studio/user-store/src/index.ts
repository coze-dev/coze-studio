import {
  type UserAuthInfo,
  type UserLabel,
} from '@coze-arch/idl/developer_api';
import {
  getIsSettled,
  getIsLogined,
  getUserInfo,
  getUserAuthInfos,
  useIsSettled,
  useIsLogined,
  useUserInfo,
  useUserAuthInfo,
  useUserLabel,
  subscribeUserAuthInfos,
  type UserInfo,
} from '@coze-arch/foundation-sdk';

export { type UserAuthInfo, type UserLabel, type UserInfo };

export const userStoreService = {
  getIsSettled,
  getIsLogined,
  getUserInfo,
  getUserAuthInfos,
  useIsSettled,
  useIsLogined,
  useUserInfo,
  useUserAuthInfo,
  useUserLabel,
  subscribeUserAuthInfos,
} as const;
