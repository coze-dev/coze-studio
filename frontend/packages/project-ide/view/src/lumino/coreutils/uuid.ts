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
 * A function which creates a function that generates UUID v4 identifiers.
 *
 * @returns A new function that creates a UUID v4 string.
 *
 * #### Notes
 * This implementation complies with RFC 4122.
 *
 * This uses `Random.getRandomValues()` for random bytes, which in
 * turn will use the underlying `crypto` module of the platform if
 * it is available. The fallback for randomness is `Math.random`.
 */
export function uuid4Factory(
  getRandomValues: (bytes: Uint8Array) => void,
): () => string {
  // Create a 16 byte array to hold the random values.
  const bytes = new Uint8Array(16);

  // Create a look up table from bytes to hex strings.
  const lut = new Array<string>(256);

  // Pad the single character hex digits with a leading zero.
  for (let i = 0; i < 16; ++i) {
    lut[i] = `0${i.toString(16)}`;
  }

  // Populate the rest of the hex digits.
  for (let i = 16; i < 256; ++i) {
    lut[i] = i.toString(16);
  }

  // Return a function which generates the UUID.
  return function uuid4(): string {
    // Get a new batch of random values.
    getRandomValues(bytes);

    // Set the UUID version number to 4.
    bytes[6] = 0x40 | (bytes[6] & 0x0f);

    // Set the clock sequence bit to the RFC spec.
    bytes[8] = 0x80 | (bytes[8] & 0x3f);

    // Assemble the UUID string.
    return `${lut[bytes[0]] + lut[bytes[1]] + lut[bytes[2]] + lut[bytes[3]]}-${
      lut[bytes[4]]
    }${lut[bytes[5]]}-${lut[bytes[6]]}${lut[bytes[7]]}-${lut[bytes[8]]}${
      lut[bytes[9]]
    }-${lut[bytes[10]]}${lut[bytes[11]]}${lut[bytes[12]]}${lut[bytes[13]]}${
      lut[bytes[14]]
    }${lut[bytes[15]]}`;
  };
}
