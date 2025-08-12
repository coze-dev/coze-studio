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

import { isFunction } from 'lodash-es';

/**
 * Convert a structure of the form {value: label} into the options Array < {label, value} > required by Select
 *   computedValue: Convert the value value once as the value of options
 *   passItem: Determine whether the current value needs to skip the traversal
 */
export default function convertMaptoOptions<Value = number>(
  map: Record<string, unknown>,
  convertOptions: {
    computedValue?: (val: unknown) => Value;
    passItem?: (val: unknown) => boolean;
    /**
     * Due to the implementation of i18n, the copy written as a constant needs to be loaded lazily
     * Therefore, the {value: label} structure involving i18n needs to be written as {value : () => label}
     * When this property is enabled, an additional lazy load is performed
     * @default false
     * @link
     */
    i18n?: boolean;
  } = {},
) {
  const res: Array<{ label: string; value: Value }> = [];
  for (const [value, label] of Object.entries(map)) {
    const pass = convertOptions.passItem
      ? convertOptions.passItem(value)
      : false;
    if (pass) {
      continue;
    }
    const computedValue = convertOptions.computedValue
      ? convertOptions.computedValue(value)
      : (value as Value);

    const finalLabel: string = convertOptions.i18n
      ? isFunction(label)
        ? label()
        : label
      : label;
    res.push({ label: finalLabel, value: computedValue });
  }
  return res;
}
