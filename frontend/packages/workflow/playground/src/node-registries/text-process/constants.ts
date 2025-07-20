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
 
import { I18n } from '@coze-arch/i18n';

export enum StringMethod {
  Concat = 'concat',
  Split = 'split',
}

export const PREFIX_STR = 'String';

/** 自定义分隔符/拼接符最大个数 */
export const MAX_CUSTOM_LENGTH = 20;

/** 下拉框最多展示多少个分隔字符 */
export const MAX_TAG_SIZE = 4;

/** 前端表单字段名 */
export const FIELD_NAME_MAP = {
  method: 'method',
  concatResult: 'concatResult',
  delimiter: 'delimiter',
  concatChar: 'concatChar',
  outputs: 'outputs',
};

/** 后端字段名 */
export const BACK_END_NAME_MAP = {
  delimiters: 'delimiters',
  allDelimiters: 'allDelimiters',
  allArrayItemConcatChars: 'allArrayItemConcatChars',
  arrayItemConcatChar: 'arrayItemConcatChar',
};

/** 字符串处理方法集合 */
export const STRING_METHOD_OPTIONS = [
  {
    label: I18n.t('workflow_stringprocess_node_method_concat'),
    value: StringMethod.Concat,
  },
  {
    label: I18n.t('workflow_stringprocess_node_method_sep'),
    value: StringMethod.Split,
  },
];

/** 分隔符选项 */
export const OPTION_SCHEMA = {
  type: 'object',
  schema: [
    {
      type: 'string',
      name: 'label',
      required: true,
    },
    {
      type: 'string',
      name: 'value',
      required: true,
    },
    {
      type: 'boolean',
      name: 'isDefault',
      required: true,
    },
  ],
};

/** 拼接模式下的默认参数 */
export const CONCAT_DEFAULT_INPUTS = [
  { name: `${PREFIX_STR}1`, input: { type: 'ref' } },
];

/** 拼接方法，组件选项设置 */
export const CONCAT_CHAR_SETTINGS = {
  key: '',

  /** 只能选择一个拼接符 */
  multiple: false,

  /** 允许自定义 */
  enableCustom: true,

  /** 最大自定义个数 */
  maxCustomLength: MAX_CUSTOM_LENGTH,

  /** 最大展示个数 */
  maxTagCount: MAX_TAG_SIZE,

  /** 下拉框提示 */
  placeholder: I18n.t('workflow_stringprocess_delimiter_option'),

  /** 输入框提示 */
  inputPlaceholder: I18n.t('workflow_textprocess_custom_shading'),
};

/** 分隔方法，组件选项设置 */
export const SPLIT_CHAR_SETTING = {
  key: '',

  /** 可以选择多个分隔符 */
  multiple: true,

  /** 允许自定义 */
  enableCustom: true,

  /** 最大自定义个数 */
  maxCustomLength: MAX_CUSTOM_LENGTH,

  /** 最大展示个数 */
  maxTagCount: MAX_TAG_SIZE,

  /** 下拉框提示 */
  placeholder: I18n.t('workflow_stringprocess_delimiter_option'),

  /** 输入框提示 */
  inputPlaceholder: I18n.t('workflow_stringprocess_delimiter_option'),
};
