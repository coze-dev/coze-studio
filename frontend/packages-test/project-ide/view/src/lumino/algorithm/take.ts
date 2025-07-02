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
 * Take a fixed number of items from an iterable.
 *
 * @param object - The iterable object of interest.
 *
 * @param count - The number of items to take from the iterable.
 *
 * @returns An iterator which yields the specified number of items
 *   from the source iterable.
 *
 * #### Notes
 * The returned iterator will exhaust early if the source iterable
 * contains an insufficient number of items.
 *
 * #### Example
 * ```typescript
 * import { take } from '../algorithm';
 *
 * let stream = take([5, 4, 3, 2, 1, 0, -1], 3);
 *
 * Array.from(stream);  // [5, 4, 3]
 * ```
 */
export function* take<T>(
  object: Iterable<T>,
  count: number,
): IterableIterator<T> {
  if (count < 1) {
    return;
  }
  const it = object[Symbol.iterator]();
  let item: IteratorResult<T>;
  while (0 < count-- && !(item = it.next()).done) {
    yield item.value;
  }
}
