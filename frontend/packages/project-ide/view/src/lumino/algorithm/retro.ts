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
 * An object which can produce a reverse iterator over its values.
 */
export interface IRetroable<T> {
  /**
   * Get a reverse iterator over the object's values.
   *
   * @returns An iterator which yields the object's values in reverse.
   */
  retro(): IterableIterator<T>;
}

/**
 * Create an iterator for a retroable object.
 *
 * @param object - The retroable or array-like object of interest.
 *
 * @returns An iterator which traverses the object's values in reverse.
 *
 * #### Example
 * ```typescript
 * import { retro } from '../algorithm';
 *
 * let data = [1, 2, 3, 4, 5, 6];
 *
 * let stream = retro(data);
 *
 * Array.from(stream);  // [6, 5, 4, 3, 2, 1]
 * ```
 */
export function* retro<T>(
  object: IRetroable<T> | ArrayLike<T>,
): IterableIterator<T> {
  if (typeof (object as IRetroable<T>).retro === 'function') {
    yield* (object as IRetroable<T>).retro();
  } else {
    for (let index = (object as ArrayLike<T>).length - 1; index > -1; index--) {
      yield (object as ArrayLike<T>)[index];
    }
  }
}
