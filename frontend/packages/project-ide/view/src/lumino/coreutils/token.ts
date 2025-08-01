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
 * A runtime object which captures compile-time type information.
 *
 * #### Notes
 * A token captures the compile-time type of an interface or class in
 * an object which can be used at runtime in a type-safe fashion.
 */
export class Token<T> {
  /**
   * Construct a new token.
   *
   * @param name - A human readable name for the token.
   * @param description - Token purpose description for documentation.
   */
  constructor(name: string, description?: string) {
    this.name = name;
    this.description = description ?? '';
    this._tokenStructuralPropertyT = null!;
  }

  /**
   * Token purpose description.
   */
  readonly description?: string; // FIXME remove `?` for the next major version

  /**
   * The human readable name for the token.
   *
   * #### Notes
   * This can be useful for debugging and logging.
   */
  readonly name: string;

  private _tokenStructuralPropertyT: T;
}
