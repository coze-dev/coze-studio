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
 * Iterate over an iterable using a stepped increment.
 *
 * @param object - The iterable object of interest.
 *
 * @param step - The distance to step on each iteration. A value
 *   of less than `1` will behave the same as a value of `1`.
 *
 * @returns An iterator which traverses the iterable step-wise.
 *
 * #### Example
 * ```typescript
 * import { stride } from '../algorithm';
 *
 * let data = [1, 2, 3, 4, 5, 6];
 *
 * let stream = stride(data, 2);
 *
 * Array.from(stream);  // [1, 3, 5];
 * ```
 */
export function* stride<T>(
  object: Iterable<T>,
  step: number,
): IterableIterator<T> {
  let count = 0;
  for (const value of object) {
    if (0 === count++ % step) {
      yield value;
    }
  }
}
