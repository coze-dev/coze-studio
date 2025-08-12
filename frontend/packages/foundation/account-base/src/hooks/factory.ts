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
 * It is used to check the login status when the page is initialized, and listen for the interface error if the login status is invalid.
 * When the login status fails, it will be redirected to the login page
 * @param needLogin is required
 * @Param checkLogin Check the specific implementation of login status
 * @Param goLogin Redirect to login page concrete implementation
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
    // The current page requires login. If the login check result is not logged in, redirect back to the login page.
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
    // This function is triggered when the Ajax request backend interface appears not authorized/logged in
    handleAPIErrorEvent(APIErrorEvent.UNAUTHORIZED, handleUnauthorized);
    return () => {
      removeAPIErrorEvent(APIErrorEvent.UNAUTHORIZED, handleUnauthorized);
    };
  }, [needLogin]);
};
