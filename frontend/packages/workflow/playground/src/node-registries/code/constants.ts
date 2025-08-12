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

import { nanoid } from 'nanoid';
import { ViewVariableType } from '@coze-workflow/variable';

// path
export const INPUT_PATH = 'inputParameters';
export const CODE_PATH = 'codeParams';
export const OUTPUT_PATH = 'outputs';

// default value
export const DEFAULT_OUTPUTS = [
  {
    key: nanoid(),
    name: 'key0',
    type: ViewVariableType.String,
  },
  {
    key: nanoid(),
    name: 'key1',
    type: ViewVariableType.ArrayString,
  },
  {
    key: nanoid(),
    name: 'key2',
    type: ViewVariableType.Object,
    children: [
      {
        key: nanoid(),
        name: 'key21',
        type: ViewVariableType.String,
      },
    ],
  },
];

export const DEFAULT_INPUTS = [{ name: 'input' }];
