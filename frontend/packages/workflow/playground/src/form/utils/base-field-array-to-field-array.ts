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

import {
  type FieldArrayInstance,
  type BaseFieldArrayInstance,
  type BaseFieldState,
  type BaseFieldInstance,
} from '../type';
import { baseFieldToField } from './base-field-to-field';

export function baseFieldArrayToFieldArray<T = unknown>(
  baseField: BaseFieldArrayInstance<T>,
  baseFieldState?: BaseFieldState,
  readonly = false,
): FieldArrayInstance<T> {
  const fieldArray = baseFieldToField(
    baseField as unknown as BaseFieldInstance<T[]>,
    baseFieldState,
    readonly,
  ) as FieldArrayInstance<T>;

  fieldArray.remove = (index: number) => baseField?.delete(index);
  fieldArray.delete = (index: number) => baseField?.delete(index);
  fieldArray.append = (newItem: T) => {
    baseField?.append(newItem);
  };
  fieldArray.move = (from: number, to: number) => baseField?.move(from, to);

  return fieldArray;
}
