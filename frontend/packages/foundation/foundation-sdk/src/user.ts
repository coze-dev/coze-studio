import {
  type refreshUserInfo as refreshUserInfoOfSdk,
  type getIsSettled as getIsSettledOfSdk,
  type getIsLogined as getIsLoginedOfSdk,
  type getUserInfo as getUserInfoOfSdk,
  type useIsSettled as useIsSettledOfSdk,
  type useIsLogined as useIsLoginedOfSdk,
  type useUserInfo as useUserInfoOfSdk,
  type getLoginStatus as getLoginStatusOfSdk,
  type useLoginStatus as useLoginStatusOfSdk,
  type getUserAuthInfos as getUserAuthInfosOfSdk,
  type useUserAuthInfo as useUserAuthInfoOfSdk,
  type useUserLabel as useUserLabelOfSdk,
  type subscribeUserAuthInfos as subscribeUserAuthInfosOfSdk,
} from '@coze-arch/foundation-sdk';
import {
  refreshUserInfo as refreshUserInfoImpl,
  getLoginStatus as getLoginStatusImpl,
  useLoginStatus as useLoginStatusImpl,
  getUserInfo as getUserInfoImpl,
  useUserInfo as useUserInfoImpl,
  getUserAuthInfos as getUserAuthInfosImpl,
  useUserAuthInfo as useUserAuthInfoImpl,
  useUserLabel as useUserLabelImpl,
  subscribeUserAuthInfos as subscribeUserAuthInfosImpl,
} from '@coze-foundation/account-adapter';

/** @deprecated 使用 getLoginStatus */
export const getIsSettled = (() =>
  getLoginStatus() !== 'settling') satisfies typeof getIsSettledOfSdk;
/** @deprecated 使用 getLoginStatus */
export const getIsLogined = (() =>
  getLoginStatus() === 'logined') satisfies typeof getIsLoginedOfSdk;
export const getUserInfo = getUserInfoImpl satisfies typeof getUserInfoOfSdk;
export const getUserAuthInfos =
  getUserAuthInfosImpl satisfies typeof getUserAuthInfosOfSdk;
/** @deprecated 使用 useLoginStatus */
export const useIsSettled = (() => {
  const status = useLoginStatus();
  return status !== 'settling';
}) satisfies typeof useIsSettledOfSdk;
/** @deprecated 使用 useLoginStatus */
export const useIsLogined = (() => {
  const status = useLoginStatus();
  return status === 'logined';
}) satisfies typeof useIsLoginedOfSdk;
export const useUserInfo = useUserInfoImpl satisfies typeof useUserInfoOfSdk;

export const useUserAuthInfo =
  useUserAuthInfoImpl satisfies typeof useUserAuthInfoOfSdk;
export const useUserLabel = useUserLabelImpl satisfies typeof useUserLabelOfSdk;
export const subscribeUserAuthInfos =
  subscribeUserAuthInfosImpl satisfies typeof subscribeUserAuthInfosOfSdk;

export const refreshUserInfo =
  refreshUserInfoImpl satisfies typeof refreshUserInfoOfSdk;
export const useLoginStatus =
  useLoginStatusImpl satisfies typeof useLoginStatusOfSdk;
export const getLoginStatus =
  getLoginStatusImpl satisfies typeof getLoginStatusOfSdk;
