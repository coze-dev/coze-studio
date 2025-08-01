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

import { Outlet } from 'react-router-dom';
import { type FC, useEffect } from 'react';

import { useUpdate } from 'ahooks';
import { BrowserUpgradeWrap } from '@coze-foundation/browser-upgrade-banner';
import { I18nProvider } from '@coze-arch/i18n/i18n-provider';
import { I18n } from '@coze-arch/i18n';
import { useUserInfo } from '@coze-arch/foundation-sdk';
import { zh_CN, en_US } from '@coze-arch/coze-design/locales';
import {
  CDLocaleProvider,
  ThemeProvider,
  enUS,
  zhCN,
} from '@coze-arch/coze-design';
import { LocaleProvider } from '@coze-arch/bot-semi';

import { GlobalLayoutComposed } from '@/components/global-layout-composed';

export const GlobalLayout: FC = () => {
  const userInfo = useUserInfo();
  const update = useUpdate();
  const currentLocale = userInfo?.locale ?? navigator.language ?? 'en-US';

  // For historical reasons, en-US needs to be converted to en.
  const transformedCurrentLocale =
    currentLocale === 'en-US' ? 'en' : currentLocale;

  useEffect(() => {
    if (userInfo && I18n.language !== transformedCurrentLocale) {
      localStorage.setItem('i18next', transformedCurrentLocale);
      I18n.setLang(transformedCurrentLocale);
      // Force an update, otherwise the language switch will not take effect
      update();
    }
  }, [userInfo, transformedCurrentLocale, update]);

  return (
    <I18nProvider i18n={I18n}>
      <CDLocaleProvider locale={currentLocale === 'en-US' ? en_US : zh_CN}>
        <LocaleProvider locale={currentLocale === 'en-US' ? enUS : zhCN}>
          <ThemeProvider
            defaultTheme="light"
            changeSemiTheme={true}
            changeBySystem={IS_BOE}
          >
            <BrowserUpgradeWrap>
              <GlobalLayoutComposed>
                <Outlet />
              </GlobalLayoutComposed>
            </BrowserUpgradeWrap>
          </ThemeProvider>
        </LocaleProvider>
      </CDLocaleProvider>
    </I18nProvider>
  );
};
