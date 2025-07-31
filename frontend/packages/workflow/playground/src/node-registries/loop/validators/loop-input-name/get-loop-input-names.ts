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
import { type InputValueVO } from '@coze-workflow/base';

import { LoopPath } from '../../constants';

export const getLoopInputNames = ({ value, formValues }): string[] => {
  const loopArray: InputValueVO[] = get(formValues, LoopPath.LoopArray) ?? [];
  const loopVariables = get(formValues, LoopPath.LoopVariables) ?? [];
  const loopInputs = [...loopArray, ...loopVariables];
  return loopInputs.map(input => input.name).filter(Boolean) as string[];
};
