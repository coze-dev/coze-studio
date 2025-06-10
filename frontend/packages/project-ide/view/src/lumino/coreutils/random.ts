// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

// Fallback
export function fallbackRandomValues(buffer: Uint8Array): void {
  let value = 0;
  for (let i = 0, n = buffer.length; i < n; ++i) {
    if (i % 4 === 0) {
      value = (Math.random() * 0xffffffff) >>> 0;
    }
    buffer[i] = value & 0xff;
    value >>>= 8;
  }
}
