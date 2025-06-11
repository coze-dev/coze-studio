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
