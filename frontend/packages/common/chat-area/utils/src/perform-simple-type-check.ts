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

import { isNumber, isObject, isString } from 'lodash-es';

type CheckMethodName = 'is-string' | 'is-number';

const checkMethodsMap = new Map<CheckMethodName, (sth: unknown) => boolean>([
  ['is-string', isString],
  ['is-number', isNumber],
]);

/**
 * think about:
 * https://www.npmjs.com/package/type-plus
 * https://www.npmjs.com/package/generic-type-guard
 * https://github.com/runtypes/runtypes
 */
export const performSimpleObjectTypeCheck = <T extends Record<string, unknown>>(
  sth: unknown,
  pairs: [key: keyof T, checkMethod: CheckMethodName][],
): sth is T => {
  if (!isObject(sth)) {
    return false;
  }
  return pairs.every(([k, type]) => {
    if (!(k in sth)) {
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- runtime safe
    // @ts-expect-error
    const val = sth[k];
    return checkMethodsMap.get(type)?.(val);
  });
};
