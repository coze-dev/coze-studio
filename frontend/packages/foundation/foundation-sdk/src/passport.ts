import {
  type logoutOnly as logoutOnlyOfSdk,
  type uploadAvatar as uploadAvatarOfSdk,
} from '@coze-arch/foundation-sdk';
import {
  logout as logoutOnlyImpl,
  passportApi,
} from '@coze-foundation/account-adapter';

export const logoutOnly = logoutOnlyImpl satisfies typeof logoutOnlyOfSdk;

export const uploadAvatar: typeof uploadAvatarOfSdk = (avatar: File) =>
  passportApi.uploadAvatar({ avatar });
