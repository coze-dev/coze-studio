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
