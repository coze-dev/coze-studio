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
import { ViewVariableType } from '@coze-workflow/base';

import { StringMethod } from './constants';

/**
 * Checks if the provided string method is a split method.
 *
 * @param {StringMethod} method - The string method to be checked.
 * @returns {boolean} Returns true if the method is a split method, false otherwise.
 */
export const isSplitMethod = (method: StringMethod) =>
  method === StringMethod.Split;

/**
 * Generates the default output configuration based on the provided string method.
 *
 * @param {StringMethod} method - The string method used to determine the output type.
 * @returns {Array<Object>} An array containing the default output configuration.
 */
export const getDefaultOutput = (method: StringMethod) => {
  const isSplit = isSplitMethod(method);
  return [
    {
      key: nanoid(),
      name: 'output',
      type: isSplit ? ViewVariableType.ArrayString : ViewVariableType.String,
      required: true,
    },
  ];
};
