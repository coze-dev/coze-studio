import { setUserInfoContext } from '@coze-arch/logger';

import { type UserInfo } from '../types';
import { useUserStore } from '../store/user';

/**
 * 主动触发刷新用户信息
 * @param checkLogin 登录检查函数
 */
export const refreshUserInfoBase = async (
  checkLogin: () => Promise<UserInfo>,
) => {
  useUserStore.setState({
    hasError: false,
  });
  const userInfo = await checkLogin();
  useUserStore.getState().setUserInfo(userInfo);
};

export const logoutBase = async (logout: () => Promise<void>) => {
  await logout();
  useUserStore.getState().reset();
};

export const checkLoginBase = async (
  checkLoginImpl: () => Promise<{
    userInfo?: UserInfo;
    hasError?: boolean;
  }>,
) => {
  useUserStore.setState({
    hasError: false,
  });
  const { userInfo, hasError } = await checkLoginImpl();
  if (hasError) {
    useUserStore.setState({
      hasError: true,
    });
    return;
  }
  if (userInfo) {
    setUserInfoContext(userInfo);
  }
  useUserStore.setState({
    userInfo,
    isSettled: true,
  });
};
