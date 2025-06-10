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
 * 所有初始化的逻辑收敛到这里
 * 注意登录态需要自行处理
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
