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

import { reporter, logger } from '@coze-arch/logger';
import { useRouteConfig } from '@coze-arch/bot-hooks';
import { useErrorCatch } from '@coze-arch/bot-error';
import slardar from '@coze-studio/default-slardar';
import { useAlertOnLogout } from '@coze-foundation/global/use-app-init';
import {
  useSyncLocalStorageUid,
  useCheckLogin,
} from '@coze-foundation/account-adapter';

import { useSetResponsiveBodyStyle } from './use-responsive-body-style';
import { useResetStoreOnLogout } from './use-reset-store-on-logout';
import { useInitCommonConfig } from './use-init-common-config';

/**
 * All initialization logic converges here
 * Note that the login status needs to be handled by yourself.
 */
export const useAppInit = () => {
  const { requireAuth, requireAuthOptional, loginFallbackPath } =
    useRouteConfig();

  useCheckLogin({
    needLogin: !!(requireAuth && !requireAuthOptional),
    loginFallbackPath,
  });

  useSyncLocalStorageUid();

  useEffect(() => {
    reporter.info({ message: 'Ok fine' });
    reporter.init(slardar);
    logger.init(slardar);
  }, []);

  useErrorCatch(slardar);

  useInitCommonConfig();

  useResetStoreOnLogout();

  useSetResponsiveBodyStyle();

  useAlertOnLogout();
};
