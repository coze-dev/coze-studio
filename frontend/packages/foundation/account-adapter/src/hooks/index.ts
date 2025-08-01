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

import { useLocation, useNavigate } from 'react-router-dom';

import { useCheckLoginBase } from '@coze-foundation/account-base';

import { signPath, signRedirectKey } from '../utils/constants';
import { checkLoginImpl } from '../utils';

const useGoLogin = (loginFallbackPath?: string) => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  return () => {
    const redirectPath = `${pathname}${search}`;
    if (loginFallbackPath) {
      navigate(`${loginFallbackPath}${search}`, { replace: true });
    } else {
      navigate(
        `${signPath}?${signRedirectKey}=${encodeURIComponent(redirectPath)}`,
      );
    }
  };
};

export const useCheckLogin = ({
  needLogin,
  loginFallbackPath,
}: {
  needLogin?: boolean;
  loginFallbackPath?: string;
}) => {
  const goLogin = useGoLogin(loginFallbackPath);
  useCheckLoginBase(!!needLogin, checkLoginImpl, goLogin);
};
