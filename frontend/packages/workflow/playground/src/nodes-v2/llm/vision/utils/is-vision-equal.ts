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

import { type InputValueVO } from '@coze-workflow/base';

import { isVisionInput } from './is-vision-input';

/**
 * Determine if they are the same input type
 * @param value1
 * @param value2
 * @returns
 */
export const isVisionEqual = (
  value1: InputValueVO,
  value2: InputValueVO,
): boolean => isVisionInput(value1) === isVisionInput(value2);
