import { Outlet } from 'react-router-dom';
import { type FC, useEffect } from 'react';

import { useUpdate } from 'ahooks';
import { BrowserUpgradeWrap } from '@coze-foundation/browser-upgrade-banner';
import { I18nProvider } from '@coze-arch/i18n/i18n-provider';
import { I18n } from '@coze-arch/i18n';
import { useUserInfo } from '@coze-arch/foundation-sdk';
import { LocaleProvider } from '@coze-arch/bot-semi';
import { ThemeProvider, enUS, zhCN } from '@coze/coze-design';

import { GlobalLayoutComposed } from '@/components/global-layout-composed';

export const GlobalLayout: FC = () => {
  const userInfo = useUserInfo();
  const update = useUpdate();
  const currentLocale = userInfo?.locale ?? navigator.language ?? 'en-US';

  // 历史原因，en-US 需要被转换为 en
  const transformedCurrentLocale =
    currentLocale === 'en-US' ? 'en' : currentLocale;

  useEffect(() => {
    if (userInfo && I18n.language !== transformedCurrentLocale) {
      I18n.setLang(transformedCurrentLocale);
      // 强制更新，否则切换语言不生效
      update();
    }
  }, [userInfo, transformedCurrentLocale, update]);

  return (
    <I18nProvider i18n={I18n}>
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
    </I18nProvider>
  );
};
