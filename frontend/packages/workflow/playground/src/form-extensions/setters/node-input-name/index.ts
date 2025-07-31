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
import {
  type ValidatorProps,
  type FormItemMaterialContext,
  type SetterExtension,
} from '@flowgram-adapter/free-layout-editor';

import { nameValidationRule } from '../helper';
import { defaultGetNames } from './utils';
import { NodeInputName } from './node-input-name';

type NodeInputNameValidatorProps = ValidatorProps<
  string,
  {
    validatorConfig?: {
      rule?: RegExp;
      errorMessage?: string;
    };
    getNames?: (context: FormItemMaterialContext) => string[];
    invalidValues?: Record<string, string>;
  }
>;

export const nodeInputName: SetterExtension = {
  key: 'NodeInputName',
  component: NodeInputName,
  validator: (props: NodeInputNameValidatorProps) => {
    const { value, options, context } = props;
    const {
      validatorConfig,
      getNames = defaultGetNames,
      invalidValues = {},
    } = options;
    const validatorRule = validatorConfig?.rule ?? nameValidationRule;
    const validatorErrorMessage =
      validatorConfig?.errorMessage ??
      I18n.t('workflow_detail_node_error_format');

    /** name check */
    if (!validatorRule.test(value)) {
      return validatorErrorMessage;
    }

    /** Illegal value verification */
    if (invalidValues[value]) {
      return invalidValues[value];
    }

    const names: string[] = getNames(context);

    const foundSames = names.filter((name: string) => name === value);

    return foundSames.length > 1
      ? I18n.t('workflow_detail_node_input_duplicated')
      : undefined;
  },
};
