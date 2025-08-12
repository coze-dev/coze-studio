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

import { type EditorAPI } from '@coze-editor/editor/preset-prompt';

export const getSelectionBoundary = (editor: EditorAPI) => {
  const rects = editor.getMainSelectionRects();

  if (rects.length === 0) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }

  // Initialize the largest rectangle
  let maxLeft = Infinity;
  let maxTop = Infinity;
  let maxRight = -Infinity;
  let maxBottom = -Infinity;

  // Iterate through all rectangles and calculate the bounding box boundary
  rects.forEach(rect => {
    maxLeft = Math.min(maxLeft, rect.left);
    maxTop = Math.min(maxTop, rect.top);
    maxRight = Math.max(maxRight, rect.left + (rect.width ?? 0));
    maxBottom = Math.max(maxBottom, rect.top + (rect.height ?? 0));
  });

  // Calculate the final width and height
  const width = maxRight - maxLeft;
  const height = maxBottom - maxTop;

  // Get the scroll position of the editor
  const { scrollLeft } = editor.$view.scrollDOM;
  const { scrollTop } = editor.$view.scrollDOM;

  // Get the location of the editor container
  const editorRect = editor.$view.dom.getBoundingClientRect();

  // Calculate the absolute position relative to the viewport
  const absoluteLeft = editorRect.left + maxLeft - scrollLeft;
  const absoluteTop = editorRect.top + maxTop - scrollTop;
  const absoluteBottom = editorRect.top + maxBottom - scrollTop;

  return {
    left: absoluteLeft,
    top: absoluteTop,
    bottom: absoluteBottom,
    width,
    height,
  };
};
