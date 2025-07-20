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
 
import cronstrue from 'cronstrue/i18n';
import { I18n } from '@coze-arch/i18n';

const langMap = {
  // 简体中文
  'zh-CN': 'zh_CN',
  zh: 'zh-CN',
  // 繁体中文
  zh_TW: 'zh_TW',
  // 英语
  'en-US': 'en',
  en: 'en',
  // 日语
  'ja-JP': 'ja',
  ja: 'ja',
  // 韩语
  'ko-KR': 'ko',
  ko: 'ko',
  // 法语
  'fr-FR': 'fr',
  fr: 'fr',
  // 德语
  'de-DE': 'de',
  de: 'de',
  // 意大利语
  'it-IT': 'it',
  it: 'it',
  // 西班牙语
  'es-ES': 'es',
  es: 'es',
};

// 校验使用 cronjob 翻译结果
export const isCronJobVerify = cronJob => {
  // 仅支持 6 位 cronjob（后端限制）
  const parts = cronJob?.split(' ');
  if (parts?.length !== 6) {
    return false;
  }
  try {
    const rs = cronstrue.toString(cronJob, {
      locale: langMap['zh-CN'],
      throwExceptionOnParseError: true,
    });

    // 额外校验一下字符串是否包含 null undefined
    // 1 2 3 31 1- 1  在上午 03:02:01, 限每月 31 号, 或者为星期一, 一月至undefined
    // 1 2 3 31 1 1#6 在上午 03:02:01, 限每月 31 号, 限每月的null 星期一, 仅于一月份
    if (rs.includes('null') || rs.includes('undefined')) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

export const cronJobTranslator = (
  cronJob?: string,
  errorMsg?: string,
): string => {
  if (!cronJob) {
    return '';
  }
  const lang = I18n.getLanguages();

  if (isCronJobVerify(cronJob)) {
    return cronstrue.toString(cronJob, {
      locale: langMap[lang[0]] ?? langMap['zh-CN'],
      use24HourTimeFormat: true,
    });
  }
  return (
    errorMsg ??
    I18n.t('workflow_trigger_param_unvalid_cron', {}, '参数为非法 cron 表达式')
  );
};
