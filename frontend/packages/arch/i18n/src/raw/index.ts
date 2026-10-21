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
import { loadLocaleRu } from '@coze-studio/studio-i18n-resource-adapter';

import locale from '../resource';
export {
  type I18nKeysNoOptionsType,
  type I18nKeysHasOptionsType,
} from '@coze-studio/studio-i18n-resource-adapter';
import { I18n } from '../intl';

interface I18nConfig extends Record<string, unknown> {
  lng: 'en' | 'zh-CN' | 'ru' | 'ru-RU';
  ns?: string;
}

const isRuLng = (lng: string) => /^ru(?:-|$)/.test(lng);

/**
 * The Russian dictionary may lag behind en.json, so keys missing in `ru`
 * fall back to English (i18next resolves `ru-RU` through its language part
 * `ru`). Other languages keep falling back to the init language, as before;
 * when the init language is Russian, that fallback is English as well.
 */
const getFallbackLng = (lng: string) => ({
  ru: ['en'],
  default: [isRuLng(lng) ? 'en' : lng],
});

// Resources downloaded by loadI18nResources, in the shape of `locale`
const lazyResources: Record<string, { i18n: Record<string, string> }> = {};
let ruResourcesLoading: Promise<boolean> | undefined;

/**
 * Russian is not bundled with en and zh-CN: ru.json is a separate chunk that
 * only Russian users download. Wait for this before `initI18nInstance` or
 * `I18n.setLang` with `ru` / `ru-RU`.
 *
 * Resolves to true once the resources are registered (at once for the other
 * languages, which are bundled) and to false when the download fails; use
 * `en`, the language Russian falls back to, in that case. Repeated calls
 * share one download, and a call after a failure tries again.
 */
export function loadI18nResources(lng: string): Promise<boolean> {
  if (!isRuLng(lng)) {
    return Promise.resolve(true);
  }
  if (!ruResourcesLoading) {
    ruResourcesLoading = loadLocaleRu().then(
      resources => {
        // initI18nInstance passes these to i18next with the bundled resources;
        // an instance that is already initialized gets them here (before init
        // the wrapper only queues them until init completes).
        lazyResources.ru = { i18n: resources };
        I18n.addResourceBundle('ru', 'i18n', resources, true, true);
        return true;
      },
      (error: unknown) => {
        ruResourcesLoading = undefined;
        console.error('[i18n] failed to load the ru resources', error);
        return false;
      },
    );
  }
  return ruResourcesLoading;
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
        fallbackLng: getFallbackLng(lng),
        lng,
        ns: ns || 'i18n',
        defaultNS: ns || 'i18n',
        resources: { ...locale, ...lazyResources },
        ...(restConfig ?? {}),
      },
      resolve,
    );
  });
}

export { I18n };
