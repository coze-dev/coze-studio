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
| Copyright (c) 2014-2019, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

/**
 * The namespace for clipboard related functionality.
 */
export namespace ClipboardExt {
  /**
   * Copy text to the system clipboard.
   *
   * @param text - The text to copy to the clipboard.
   */
  export function copyText(text: string): void {
    // Fetch the document body.
    const { body } = document;

    // Set up the clipboard event listener.
    const handler = (event: ClipboardEvent) => {
      // Stop the event propagation.
      event.preventDefault();
      event.stopPropagation();

      // Set the clipboard data.
      event.clipboardData!.setData('text', text);

      // Remove the event listener.
      body.removeEventListener('copy', handler, true);
    };

    // Add the event listener.
    body.addEventListener('copy', handler, true);

    // Trigger the event.
    document.execCommand('copy');
  }
}
