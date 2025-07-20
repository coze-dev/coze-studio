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

  // 初始化最大矩形
  let maxLeft = Infinity;
  let maxTop = Infinity;
  let maxRight = -Infinity;
  let maxBottom = -Infinity;

  // 遍历所有矩形，计算包围盒的边界
  rects.forEach(rect => {
    maxLeft = Math.min(maxLeft, rect.left);
    maxTop = Math.min(maxTop, rect.top);
    maxRight = Math.max(maxRight, rect.left + (rect.width ?? 0));
    maxBottom = Math.max(maxBottom, rect.top + (rect.height ?? 0));
  });

  // 计算最终的宽度和高度
  const width = maxRight - maxLeft;
  const height = maxBottom - maxTop;

  // 获取编辑器的滚动位置
  const { scrollLeft } = editor.$view.scrollDOM;
  const { scrollTop } = editor.$view.scrollDOM;

  // 获取编辑器容器的位置
  const editorRect = editor.$view.dom.getBoundingClientRect();

  // 计算相对于视口的绝对位置
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
