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
