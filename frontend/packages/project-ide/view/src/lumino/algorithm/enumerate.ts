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
 * Enumerate an iterable object.
 *
 * @param object - The iterable object of interest.
 *
 * @param start - The starting enum value. The default is `0`.
 *
 * @returns An iterator which yields the enumerated values.
 *
 * #### Example
 * ```typescript
 * import { enumerate } from '../algorithm';
 *
 * let data = ['foo', 'bar', 'baz'];
 *
 * let stream = enumerate(data, 1);
 *
 * Array.from(stream);  // [[1, 'foo'], [2, 'bar'], [3, 'baz']]
 * ```
 */
export function* enumerate<T>(
  object: Iterable<T>,
  start = 0,
): IterableIterator<[number, T]> {
  for (const value of object) {
    yield [start++, value];
  }
}
