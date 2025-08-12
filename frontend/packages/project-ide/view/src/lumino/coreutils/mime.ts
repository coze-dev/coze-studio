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
 * An object which stores MIME data for general application use.
 *
 * #### Notes
 * This class does not attempt to enforce "correctness" of MIME types
 * and their associated data. Since this class is designed to transfer
 * arbitrary data and objects within the same application, it assumes
 * that the user provides correct and accurate data.
 */
export class MimeData {
  /**
   * Get an array of the MIME types contained within the dataset.
   *
   * @returns A new array of the MIME types, in order of insertion.
   */
  types(): string[] {
    return this._types.slice();
  }

  /**
   * Test whether the dataset has an entry for the given type.
   *
   * @param mime - The MIME type of interest.
   *
   * @returns `true` if the dataset contains a value for the given
   *   MIME type, `false` otherwise.
   */
  hasData(mime: string): boolean {
    return this._types.indexOf(mime) !== -1;
  }

  /**
   * Get the data value for the given MIME type.
   *
   * @param mime - The MIME type of interest.
   *
   * @returns The value for the given MIME type, or `undefined` if
   *   the dataset does not contain a value for the type.
   */
  getData(mime: string): any | undefined {
    const i = this._types.indexOf(mime);
    return i !== -1 ? this._values[i] : undefined;
  }

  /**
   * Set the data value for the given MIME type.
   *
   * @param mime - The MIME type of interest.
   *
   * @param data - The data value for the given MIME type.
   *
   * #### Notes
   * This will overwrite any previous entry for the MIME type.
   */
  setData(mime: string, data: unknown): void {
    this.clearData(mime);
    this._types.push(mime);
    this._values.push(data);
  }

  /**
   * Remove the data entry for the given MIME type.
   *
   * @param mime - The MIME type of interest.
   *
   * #### Notes
   * This is a no-op if there is no entry for the given MIME type.
   */
  clearData(mime: string): void {
    const i = this._types.indexOf(mime);
    if (i !== -1) {
      this._types.splice(i, 1);
      this._values.splice(i, 1);
    }
  }

  /**
   * Remove all data entries from the dataset.
   */
  clear(): void {
    this._types.length = 0;
    this._values.length = 0;
  }

  private _types: string[] = [];

  private _values: any[] = [];
}
