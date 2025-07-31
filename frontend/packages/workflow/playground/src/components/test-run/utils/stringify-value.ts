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

import { isBoolean, isNumber } from 'lodash-es';

// Convert form values to testrun interface protocol format
const stringifyValue = (
  values: object,
  stringifyKeys?: string[],
): Record<string, string> | undefined => {
  if (!values) {
    return undefined;
  }
  return Object.entries(values).reduce<Record<string, string>>(
    (buf, [k, v]) => {
      if (isBoolean(v) || isNumber(v)) {
        buf[k] = String(v);
      } else if (stringifyKeys?.includes(k)) {
        buf[k] = JSON.stringify(v);
      } else {
        buf[k] = v as string;
      }
      return buf;
    },
    {},
  );
};

// Ensure that the default values passed in are of type string; the values in the current form are of type string, which can be handled simply. Multiple default value types may be required for verification in the future.
const stringifyDefaultValue = (value: object) => {
  if (!value) {
    return undefined;
  }
  return Object.keys(value).reduce((acc, key) => {
    const val = value[key];
    // Bool needs special treatment
    if (typeof val === 'string' || isBoolean(val)) {
      acc[key] = val;
    } else {
      acc[key] = JSON.stringify(value[key]);
    }
    return acc;
  }, {});
};

export { stringifyValue, stringifyDefaultValue };
