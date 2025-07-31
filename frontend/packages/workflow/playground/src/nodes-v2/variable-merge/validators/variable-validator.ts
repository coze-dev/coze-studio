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

import { get, isUndefined } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { type Validate } from '@flowgram-adapter/free-layout-editor';

import { isVariableTypeMatched } from '../utils/is-variable-type-matched';
import { getVariableViewType } from '../utils/get-variable-view-type';
import { createValueExpressionInputValidate } from '../../materials/create-value-expression-input-validate';

export const variableValidator: Validate = options => {
  // Todo currently deletes the element of the form engine and will pass an undefined one. The verification is skipped first, and the subsequent node engine fixes the removal.
  if (isUndefined(options?.value)) {
    return;
  }
  // check expression
  const validator = createValueExpressionInputValidate({
    required: true,
  });

  const error = validator(options);
  if (error) {
    return error;
  }

  const paths = get(options, 'name', '').split('.');
  const index = paths.pop();

  // The first item does not require verification
  if (index === '0') {
    return;
  }

  // Verify that the variable type is consistent with the first item
  const { node } = options.context;
  const { variableService } = options.context.playgroundContext;
  const variables = get(options.formValues, paths);

  const firstVariableType = getVariableViewType(
    variables[0],
    variableService,
    node,
  );

  const variableType = getVariableViewType(
    options.value,
    variableService,
    node,
  );

  if (
    !firstVariableType ||
    !variableType ||
    !isVariableTypeMatched(firstVariableType, variableType)
  ) {
    return I18n.t('workflow_var_merge_var_err_sametype');
  }
};
