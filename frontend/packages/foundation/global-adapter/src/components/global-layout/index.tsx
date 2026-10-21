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
import { loadI18nResources } from '@coze-arch/i18n/raw';
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
import { LocaleProvider, ruRU } from '@coze-arch/bot-semi';

import { GlobalLayoutComposed } from '@/components/global-layout-composed';

import { cdRuRU } from './locales';

export const GlobalLayout: FC = () => {
  const userInfo = useUserInfo();
  const update = useUpdate();
  const currentLocale = userInfo?.locale ?? navigator.language ?? 'en-US';

  // For historical reasons, en-US needs to be converted to en.
  const transformedCurrentLocale =
    currentLocale === 'en-US' ? 'en' : currentLocale;

  useEffect(() => {
    if (!userInfo || I18n.language === transformedCurrentLocale) {
      return undefined;
    }
    localStorage.setItem('i18next', transformedCurrentLocale);
    let isCancelled = false;
    // Russian texts are downloaded first; English is used if that fails
    loadI18nResources(transformedCurrentLocale).then(isLoaded => {
      if (isCancelled) {
        return;
      }
      I18n.setLang(isLoaded ? transformedCurrentLocale : 'en');
      // Force an update, otherwise the language switch will not take effect
      update();
    });
    return () => {
      isCancelled = true;
    };
  }, [userInfo, transformedCurrentLocale, update]);

  // Russian (ru, ru-RU) gets its own component locales once the texts are
  // Russian. Until then, or when they cannot be loaded, a Russian locale
  // follows the language of the texts (Chinese, or English as the fallback):
  // a visitor whose browser is Russian but who is not signed in yet sees
  // Chinese texts and components. Every other locale keeps the en-US / zh-CN
  // choice.
  const textLanguage = I18n.language ?? '';
  const isRuLocale = textLanguage.startsWith('ru');
  const isEnLocale = currentLocale.startsWith('ru')
    ? textLanguage === 'en'
    : currentLocale === 'en-US';
  const cdLocale = isEnLocale ? en_US : zh_CN;
  const semiLocale = isEnLocale ? enUS : zhCN;

  return (
    <I18nProvider i18n={I18n}>
      <CDLocaleProvider locale={isRuLocale ? cdRuRU : cdLocale}>
        <LocaleProvider locale={isRuLocale ? ruRU : semiLocale}>
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
