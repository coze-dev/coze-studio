import { type UserUpdateProfileRequest } from '@coze-studio/api-schema/passport';
import { passport } from '@coze-studio/api-schema';
import { resetUserStore, type UserInfo } from '@coze-foundation/account-base';

export const passportApi = {
  checkLogin: async () => {
    const res = (await passport.PassportAccountInfoV2({})) as unknown as {
      data: UserInfo;
    };
    return res.data;
  },

  logout: async () => {
    await passport.PassportWebLogoutGet({
      next: '/',
    });
  },

  uploadAvatar: async ({ avatar }: { avatar: File }) => {
    const res = await passport.UserUpdateAvatar({
      avatar,
    });

    return res.data;
  },

  updatePassword: async (params: { password: string; email: string }) => {
    await passport.PassportWebEmailPasswordResetGet({ ...params, code: '' });
    // 更新密码后，当前登录态失效，重置 store
    resetUserStore();
  },

  updateUserProfile: (params: UserUpdateProfileRequest) =>
    passport.UserUpdateProfile(params),
};
