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
 * Create an array from an iterable of values.
 *
 * @deprecated
 *
 * @param object - The iterable object of interest.
 *
 * @returns A new array of values from the given object.
 *
 * #### Example
 * ```typescript
 * import { toArray } from '../algorithm';
 *
 * let stream = [1, 2, 3, 4, 5, 6][Symbol.iterator]();
 *
 * toArray(stream);  // [1, 2, 3, 4, 5, 6];
 * ```
 */
export function toArray<T>(object: Iterable<T>): T[] {
  return Array.from(object);
}

/**
 * Create an object from an iterable of key/value pairs.
 *
 * @param object - The iterable object of interest.
 *
 * @returns A new object mapping keys to values.
 *
 * #### Example
 * ```typescript
 * import { toObject } from '../algorithm';
 *
 * let data: [string, number][] = [['one', 1], ['two', 2], ['three', 3]];
 *
 * toObject(data);  // { one: 1, two: 2, three: 3 }
 * ```
 */
export function toObject<T>(object: Iterable<[string, T]>): {
  [key: string]: T;
} {
  const result: { [key: string]: T } = {};
  for (const [key, value] of object) {
    result[key] = value;
  }
  return result;
}

/**
 * Invoke a function for each value in an iterable.
 *
 * @deprecated
 *
 * @param object - The iterable object of interest.
 *
 * @param fn - The callback function to invoke for each value.
 *
 * #### Notes
 * Iteration can be terminated early by returning `false` from the
 * callback function.
 *
 * #### Complexity
 * Linear.
 *
 * #### Example
 * ```typescript
 * import { each } from '../algorithm';
 *
 * let data = [5, 7, 0, -2, 9];
 *
 * each(data, value => { console.log(value); });
 * ```
 */
export function each<T>(
  object: Iterable<T>,
  fn: (value: T, index: number) => boolean | void,
): void {
  let index = 0;
  for (const value of object) {
    if (false === fn(value, index++)) {
      return;
    }
  }
}

/**
 * Test whether all values in an iterable satisfy a predicate.
 *
 * @param object - The iterable object of interest.
 *
 * @param fn - The predicate function to invoke for each value.
 *
 * @returns `true` if all values pass the test, `false` otherwise.
 *
 * #### Notes
 * Iteration terminates on the first `false` predicate result.
 *
 * #### Complexity
 * Linear.
 *
 * #### Example
 * ```typescript
 * import { every } from '../algorithm';
 *
 * let data = [5, 7, 1];
 *
 * every(data, value => value % 2 === 0);  // false
 * every(data, value => value % 2 === 1);  // true
 * ```
 */
export function every<T>(
  object: Iterable<T>,
  fn: (value: T, index: number) => boolean,
): boolean {
  let index = 0;
  for (const value of object) {
    if (false === fn(value, index++)) {
      return false;
    }
  }
  return true;
}

/**
 * Test whether any value in an iterable satisfies a predicate.
 *
 * @param object - The iterable object of interest.
 *
 * @param fn - The predicate function to invoke for each value.
 *
 * @returns `true` if any value passes the test, `false` otherwise.
 *
 * #### Notes
 * Iteration terminates on the first `true` predicate result.
 *
 * #### Complexity
 * Linear.
 *
 * #### Example
 * ```typescript
 * import { some } from '../algorithm';
 *
 * let data = [5, 7, 1];
 *
 * some(data, value => value === 7);  // true
 * some(data, value => value === 3);  // false
 * ```
 */
export function some<T>(
  object: Iterable<T>,
  fn: (value: T, index: number) => boolean,
): boolean {
  let index = 0;
  for (const value of object) {
    if (fn(value, index++)) {
      return true;
    }
  }
  return false;
}
