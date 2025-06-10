import { useEffect } from 'react';

import { useMemoizedFn } from 'ahooks';
import {
  APIErrorEvent,
  handleAPIErrorEvent,
  removeAPIErrorEvent,
} from '@coze-arch/bot-api';

import { checkLoginBase } from '../utils/factory';
import { type UserInfo } from '../types';
import { useUserStore } from '../store/user';

/**
 * 用于页面初始化时，检查登录状态，并监听登录态失效的接口报错
 * 在登录态失效时，会重定向到登录页
 * @param needLogin 是否需要登录
 * @param checkLogin 检查登录状态的具体实现
 * @param goLogin 重定向到登录页的具体实现
 */
export const useCheckLoginBase = (
  needLogin: boolean,
  checkLoginImpl: () => Promise<{
    userInfo?: UserInfo;
    hasError?: boolean;
  }>,
  goLogin: () => void,
) => {
  const isSettled = useUserStore(state => state.isSettled);

  const memoizedGoLogin = useMemoizedFn(goLogin);

  useEffect(() => {
    if (!isSettled) {
      checkLoginBase(checkLoginImpl);
    }
  }, [isSettled]);

  useEffect(() => {
    const isLogined = !!useUserStore.getState().userInfo?.user_id_str;
    // 当前页面要求登录，登录检查结果为未登录时，重定向回登录页
    if (needLogin && isSettled && !isLogined) {
      memoizedGoLogin();
    }
  }, [needLogin, isSettled]);

  useEffect(() => {
    let fired = false;
    const handleUnauthorized = () => {
      useUserStore.getState().reset();
      if (needLogin) {
        if (!fired) {
          fired = true;
          memoizedGoLogin();
        }
      }
    };
    // ajax 请求后端接口出现未 授权/登录 时，触发该函数
    handleAPIErrorEvent(APIErrorEvent.UNAUTHORIZED, handleUnauthorized);
    return () => {
      removeAPIErrorEvent(APIErrorEvent.UNAUTHORIZED, handleUnauthorized);
    };
  }, [needLogin]);
};
