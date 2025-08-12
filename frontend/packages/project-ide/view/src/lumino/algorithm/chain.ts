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

// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

/**
 * Chain together several iterables.
 *
 * @deprecated
 *
 * @param objects - The iterable objects of interest.
 *
 * @returns An iterator which yields the values of the iterables
 *   in the order in which they are supplied.
 *
 * #### Example
 * ```typescript
 * import { chain } from '../algorithm';
 *
 * let data1 = [1, 2, 3];
 * let data2 = [4, 5, 6];
 *
 * let stream = chain(data1, data2);
 *
 * Array.from(stream);  // [1, 2, 3, 4, 5, 6]
 * ```
 */
export function* chain<T>(...objects: Iterable<T>[]): IterableIterator<T> {
  for (const object of objects) {
    yield* object;
  }
}
