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

/** Maximum number of custom separators/splices */
export const MAX_CUSTOM_LENGTH = 20;

/** The maximum number of delimiter characters displayed in the drop-down box */
export const MAX_TAG_SIZE = 4;

/** Front-end form field name */
export const FIELD_NAME_MAP = {
  method: 'method',
  concatResult: 'concatResult',
  delimiter: 'delimiter',
  concatChar: 'concatChar',
  outputs: 'outputs',
};

/** backend field name */
export const BACK_END_NAME_MAP = {
  delimiters: 'delimiters',
  allDelimiters: 'allDelimiters',
  allArrayItemConcatChars: 'allArrayItemConcatChars',
  arrayItemConcatChar: 'arrayItemConcatChar',
};

/** Collection of string handling methods */
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

/** separator option */
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

/** Default parameters in splicing mode */
export const CONCAT_DEFAULT_INPUTS = [
  { name: `${PREFIX_STR}1`, input: { type: 'ref' } },
];

/** Splicing method, component option settings */
export const CONCAT_CHAR_SETTINGS = {
  key: '',

  /** Only one splice can be selected. */
  multiple: false,

  /** Allow customization */
  enableCustom: true,

  /** Maximum number of customizations */
  maxCustomLength: MAX_CUSTOM_LENGTH,

  /** maximum number of impressions */
  maxTagCount: MAX_TAG_SIZE,

  /** drop-down box prompt */
  placeholder: I18n.t('workflow_stringprocess_delimiter_option'),

  /** Text box prompt */
  inputPlaceholder: I18n.t('workflow_textprocess_custom_shading'),
};

/** Separation method, component option settings */
export const SPLIT_CHAR_SETTING = {
  key: '',

  /** Multiple separators can be selected */
  multiple: true,

  /** Allow customization */
  enableCustom: true,

  /** Maximum number of customizations */
  maxCustomLength: MAX_CUSTOM_LENGTH,

  /** maximum number of impressions */
  maxTagCount: MAX_TAG_SIZE,

  /** drop-down box prompt */
  placeholder: I18n.t('workflow_stringprocess_delimiter_option'),

  /** Text box prompt */
  inputPlaceholder: I18n.t('workflow_stringprocess_delimiter_option'),
};
