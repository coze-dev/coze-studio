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

import { memo } from 'react';

import { ViewVariableType } from '@coze-workflow/base';

import { type InputComponentRegistry } from './type';
import { InputTime } from './input-time';
import { InputString } from './input-string';
import { InputSelect } from './input-select';
import { InputNumber } from './input-number';
import { InputJson } from './input-json';
import { InputInteger } from './input-integer';
import { InputBoolean } from './input-boolean';

export const DEFAULT_COMPONENT_REGISTRY: InputComponentRegistry[] = [
  {
    canHandle: ViewVariableType.String,
    component: memo(InputString),
  },
  {
    canHandle: ViewVariableType.Number,
    component: memo(InputNumber),
  },
  {
    canHandle: ViewVariableType.Integer,
    component: memo(InputInteger),
  },
  {
    canHandle: ViewVariableType.Boolean,
    component: memo(InputBoolean),
  },
  {
    canHandle: ViewVariableType.Time,
    component: memo(InputTime),
  },
  {
    canHandle: inputType => ViewVariableType.isJSONInputType(inputType),
    component: memo(InputJson),
  },
  {
    canHandle: (inputType, optionsList) =>
      [ViewVariableType.String, ViewVariableType.Integer].includes(inputType) &&
      (optionsList ?? []).length > 0,
    component: memo(InputSelect),
  },
];
