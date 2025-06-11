// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { every } from './iter';

/**
 * Iterate several iterables in lockstep.
 *
 * @param objects - The iterable objects of interest.
 *
 * @returns An iterator which yields successive tuples of values where
 *   each value is taken in turn from the provided iterables. It will
 *   be as long as the shortest provided iterable.
 *
 * #### Example
 * ```typescript
 * import { zip } from '../algorithm';
 *
 * let data1 = [1, 2, 3];
 * let data2 = [4, 5, 6];
 *
 * let stream = zip(data1, data2);
 *
 * Array.from(stream);  // [[1, 4], [2, 5], [3, 6]]
 * ```
 */
export function* zip<T>(...objects: Iterable<T>[]): IterableIterator<T[]> {
  const iters = objects.map(obj => obj[Symbol.iterator]());
  let tuple = iters.map(it => it.next());
  for (; every(tuple, item => !item.done); tuple = iters.map(it => it.next())) {
    yield tuple.map(item => item.value);
  }
}
