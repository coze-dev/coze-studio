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

import { fallbackRandomValues } from './random';

// Declare ambient variables for `window` and `require` to avoid a
// hard dependency on both. This package must run on node.
declare let window: any;

/**
 * The namespace for random number related functionality.
 */
export namespace Random {
  /**
   * A function which generates random bytes.
   *
   * @param buffer - The `Uint8Array` to fill with random bytes.
   *
   * #### Notes
   * A cryptographically strong random number generator will be used if
   * available. Otherwise, `Math.random` will be used as a fallback for
   * randomness.
   *
   * The following RNGs are supported, listed in order of precedence:
   *   - `window.crypto.getRandomValues`
   *   - `window.msCrypto.getRandomValues`
   *   - `require('crypto').randomFillSync
   *   - `require('crypto').randomBytes
   *   - `Math.random`
   */
  export const getRandomValues = (() => {
    // Look up the crypto module if available.
    const crypto: any =
      (typeof window !== 'undefined' && (window.crypto || window.msCrypto)) ||
      null;

    // Modern browsers and IE 11
    if (crypto && typeof crypto.getRandomValues === 'function') {
      return function getRandomValues(buffer: Uint8Array): void {
        return crypto.getRandomValues(buffer);
      };
    }

    // Fallback
    return fallbackRandomValues;
  })();
}
