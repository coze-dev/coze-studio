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
