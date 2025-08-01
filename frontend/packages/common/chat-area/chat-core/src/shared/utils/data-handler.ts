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

import { pickBy, type merge, mergeWith, isArray } from 'lodash-es';

export const filterEmptyField = <T extends Record<string, unknown>>(
  obj: T,
): T =>
  pickBy(
    obj,
    value => value !== undefined && value !== null && value !== '',
  ) as T;

export type PartiallyRequired<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

// Enum to union type
export type EnumToUnion<T extends Record<string, string>> = T[keyof T];

export const muteMergeWithArray = (...args: Parameters<typeof merge>) =>
  mergeWith(...args, (objValue: unknown, srcValue: unknown) => {
    if (isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  });
