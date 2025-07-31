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

export type NestedObject = Record<string, never>;

export function flattenObject(obj: NestedObject): NestedObject {
  const flatten = Object.keys(obj).reduce((acc: NestedObject, key: string) => {
    const target = obj[key];
    if (
      typeof target === 'object' &&
      target !== null &&
      !Array.isArray(target)
    ) {
      Object.assign(acc, flattenObject(target));
    } else {
      Object.assign(acc, { [key]: target });
    }
    return acc;
  }, {});

  return flatten;
}
