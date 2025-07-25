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
 
/** 此文件放的是 table 通用 utils */
import { get } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';

import { type TableSettings } from '../types';
import { FrequencyDay, TableSettingFormFields } from '../constants';

export const getFrequencyMap = (updateInterval: FrequencyDay): string => {
  const frequencyMap = {
    [FrequencyDay.ZERO]: I18n.t('datasets_frequencyModal_frequency_noUpdate'),
    [FrequencyDay.ONE]: I18n.t('datasets_frequencyModal_frequency_day', {
      num: 1,
    }),
    [FrequencyDay.THREE]: I18n.t('datasets_frequencyModal_frequency_day', {
      num: 3,
    }),
    [FrequencyDay.SEVEN]: I18n.t('datasets_frequencyModal_frequency_day', {
      num: 7,
    }),
    [FrequencyDay.THIRTY]: I18n.t('datasets_frequencyModal_frequency_day', {
      num: 30,
    }),
  };
  return frequencyMap[updateInterval];
};

export interface IValidateRes {
  valid: boolean;
  errorMsg: string;
}
// 校验tableStructure列名及表明是否包含特殊字符
export const validateField = (
  fieldName: string,
  emptyMsg = '',
): IValidateRes => {
  let valid = true;
  let errorMsg = '';

  // 是否包含特殊字符-->单引号，双引号，转义符，反引号
  const notationReg = /["'`\\]+/g;

  if (!fieldName) {
    return {
      valid: false,
      errorMsg: emptyMsg,
    };
  }

  if (notationReg.test(fieldName)) {
    valid = false;
    errorMsg = I18n.t('knowledge_tableStructure_field_errLegally');
  }
  // 不能包含_knowledge_slice_id关键字
  if (['_knowledge_slice_id'].includes(fieldName)) {
    valid = false;
    errorMsg = I18n.t('knowledge_tableStructure_errSystemField');
  }
  return {
    valid,
    errorMsg,
  };
};
export const getSrcFromImg = (str: string): string[] => {
  if (!str) {
    return [];
  }
  const imgRegx = /<img[^>]+src\s*=\s*['"]([^'"]+)['"][^>]*>/g;
  // 使用正则表达式进行匹配
  const matches = str.match(imgRegx);

  // 提取匹配结果中的src属性值
  const srcList: string[] = [];
  if (matches) {
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const src = match.match(/src\s*=\s*['"]([^'"]+)['"]/)?.[1];
      if (src) {
        srcList.push(src);
      }
    }
  }
  return srcList;
};

export const isKeyInTableSettings = (
  key: string,
): key is TableSettingFormFields =>
  Object.values(TableSettingFormFields).includes(key as TableSettingFormFields);

export const tableSettingsToString = (tableSettings: TableSettings) => {
  const res: { [key in keyof TableSettings]: string } = {
    sheet_id: '',
    header_line_idx: '',
    start_line_idx: '',
  };
  Object.keys(tableSettings).reduce((acc, key) => {
    if (isKeyInTableSettings(key)) {
      acc[key] = String(get(tableSettings, key));
    }
    return acc;
  }, res);
  return res;
};
