/* eslint-disable */
// 由 dl-i18n 命令自动生成
import localeEn from './locales/en.json';
import localeZhCN from './locales/zh-CN.json';

const defaultConfig = {
  en: { 'i18n': localeEn },
  'zh-CN': { 'i18n': localeZhCN },
} as {  en: { 'i18n': typeof localeEn };   'zh-CN': { 'i18n': typeof localeZhCN }};

export { localeEn, localeZhCN, defaultConfig };
export type { I18nOptionsMap, I18nKeysHasOptionsType, I18nKeysNoOptionsType, LocaleData } from './locale-data';
