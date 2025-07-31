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
 * The namespace for string-specific algorithms.
 */
export namespace StringExt {
  /**
   * Find the indices of characters in a source text.
   *
   * @param source - The source text which should be searched.
   *
   * @param query - The characters to locate in the source text.
   *
   * @param start - The index to start the search.
   *
   * @returns The matched indices, or `null` if there is no match.
   *
   * #### Complexity
   * Linear on `sourceText`.
   *
   * #### Notes
   * In order for there to be a match, all of the characters in `query`
   * **must** appear in `source` in the order given by `query`.
   *
   * Characters are matched using strict `===` equality.
   */
  export function findIndices(
    source: string,
    query: string,
    start = 0,
  ): number[] | null {
    const indices = new Array<number>(query.length);
    for (let i = 0, j = start, n = query.length; i < n; ++i, ++j) {
      j = source.indexOf(query[i], j);
      if (j === -1) {
        return null;
      }
      indices[i] = j;
    }
    return indices;
  }

  /**
   * The result of a string match function.
   */
  export interface IMatchResult {
    /**
     * A score which indicates the strength of the match.
     *
     * The documentation of a given match function should specify
     * whether a lower or higher score is a stronger match.
     */
    score: number;

    /**
     * The indices of the matched characters in the source text.
     *
     * The indices will appear in increasing order.
     */
    indices: number[];
  }

  /**
   * A string matcher which uses a sum-of-squares algorithm.
   *
   * @param source - The source text which should be searched.
   *
   * @param query - The characters to locate in the source text.
   *
   * @param start - The index to start the search.
   *
   * @returns The match result, or `null` if there is no match.
   *   A lower `score` represents a stronger match.
   *
   * #### Complexity
   * Linear on `sourceText`.
   *
   * #### Notes
   * This scoring algorithm uses a sum-of-squares approach to determine
   * the score. In order for there to be a match, all of the characters
   * in `query` **must** appear in `source` in order. The index of each
   * matching character is squared and added to the score. This means
   * that early and consecutive character matches are preferred, while
   * late matches are heavily penalized.
   */
  export function matchSumOfSquares(
    source: string,
    query: string,
    start = 0,
  ): IMatchResult | null {
    const indices = findIndices(source, query, start);
    if (!indices) {
      return null;
    }
    let score = 0;
    for (let i = 0, n = indices.length; i < n; ++i) {
      const j = indices[i] - start;
      score += j * j;
    }
    return { score, indices };
  }

  /**
   * A string matcher which uses a sum-of-deltas algorithm.
   *
   * @param source - The source text which should be searched.
   *
   * @param query - The characters to locate in the source text.
   *
   * @param start - The index to start the search.
   *
   * @returns The match result, or `null` if there is no match.
   *   A lower `score` represents a stronger match.
   *
   * #### Complexity
   * Linear on `sourceText`.
   *
   * #### Notes
   * This scoring algorithm uses a sum-of-deltas approach to determine
   * the score. In order for there to be a match, all of the characters
   * in `query` **must** appear in `source` in order. The delta between
   * the indices are summed to create the score. This means that groups
   * of matched characters are preferred, while fragmented matches are
   * penalized.
   */
  export function matchSumOfDeltas(
    source: string,
    query: string,
    start = 0,
  ): IMatchResult | null {
    const indices = findIndices(source, query, start);
    if (!indices) {
      return null;
    }
    let score = 0;
    let last = start - 1;
    for (let i = 0, n = indices.length; i < n; ++i) {
      const j = indices[i];
      score += j - last - 1;
      last = j;
    }
    return { score, indices };
  }

  /**
   * Highlight the matched characters of a source text.
   *
   * @param source - The text which should be highlighted.
   *
   * @param indices - The indices of the matched characters. They must
   *   appear in increasing order and must be in bounds of the source.
   *
   * @param fn - The function to apply to the matched chunks.
   *
   * @returns An array of unmatched and highlighted chunks.
   */
  export function highlight<T>(
    source: string,
    indices: ReadonlyArray<number>,
    fn: (chunk: string) => T,
  ): Array<string | T> {
    // Set up the result array.
    const result: Array<string | T> = [];

    // Set up the counter variables.
    let k = 0;
    let last = 0;
    const n = indices.length;

    // Iterator over each index.
    while (k < n) {
      // Set up the chunk indices.
      const i = indices[k];
      let j = indices[k];

      // Advance the right chunk index until it's non-contiguous.
      while (++k < n && indices[k] === j + 1) {
        j++;
      }

      // Extract the unmatched text.
      if (last < i) {
        result.push(source.slice(last, i));
      }

      // Extract and highlight the matched text.
      if (i < j + 1) {
        result.push(fn(source.slice(i, j + 1)));
      }

      // Update the last visited index.
      last = j + 1;
    }

    // Extract any remaining unmatched text.
    if (last < source.length) {
      result.push(source.slice(last));
    }

    // Return the highlighted result.
    return result;
  }

  /**
   * A 3-way string comparison function.
   *
   * @param a - The first string of interest.
   *
   * @param b - The second string of interest.
   *
   * @returns `-1` if `a < b`, else `1` if `a > b`, else `0`.
   */
  export function cmp(a: string, b: string): number {
    return a < b ? -1 : a > b ? 1 : 0;
  }
}
