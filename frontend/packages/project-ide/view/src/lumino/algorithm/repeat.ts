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
