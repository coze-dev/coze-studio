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
 
import { useEffect, useRef, useState, type MutableRefObject } from 'react';

import { defer } from 'lodash-es';
import { useEventCallback } from '@coze-common/chat-hooks';

import { isTouchDevice } from '../utils/is-touch-device';
import { getSelectionData } from '../utils/get-selection-data';
import { getRectData } from '../utils/get-rect-data';
import {
  Direction,
  type GrabPosition,
  type SelectionData,
} from '../types/selection';

const MAX_WIDTH = 40;
const TIMEOUT = 100;

interface GrabParams {
  /**
   * 选择目标容器的 Ref
   */
  contentRef: MutableRefObject<HTMLDivElement | null>;
  /**
   * 浮动菜单的 Ref
   */
  floatMenuRef: MutableRefObject<HTMLDivElement | null> | undefined;
  /**
   * 选择事件的回调
   */
  onSelectChange: (selectionData: SelectionData | null) => void;
  /**
   * 位置信息的回调
   */
  onPositionChange: (position: GrabPosition | null) => void;
  /**
   * Resize/Scroll/Wheel 是节流的时间
   */
  resizeThrottleTime?: number;
}

// eslint-disable-next-line @coze-arch/max-line-per-function, max-lines-per-function
export const useGrab = ({
  contentRef,
  floatMenuRef,
  onSelectChange,
  onPositionChange,
}: GrabParams) => {
  const timeoutRef = useRef<number>();

  /**
   * 选区对象存放（用于hooks内部流转状态用）
   */
  const selection = useRef<Selection | null>(null);

  /**
   * 选区最终计算结果的数据
   */
  const selectionData = useRef<SelectionData | null>(null);

  /**
   * 是否在 Scrolling 中
   */
  const [isScrolling, setIsScrolling] = useState(false);

  /**
   * Scrolling 计时器
   */
  const scrollingTimer = useRef<number | null>(null);

  /**
   * 是否有 SelectionData (优化挂载逻辑用)
   */
  const hasSelectionData = useRef(false);

  /**
   * 清除内部数据 + 触发回调
   */
  const clearSelection = () => {
    onSelectChange(null);
    onPositionChange(null);
    selection.current?.removeAllRanges();
    selection.current = null;
    setIsScrolling(false);
    hasSelectionData.current = false;
    if (scrollingTimer.current) {
      clearTimeout(scrollingTimer.current);
    }
  };

  /**
   * 处理屏幕发生变化 Scroll + Resize + Wheel + SelectionChange（移动设备）
   */
  const handleScreenChange = () => {
    // 获取选区
    const innerSelection = window.getSelection();

    const { direction = Direction.Unknown } = selectionData.current ?? {};

    // 如果选区为空，则返回
    if (!innerSelection) {
      onSelectChange(null);
      return;
    }

    const rectData = getRectData({ selection: innerSelection });

    if (!rectData) {
      onPositionChange(null);
      return;
    }

    // 默认使用获取选区最后一行的位置信息 （既Forward的情况）
    const rangeRect = Array.from(rectData.rangeRects).at(
      direction === Direction.Backward ? 0 : -1,
    );

    // 如果最后一行选区信息不正确则返回
    if (!rangeRect) {
      onPositionChange(null);
      return;
    }

    let [x, y] = [0, 0];
    // 判断如果选区是从前往后选择，则展示在最后一行的末尾，否则展示在开头
    if (direction === Direction.Backward) {
      x = rangeRect.left;
      y = rangeRect.top + rangeRect.height;
    } else {
      x = rangeRect.x + rangeRect.width;
      y = rangeRect.y + rangeRect.height;
    }

    /**
     * 加了一个避让屏幕的逻辑
     */
    const position = {
      x: x > screen.width - MAX_WIDTH ? x - MAX_WIDTH : x,
      y:
        y > screen.height - MAX_WIDTH
          ? y - MAX_WIDTH
          : rangeRect.y + rangeRect.height,
    };

    onPositionChange(position);
  };

  /**
   * 智能处理屏幕发生变化 有一个计时器 + 滚动告知的逻辑
   */
  const handleSmartScreenChange = useEventCallback(() => {
    if (scrollingTimer.current) {
      clearTimeout(scrollingTimer.current);
    }

    setIsScrolling(true);
    scrollingTimer.current = setTimeout(() => {
      handleScreenChange();
      setIsScrolling(false);
    }, TIMEOUT);
  });

  /**
   * 处理获取选区的逻辑
   */
  const handleGetSelection = () => {
    if (!contentRef.current) {
      onSelectChange(null);
      return;
    }

    // 获取选区
    // eslint-disable-next-line @typescript-eslint/naming-convention -- 内部变量
    const _selection = window.getSelection();

    // 如果选区为空，则返回
    if (!_selection) {
      onSelectChange(null);
      return;
    }

    selection.current = _selection;

    // 获取选区数据
    // eslint-disable-next-line @typescript-eslint/naming-convention -- 内部变量
    const _selectionData = getSelectionData({
      selection: _selection,
    });

    // 选区如果为空，则隐藏浮层Button
    if (!_selectionData || !_selectionData.nodesAncestorIsMessageBox) {
      onSelectChange(null);
      return;
    }

    // 设置展示和位置信息
    selectionData.current = _selectionData;
    hasSelectionData.current = Boolean(_selectionData);

    handleScreenChange();
    onSelectChange(_selectionData);
  };

  /**
   * 鼠标抬起的动作
   */
  const handleMouseUp = useEventCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = defer(handleGetSelection);
  });

  /**
   * 键盘按下的动作
   */
  const handleKeyDown = useEventCallback((e: KeyboardEvent) => {
    const forbiddenKeyboardSelect = () => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        onSelectChange(null);
      }
    };

    if (selectionData.current) {
      forbiddenKeyboardSelect();

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        handleGetSelection();
      }
    }
  });

  /**
   * 鼠标按下的动作
   */
  const handleMouseDown = useEventCallback((e: MouseEvent) => {
    // 检查是否有选区，且点击事件的目标不在选区内

    if (!contentRef.current || !floatMenuRef || !floatMenuRef?.current) {
      return;
    }

    const { clientX, clientY } = e;

    const floatMenuRect = floatMenuRef.current.getBoundingClientRect();

    const isInFloatMenu =
      clientY >= floatMenuRect.top &&
      clientY <= floatMenuRect.bottom &&
      clientX >= floatMenuRect.left &&
      clientX <= floatMenuRect.right;

    if (isInFloatMenu) {
      return;
    }

    clearSelection();
  });

  useEffect(() => {
    if (!hasSelectionData.current) {
      return;
    }

    // 监听鼠标down事件
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [hasSelectionData.current]);

  // 当visible时，挂载监听事件，优化监听
  useEffect(() => {
    if (!hasSelectionData.current) {
      return;
    }

    window.addEventListener('resize', handleSmartScreenChange);
    window.addEventListener('wheel', handleSmartScreenChange);
    window.addEventListener('scroll', handleSmartScreenChange);
    window.addEventListener('keydown', handleKeyDown);

    if (isTouchDevice()) {
      window.addEventListener('selectionchange', handleSmartScreenChange);
    }

    return () => {
      window.removeEventListener('resize', handleSmartScreenChange);
      window.removeEventListener('wheel', handleSmartScreenChange);
      window.removeEventListener('scroll', handleSmartScreenChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('selectionchange', handleSmartScreenChange);
    };
  }, [hasSelectionData.current]);

  // target上挂载监听
  useEffect(() => {
    const target = contentRef.current;

    if (!target) {
      return;
    }

    // 监听选择相关的鼠标抬起事件
    target.addEventListener('pointerup', handleMouseUp);

    if (isTouchDevice()) {
      target.addEventListener('selectionchange', handleMouseUp);
    }

    return () => {
      target.removeEventListener('pointerup', handleMouseUp);
      target.removeEventListener('selectionchange', handleMouseUp);
    };
  }, [contentRef.current]);

  return {
    /**
     * 清除内置状态和选区
     */
    clearSelection,
    /**
     * 是否在滚动中
     */
    isScrolling,
    /**
     * 重新计算选区位置
     */
    computePosition: handleSmartScreenChange,
  };
};
