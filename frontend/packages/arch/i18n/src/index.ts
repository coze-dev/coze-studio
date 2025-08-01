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

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  LocaleData,
  I18nOptionsMap,
  I18nKeysHasOptionsType,
  I18nKeysNoOptionsType,
} from '@coze-studio/studio-i18n-resource-adapter';

import {
  type Intl,
  type I18nCore,
  type IIntlInitOptions,
  I18n as _I18n,
} from './intl';

type Callback = Parameters<(typeof _I18n)['init']>[1];
type FallbackLng = ReturnType<(typeof _I18n)['getLanguages']>;
type IntlModule = Parameters<(typeof _I18n)['use']>[0];
type InitReturnType = ReturnType<(typeof _I18n)['init']>;
type I18nOptions<K extends LocaleData> = K extends keyof I18nOptionsMap
  ? I18nOptionsMap[K]
  : never;

// The exported const I18n = new FlowIntl () is functionally equivalent to I18n in '@edenx/plugin-starling-intl/runtime'
// In fact, it is a layer of encapsulation for I18n in '@edenx/plugin-starling-intl/runtime', in order to further flexibly define the parameter type of I18n.t () in the future.
// The parameter types of I18n.t () here are defined by the generic LocaleData, while the parameter types of I18n.t () in '@edenx/plugin-starling-intl/runtime' are defined by the generic string.
class FlowIntl {
  plugins: any[] = [];
  public i18nInstance: I18nCore;
  constructor() {
    this.i18nInstance = _I18n.i18nInstance;
  }

  init(config: IIntlInitOptions, callback?: Callback): InitReturnType {
    return _I18n.init(config, callback);
  }

  use(plugin: IntlModule): Intl {
    return _I18n.use(plugin);
  }

  get language(): string {
    return _I18n.language;
  }

  setLangWithPromise(lng: string) {
    return this.i18nInstance.changeLanguageWithPromise(lng);
  }

  setLang(lng: string, callback?: Callback): void {
    return _I18n.setLang(lng, callback);
  }

  getLanguages(): FallbackLng {
    return _I18n.getLanguages();
  }

  dir(): 'ltr' | 'rtl' {
    return _I18n.dir();
  }

  addResourceBundle(
    lng: string,
    ns: string,
    resources: any,
    deep?: boolean,
    overwrite?: boolean,
  ) {
    return _I18n.addResourceBundle(lng, ns, resources, deep, overwrite);
  }

  t<K extends I18nKeysNoOptionsType>(
    keys: K,
    // If you use never here, an error will be reported when the second parameter of the stock code is' {} ', so use Record < string, unknown > instead
    // The follow-up approach is to use sg to fix all the existing code, and then change it to the never type here, so as to ensure that future new code is type-checked.
    // Remember to modify line #87 together when changing.
    options?: Record<string, unknown>,
    fallbackText?: string,
  ): string;
  t<K extends I18nKeysHasOptionsType>(
    keys: K,
    options: I18nOptions<K>,
    fallbackText?: string,
  ): string;
  t<K extends LocaleData>(
    keys: K,
    options?: I18nOptions<K> | Record<string, unknown>,
    fallbackText?: string,
  ): string {
    // tecvan: fixme, hard to understand why this happens
    return _I18n.t(keys, options, fallbackText);
  }
}

export const getUnReactiveLanguage = () => _I18n.language;
export const I18n = new FlowIntl();

export { type I18nKeysNoOptionsType, type I18nKeysHasOptionsType };
