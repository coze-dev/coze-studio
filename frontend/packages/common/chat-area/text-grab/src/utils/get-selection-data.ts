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
   * 通过获取特定标识 判断是否是可以划选的元素
   */
  const ancestorNodeWithAttribute = getAncestorAttributeNode(
    range.commonAncestorContainer.parentNode,
    CONTENT_ATTRIBUTE_NAME,
  );

  // 特定标识
  const ancestorAttributeValue =
    ancestorNodeWithAttribute?.attributes.getNamedItem(CONTENT_ATTRIBUTE_NAME)
      ?.value ?? null;

  // 信息来源
  const messageSource = ancestorNodeWithAttribute?.attributes.getNamedItem(
    MESSAGE_SOURCE_ATTRIBUTE_NAME,
  )?.value;

  if (!hasFix) {
    // 尝试修复选区
    const needFix = shouldRefineRange(range);

    // 如果修复过，则重新获取执行并返回
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

  // 格式化的选区NodeList
  const normalizeSelectionNodeList = getNormalizeNodeList(
    documentFragment.childNodes,
  );

  if (!normalizeSelectionNodeList.length) {
    return;
  }

  // 人性化文本内容
  const humanizedContentText = getHumanizedContentText(
    normalizeSelectionNodeList,
  );

  // 原始文本内容
  const originContentText = getOriginContentText(normalizeSelectionNodeList);

  // 如果修复选区成功了，那么他们的组件

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
