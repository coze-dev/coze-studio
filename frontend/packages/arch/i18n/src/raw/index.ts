import LanguageDetector from 'i18next-browser-languagedetector';

import locale from '../resource';
export {
  type I18nKeysNoOptionsType,
  type I18nKeysHasOptionsType,
} from '@coze-studio/studio-i18n-resource-adapter';
import { I18n } from '../intl';

interface I18nConfig extends Record<string, unknown> {
  lng: 'en' | 'zh-CN';
  ns?: string;
}
export function initI18nInstance(config?: I18nConfig) {
  const { lng = 'en', ns, ...restConfig } = config || {};
  return new Promise(resolve => {
    I18n.use(LanguageDetector);
    I18n.init(
      {
        detection: {
          order: [
            'querystring',
            'cookie',
            'localStorage',
            'navigator',
            'htmlTag',
          ],
          lookupQuerystring: 'lng',
          lookupCookie: 'i18next',
          lookupLocalStorage: 'i18next',
          fallback: 'zh-CN',
          caches: ['cookie'],
          mute: false,
        },
        react: {
          useSuspense: false,
        },
        keySeparator: false,
        fallbackLng: lng,
        lng,
        ns: ns || 'i18n',
        defaultNS: ns || 'i18n',
        resources: locale,
        ...(restConfig ?? {}),
      },
      resolve,
    );
  });
}

export { I18n };
