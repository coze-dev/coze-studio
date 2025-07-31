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
import { type Validate } from '@flowgram-adapter/free-layout-editor';

import { nameValidationRule } from '../helpers';

export interface CreateNodeInputNameValidateOptions {
  getNames?: ({ value, formValues }) => string[];
  validatorConfig?: {
    rule?: RegExp;
    errorMessage?: string;
  };
  invalidValues?: Record<string, string>;
  skipValidate?: ({ value, formValues }) => boolean;
}

const defaultGetNames = ({ formValues }) =>
  formValues.inputParameters.map(item => item.name);

export const createNodeInputNameValidate =
  (options?: CreateNodeInputNameValidateOptions): Validate =>
  ({ value, formValues }) => {
    const {
      getNames = defaultGetNames,
      validatorConfig,
      invalidValues,
      skipValidate,
    } = options || {};
    if (skipValidate?.({ value, formValues })) {
      return;
    }

    const validatorRule = validatorConfig?.rule ?? nameValidationRule;
    const validatorErrorMessage =
      validatorConfig?.errorMessage ??
      I18n.t('workflow_detail_node_error_format');

    /** name check */
    if (!validatorRule.test(value)) {
      return validatorErrorMessage;
    }

    /** Illegal value verification */
    if (invalidValues?.[value]) {
      return invalidValues[value];
    }

    const names: string[] = getNames({ value, formValues });

    const foundSames = names.filter((name: string) => name === value);

    return foundSames.length > 1
      ? I18n.t('workflow_detail_node_input_duplicated')
      : undefined;
  };
