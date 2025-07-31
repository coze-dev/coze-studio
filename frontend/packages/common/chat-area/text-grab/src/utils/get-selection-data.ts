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

import { type SelectionData } from '../types/selection';
import {
  CONTENT_ATTRIBUTE_NAME,
  MESSAGE_SOURCE_ATTRIBUTE_NAME,
} from '../constants/range';
import { shouldRefineRange } from './should-refine-range';
import { refineRange } from './refine-range/refine-range';
import { getOriginContentText } from './normalizer/get-origin-content-text';
import { getNormalizeNodeList } from './normalizer/get-normalize-node-list';
import { getHumanizedContentText } from './normalizer/get-humanize-content-text';
import { hasVisibleSelection } from './helper/is-range-collapsed';
import { getSelectionDirection } from './helper/get-selection-direction';
import { getAncestorAttributeNode } from './get-ancestor-attribute-node';

export const getSelectionData = ({
  selection,
  hasFix,
}: {
  selection: Selection;
  hasFix?: boolean;
}): SelectionData | undefined => {
  if (!selection.rangeCount) {
    return;
  }

  const range = selection.getRangeAt(0);

  if (!range) {
    return;
  }

  const documentFragment = range.cloneContents();

  const direction = getSelectionDirection(selection);

  /**
   * Determine whether it is an element that can be selected by getting a specific identifier
   */
  const ancestorNodeWithAttribute = getAncestorAttributeNode(
    range.commonAncestorContainer.parentNode,
    CONTENT_ATTRIBUTE_NAME,
  );

  // specific logo
  const ancestorAttributeValue =
    ancestorNodeWithAttribute?.attributes.getNamedItem(CONTENT_ATTRIBUTE_NAME)
      ?.value ?? null;

  // source of information
  const messageSource = ancestorNodeWithAttribute?.attributes.getNamedItem(
    MESSAGE_SOURCE_ATTRIBUTE_NAME,
  )?.value;

  if (!hasFix) {
    // Try to fix the selection
    const needFix = shouldRefineRange(range);

    // If repaired, retrieve the execution and return
    if (needFix) {
      const isFix = refineRange({ range });

      if (!isFix) {
        return;
      }

      return getSelectionData({
        selection,
        hasFix: true,
      });
    }
  }

  const hasVisibleSelectionResult = hasVisibleSelection(range);

  if (!hasVisibleSelectionResult) {
    return;
  }

  // Formatted Selection NodeList
  const normalizeSelectionNodeList = getNormalizeNodeList(
    documentFragment.childNodes,
  );

  if (!normalizeSelectionNodeList.length) {
    return;
  }

  // user-friendly text content
  const humanizedContentText = getHumanizedContentText(
    normalizeSelectionNodeList,
  );

  // raw text content
  const originContentText = getOriginContentText(normalizeSelectionNodeList);

  // If the repair selection is successful, then their components

  return {
    humanizedContentText,
    originContentText,
    normalizeSelectionNodeList,
    nodesAncestorIsMessageBox: Boolean(ancestorAttributeValue),
    ancestorAttributeValue,
    messageSource: Number(messageSource),
    direction,
  };
};
