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
 * Find the first value in an iterable which matches a predicate.
 *
 * @param object - The iterable object to search.
 *
 * @param fn - The predicate function to apply to the values.
 *
 * @returns The first matching value, or `undefined` if no matching
 *   value is found.
 *
 * #### Complexity
 * Linear.
 *
 * #### Example
 * ```typescript
 * import { find } from '../algorithm';
 *
 * interface IAnimal { species: string, name: string };
 *
 * function isCat(value: IAnimal): boolean {
 *   return value.species === 'cat';
 * }
 *
 * let data: IAnimal[] = [
 *   { species: 'dog', name: 'spot' },
 *   { species: 'cat', name: 'fluffy' },
 *   { species: 'alligator', name: 'pocho' }
 * ];
 *
 * find(data, isCat).name;  // 'fluffy'
 * ```
 */
export function find<T>(
  object: Iterable<T>,
  fn: (value: T, index: number) => boolean,
): T | undefined {
  let index = 0;
  for (const value of object) {
    if (fn(value, index++)) {
      return value;
    }
  }
  return undefined;
}

/**
 * Find the index of the first value which matches a predicate.
 *
 * @param object - The iterable object to search.
 *
 * @param fn - The predicate function to apply to the values.
 *
 * @returns The index of the first matching value, or `-1` if no
 *   matching value is found.
 *
 * #### Complexity
 * Linear.
 *
 * #### Example
 * ```typescript
 * import { findIndex } from '../algorithm';
 *
 * interface IAnimal { species: string, name: string };
 *
 * function isCat(value: IAnimal): boolean {
 *   return value.species === 'cat';
 * }
 *
 * let data: IAnimal[] = [
 *   { species: 'dog', name: 'spot' },
 *   { species: 'cat', name: 'fluffy' },
 *   { species: 'alligator', name: 'pocho' }
 * ];
 *
 * findIndex(data, isCat);  // 1
 * ```
 */
export function findIndex<T>(
  object: Iterable<T>,
  fn: (value: T, index: number) => boolean,
): number {
  let index = 0;
  for (const value of object) {
    if (fn(value, index++)) {
      return index - 1;
    }
  }
  return -1;
}

/**
 * Find the minimum value in an iterable.
 *
 * @param object - The iterable object to search.
 *
 * @param fn - The 3-way comparison function to apply to the values.
 *   It should return `< 0` if the first value is less than the second.
 *   `0` if the values are equivalent, or `> 0` if the first value is
 *   greater than the second.
 *
 * @returns The minimum value in the iterable. If multiple values are
 *   equivalent to the minimum, the left-most value is returned. If
 *   the iterable is empty, this returns `undefined`.
 *
 * #### Complexity
 * Linear.
 *
 * #### Example
 * ```typescript
 * import { min } from '../algorithm';
 *
 * function numberCmp(a: number, b: number): number {
 *   return a - b;
 * }
 *
 * min([7, 4, 0, 3, 9, 4], numberCmp);  // 0
 * ```
 */
export function min<T>(
  object: Iterable<T>,
  fn: (first: T, second: T) => number,
): T | undefined {
  let result: T | undefined = undefined;
  for (const value of object) {
    if (result === undefined) {
      result = value;
      continue;
    }
    if (fn(value, result) < 0) {
      result = value;
    }
  }
  return result;
}

/**
 * Find the maximum value in an iterable.
 *
 * @param object - The iterable object to search.
 *
 * @param fn - The 3-way comparison function to apply to the values.
 *   It should return `< 0` if the first value is less than the second.
 *   `0` if the values are equivalent, or `> 0` if the first value is
 *   greater than the second.
 *
 * @returns The maximum value in the iterable. If multiple values are
 *   equivalent to the maximum, the left-most value is returned. If
 *   the iterable is empty, this returns `undefined`.
 *
 * #### Complexity
 * Linear.
 *
 * #### Example
 * ```typescript
 * import { max } from '../algorithm';
 *
 * function numberCmp(a: number, b: number): number {
 *   return a - b;
 * }
 *
 * max([7, 4, 0, 3, 9, 4], numberCmp);  // 9
 * ```
 */
export function max<T>(
  object: Iterable<T>,
  fn: (first: T, second: T) => number,
): T | undefined {
  let result: T | undefined = undefined;
  for (const value of object) {
    if (result === undefined) {
      result = value;
      continue;
    }
    if (fn(value, result) > 0) {
      result = value;
    }
  }
  return result;
}

/**
 * Find the minimum and maximum values in an iterable.
 *
 * @param object - The iterable object to search.
 *
 * @param fn - The 3-way comparison function to apply to the values.
 *   It should return `< 0` if the first value is less than the second.
 *   `0` if the values are equivalent, or `> 0` if the first value is
 *   greater than the second.
 *
 * @returns A 2-tuple of the `[min, max]` values in the iterable. If
 *   multiple values are equivalent, the left-most values are returned.
 *   If the iterable is empty, this returns `undefined`.
 *
 * #### Complexity
 * Linear.
 *
 * #### Example
 * ```typescript
 * import { minmax } from '../algorithm';
 *
 * function numberCmp(a: number, b: number): number {
 *   return a - b;
 * }
 *
 * minmax([7, 4, 0, 3, 9, 4], numberCmp);  // [0, 9]
 * ```
 */
export function minmax<T>(
  object: Iterable<T>,
  fn: (first: T, second: T) => number,
): [T, T] | undefined {
  let empty = true;
  let vmin: T;
  let vmax: T;
  for (const value of object) {
    if (empty) {
      vmin = value;
      vmax = value;
      empty = false;
    } else if (fn(value, vmin!) < 0) {
      vmin = value;
    } else if (fn(value, vmax!) > 0) {
      vmax = value;
    }
  }
  return empty ? undefined : [vmin!, vmax!];
}
