// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { uuid4Factory } from './uuid';
import { Random } from './random.browser';

/**
 * The namespace for UUID related functionality.
 */
export namespace UUID {
  /**
   * A function which generates UUID v4 identifiers.
   *
   * @returns A new UUID v4 string.
   *
   * #### Notes
   * This implementation complies with RFC 4122.
   *
   * This uses `Random.getRandomValues()` for random bytes, which in
   * turn will use the underlying `crypto` module of the platform if
   * it is available. The fallback for randomness is `Math.random`.
   */
  export const uuid4 = uuid4Factory(Random.getRandomValues);
}
