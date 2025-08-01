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

import { Direction } from '../../types/selection';
import { compareNodePosition } from './compare-node-position';

export const getSelectionDirection = (selection: Selection): Direction => {
  // Make sure there are constituencies
  if (!selection || selection.isCollapsed) {
    return Direction.Unknown; // No constituencies or constituencies not expanded
  }

  const { anchorNode } = selection;
  const { focusNode } = selection;

  // Make sure that neither anchorNode nor focusNode is null
  if (!anchorNode || !focusNode) {
    return Direction.Unknown; // Unable to determine direction
  }

  const { anchorOffset } = selection;
  const { focusOffset } = selection;
  // Compare anchor and focus positions
  if (anchorNode === focusNode) {
    // If the anchor and focus are on the same node, determine the direction by the offset
    return anchorOffset <= focusOffset ? Direction.Forward : Direction.Backward;
  } else {
    // If not in the same node, use Document Position to determine
    const position = compareNodePosition(anchorNode, focusNode);

    if (position === 'before') {
      return Direction.Forward;
    } else if (position === 'after') {
      return Direction.Backward;
    }
  }

  // If the direction cannot be determined, return'unknown'
  return Direction.Unknown;
};
