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
import { type Validate } from '@flowgram-adapter/free-layout-editor';

import { createValueExpressionInputValidate } from '@/nodes-v2/materials/create-value-expression-input-validate';
import { createNodeInputNameValidate } from '@/nodes-v2/components/node-input-name/validate';

import { createInputTreeValidator } from '../../validators/create-input-tree-validator';

export function createInputsValidator(isTree: boolean): {
  [key: string]: Validate;
} {
  if (isTree) {
    return {
      'inputs.inputParameters': createInputTreeValidator(),
    };
  }

  return {
    'inputs.inputParameters.*.name': createNodeInputNameValidate({
      getNames: ({ formValues }) =>
        (get(formValues, 'inputs.inputParameters') || []).map(
          item => item.name,
        ),
    }),
    'inputs.inputParameters.*.input': createValueExpressionInputValidate({
      required: true,
    }),
  };
}
