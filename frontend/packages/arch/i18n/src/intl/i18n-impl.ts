/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Callback, TFunction, InitOptions, FallbackLng } from 'i18next';

import type { StringMap, TFunctionKeys } from './types';
import I18next, { formatLang, isTypes, LANGUAGE_TRANSFORMER } from './i18n';

export interface IntlConstructorOptions {
  i18nInstance?: I18next;
}
let intlInstance: any = null;
/**
 * I18n实例
 * 自定义配置
 */
class Intl {
  plugins: any[];
  i18nInstance: I18next;
  constructor(opts?: IntlConstructorOptions) {
    this.plugins = [];
    this.i18nInstance = opts?.i18nInstance ?? new I18next();
  }
  /**
   * i18n 没有定义类型，这里声明 any
   */
  use(plugin: any) {
    if (!this.plugins.includes(plugin)) {
      this.plugins.push(plugin);
      return this;
    }
    return this;
  }
  async init(
    config: InitOptions,
    initCallback?: Callback,
  ): Promise<{ err: Error; t: TFunction }> {
    this.i18nInstance._handleConfigs(config as any);
    this.i18nInstance._handlePlugins(this.plugins);

    try {
      const { err, t } = await this.i18nInstance.createInstance();

      typeof initCallback === 'function' && initCallback(err, t);
      return { err, t };
    } catch (err) {
      console.log('debugger error', err);
      return {
        err,
        t: ((key: string) => key) as TFunction<'translation', undefined>,
      };
    }
  }
  get language() {
    return (this.i18nInstance || {}).language;
  }
  getLanguages(): FallbackLng {
    return this.i18nInstance.getLanguages() || [];
  }
  setLang(lng: string, callback?: Callback) {
    const formatLng = formatLang(
      lng,
      this.plugins.filter(isTypes(LANGUAGE_TRANSFORMER)),
    );
    this.i18nInstance.changeLanguage(formatLng, callback);
  }
  setLangWithPromise(lng: string) {
    const formatLng = formatLang(
      lng,
      this.plugins.filter(isTypes(LANGUAGE_TRANSFORMER)),
    );
    return this.i18nInstance.changeLanguageWithPromise(formatLng);
  }
  dir(lng: string) {
    return this.i18nInstance.getDir(lng);
  }
  addResourceBundle(
    lng: string,
    ns: string,
    resources: any,
    deep?: boolean,
    overwrite?: boolean,
  ) {
    // to to something validate
    return this.i18nInstance.addResourceBundle(
      lng,
      ns,
      resources,
      deep,
      overwrite,
    );
  }
  t<
    TKeys extends TFunctionKeys = string,
    TInterpolationMap extends object = StringMap,
  >(keys: TKeys | TKeys[], options?: TInterpolationMap, fallbackText?: string) {
    let that: any = null;
    if (typeof this === 'undefined') {
      that = intlInstance;
    } else {
      that = this;
    }
    if (!that.i18nInstance || !that.i18nInstance.init) {
      return fallbackText ?? (Array.isArray(keys) ? keys[0] : keys);
    }
    // 有人给 key 传空字符串?
    if (!keys || (typeof keys === 'string' && !keys.trim())) {
      return '';
    }

    return that.i18nInstance.t(keys, options, fallbackText);
  }
}

intlInstance = new Intl();

export default Intl;
export { intlInstance as IntlInstance };
