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

/* eslint-disable max-params */
import { provideNodeOutputVariables } from 'src/form-extensions/variable-providers/provide-node-output-variables';
import { provideNodeBatchVariables } from 'src/form-extensions/variable-providers/provide-node-batch-variables';
import { provideMergeGroupVariables } from 'src/form-extensions/variable-providers/provide-merge-group-variables';
import { provideLoopOutputsVariables } from 'src/form-extensions/variable-providers/provide-loop-output-variables';
import { provideLoopInputsVariables } from 'src/form-extensions/variable-providers/provide-loop-input-variables';
import { type VariableProviderAbilityOptions } from '@flowgram-adapter/free-layout-editor';

import {
  mockFullOutputs,
  mockRefInputs,
  mockMergeGroup,
} from '../variable.mock';

const createCase = <V>(
  provider: VariableProviderAbilityOptions<V>,
  value: V,
  context: any = { node: { id: '12345' } },
  extraInfo = '',
): {
  key: string;
  parse: (input: any, context: any) => any;
  value: V;
  context: any;
  extraInfo: string;
} => ({
  key: provider.key || '',
  parse: provider.parse,
  value,
  context,
  extraInfo,
});

describe('test variable providers', () => {
  test.each([
    createCase(provideLoopInputsVariables, {
      inputParameters: mockRefInputs,
      variableParameters: mockRefInputs,
    }),
    createCase(provideLoopOutputsVariables, mockRefInputs),
    createCase(provideMergeGroupVariables, mockMergeGroup),
    createCase(provideNodeBatchVariables, mockRefInputs, {
      node: { id: '123456' },
      formItem: { formModel: { getFormItemValueByPath: path => 'batch' } },
    }),
    createCase(provideNodeOutputVariables, mockFullOutputs),
    createCase(
      provideNodeBatchVariables,
      mockRefInputs,
      {
        node: { id: '123456' },
        formItem: {
          formModel: { getFormItemValueByPath: path => 'not_batch' },
        },
      },
      "shouldn't provide batch variables",
    ),
    createCase(
      provideNodeBatchVariables,
      mockRefInputs,
      {
        node: { id: '123456' },
        formItem: {
          formModel: {
            getFormItemValueByPath: path =>
              path === '/batchMode' ? undefined : 'batch',
          },
        },
      },
      'batchMode in /inputs/batchMode',
    ),
  ])('test variable provider: $key $extraInfo', ({ parse, value, context }) => {
    expect(parse?.(value, context)).toMatchSnapshot();
  });
});
