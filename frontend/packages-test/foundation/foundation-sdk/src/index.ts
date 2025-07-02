import { type useCurrentTheme as useCurrentThemeOfSDK } from '@coze-arch/foundation-sdk';
import { useTheme } from '@coze-arch/coze-design';

export const useCurrentTheme: typeof useCurrentThemeOfSDK = () =>
  useTheme().theme;

export { logoutOnly, uploadAvatar } from './passport';

export {
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
  refreshUserInfo,
  useLoginStatus,
  getLoginStatus,
} from './user';

export { BackButton, SideSheetMenu } from '@coze-foundation/layout';

export { useSpace } from './space';
