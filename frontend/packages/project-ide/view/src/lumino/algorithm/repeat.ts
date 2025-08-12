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
 * Create an iterator which repeats a value a number of times.
 *
 * @deprecated
 *
 * @param value - The value to repeat.
 *
 * @param count - The number of times to repeat the value.
 *
 * @returns A new iterator which repeats the specified value.
 *
 * #### Example
 * ```typescript
 * import { repeat } from '../algorithm';
 *
 * let stream = repeat(7, 3);
 *
 * Array.from(stream);  // [7, 7, 7]
 * ```
 */
export function* repeat<T>(value: T, count: number): IterableIterator<T> {
  while (0 < count--) {
    yield value;
  }
}

/**
 * Create an iterator which yields a value a single time.
 *
 * @deprecated
 *
 * @param value - The value to wrap in an iterator.
 *
 * @returns A new iterator which yields the value a single time.
 *
 * #### Example
 * ```typescript
 * import { once } from '../algorithm';
 *
 * let stream = once(7);
 *
 * Array.from(stream);  // [7]
 * ```
 */
export function* once<T>(value: T): IterableIterator<T> {
  yield value;
}
