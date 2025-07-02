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
 * The namespace for platform related utilities.
 */
export namespace Platform {
  /**
   * A flag indicating whether the platform is Mac.
   */
  export const IS_MAC = !!navigator.platform.match(/Mac/i);

  /**
   * A flag indicating whether the platform is Windows.
   */
  export const IS_WIN = !!navigator.platform.match(/Win/i);

  /**
   * A flag indicating whether the browser is IE.
   */
  export const IS_IE = /Trident/.test(navigator.userAgent);

  /**
   * A flag indicating whether the browser is Edge.
   */
  export const IS_EDGE = /Edge/.test(navigator.userAgent);

  /**
   * Test whether the `accel` key is pressed.
   *
   * @param event - The keyboard or mouse event of interest.
   *
   * @returns Whether the `accel` key is pressed.
   *
   * #### Notes
   * On Mac the `accel` key is the command key. On all other
   * platforms the `accel` key is the control key.
   */
  export function accelKey(event: KeyboardEvent | MouseEvent): boolean {
    return IS_MAC ? event.metaKey : event.ctrlKey;
  }
}
