/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
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
