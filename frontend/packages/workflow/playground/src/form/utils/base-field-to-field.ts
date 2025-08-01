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
  type FieldInstance,
  type BaseFieldInstance,
  type BaseFieldState,
} from '../type';

export function baseFieldToField<T = unknown>(
  baseField: BaseFieldInstance<T>,
  baseFieldState?: BaseFieldState,
  readonly = false,
): FieldInstance<T> {
  const field: FieldInstance<T> = {
    key: baseField.key,
    value: baseField.value,
    name: baseField.name,
    onBlur: () => baseField.onBlur?.(),
    onFocus: () => baseField.onFocus?.(),

    readonly,
    errors: baseFieldState?.errors,
    onChange: (value?: T) => {
      if (readonly) {
        return;
      }

      baseField?.onChange(value as T);
    },
  };

  return field;
}
