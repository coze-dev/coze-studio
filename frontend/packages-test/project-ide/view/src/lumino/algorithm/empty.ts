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
 * Create an empty iterator.
 *
 * @returns A new iterator which yields nothing.
 *
 * #### Example
 * ```typescript
 * import { empty } from '../algorithm';
 *
 * let stream = empty<number>();
 *
 * Array.from(stream);  // []
 * ```
 */

export function* empty<T>(): IterableIterator<T> {
  return;
}
