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

/* eslint-disable security/detect-object-injection */
import { type InputItem } from 'src/form-extensions/variable-providers/common';
import {
  ValueExpressionType,
  ViewVariableType,
  type ViewVariableMeta,
} from 'src';
import { type InputValueVO } from '@coze-workflow/base/types';

export const genInput = (name: string, keyPath: string[]): InputItem => ({
  name,
  input: {
    type: ValueExpressionType.REF,
    content: { keyPath },
  },
});

export const mockKeyPaths = [
  ['start', 'String'],
  ['llm_0', 'Object'],
  ['start', 'Object', 'Image'],
  ['llm_0', 'Object', 'Number'],
  ['start', 'Array<Code>'],
  ['llm_0', 'Array<String>'],
  ['start', 'Array<Object>', 'Number'],
  // Not existed
  ['llm_0', 'Array<String>', 'Number'],
  ['start', 'Object', 'Undefined'],
  [],
];

export const mockMergeGroupKeyPaths = [
  ['merge_0', 'test_group_1'],
  ['merge_0', 'test_group_2'],
];

export const mockKeyPathsInsideLoop = [
  ['loop_0', 'loop_batch_llm_0__Object'],
  ['loop_0', 'loop_var_llm_0__Object'],
  ['loop_0', 'loop_batch_start__Array<Object>__Number'],
  ['loop_0', 'loop_var_start__Array<Code>'],
];

export const mockLoopOutputKeyPaths = [
  ['loop_0', 'loop_output_var_string'],
  ['loop_0', 'loop_output_string'],
  ['loop_0', 'loop_output_image'],
];

export const allKeyPaths = [
  ...mockKeyPaths,
  ...mockMergeGroupKeyPaths,
  ...mockKeyPathsInsideLoop,
  ...mockLoopOutputKeyPaths,
];

export const allEndRefInputs = [
  ...mockKeyPaths,
  ...mockMergeGroupKeyPaths,
  ...mockLoopOutputKeyPaths,
].map(_keyPath => genInput(_keyPath.join('__'), _keyPath));

export const allConstantInputs: InputValueVO[] = [
  {
    name: 'test_constant_no_raw_meta',
    input: {
      type: ValueExpressionType.LITERAL,
      content: 'test_constant',
    },
  },
  {
    name: 'test_constant_image_url',
    input: {
      type: ValueExpressionType.LITERAL,
      content: ['image_url'],
      rawMeta: { type: ViewVariableType.ArrayImage },
    },
  },
  {
    name: 'test_constant_array_object',
    input: {
      type: ValueExpressionType.LITERAL,
      content: [{ count: 0 }],
      rawMeta: {
        type: ViewVariableType.ArrayObject,
        children: [
          {
            key: 'count',
            name: 'count',
            type: ViewVariableType.Number,
          },
        ],
      },
    },
  },
];

export const mockRefInputs: InputItem[] = mockKeyPaths.map(_keyPath =>
  genInput(mockKeyPaths.join('__'), _keyPath),
);

export const mockRefValues = mockRefInputs.map(_input => _input.input);

export const mockMergeGroup = [
  {
    name: 'test_group_1',
    variables: mockRefValues,
  },
  {
    name: 'test_group_2',
    variables: mockRefValues.reverse(),
  },
];

export const mockFullOutputs: ViewVariableMeta[] =
  ViewVariableType.getComplement([]).map(_type => ({
    key: ViewVariableType.LabelMap[_type],
    name: ViewVariableType.LabelMap[_type],
    type: _type,
    required: true,
    description: 'test_description',
    children: ViewVariableType.canDrilldown(_type)
      ? ViewVariableType.getComplement([]).map(_childType => ({
          key: ViewVariableType.LabelMap[_childType],
          name: ViewVariableType.LabelMap[_childType],
          type: _childType,
          required: true,
          description: 'test_child_description',
        }))
      : [],
  }));
