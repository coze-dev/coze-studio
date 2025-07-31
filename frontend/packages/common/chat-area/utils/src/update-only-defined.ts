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

import { isUndefined, omitBy } from 'lodash-es';

/**
 * Zustand updates helper methods, checking imported parameter objects, discarding items with undefined values.
 * Zustand itself has no filtering logic. If there is no problem with the type, it may accidentally set the item to an undefined value
 */
export const updateOnlyDefined = <T extends Record<string, unknown>>(
  updater: (sth: T) => void,
  val: T,
) => {
  const left = omitBy(val, isUndefined) as T;
  if (!Object.keys(left).length) {
    return;
  }
  updater(left);
};
