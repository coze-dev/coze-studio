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
 * Take a fixed number of items from an iterable.
 *
 * @param object - The iterable object of interest.
 *
 * @param count - The number of items to take from the iterable.
 *
 * @returns An iterator which yields the specified number of items
 *   from the source iterable.
 *
 * #### Notes
 * The returned iterator will exhaust early if the source iterable
 * contains an insufficient number of items.
 *
 * #### Example
 * ```typescript
 * import { take } from '../algorithm';
 *
 * let stream = take([5, 4, 3, 2, 1, 0, -1], 3);
 *
 * Array.from(stream);  // [5, 4, 3]
 * ```
 */
export function* take<T>(
  object: Iterable<T>,
  count: number,
): IterableIterator<T> {
  if (count < 1) {
    return;
  }
  const it = object[Symbol.iterator]();
  let item: IteratorResult<T>;
  while (0 < count-- && !(item = it.next()).done) {
    yield item.value;
  }
}
