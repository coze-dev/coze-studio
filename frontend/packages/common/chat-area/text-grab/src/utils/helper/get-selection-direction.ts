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
  // 确保有选区存在
  if (!selection || selection.isCollapsed) {
    return Direction.Unknown; // 没有选区或选区未展开
  }

  const { anchorNode } = selection;
  const { focusNode } = selection;

  // 确保 anchorNode 和 focusNode 都不为 null
  if (!anchorNode || !focusNode) {
    return Direction.Unknown; // 无法确定方向
  }

  const { anchorOffset } = selection;
  const { focusOffset } = selection;
  // 比较 anchor 和 focus 的位置
  if (anchorNode === focusNode) {
    // 如果 anchor 和 focus 在同一个节点，通过偏移量判断方向
    return anchorOffset <= focusOffset ? Direction.Forward : Direction.Backward;
  } else {
    // 如果不在同一个节点，使用 Document Position 来判断
    const position = compareNodePosition(anchorNode, focusNode);

    if (position === 'before') {
      return Direction.Forward;
    } else if (position === 'after') {
      return Direction.Backward;
    }
  }

  // 如果无法确定方向，返回 'unknown'
  return Direction.Unknown;
};
