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

/* eslint-disable max-params */
/* eslint-disable no-empty */
/* eslint-disable @coze-arch/no-empty-catch */
/* eslint-disable @coze-arch/use-error-in-catch */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import ICU from 'i18next-icu';
import i18next, {
  type TOptions,
  type Callback,
  type FallbackLng,
  type InitOptions,
  type Module,
  type TFunction,
  type i18n,
} from 'i18next';

import {
  type StringMap,
  type TFunctionKeys,
  type TFunctionResult,
} from './types';

export const LANGUAGE_TRANSFORMER = 'languageTransformer';

export function isTypes(type) {
  return itm => itm.type === type;
}

export function formatLang(lng, plugins) {
  let fl = lng;
  (plugins || []).map(plugin => {
    fl = plugin.process(lng) || fl;
  });
  return fl;
}

const defaultFallbackLanguage = 'zh-CN';
const defaultConfig = {
  lng: defaultFallbackLanguage, // If Language Detector is used, the weight of the underlying lng of i18next is greater than that of the plug-in.
  fallbackLng: ['en-US'],
  inContext: true,
};
// Default enable ICU interpolation parsing

/**
 * I18n kernel
 * security check
 */
export default class I18next {
  instance: i18n;
  config?: InitOptions & {
    lng?: string;
    fallbackLng?: string[];
    [key: string]: any;
  };
  plugins?: any[];
  languages?: FallbackLng;
  init?: boolean;
  userLng?: string | null;

  private _waitingToAddResourceBundle: [
    string,
    string,
    any,
    boolean,
    boolean,
  ][] = [];

  _handlePlugins(plugins?: any[]) {
    this.plugins = plugins;
  }

  _handleConfigs(config?: InitOptions) {
    this.userLng = config?.lng || null; // Lng set by the user.

    this.config = Object.assign({}, defaultConfig, config || {});
  }

  constructor(
    config?: InitOptions & { copiedI18nextInstance?: any },
    plugins?: any[],
  ) {
    if (config?.copiedI18nextInstance) {
      // just clone instance
      this.instance = config.copiedI18nextInstance;

      return;
    }

    this._handlePlugins(plugins);
    this._handleConfigs(config);
    this.instance = i18next.createInstance();
    this.instance.use(ICU);
    this.instance.isInitialized = false;
  }
  get language() {
    return (this.instance || {}).language;
  }
  createInstance(): Promise<{ err: Error; t: TFunction }> {
    return new Promise((resolve, reject) => {
      this.plugins?.map(p => {
        this.instance.use(p as Module);
      });

      const { config } = this;

      this.config!.formats = Object.assign({}, this.config!.formats);
      const formatLng = formatLang(
        config!.lng,
        this.plugins?.filter(isTypes(LANGUAGE_TRANSFORMER)),
      );
      this.instance.init(
        {
          ...config,
          lng: formatLng,
          i18nFormat: {
            ...(config!.i18nFormat || {}),
            formats: this.config!.formats,
          },
        },
        (err, t) => {
          // Initialized

          try {
            // Add everything waiting to be added
            for (const item of this._waitingToAddResourceBundle) {
              this.instance.addResourceBundle(...item);
            }
            this._waitingToAddResourceBundle = [];
          } catch (_err) {}

          if (!err) {
            this._updateLanguages();
            resolve({
              t,
              err,
            });
          }
          this.init = true;
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({
            t,
            err,
          });
        },
      );
    });
  }
  getLanguages() {
    return this.languages;
  }
  addResourceBundle(
    lng: string,
    ns: string,
    resources: any,
    deep?: boolean,
    overwrite?: boolean,
  ) {
    if (this.instance.isInitialized) {
      return this.instance.addResourceBundle(
        lng,
        ns,
        resources,
        deep,
        overwrite,
      );
    }
    // It hasn't been initialized yet.
    this._waitingToAddResourceBundle.push([
      lng,
      ns,
      resources,
      !!deep,
      !!overwrite,
    ]);
    return this.instance;
  }
  _updateLanguages() {
    this.languages = this.instance
      ? (Array.from(
          new Set([this.instance.language, ...this.instance.languages]),
        ) as FallbackLng)
      : (null as unknown as FallbackLng);
  }
  changeLanguage(lng: string, callback?: Callback) {
    this.config!.lng = lng;
    this.instance.changeLanguage(lng, (err, t) => {
      if (!err) {
        this._updateLanguages();
      }
      callback && callback(err, t);
    });
  }
  changeLanguageWithPromise(lng: string) {
    return new Promise((resolve, reject) => {
      this.config!.lng = lng;
      this.instance.changeLanguage(lng, (err, t) => {
        if (err) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({
            err,
            t,
          });
        }
        this._updateLanguages();
        resolve({ err, t });
      });
    });
  }
  getDir(lng: string) {
    return this.instance.dir(lng);
  }
  t<
    TResult extends TFunctionResult = string,
    TKeys extends TFunctionKeys = string,
    TInterpolationMap extends object = StringMap,
  >(
    keys: TKeys | TKeys[],
    options?: TOptions<TInterpolationMap> | string,
    fallbackText?: string,
  ): TResult {
    const separatorMock = Array.isArray(keys)
      ? Array.from(keys)
          .map(() => ' ')
          .join('')
      : Array(keys.length).fill(' ');

    // Fixed: Remove the default lngs, if there is lngs i18next, the lng will be ignored.
    const opt: Record<string, any> = Object.assign(
      { keySeparator: separatorMock, nsSeparator: separatorMock },
      options,
    );

    return this.instance.t(
      keys as string,
      fallbackText as string,
      opt,
    ) as TResult;
  }
}
