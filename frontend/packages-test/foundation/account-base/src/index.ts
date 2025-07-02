// types
export type { UserInfo, LoginStatus } from './types';
export type {
  OAuth2RedirectConfig,
  Connector2Redirect,
} from './types/passport';

// common hooks
export {
  useLoginStatus,
  useUserInfo,
  useHasError,
  useAlterOnLogout,
  useUserLabel,
  useUserAuthInfo,
} from './hooks';

export { useSyncLocalStorageUid } from './hooks/use-sync-local-storage-uid';

// common utils
export {
  getUserInfo,
  getUserLabel,
  getLoginStatus,
  resetUserStore,
  setUserInfo,
  getUserAuthInfos,
  subscribeUserAuthInfos,
  usernameRegExpValidate,
} from './utils';

// base hooks
export { useCheckLoginBase } from './hooks/factory';

// base utils
export {
  refreshUserInfoBase,
  logoutBase,
  checkLoginBase,
} from './utils/factory';
