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
 * Transform the values of an iterable with a mapping function.
 *
 * @param object - The iterable object of interest.
 *
 * @param fn - The mapping function to invoke for each value.
 *
 * @returns An iterator which yields the transformed values.
 *
 * #### Example
 * ```typescript
 * import { map } from '../algorithm';
 *
 * let data = [1, 2, 3];
 *
 * let stream = map(data, value => value * 2);
 *
 * Array.from(stream);  // [2, 4, 6]
 * ```
 */
export function* map<T, U>(
  object: Iterable<T>,
  fn: (value: T, index: number) => U,
): IterableIterator<U> {
  let index = 0;
  for (const value of object) {
    yield fn(value, index++);
  }
}
