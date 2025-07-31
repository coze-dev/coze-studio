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
 * Create an iterator of evenly spaced values.
 *
 * @param start - The starting value for the range, inclusive.
 *
 * @param stop - The stopping value for the range, exclusive.
 *
 * @param step - The distance between each value.
 *
 * @returns An iterator which produces evenly spaced values.
 *
 * #### Notes
 * In the single argument form of `range(stop)`, `start` defaults to
 * `0` and `step` defaults to `1`.
 *
 * In the two argument form of `range(start, stop)`, `step` defaults
 * to `1`.
 *
 * #### Example
 * ```typescript
 * import { range } from '../algorithm';
 *
 * let stream = range(2, 4);
 *
 * Array.from(stream);  // [2, 3]
 * ```
 */
export function* range(
  start: number,
  stop?: number,
  step?: number,
): IterableIterator<number> {
  if (stop === undefined) {
    stop = start;
    start = 0;
    step = 1;
  } else if (step === undefined) {
    step = 1;
  }
  const length = Private.rangeLength(start, stop, step);
  for (let index = 0; index < length; index++) {
    yield start + step * index;
  }
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * Compute the effective length of a range.
   *
   * @param start - The starting value for the range, inclusive.
   *
   * @param stop - The stopping value for the range, exclusive.
   *
   * @param step - The distance between each value.
   *
   * @returns The number of steps need to traverse the range.
   */
  export function rangeLength(
    start: number,
    stop: number,
    step: number,
  ): number {
    if (step === 0) {
      return Infinity;
    }
    if (start > stop && step > 0) {
      return 0;
    }
    if (start < stop && step < 0) {
      return 0;
    }
    return Math.ceil((stop - start) / step);
  }
}
