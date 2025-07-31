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

import { ValueExpressionType, ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { type InputType } from './InputField';

/** input type options */
export const TYPE_OPTIONS = (
  inputType: InputType,
): {
  value: ValueExpressionType;
  label: string;
  disabled?: boolean;
}[] => [
  {
    value: ValueExpressionType.REF,
    label: I18n.t('workflow_detail_node_parameter_reference'),
  },
  {
    value: ValueExpressionType.LITERAL,
    label: ViewVariableType.isFileType(inputType)
      ? I18n.t('imageflow_input_upload')
      : I18n.t('workflow_detail_node_parameter_input'),
  },
];

const EMPTY_LITERAL = {
  type: ValueExpressionType.LITERAL,
};

const EMPTY_REF = {
  type: ValueExpressionType.REF,
};

/** Null values for each input type */
export const EMPTY_VALUE = {
  [ValueExpressionType.REF]: EMPTY_REF,
  [ValueExpressionType.LITERAL]: EMPTY_LITERAL,
};

/** default value */
export const DEFAULT_VALUE = EMPTY_REF;

export const VARIABLE_SELECTOR_STYLE = {
  width: '100%',
  height: '100%',
};

export const SELECT_STYLE = {
  width: 115,
};

export const SELECT_POPOVER_MIN_WIDTH = 130;
