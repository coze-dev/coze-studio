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

import { get } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';

import { nameValidationRule } from '@/nodes-v2/components/helpers';

import { isVisionEqual, isVisionInput } from '../vision';

export const llmInputNameValidator = ({ value, formValues, name }) => {
  const validatorRule = nameValidationRule;

  /** name check */
  if (!validatorRule.test(value)) {
    return I18n.t('workflow_detail_node_error_format');
  }

  const inputValues =
    get(formValues, '$$input_decorator$$.inputParameters') || [];
  const paths = name.split('.');
  paths.pop();
  const inputValue = get(formValues, paths);

  if (!inputValue) {
    return;
  }

  const sameVisionInputs = inputValues.filter(
    item => item.name === value && isVisionEqual(item, inputValue),
  );

  // All scenes are input or visually understood, and the same name is directly returned.
  if (sameVisionInputs.length > 1) {
    return I18n.t('workflow_detail_node_input_duplicated');
  }

  // Scenes with the same name as the input and visual understanding parameters are returned that cannot be the same name as the visual understanding parameters
  // Visual understanding of parameters and input duplicate names, return cannot duplicate input names
  const differentVisionInputs = inputValues.filter(
    item => item.name === value && !isVisionEqual(item, inputValue),
  );
  if (differentVisionInputs.length > 0) {
    if (isVisionInput(inputValue)) {
      return I18n.t('workflow_250317_01', undefined, '不能和输入重名');
    } else {
      return I18n.t('workflow_250317_02', undefined, '不能和视觉理解输入重名');
    }
  }
};
