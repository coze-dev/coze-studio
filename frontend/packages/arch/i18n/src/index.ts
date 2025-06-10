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

// 这里导出的 const I18n = new FlowIntl() 与 '@edenx/plugin-starling-intl/runtime' 中的 I18n 功能等价
// 其实就是对 '@edenx/plugin-starling-intl/runtime' 中的 I18n 进行了一层封装，目的是为了后续进一步灵活的定义I18n.t() 的参数类型。
// 这里的 I18n.t() 的参数类型是通过泛型 LocaleData 来定义的，而 '@edenx/plugin-starling-intl/runtime' 中的 I18n.t() 的参数类型是通过泛型 string 来定义的。
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
    // 这里如果用 never 的话，导致存量代码第二个参数是 `{}` 的时候会报错，所以这里用 Record<string, unknown> 代替
    // 后续的做法是：用 sg 把存量的代码都修复了之后，这里再改成 never 类型，从而保证未来新增的代码，都是有类型检查的。
    // 记得改动的时候 #87 行也要一起修改
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
