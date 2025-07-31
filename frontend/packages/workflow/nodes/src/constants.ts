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

export enum LLMModel {
  GPT_4O = 124,
  YunqueModel = 1706077826,
}

/** GPT_4O is selected by default overseas, the bean bag Function Call model is selected by default in China, and the first one is selected by default in the professional version */
export const DEFAULT_MODEL_TYPE = IS_OVERSEA
  ? LLMModel.GPT_4O
  : LLMModel.YunqueModel;

export const VARIABLE_NAME_REGEX =
  /^(?!.*\b(true|false|and|AND|or|OR|not|NOT|null|nil|If|Switch)\b)[a-zA-Z_][a-zA-Z_$0-9]*$/;

export const DEFAULT_NODE_META_PATH = '/nodeMeta';
export const DEFAULT_BATCH_PATH = '/inputs/batch';
export const DEFAULT_INPUT_PARAMETERS_PATH = '/inputs/inputParameters';
export const DEFAULT_OUTPUTS_PATH = '/outputs';

export const BATCH_CONCURRENT_SIZE_MIN = 1;
export const BATCH_CONCURRENT_SIZE_MAX = 10;
export const BATCH_SIZE_MIN = 1;
export const BATCH_SIZE_MAX = 200;

export const DEFAULT_BATCH_CONCURRENT_SIZE = BATCH_CONCURRENT_SIZE_MAX;
export const DEFAULT_BATCH_SIZE = 100;

export const INTENT_NODE_MODE = {
  /** intent recognition node minimalist pattern */
  MINIMAL: 'top_speed',

  /** intent recognition full pattern */
  STANDARD: 'all',
};

/** Lite version maximum number of intent recognition options */
export const MINIMAL_INTENT_ITEMS = 10;
/** Standard Edition maximum number of intent recognition options */
export const STANDARD_INTENT_ITEMS = 50;

export const SYSTEM_DELIMITER = {
  lineBreak: '\n',
  tab: '\t',
  period: IS_OVERSEA ? '.' : '。',
  comma: IS_OVERSEA ? ',' : '，',
  semicolon: IS_OVERSEA ? ';' : '；',
  space: ' ',
};

export const DEFAULT_DELIMITER_OPTIONS = [
  {
    label: I18n.t('workflow_stringprocess_concat_symbol_lineBreak'),
    value: SYSTEM_DELIMITER.lineBreak,
    isDefault: true,
  },
  {
    label: I18n.t('workflow_stringprocess_concat_symbol_tab'),
    value: SYSTEM_DELIMITER.tab,
    isDefault: true,
  },
  {
    label: I18n.t('workflow_stringprocess_concat_symbol_period'),
    value: SYSTEM_DELIMITER.period,
    isDefault: true,
  },
  {
    label: I18n.t('workflow_stringprocess_concat_symbol_comma'),
    value: SYSTEM_DELIMITER.comma,
    isDefault: true,
  },
  {
    label: I18n.t('workflow_stringprocess_concat_symbol_semicolon'),
    value: SYSTEM_DELIMITER.semicolon,
    isDefault: true,
  },
  {
    label: I18n.t('workflow_stringprocess_concat_symbol_space'),
    value: SYSTEM_DELIMITER.space,
    isDefault: true,
  },
];

/** scenario workflow role information keyword */
export const roleInformationKeyword = 'role_information';

/** Node default width and height (with input/output) */
export const DEFAULT_NODE_SIZE = {
  width: 360,
  height: 104.7,
};

/** Input parameter label style */
export const DEFAULT_INPUT_LABEL_STYLE = {
  width: '40%',
};

export const NARROW_INPUT_LABEL_STYLE = {
  width: '36%',
};
