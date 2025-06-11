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
  lng: defaultFallbackLanguage, // 如果使用了 Language Detector，i18next 底层 lng 的权重是大于插件的
  fallbackLng: ['en-US'],
  inContext: true,
};
// 默认开启ICU插值解析

/**
 * I18n内核
 * 安全校验
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
    this.userLng = config?.lng || null; // 用户自己设定的 lng

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
          // 初始化好了

          try {
            // 把等待添加的东西都加进去
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
    // 还没初始化好
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

    // fixed: 去除默认lngs，有lngs i18next就会忽略lng
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
