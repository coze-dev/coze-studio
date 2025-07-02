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
 * Filter an iterable for values which pass a test.
 *
 * @param object - The iterable object of interest.
 *
 * @param fn - The predicate function to invoke for each value.
 *
 * @returns An iterator which yields the values which pass the test.
 *
 * #### Example
 * ```typescript
 * import { filter } from '../algorithm';
 *
 * let data = [1, 2, 3, 4, 5, 6];
 *
 * let stream = filter(data, value => value % 2 === 0);
 *
 * Array.from(stream);  // [2, 4, 6]
 * ```
 */
export function* filter<T>(
  object: Iterable<T>,
  fn: (value: T, index: number) => boolean,
): IterableIterator<T> {
  let index = 0;
  for (const value of object) {
    if (fn(value, index++)) {
      yield value;
    }
  }
}
