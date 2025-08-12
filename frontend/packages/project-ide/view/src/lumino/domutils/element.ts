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
 * The namespace for element related utilities.
 */
export namespace ElementExt {
  /**
   * An object which holds the border and padding data for an element.
   */
  export interface IBoxSizing {
    /**
     * The top border width, in pixels.
     */
    borderTop: number;

    /**
     * The left border width, in pixels.
     */
    borderLeft: number;

    /**
     * The right border width, in pixels.
     */
    borderRight: number;

    /**
     * The bottom border width, in pixels.
     */
    borderBottom: number;

    /**
     * The top padding width, in pixels.
     */
    paddingTop: number;

    /**
     * The left padding width, in pixels.
     */
    paddingLeft: number;

    /**
     * The right padding width, in pixels.
     */
    paddingRight: number;

    /**
     * The bottom padding width, in pixels.
     */
    paddingBottom: number;

    /**
     * The sum of horizontal border and padding.
     */
    horizontalSum: number;

    /**
     * The sum of vertical border and padding.
     */
    verticalSum: number;
  }

  /**
   * Compute the box sizing for an element.
   *
   * @param element - The element of interest.
   *
   * @returns The box sizing data for the specified element.
   */
  export function boxSizing(element: Element): IBoxSizing {
    const style = window.getComputedStyle(element);
    const bt = parseFloat(style.borderTopWidth!) || 0;
    const bl = parseFloat(style.borderLeftWidth!) || 0;
    const br = parseFloat(style.borderRightWidth!) || 0;
    const bb = parseFloat(style.borderBottomWidth!) || 0;
    const pt = parseFloat(style.paddingTop!) || 0;
    const pl = parseFloat(style.paddingLeft!) || 0;
    const pr = parseFloat(style.paddingRight!) || 0;
    const pb = parseFloat(style.paddingBottom!) || 0;
    const hs = bl + pl + pr + br;
    const vs = bt + pt + pb + bb;
    return {
      borderTop: bt,
      borderLeft: bl,
      borderRight: br,
      borderBottom: bb,
      paddingTop: pt,
      paddingLeft: pl,
      paddingRight: pr,
      paddingBottom: pb,
      horizontalSum: hs,
      verticalSum: vs,
    };
  }

  /**
   * An object which holds the min and max size data for an element.
   */
  export interface ISizeLimits {
    /**
     * The minimum width, in pixels.
     */
    minWidth: number;

    /**
     * The minimum height, in pixels.
     */
    minHeight: number;

    /**
     * The maximum width, in pixels.
     */
    maxWidth: number;

    /**
     * The maximum height, in pixels.
     */
    maxHeight: number;
  }

  /**
   * Compute the size limits for an element.
   *
   * @param element - The element of interest.
   *
   * @returns The size limit data for the specified element.
   */
  export function sizeLimits(element: Element): ISizeLimits {
    const style = window.getComputedStyle(element);
    const minWidth = parseFloat(style.minWidth!) || 0;
    const minHeight = parseFloat(style.minHeight!) || 0;
    let maxWidth = parseFloat(style.maxWidth!) || Infinity;
    let maxHeight = parseFloat(style.maxHeight!) || Infinity;
    maxWidth = Math.max(minWidth, maxWidth);
    maxHeight = Math.max(minHeight, maxHeight);
    return { minWidth, minHeight, maxWidth, maxHeight };
  }

  /**
   * Test whether a client position lies within an element.
   *
   * @param element - The DOM element of interest.
   *
   * @param clientX - The client X coordinate of interest.
   *
   * @param clientY - The client Y coordinate of interest.
   *
   * @returns Whether the point is within the given element.
   */
  export function hitTest(
    element: Element,
    clientX: number,
    clientY: number,
  ): boolean {
    const rect = element.getBoundingClientRect();
    return (
      clientX >= rect.left &&
      clientX < rect.right &&
      clientY >= rect.top &&
      clientY < rect.bottom
    );
  }

  /**
   * Vertically scroll an element into view if needed.
   *
   * @param area - The scroll area element.
   *
   * @param element - The element of interest.
   *
   * #### Notes
   * This follows the "nearest" behavior of the native `scrollIntoView`
   * method, which is not supported by all browsers.
   * https://drafts.csswg.org/cssom-view/#element-scrolling-members
   *
   * If the element fully covers the visible area or is fully contained
   * within the visible area, no scrolling will take place. Otherwise,
   * the nearest edges of the area and element are aligned.
   */
  export function scrollIntoViewIfNeeded(
    area: Element,
    element: Element,
  ): void {
    const ar = area.getBoundingClientRect();
    const er = element.getBoundingClientRect();
    if (er.top <= ar.top && er.bottom >= ar.bottom) {
      return;
    }
    if (er.top < ar.top && er.height <= ar.height) {
      area.scrollTop -= ar.top - er.top;
      return;
    }
    if (er.bottom > ar.bottom && er.height >= ar.height) {
      area.scrollTop -= ar.top - er.top;
      return;
    }
    if (er.top < ar.top && er.height > ar.height) {
      area.scrollTop -= ar.bottom - er.bottom;
      return;
    }
    if (er.bottom > ar.bottom && er.height < ar.height) {
      area.scrollTop -= ar.bottom - er.bottom;
      return;
    }
  }
}
