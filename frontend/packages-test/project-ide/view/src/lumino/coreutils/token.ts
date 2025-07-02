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
